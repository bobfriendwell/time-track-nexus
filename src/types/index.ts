
export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

export interface TimeEntry {
  id: string;
  userId: string;
  date: string;
  hours: number;
  mainCategory: string;
  subCategory: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
}
