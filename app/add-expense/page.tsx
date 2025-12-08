'use client';

import React, { useState } from 'react';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { Expense } from '@/lib/types/expense';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function AddExpensePage() {
  const { addExpense, error } = useExpenses();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (expense: Expense) => {
    try {
      setSubmitting(true);
      console.log('Submitting expense:', expense);
      const success = await addExpense(expense);
      console.log('Add expense result:', success);
      setSubmitting(false);
      
      if (success) {
        router.push('/expenses');
      }
    } catch (err) {
      console.error('Error submitting expense:', err);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Add New Expense</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <ExpenseForm onSubmit={handleSubmit} />
    </div>
  );
}

