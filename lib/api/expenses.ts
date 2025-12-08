import { Expense, Category } from '@/lib/types/expense';
import { apiClient } from './client';

export interface ExpenseFilter {
  startDate?: string;
  endDate?: string;
  category?: Category;
}

export interface ExpensesResponse {
  expenses: Expense[];
  count: number;
}

export interface ExpenseResponse {
  expense: Expense;
}

export interface DeleteResponse {
  message: string;
  expenseId: string;
}

export const getExpenses = async (filter?: ExpenseFilter): Promise<Expense[]> => {
  try {
    const params: Record<string, string> = {};
    
    if (filter?.startDate) {
      params.startDate = filter.startDate;
    }
    if (filter?.endDate) {
      params.endDate = filter.endDate;
    }
    if (filter?.category) {
      params.category = filter.category;
    }

    const response = await apiClient.get<ExpensesResponse>('/expenses', params);
    return response.expenses;
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    throw error;
  }
};

export const createExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
  try {
    const response = await apiClient.post<ExpenseResponse>('/expenses', expense);
    return response.expense;
  } catch (error) {
    console.error('Failed to create expense:', error);
    throw error;
  }
};

export const updateExpense = async (id: string, expense: Partial<Expense>): Promise<Expense> => {
  try {
    const response = await apiClient.put<ExpenseResponse>(`/expenses/${id}`, expense);
    return response.expense;
  } catch (error) {
    console.error('Failed to update expense:', error);
    throw error;
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  try {
    await apiClient.delete<DeleteResponse>(`/expenses/${id}`);
  } catch (error) {
    console.error('Failed to delete expense:', error);
    throw error;
  }
};

