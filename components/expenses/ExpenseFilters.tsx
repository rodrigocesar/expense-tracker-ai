'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Category, CATEGORIES } from '@/lib/types/expense';
import { useExpenseFilters, FilterOptions } from '@/lib/hooks/useExpenseFilters';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { parseISO } from 'date-fns';

interface ExpenseFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, searchQuery: e.target.value });
  };

  const handleCategoryToggle = (category: Category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleDateFromChange = (date: Date | null) => {
    onFiltersChange({
      ...filters,
      dateFrom: date ? format(date, 'yyyy-MM-dd') : null,
    });
  };

  const handleDateToChange = (date: Date | null) => {
    onFiltersChange({
      ...filters,
      dateTo: date ? format(date, 'yyyy-MM-dd') : null,
    });
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.categories.length > 0 ||
    filters.dateFrom ||
    filters.dateTo;

  const clearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      categories: [],
      dateFrom: null,
      dateTo: null,
    });
  };

  return (
    <Card title="Filters">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by description or category..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <DatePicker
              selected={filters.dateFrom ? parseISO(filters.dateFrom) : null}
              onChange={handleDateFromChange}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select start date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              wrapperClassName="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <DatePicker
              selected={filters.dateTo ? parseISO(filters.dateTo) : null}
              onChange={handleDateToChange}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select end date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              wrapperClassName="w-full"
            />
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const isSelected = filters.categories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    isSelected
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-gray-200">
            <Button
              variant="secondary"
              size="sm"
              onClick={clearFilters}
              className="w-full md:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

