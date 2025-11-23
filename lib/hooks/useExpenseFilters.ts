'use client';

import { useMemo, useState } from 'react';
import { Expense, Category } from '@/lib/types/expense';
import { parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export interface FilterOptions {
  searchQuery: string;
  categories: Category[];
  dateFrom: string | null;
  dateTo: string | null;
}

export const useExpenseFilters = (expenses: Expense[]) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    categories: [],
    dateFrom: null,
    dateTo: null,
  });

  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(expense =>
        filters.categories.includes(expense.category)
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = startOfDay(parseISO(filters.dateFrom));
      filtered = filtered.filter(expense => {
        const expenseDate = startOfDay(parseISO(expense.date));
        return expenseDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      const toDate = endOfDay(parseISO(filters.dateTo));
      filtered = filtered.filter(expense => {
        const expenseDate = endOfDay(parseISO(expense.date));
        return expenseDate <= toDate;
      });
    }

    return filtered;
  }, [expenses, filters]);

  const updateFilters = (updates: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      categories: [],
      dateFrom: null,
      dateTo: null,
    });
  };

  return {
    filters,
    filteredExpenses,
    updateFilters,
    clearFilters,
  };
};

