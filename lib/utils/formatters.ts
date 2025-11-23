import { format, parseISO } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
};

export const formatDateShort = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'MMM dd');
  } catch {
    return dateString;
  }
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    Food: 'bg-orange-100 text-orange-800 border-orange-200',
    Transportation: 'bg-blue-100 text-blue-800 border-blue-200',
    Entertainment: 'bg-purple-100 text-purple-800 border-purple-200',
    Shopping: 'bg-pink-100 text-pink-800 border-pink-200',
    Bills: 'bg-red-100 text-red-800 border-red-200',
    Other: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[category] || colors.Other;
};

export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    Food: '🍔',
    Transportation: '🚗',
    Entertainment: '🎬',
    Shopping: '🛍️',
    Bills: '📄',
    Other: '📦',
  };
  return icons[category] || icons.Other;
};

