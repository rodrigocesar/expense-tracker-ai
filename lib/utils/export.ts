import { Expense } from '@/lib/types/expense';
import { formatDate, formatCurrency } from './formatters';

export const exportToCSV = (expenses: Expense[]): void => {
  if (expenses.length === 0) {
    alert('No expenses to export');
    return;
  }

  const headers = ['Date', 'Amount', 'Category', 'Description'];
  const rows = expenses.map(expense => [
    formatDate(expense.date),
    formatCurrency(expense.amount),
    expense.category,
    expense.description.replace(/"/g, '""'), // Escape quotes in CSV
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `expenses-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

