'use client';

import React from 'react';
import { Expense } from '@/lib/types/expense';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/formatters';
import { DollarSign, Calendar, TrendingUp, Receipt } from 'lucide-react';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';

interface SummaryCardsProps {
  expenses: Expense[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ expenses }) => {
  const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = parseISO(expense.date);
    return isWithinInterval(expenseDate, { start: monthStart, end: monthEnd });
  });

  const monthlySpending = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate top category
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const topCategoryName = topCategory ? topCategory[0] : 'N/A';
  const topCategoryAmount = topCategory ? topCategory[1] : 0;

  const cards = [
    {
      title: 'Total Spending',
      value: formatCurrency(totalSpending),
      icon: DollarSign,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Monthly Spending',
      value: formatCurrency(monthlySpending),
      icon: Calendar,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'Top Category',
      value: topCategoryName,
      subvalue: formatCurrency(topCategoryAmount),
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      title: 'Expenses This Month',
      value: monthlyExpenses.length.toString(),
      icon: Receipt,
      color: 'text-orange-600 bg-orange-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                {card.subvalue && (
                  <p className="text-sm text-gray-500 mt-1">{card.subvalue}</p>
                )}
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

