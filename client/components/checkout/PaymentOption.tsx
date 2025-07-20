import React from 'react';
import { CreditCard, Wallet } from 'lucide-react';

interface PaymentOptionProps {
  type: 'card' | 'wallet';
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
}

const PaymentOption: React.FC<PaymentOptionProps> = ({
  type,
  selected,
  onSelect,
  title,
  description
}) => {
  const Icon = type === 'card' ? CreditCard : Wallet;

  return (
    <div
      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
        selected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${
          selected ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          <Icon className={`h-5 w-5 ${
            selected ? 'text-blue-600' : 'text-gray-600'
          }`} />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
          selected 
            ? 'border-blue-500 bg-blue-500' 
            : 'border-gray-300'
        }`}>
          {selected && (
            <div className="w-2 h-2 rounded-full bg-white"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentOption; 