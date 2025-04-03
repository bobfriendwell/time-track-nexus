
import React, { createContext, useContext, useState, useEffect } from 'react';
import { TimeEntry, User, Category } from '../types';
import { toast } from "@/components/ui/use-toast";
import { useAuth } from './AuthContext';

interface TimeEntryContextType {
  entries: TimeEntry[];
  categories: Category[];
  addEntry: (entry: Omit<TimeEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateEntry: (id: string, entry: Partial<TimeEntry>) => void;
  deleteEntry: (id: string) => void;
  getUserEntries: (userId: string) => TimeEntry[];
  getAllEntries: () => TimeEntry[];
  getEntryById: (id: string) => TimeEntry | undefined;
  getWeeklyEntries: (userId?: string) => TimeEntry[];
  getMonthlyEntries: (userId?: string) => TimeEntry[];
  getCustomRangeEntries: (startDate: string, endDate: string, userId?: string) => TimeEntry[];
  getPreviousWeekEntries: (userId?: string) => TimeEntry[];
  getPreviousMonthEntries: (userId?: string) => TimeEntry[];
}

// Initial categories with leave options
const initialCategories: Category[] = [
  {
    id: '1',
    name: 'Development',
    subCategories: [
      { id: '101', name: 'Frontend' },
      { id: '102', name: 'Backend' },
      { id: '103', name: 'Testing' },
    ],
  },
  {
    id: '2',
    name: 'Design',
    subCategories: [
      { id: '201', name: 'UI Design' },
      { id: '202', name: 'UX Research' },
    ],
  },
  {
    id: '3',
    name: 'Management',
    subCategories: [
      { id: '301', name: 'Meeting' },
      { id: '302', name: 'Planning' },
    ],
  },
  {
    id: '4',
    name: 'Leave',
    subCategories: [
      { id: '401', name: 'Vacation' },
      { id: '402', name: 'Sick Leave' },
      { id: '403', name: 'Personal Leave' },
    ],
  },
];

// Mock entries for demo
const mockEntries: TimeEntry[] = [
  {
    id: '1',
    userId: '1',
    date: '2023-05-01',
    hours: 7.5,
    mainCategory: 'Development',
    subCategory: 'Frontend',
    description: 'Working on react components',
    createdAt: '2023-05-01T09:00:00',
    updatedAt: '2023-05-01T09:00:00',
  },
  {
    id: '2',
    userId: '1',
    date: '2023-05-02',
    hours: 6,
    mainCategory: 'Management',
    subCategory: 'Meeting',
    description: 'Project planning meeting',
    createdAt: '2023-05-02T09:00:00',
    updatedAt: '2023-05-02T09:00:00',
  },
  {
    id: '3',
    userId: '2',
    date: '2023-05-01',
    hours: 8,
    mainCategory: 'Design',
    subCategory: 'UI Design',
    description: 'Designing new dashboard',
    createdAt: '2023-05-01T09:00:00',
    updatedAt: '2023-05-01T09:00:00',
  },
  {
    id: '4',
    userId: '2',
    date: '2023-05-02',
    hours: 4,
    mainCategory: 'Leave',
    subCategory: 'Sick Leave',
    description: 'Half day sick leave',
    createdAt: '2023-05-02T09:00:00',
    updatedAt: '2023-05-02T09:00:00',
  },
];

const TimeEntryContext = createContext<TimeEntryContextType | undefined>(undefined);

export const useTimeEntry = () => {
  const context = useContext(TimeEntryContext);
  if (!context) {
    throw new Error('useTimeEntry must be used within a TimeEntryProvider');
  }
  return context;
};

export const TimeEntryProvider = ({ children }: { children: React.ReactNode }) => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [categories] = useState<Category[]>(initialCategories);
  const { user } = useAuth();

  useEffect(() => {
    // Load mock entries for demo
    setEntries(mockEntries);
  }, []);

