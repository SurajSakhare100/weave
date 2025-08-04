import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  count?: number;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showCounts?: boolean;
}

const Select: React.FC<SelectProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option",
  className = "",
  disabled = false,
  showCounts = false
}) => {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          appearance-none w-full px-3 py-2 pr-8 
          bg-white border border-gray-300 rounded-lg 
          text-sm text-gray-900 
          focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${disabled ? 'opacity-50' : 'hover:border-gray-400'}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
            {showCounts && option.count !== undefined && ` (${option.count})`}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
};

export default Select;