
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTimeEntry } from '../contexts/TimeEntryContext';
import Layout from '../components/Layout';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { CalendarIcon, ChevronDown, ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TimeEntry } from '../types';

type TimeRange = 'thisWeek' | 'thisMonth' | 'prevWeek' | 'prevMonth' | 'custom';
type GroupedData = {
  category: string;
  hours: number;
  entries: TimeEntry[];
};

const COLORS = ['#4F46E5', '#A78BFA', '#EC4899', '#8B5CF6', '#F97316', '#6366F1', '#84CC16', '#14B8A6', '#06B6D4'];

const TimeAnalysisPage = () => {
  const { user } = useAuth();
  const { 
    getWeeklyEntries, 
    getMonthlyEntries, 
    getPreviousWeekEntries,
    getPreviousMonthEntries,
    getCustomRangeEntries,
    getAllEntries
  } = useTimeEntry();
  
  const [timeRange, setTimeRange] = useState<TimeRange>('thisWeek');
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date());
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [mainCategoryData, setMainCategoryData] = useState<GroupedData[]>([]);
  const [subCategoryData, setSubCategoryData] = useState<GroupedData[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [totalHours, setTotalHours] = useState(0);
  
  // Load time entries based on selected range
  useEffect(() => {
    const loadEntries = () => {
      if (!user) return;
      
      let loadedEntries: TimeEntry[] = [];
      
      if (user.isAdmin) {
        switch (timeRange) {
          case 'thisWeek':
            loadedEntries = getWeeklyEntries();
            break;
          case 'thisMonth':
            loadedEntries = getMonthlyEntries();
            break;
          case 'prevWeek':
            loadedEntries = getPreviousWeekEntries();
            break;
          case 'prevMonth':
            loadedEntries = getPreviousMonthEntries();
            break;
          case 'custom':
            loadedEntries = getCustomRangeEntries(
              format(customStartDate, 'yyyy-MM-dd'),
              format(customEndDate, 'yyyy-MM-dd')
            );
            break;
        }
      } else {
        // Regular users only see their own entries
        switch (timeRange) {
          case 'thisWeek':
            loadedEntries = getWeeklyEntries(user.id);
            break;
          case 'thisMonth':
            loadedEntries = getMonthlyEntries(user.id);
            break;
          case 'prevWeek':
            loadedEntries = getPreviousWeekEntries(user.id);
            break;
          case 'prevMonth':
            loadedEntries = getPreviousMonthEntries(user.id);
            break;
          case 'custom':
            loadedEntries = getCustomRangeEntries(
              format(customStartDate, 'yyyy-MM-dd'),
              format(customEndDate, 'yyyy-MM-dd'),
              user.id
            );
            break;
        }
      }
      
      setEntries(loadedEntries);
    };
    
    loadEntries();
  }, [
    user, 
    timeRange, 
    customStartDate, 
    customEndDate, 
    getWeeklyEntries, 
    getMonthlyEntries, 
    getPreviousWeekEntries,
    getPreviousMonthEntries,
    getCustomRangeEntries
  ]);
  
  // Process data for visualization
  useEffect(() => {
    if (!entries.length) {
      setMainCategoryData([]);
      setSubCategoryData([]);
      setTotalHours(0);
      return;
    }
    
    const mainCategoryGroups: Record<string, GroupedData> = {};
    const subCategoryGroups: Record<string, GroupedData> = {};
    let total = 0;
    
    entries.forEach(entry => {
      // Add to main category groups
      if (!mainCategoryGroups[entry.mainCategory]) {
        mainCategoryGroups[entry.mainCategory] = {
          category: entry.mainCategory,
          hours: 0,
          entries: []
        };
      }
      
      mainCategoryGroups[entry.mainCategory].hours += entry.hours;
      mainCategoryGroups[entry.mainCategory].entries.push(entry);
      
      // Add to sub category groups
      const subCatKey = `${entry.mainCategory}:${entry.subCategory}`;
      if (!subCategoryGroups[subCatKey]) {
        subCategoryGroups[subCatKey] = {
          category: entry.subCategory,
          hours: 0,
          entries: []
        };
      }
      
      subCategoryGroups[subCatKey].hours += entry.hours;
      subCategoryGroups[subCatKey].entries.push(entry);
      
      total += entry.hours;
    });
    
    setMainCategoryData(Object.values(mainCategoryGroups));
    setSubCategoryData(Object.values(subCategoryGroups));
    setTotalHours(total);
    
  }, [entries]);
  
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  const getRangeTitle = () => {
    switch (timeRange) {
      case 'thisWeek':
        return 'This Week';
      case 'thisMonth':
        return 'This Month';
      case 'prevWeek':
        return 'Previous Week';
      case 'prevMonth':
        return 'Previous Month';
      case 'custom':
        return `${format(customStartDate, 'MMM dd')} - ${format(customEndDate, 'MMM dd, yyyy')}`;
    }
  };
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Time Analysis</h1>
        
        {/* Time Range Selector */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-3">
                <Label htmlFor="time-range">Time Range</Label>
                <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                  <SelectTrigger id="time-range">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thisWeek">This Week</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="prevWeek">Previous Week</SelectItem>
                    <SelectItem value="prevMonth">Previous Month</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {timeRange === 'custom' && (
                <>
                  <div className="md:col-span-3">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customStartDate ? format(customStartDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={customStartDate}
                          onSelect={(date) => date && setCustomStartDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="md:col-span-3">
                    <Label htmlFor="end-date">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customEndDate ? format(customEndDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={customEndDate}
                          onSelect={(date) => date && setCustomEndDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Summary Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Summary for {getRangeTitle()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <p className="text-sm text-gray-500">Total Hours</p>
                <p className="text-3xl font-bold text-time-purple">{totalHours.toFixed(1)}</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <p className="text-sm text-gray-500">Total Entries</p>
                <p className="text-3xl font-bold text-time-purple">{entries.length}</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <p className="text-sm text-gray-500">Categories Used</p>
                <p className="text-3xl font-bold text-time-purple">{mainCategoryData.length}</p>
              </div>
            </div>
            
            {/* Charts Section */}
            {entries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="text-lg font-medium mb-4">Hours by Category</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={mainCategoryData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="hours" fill="#4F46E5" name="Hours" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Pie Chart */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="text-lg font-medium mb-4">Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mainCategoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="hours"
                          nameKey="category"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {mainCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} hours`, 'Time Spent']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No data available for the selected time period.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Detailed Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {mainCategoryData.length > 0 ? (
              <div className="space-y-4">
                {mainCategoryData.map((category) => (
                  <Collapsible key={category.category}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <div className="flex items-center">
                        {expandedCategories[category.category] ? (
                          <ChevronDown className="h-4 w-4 mr-2" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-2" />
                        )}
                        <span className="font-medium">{category.category}</span>
                      </div>
                      <span className="font-semibold text-time-purple">
                        {category.hours.toFixed(1)} hours
                      </span>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="p-4 border rounded-lg mt-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Subcategory</TableHead>
                            <TableHead>Hours</TableHead>
                            <TableHead className="hidden md:table-cell">Description</TableHead>
                            {user?.isAdmin && <TableHead>User</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {category.entries.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell>
                                {format(new Date(entry.date), 'yyyy-MM-dd')}
                              </TableCell>
                              <TableCell>{entry.subCategory}</TableCell>
                              <TableCell>{entry.hours}</TableCell>
                              <TableCell className="hidden md:table-cell max-w-xs truncate">
                                {entry.description}
                              </TableCell>
                              {user?.isAdmin && <TableCell>{entry.userId}</TableCell>}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No data available for the selected time period.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TimeAnalysisPage;
