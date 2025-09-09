import { format, parseISO } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM dd, yyyy HH:mm');
  } catch {
    return dateString;
  }
};

export const formatDateShort = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
};

export const getStatusColor = (status: string | undefined | null): string => {
  if (!status) {
    return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
  }
  
  switch (status.toLowerCase()) {
    case 'success':
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
    case 'failed':
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
  }
};

export const getGatewayColor = (gateway: string | undefined | null): string => {
  if (!gateway) {
    return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
  }
  
  switch (gateway.toLowerCase()) {
    case 'phonepe':
      return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900';
    case 'razorpay':
      return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
    case 'paytm':
      return 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
  }
};
