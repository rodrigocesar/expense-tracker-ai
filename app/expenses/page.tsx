'use client';

import React, { useState } from 'react';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { useExpenseFilters } from '@/lib/hooks/useExpenseFilters';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { ExpenseFilters } from '@/components/expenses/ExpenseFilters';
import { Button } from '@/components/ui/Button';
import { exportToCSV } from '@/lib/utils/export';
import { Download, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Expense } from '@/lib/types/expense';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';

export default function ExpensesPage() {
  const { expenses, loading, error, addExpense, updateExpense, deleteExpense } = useExpenses();
  const { filters, filteredExpenses, updateFilters, clearFilters } = useExpenseFilters(expenses);
  const router = useRouter();
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [showForm, setShowForm] = useState(false);

  const handleExport = () => {
    exportToCSV(filteredExpenses);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteExpense(id);
  };

  const handleSubmit = (expense: Expense) => {
    if (editingExpense) {
      updateExpense(expense.id, expense);
      setEditingExpense(undefined);
    } else {
      addExpense(expense);
    }
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={filteredExpenses.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setEditingExpense(undefined);
                setShowForm(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-8">
          <ExpenseForm
            expense={editingExpense}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingExpense(undefined);
            }}
          />
        </div>
      )}

      <div className="space-y-6">
        <ExpenseFilters filters={filters} onFiltersChange={updateFilters} />

        <div>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredExpenses.length} of {expenses.length} expenses
            </p>
          </div>
          <ExpenseList
            expenses={filteredExpenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}

