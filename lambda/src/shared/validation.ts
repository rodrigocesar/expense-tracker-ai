import { Expense } from './types';

export const validateExpense = (expense: any): { valid: boolean; error?: string } => {
  if (!expense) {
    return { valid: false, error: 'Expense data is required' };
  }

  if (!expense.date || typeof expense.date !== 'string') {
    return { valid: false, error: 'Date is required and must be a string' };
  }

  if (!expense.amount || typeof expense.amount !== 'number' || expense.amount <= 0) {
    return { valid: false, error: 'Amount is required and must be a positive number' };
  }

  const validCategories = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other'];
  if (!expense.category || !validCategories.includes(expense.category)) {
    return { valid: false, error: 'Category is required and must be one of: ' + validCategories.join(', ') };
  }

  if (!expense.description || typeof expense.description !== 'string' || expense.description.trim().length === 0) {
    return { valid: false, error: 'Description is required and must be a non-empty string' };
  }

  if (expense.description.length > 500) {
    return { valid: false, error: 'Description must be 500 characters or less' };
  }

  return { valid: true };
};

export const parseExpenseFromBody = (body: string | null): Expense | null => {
  if (!body) {
    return null;
  }

  try {
    return JSON.parse(body) as Expense;
  } catch (error) {
    return null;
  }
};

