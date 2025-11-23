'use client';

import React, { useState } from 'react';
import { Expense } from '@/lib/types/expense';
import { formatCurrency, formatDate, getCategoryColor, getCategoryIcon } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pencil, Trash2, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onEdit, onDelete }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setDeletingId(id);
      onDelete(id);
      setTimeout(() => setDeletingId(null), 300);
    }
  };

  if (expenses.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No expenses found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by adding your first expense.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className={cn(
                      'hover:bg-gray-50 transition-colors',
                      deletingId === expense.id && 'opacity-50'
                    )}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                          getCategoryColor(expense.category)
                        )}
                      >
                        {getCategoryIcon(expense.category)} {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(expense)}
                          className="!p-2"
                          title="Edit expense"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(expense.id)}
                          className="!p-2"
                          disabled={deletingId === expense.id}
                          title="Delete expense"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {expenses.map((expense) => (
          <Card
            key={expense.id}
            className={cn(deletingId === expense.id && 'opacity-50')}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(expense)}
                  className="!p-2"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(expense.id)}
                  className="!p-2"
                  disabled={deletingId === expense.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mb-2">
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getCategoryColor(expense.category)
                )}
              >
                {getCategoryIcon(expense.category)} {expense.category}
              </span>
            </div>
            <p className="text-sm text-gray-700">{expense.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

