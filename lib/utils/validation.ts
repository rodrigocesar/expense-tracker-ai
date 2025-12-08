import { z } from 'zod';
import { Category } from '@/lib/types/expense';

export const expenseSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  amount: z.number().refine((val) => !isNaN(val) && isFinite(val) && val > 0, {
    message: 'Amount must be greater than 0',
  }),
  category: z.enum(['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other'] as [Category, ...Category[]]),
  description: z.string().min(1, 'Description is required').max(500, 'Description is too long'),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

