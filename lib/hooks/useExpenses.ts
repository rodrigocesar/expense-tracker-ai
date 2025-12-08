'use client';

import { useState, useEffect, useCallback } from 'react';
import { Expense } from '@/lib/types/expense';
import { 
  loadExpenses, 
  addExpense as addExpenseToStorage,
  updateExpense as updateExpenseInStorage,
  deleteExpense as deleteExpenseFromStorage,
} from '@/lib/utils/storage';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loaded = await loadExpenses();
      setExpenses(loaded);
    } catch (err) {
      setError('Failed to load expenses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = useCallback(async (expense: Expense): Promise<boolean> => {
    try {
      setError(null);
      const created = await addExpenseToStorage(expense);
      setExpenses((prev) => [...prev, created]);
      return true;
    } catch (err) {
      setError('Failed to add expense');
      console.error(err);
      return false;
    }
  }, []);

  const updateExpense = useCallback(async (id: string, expense: Expense): Promise<boolean> => {
    try {
      setError(null);
      const updated = await updateExpenseInStorage(id, expense);
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
      return true;
    } catch (err) {
      setError('Failed to update expense');
      console.error(err);
      return false;
    }
  }, []);

  const deleteExpense = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await deleteExpenseFromStorage(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
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
    refetch: fetchExpenses,
  };
};

