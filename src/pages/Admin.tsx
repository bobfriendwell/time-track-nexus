
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTimeEntry } from '../contexts/TimeEntryContext';
import Layout from '../components/Layout';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '../types';

// Mock users for demo
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    isAdmin: true,
  },
  {
    id: '2',
    username: 'user',
    email: 'user@example.com',
    isAdmin: false,
  },
];

const AdminPage = () => {
  const { user } = useAuth();
  const { getAllEntries } = useTimeEntry();
  
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [entries, setEntries] = useState(getAllEntries());
  const [filteredEntries, setFilteredEntries] = useState(entries);
  
  // Redirect non-admin users
  useEffect(() => {
    if (user && !user.isAdmin) {
      window.location.href = '/';
    }
  }, [user]);

  // Apply filters when selectedUser changes
  useEffect(() => {
    if (selectedUser === 'all') {
      setFilteredEntries(entries);
    } else {
      setFilteredEntries(entries.filter(entry => entry.userId === selectedUser));
    }
  }, [selectedUser, entries]);

  // Calculate stats
  const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const usersWithEntries = [...new Set(entries.map(entry => entry.userId))].length;
  
  if (!user?.isAdmin) {
    return null; // Don't render anything while redirecting
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
        
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="entries">All Entries</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{entries.length}</div>
                  <p className="text-sm text-gray-500">Total Entries</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
                  <p className="text-sm text-gray-500">Total Hours</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{usersWithEntries}</div>
                  <p className="text-sm text-gray-500">Active Users</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {entries.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Hours</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map((entry) => {
                          const entryUser = mockUsers.find(u => u.id === entry.userId);
                          
                          return (
                            <TableRow key={entry.id}>
                              <TableCell>{format(new Date(entry.date), 'yyyy-MM-dd')}</TableCell>
                              <TableCell>{entryUser?.username || entry.userId}</TableCell>
                              <TableCell>{entry.mainCategory} / {entry.subCategory}</TableCell>
                              <TableCell>{entry.hours}</TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No entries found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="entries">
            <Card>
              <CardHeader>
                <CardTitle>All Time Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label htmlFor="user-filter" className="mr-2">Filter by User</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger id="user-filter" className="w-[200px]">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {filteredEntries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Hours</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEntries.map((entry) => {
                          const entryUser = mockUsers.find(u => u.id === entry.userId);
                          
                          return (
                            <TableRow key={entry.id}>
                              <TableCell>{format(new Date(entry.date), 'yyyy-MM-dd')}</TableCell>
                              <TableCell>{entryUser?.username || entry.userId}</TableCell>
                              <TableCell>
                                {entry.mainCategory} / {entry.subCategory}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                              <TableCell>{entry.hours}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No entries found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Entries</TableHead>
                      <TableHead>Total Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((mockUser) => {
                      const userEntries = entries.filter(e => e.userId === mockUser.id);
                      const userTotalHours = userEntries.reduce((sum, e) => sum + e.hours, 0);
                      
                      return (
                        <TableRow key={mockUser.id}>
                          <TableCell>{mockUser.id}</TableCell>
                          <TableCell>{mockUser.username}</TableCell>
                          <TableCell>{mockUser.email}</TableCell>
                          <TableCell>{mockUser.isAdmin ? 'Admin' : 'User'}</TableCell>
                          <TableCell>{userEntries.length}</TableCell>
                          <TableCell>{userTotalHours.toFixed(1)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminPage;
