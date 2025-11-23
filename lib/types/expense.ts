export type Category = 
  | 'Food' 
  | 'Transportation' 
  | 'Entertainment' 
  | 'Shopping' 
  | 'Bills' 
  | 'Other';

export interface Expense {
  id: string;
  date: string; // ISO date string
  amount: number;
  category: Category;
  description: string;
}

export const CATEGORIES: Category[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
];

