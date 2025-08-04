import { useRouter } from 'next/router';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

// Admin logout function
export const adminLogout = async (navigate: any) => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/admin/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
  navigate.push('/admin/login');
};

// Currency formatting utility
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Status color utility for products
export const getProductStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'text-green-600 bg-green-50';
    case 'pending':
      return 'text-yellow-600 bg-yellow-50';
    case 'rejected':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// Status color utility for orders
export const getOrderStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'shipped':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'processing':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'returned':
    case 'return':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'refunded':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Status color utility for vendors
export const getVendorStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'text-green-600 bg-green-50';
    case 'pending':
      return 'text-yellow-600 bg-yellow-50';
    case 'rejected':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// Status icon utility for products
export const getProductStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return <CheckCircle size={16} />;
    case 'pending':
      return <Clock size={16} />;
    case 'rejected':
      return <XCircle size={16} />;
    default:
      return <AlertCircle size={16} />;
  }
};

// Error handling utility for admin operations
export const handleAdminError = (error: any, logout: () => void, defaultMessage: string = 'Operation failed') => {
  console.error('Admin operation error:', error);
  if (error.status === 401) {
    logout();
  } else {
    return defaultMessage;
  }
};

// Confirmation dialog utility
export const confirmAction = (message: string): boolean => {
  return window.confirm(message);
};

// Date formatting utility
export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Pagination utility
export const calculatePagination = (total: number, currentPage: number, limit: number) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  
  return {
    totalPages,
    hasNextPage,
    hasPrevPage,
    startIndex: (currentPage - 1) * limit + 1,
    endIndex: Math.min(currentPage * limit, total)
  };
}; 