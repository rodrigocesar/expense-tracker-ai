'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Expense, Category } from '@/lib/types/expense';
import { expenseSchema, ExpenseFormData } from '@/lib/utils/validation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { format, parseISO, isValid } from 'date-fns';

interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (expense: Expense) => void;
  onCancel?: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? {
          date: expense.date,
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
        }
      : {
          date: format(new Date(), 'yyyy-MM-dd'),
          amount: 0,
          category: 'Food' as Category,
          description: '',
        },
  });

  const selectedDate = watch('date');

  useEffect(() => {
    if (expense) {
      reset({
        date: expense.date,
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
      });
    }
  }, [expense, reset]);

  const onSubmitForm = (data: ExpenseFormData) => {
    const expenseData: Expense = {
      id: expense?.id || crypto.randomUUID(),
      date: data.date,
      amount: data.amount,
      category: data.category,
      description: data.description,
    };
    onSubmit(expenseData);
    if (!expense) {
      reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: 0,
        category: 'Food' as Category,
        description: '',
      });
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const dateString = format(date, 'yyyy-MM-dd');
      setValue('date', dateString, { shouldValidate: true });
    } else {
      setValue('date', format(new Date(), 'yyyy-MM-dd'), { shouldValidate: true });
    }
  };

  const categoryOptions = [
    { value: 'Food', label: 'Food' },
    { value: 'Transportation', label: 'Transportation' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Shopping', label: 'Shopping' },
    { value: 'Bills', label: 'Bills' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <Card title={expense ? 'Edit Expense' : 'Add New Expense'}>
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <DatePicker
            selected={selectedDate ? (isValid(parseISO(selectedDate)) ? parseISO(selectedDate) : new Date()) : new Date()}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            wrapperClassName="w-full"
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
        </div>

        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          {...register('amount', { valueAsNumber: true })}
          error={errors.amount?.message}
        />

        <Select
          label="Category"
          options={categoryOptions}
          {...register('category')}
          error={errors.category?.message}
        />

        <Textarea
          label="Description"
          rows={3}
          {...register('description')}
          error={errors.description?.message}
          placeholder="Enter expense description..."
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary">
            {expense ? 'Update Expense' : 'Add Expense'}
          </Button>
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

