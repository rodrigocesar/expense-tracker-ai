'use client';

import React, { useMemo } from 'react';
import { Expense } from '@/lib/types/expense';
import { Card } from '@/components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { formatCurrency, formatDateShort } from '@/lib/utils/formatters';
import { startOfDay, parseISO, subDays, format } from 'date-fns';

interface ExpenseChartsProps {
  expenses: Expense[];
}

export const ExpenseCharts: React.FC<ExpenseChartsProps> = ({ expenses }) => {
  // Category breakdown
  const categoryData = useMemo(() => {
    const totals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Spending over time (last 30 days)
  const timeSeriesData = useMemo(() => {
    const days = 30;
    const endDate = new Date();
    const dataMap = new Map<string, number>();

    // Initialize all days with 0
    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, i);
      const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
      dataMap.set(dateKey, 0);
    }

    // Sum expenses by date
    expenses.forEach(expense => {
      const dateKey = format(startOfDay(parseISO(expense.date)), 'yyyy-MM-dd');
      if (dataMap.has(dateKey)) {
        dataMap.set(dateKey, (dataMap.get(dateKey) || 0) + expense.amount);
      }
    });

    // Convert to array and sort by date
    return Array.from(dataMap.entries())
      .map(([date, value]) => ({
        date: formatDateShort(date),
        amount: value,
      }))
      .reverse();
  }, [expenses]);

  const formatTooltipValue = (value: number) => formatCurrency(value);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Breakdown */}
      <Card title="Spending by Category">
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={formatTooltipValue} />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No data available
          </div>
        )}
      </Card>

      {/* Spending Over Time */}
      <Card title="Spending Over Time (Last 30 Days)">
        {timeSeriesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={formatTooltipValue} />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No data available
          </div>
        )}
      </Card>
    </div>
  );
};

