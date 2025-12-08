import { Expense } from '@/lib/types/expense';
import * as expensesApi from '@/lib/api/expenses';

// Check if API URL is configured - if not, fall back to localStorage
const USE_API = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_API_URL;
const STORAGE_KEY = 'expense-tracker-expenses';

// Fallback localStorage functions
const saveExpensesLocal = (expenses: Expense[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Failed to save expenses to localStorage:', error);
    throw new Error('Failed to save expenses. Storage may be full.');
  }
};

const loadExpensesLocal = (): Expense[] => {
  try {
    if (typeof window === 'undefined') {
      return [];
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored) as Expense[];
    if (!Array.isArray(parsed)) {
      console.error('Invalid data format in localStorage');
      return [];
    }
    return parsed;
  } catch (error) {
    console.error('Failed to load expenses from localStorage:', error);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore errors when trying to clear
    }
    return [];
  }
};

// API-based functions
export const loadExpenses = async (): Promise<Expense[]> => {
  if (USE_API) {
    try {
      return await expensesApi.getExpenses();
    } catch (error) {
      console.error('Failed to load expenses from API:', error);
      throw error;
    }
  } else {
    // Fallback to localStorage for development
    return Promise.resolve(loadExpensesLocal());
  }
};

export const addExpense = async (expense: Expense): Promise<Expense> => {
  if (USE_API) {
    try {
      // Remove id from expense as API will generate it
      const { id, ...expenseData } = expense;
      return await expensesApi.createExpense(expenseData);
    } catch (error) {
      console.error('Failed to add expense via API:', error);
      throw error;
    }
  } else {
    // Fallback to localStorage for development
    try {
      if (!expense.id || !expense.date || !expense.category || expense.amount <= 0) {
        throw new Error('Invalid expense data');
      }
      const expenses = loadExpensesLocal();
      const updated = [...expenses, expense];
      saveExpensesLocal(updated);
      return expense;
    } catch (error) {
      console.error('Failed to add expense:', error);
      throw error;
    }
  }
};

export const updateExpense = async (id: string, updatedExpense: Expense): Promise<Expense> => {
  if (USE_API) {
    try {
      // Only send updated fields
      const { id: _, ...expenseData } = updatedExpense;
      return await expensesApi.updateExpense(id, expenseData);
    } catch (error) {
      console.error('Failed to update expense via API:', error);
      throw error;
    }
  } else {
    // Fallback to localStorage for development
    const expenses = loadExpensesLocal();
    const index = expenses.findIndex(expense => expense.id === id);
    if (index === -1) {
      throw new Error('Expense not found');
    }
    expenses[index] = updatedExpense;
    saveExpensesLocal(expenses);
    return updatedExpense;
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  if (USE_API) {
    try {
      await expensesApi.deleteExpense(id);
    } catch (error) {
      console.error('Failed to delete expense via API:', error);
      throw error;
    }
  } else {
    // Fallback to localStorage for development
    try {
      const expenses = loadExpensesLocal();
      const updated = expenses.filter(expense => expense.id !== id);
      saveExpensesLocal(updated);
    } catch (error) {
      console.error('Failed to delete expense:', error);
      throw error;
    }
  }
};

// Legacy synchronous functions for backward compatibility (deprecated)
export const saveExpenses = (expenses: Expense[]): void => {
  console.warn('saveExpenses is deprecated. Use async API functions instead.');
  saveExpensesLocal(expenses);
};

