'use client';

import React from 'react';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { ExpenseCharts } from '@/components/dashboard/ExpenseCharts';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { exportToCSV } from '@/lib/utils/export';
import { Download, Plus } from 'lucide-react';
import { useState } from 'react';
import { Expense } from '@/lib/types/expense';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';

export default function DashboardPage() {
  const { expenses, loading, error, addExpense, updateExpense, deleteExpense } = useExpenses();
  const router = useRouter();
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [showForm, setShowForm] = useState(false);

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleExport = () => {
    exportToCSV(expenses);
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExport} disabled={expenses.length === 0}>
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

      <div className="space-y-8">
        <SummaryCards expenses={expenses} />

        <ExpenseCharts expenses={expenses} />

        <div>
          <Card title="Recent Expenses">
            {recentExpenses.length > 0 ? (
              <ExpenseList
                expenses={recentExpenses}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No expenses yet. Add your first expense to get started!
              </div>
            )}
          </Card>
          {expenses.length > 5 && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => router.push('/expenses')}
              >
                View All Expenses
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

