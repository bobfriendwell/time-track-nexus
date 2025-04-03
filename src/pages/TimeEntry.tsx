
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTimeEntry } from '../contexts/TimeEntryContext';
import Layout from '../components/Layout';
import { format } from 'date-fns';
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
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { CalendarIcon, Pencil, Trash } from 'lucide-react';
import { TimeEntry as TimeEntryType } from '../types';

const TimeEntryPage = () => {
  const { user } = useAuth();
  const { 
    categories, 
    addEntry, 
    getUserEntries, 
    updateEntry, 
    deleteEntry,
    getEntryById
  } = useTimeEntry();
  
  const [date, setDate] = useState<Date>(new Date());
  const [hours, setHours] = useState<number>(8);
  const [mainCategory, setMainCategory] = useState<string>("");
  const [subCategories, setSubCategories] = useState<{ id: string; name: string }[]>([]);
  const [subCategory, setSubCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userEntries, setUserEntries] = useState<TimeEntryType[]>([]);

  // Load user entries
  useEffect(() => {
    if (user) {
      setUserEntries(getUserEntries(user.id));
    }
  }, [user, getUserEntries]);

  // Update subcategories when main category changes
  useEffect(() => {
    const selectedCategory = categories.find(cat => cat.name === mainCategory);
    if (selectedCategory) {
      setSubCategories(selectedCategory.subCategories);
      setSubCategory("");
    } else {
      setSubCategories([]);
      setSubCategory("");
    }
  }, [mainCategory, categories]);

  const resetForm = () => {
    setDate(new Date());
    setHours(8);
    setMainCategory("");
    setSubCategory("");
    setDescription("");
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    if (isEditing && editingId) {
      updateEntry(editingId, {
        date: format(date, 'yyyy-MM-dd'),
        hours,
        mainCategory,
        subCategory,
        description
      });

      // Reload user entries after update
      setUserEntries(getUserEntries(user.id));
    } else {
      addEntry({
        date: format(date, 'yyyy-MM-dd'),
        hours,
        mainCategory,
        subCategory,
        description
      });

      // Reload user entries after adding
      setUserEntries(getUserEntries(user.id));
    }

    resetForm();
  };

  const handleEdit = (id: string) => {
    const entry = getEntryById(id);
    if (entry) {
      setDate(new Date(entry.date));
      setHours(entry.hours);
      setMainCategory(entry.mainCategory);
      
      // Need to update subcategories based on main category
      const selectedCategory = categories.find(cat => cat.name === entry.mainCategory);
      if (selectedCategory) {
        setSubCategories(selectedCategory.subCategories);
      }
      
      setSubCategory(entry.subCategory);
      setDescription(entry.description);
      setIsEditing(true);
      setEditingId(id);
    }
  };

  const handleDelete = (id: string) => {
    deleteEntry(id);
    setUserEntries(getUserEntries(user?.id || ""));
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Time Entry</h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Entry Form */}
          <div className="md:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? 'Edit Time Entry' : 'Add Time Entry'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Date Picker */}
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(date) => date && setDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Hours */}
                  <div className="space-y-2">
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                      required
                    />
                  </div>

                  {/* Main Category */}
                  <div className="space-y-2">
                    <Label htmlFor="main-category">Main Category</Label>
                    <Select 
                      value={mainCategory} 
                      onValueChange={setMainCategory}
                      required
                    >
                      <SelectTrigger id="main-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sub Category */}
                  <div className="space-y-2">
                    <Label htmlFor="sub-category">Sub Category</Label>
                    <Select 
                      value={subCategory} 
                      onValueChange={setSubCategory}
                      disabled={!mainCategory}
                      required
                    >
                      <SelectTrigger id="sub-category">
                        <SelectValue placeholder="Select a subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {subCategories.map((subCat) => (
                          <SelectItem key={subCat.id} value={subCat.name}>
                            {subCat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="What did you work on?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-2">
                    {isEditing && (
                      <Button type="button" variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" className="bg-time-purple hover:bg-time-light-purple">
                      {isEditing ? 'Update Entry' : 'Add Entry'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Entries List */}
          <div className="md:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle>Your Time Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {userEntries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="hidden md:table-cell">Description</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>
                              {format(new Date(entry.date), 'yyyy-MM-dd')}
                            </TableCell>
                            <TableCell>{entry.hours}</TableCell>
                            <TableCell>
                              {entry.mainCategory} / {entry.subCategory}
                            </TableCell>
                            <TableCell className="hidden md:table-cell max-w-xs truncate">
                              {entry.description}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleEdit(entry.id)}
                                >
                                  <Pencil size={16} />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-red-500"
                                  onClick={() => handleDelete(entry.id)}
                                >
                                  <Trash size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No time entries yet. Add your first entry to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TimeEntryPage;
