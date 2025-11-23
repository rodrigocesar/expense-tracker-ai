import { Expense } from '@/lib/types/expense';

const STORAGE_KEY = 'expense-tracker-expenses';

export const saveExpenses = (expenses: Expense[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Failed to save expenses to localStorage:', error);
    throw new Error('Failed to save expenses. Storage may be full.');
  }
};

export const loadExpenses = (): Expense[] => {
  try {
    if (typeof window === 'undefined') {
      return [];
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored) as Expense[];
    // Validate that parsed data is an array
    if (!Array.isArray(parsed)) {
      console.error('Invalid data format in localStorage');
      return [];
    }
    return parsed;
  } catch (error) {
    console.error('Failed to load expenses from localStorage:', error);
    // Clear corrupted data
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore errors when trying to clear
    }
    return [];
  }
};

export const deleteExpense = (id: string): Expense[] => {
  try {
    const expenses = loadExpenses();
    const updated = expenses.filter(expense => expense.id !== id);
    saveExpenses(updated);
    return updated;
  } catch (error) {
    console.error('Failed to delete expense:', error);
    throw error;
  }
};

export const updateExpense = (id: string, updatedExpense: Expense): Expense[] => {
  const expenses = loadExpenses();
  const index = expenses.findIndex(expense => expense.id === id);
  if (index === -1) {
    throw new Error('Expense not found');
  }
  expenses[index] = updatedExpense;
  saveExpenses(expenses);
  return expenses;
};

export const addExpense = (expense: Expense): Expense[] => {
  try {
    const expenses = loadExpenses();
    // Validate expense has required fields
    if (!expense.id || !expense.date || !expense.category || expense.amount <= 0) {
      throw new Error('Invalid expense data');
    }
    const updated = [...expenses, expense];
    saveExpenses(updated);
    return updated;
  } catch (error) {
    console.error('Failed to add expense:', error);
    throw error;
  }
};

