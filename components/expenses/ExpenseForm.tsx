'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
    control,
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
          amount: undefined as any,
          category: 'Food' as Category,
          description: '',
        },
  });

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
    console.log('Form data received:', data);
    try {
      const expenseData: Expense = {
        id: expense?.id || crypto.randomUUID(),
        date: data.date,
        amount: data.amount,
        category: data.category,
        description: data.description,
      };
      console.log('Expense data to submit:', expenseData);
      onSubmit(expenseData);
      if (!expense) {
      reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: undefined as any,
        category: 'Food' as Category,
        description: '',
      });
      }
    } catch (error) {
      console.error('Error in onSubmitForm:', error);
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
        <Controller
          name="date"
          control={control}
          rules={{ required: 'Date is required' }}
          render={({ field }) => {
            const dateValue = field.value ? (isValid(parseISO(field.value)) ? parseISO(field.value) : new Date()) : new Date();
            return (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <DatePicker
                  selected={dateValue}
                  onChange={(date) => {
                    if (date) {
                      const dateString = format(date, 'yyyy-MM-dd');
                      field.onChange(dateString);
                    }
                  }}
                  dateFormat="yyyy-MM-dd"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  wrapperClassName="w-full"
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
              </div>
            );
          }}
        />

        <Controller
          name="amount"
          control={control}
          rules={{
            required: 'Amount is required',
            validate: (value) => {
              if (value === undefined || value === null || isNaN(value) || value === 0) {
                return 'Amount is required and must be greater than 0';
              }
              if (value <= 0) {
                return 'Amount must be greater than 0';
              }
              return true;
            }
          }}
          render={({ field }) => (
            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              name={field.name}
              value={field.value === undefined || field.value === null ? '' : field.value}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  field.onChange(undefined);
                } else {
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue)) {
                    field.onChange(numValue);
                  }
                }
              }}
              onBlur={field.onBlur}
              ref={field.ref}
              error={errors.amount?.message}
            />
          )}
        />

        <Controller
          name="category"
          control={control}
          rules={{ required: 'Category is required' }}
          render={({ field }) => (
            <Select
              label="Category"
              options={categoryOptions}
              {...field}
              error={errors.category?.message}
            />
          )}
        />

        <Textarea
          label="Description"
          rows={3}
          {...register('description', { required: 'Description is required' })}
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

