import React from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface ToastClearButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const ToastClearButton: React.FC<ToastClearButtonProps> = ({ 
  className = '', 
  variant = 'outline',
  size = 'md' 
}) => {
  const handleClearAll = () => {
    toast.dismiss();
    toast.success('All notifications cleared');
  };

  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2';
  
  const variantClasses = {
    default: 'bg-[#EE346C] text-white hover:bg-[#D62A5A]',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs min-h-[32px] min-w-[32px]',
    md: 'px-3 py-2 text-sm min-h-[40px] min-w-[40px]',
    lg: 'px-4 py-2 text-base min-h-[48px] min-w-[48px]'
  };

  return (
    <button
      onClick={handleClearAll}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      aria-label="Clear all notifications"
    >
      <X className="h-4 w-4 sm:h-5 sm:w-5" />
      <span className="ml-2 hidden sm:inline">Clear All</span>
    </button>
  );
};

export default ToastClearButton; 