  const addEntry = (entryData: Omit<TimeEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    const newEntry: TimeEntry = {
      ...entryData,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEntries((prev) => [...prev, newEntry]);
    toast({
      title: "Time entry added",
      description: "Your time entry has been added successfully",
    });
  };

  const updateEntry = (id: string, entryData: Partial<TimeEntry>) => {
    setEntries((prev) => 
      prev.map((entry) => {
        if (entry.id === id) {
          return { 
            ...entry, 
            ...entryData, 
            updatedAt: new Date().toISOString() 
          };
        }
        return entry;
      })
    );
    
    toast({
      title: "Time entry updated",
      description: "Your time entry has been updated successfully",
    });
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    
    toast({
      title: "Time entry deleted",
      description: "Your time entry has been deleted successfully",
    });
  };

  const getUserEntries = (userId: string) => {
    return entries.filter((entry) => entry.userId === userId);
  };

  const getAllEntries = () => {
    return entries;
  };

  const getEntryById = (id: string) => {
    return entries.find((entry) => entry.id === id);
  };

  // Date filtering helpers
  const isDateInCurrentWeek = (date: string) => {
    const today = new Date();
    const entryDate = new Date(date);
    const dayOfWeek = today.getDay();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + (6 - dayOfWeek));
    return entryDate >= startDate && entryDate <= endDate;
  };

  const isDateInPreviousWeek = (date: string) => {
    const today = new Date();
    const entryDate = new Date(date);
    const dayOfWeek = today.getDay();
    const endDateOfPrevWeek = new Date(today);
    endDateOfPrevWeek.setDate(today.getDate() - dayOfWeek - 1);
    const startDateOfPrevWeek = new Date(endDateOfPrevWeek);
    startDateOfPrevWeek.setDate(endDateOfPrevWeek.getDate() - 6);
    return entryDate >= startDateOfPrevWeek && entryDate <= endDateOfPrevWeek;
  };

  const isDateInCurrentMonth = (date: string) => {
    const today = new Date();
    const entryDate = new Date(date);
    return entryDate.getMonth() === today.getMonth() && 
           entryDate.getFullYear() === today.getFullYear();
  };

  const isDateInPreviousMonth = (date: string) => {
    const today = new Date();
    const entryDate = new Date(date);
    const prevMonth = today.getMonth() - 1;
    const year = prevMonth < 0 ? today.getFullYear() - 1 : today.getFullYear();
    const month = prevMonth < 0 ? 11 : prevMonth;
    return entryDate.getMonth() === month && entryDate.getFullYear() === year;
  };

  const filterEntriesByDate = (
    filterFn: (date: string) => boolean, 
    userId?: string
  ) => {
    let filteredEntries = entries.filter(entry => filterFn(entry.date));
    
    if (userId) {
      filteredEntries = filteredEntries.filter(entry => entry.userId === userId);
    }
    
    return filteredEntries;
  };

  const getWeeklyEntries = (userId?: string) => {
    return filterEntriesByDate(isDateInCurrentWeek, userId);
  };

  const getMonthlyEntries = (userId?: string) => {
    return filterEntriesByDate(isDateInCurrentMonth, userId);
  };

  const getPreviousWeekEntries = (userId?: string) => {
    return filterEntriesByDate(isDateInPreviousWeek, userId);
  };

  const getPreviousMonthEntries = (userId?: string) => {
    return filterEntriesByDate(isDateInPreviousMonth, userId);
  };

  const getCustomRangeEntries = (startDate: string, endDate: string, userId?: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the end date fully
    
    let filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });
    
    if (userId) {
      filteredEntries = filteredEntries.filter(entry => entry.userId === userId);
    }
    
    return filteredEntries;
  };

  return (
    <TimeEntryContext.Provider 
      value={{ 
        entries, 
        categories, 
        addEntry, 
        updateEntry, 
        deleteEntry, 
        getUserEntries, 
        getAllEntries, 
        getEntryById,
        getWeeklyEntries,
        getMonthlyEntries,
        getCustomRangeEntries,
        getPreviousWeekEntries,
        getPreviousMonthEntries
      }}
    >
      {children}
    </TimeEntryContext.Provider>
  );
};
