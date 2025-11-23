'use client';

import { useState, useEffect, useCallback } from 'react';
import { Expense } from '@/lib/types/expense';
import { 
  loadExpenses, 
  saveExpenses, 
  addExpense as addExpenseToStorage,
  updateExpense as updateExpenseInStorage,
  deleteExpense as deleteExpenseFromStorage,
} from '@/lib/utils/storage';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const loaded = loadExpenses();
      setExpenses(loaded);
      setError(null);
    } catch (err) {
      setError('Failed to load expenses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addExpense = useCallback((expense: Expense) => {
    try {
      const updated = addExpenseToStorage(expense);
      setExpenses(updated);
      setError(null);
      return true;
    } catch (err) {
      setError('Failed to add expense');
      console.error(err);
      return false;
    }
  }, []);

  const updateExpense = useCallback((id: string, expense: Expense) => {
    try {
      const updated = updateExpenseInStorage(id, expense);
      setExpenses(updated);
      setError(null);
      return true;
    } catch (err) {
      setError('Failed to update expense');
      console.error(err);
      return false;
    }
  }, []);

  const deleteExpense = useCallback((id: string) => {
    try {
      const updated = deleteExpenseFromStorage(id);
      setExpenses(updated);
      setError(null);
      return true;
    } catch (err) {
      setError('Failed to delete expense');
      console.error(err);
      return false;
    }
  }, []);

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: () => {
      try {
        const loaded = loadExpenses();
        setExpenses(loaded);
        setError(null);
      } catch (err) {
        setError('Failed to reload expenses');
        console.error(err);
      }
    },
  };
};

