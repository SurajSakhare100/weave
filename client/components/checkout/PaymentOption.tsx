import React from 'react';
import { CreditCard, Wallet, Building2, Smartphone } from 'lucide-react';

interface PaymentOptionProps {
  label: string;
  icon: string;
  isSelected: boolean;
  onSelect: () => void;
}

const PaymentOption: React.FC<PaymentOptionProps> = ({
  label,
  icon,
  isSelected,
  onSelect
}) => {
  const getIcon = () => {
    switch (icon) {
      case '💳':
        return <CreditCard className="h-5 w-5" />;
      case '🏦':
        return <Building2 className="h-5 w-5" />;
      case '📱':
        return <Smartphone className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  return (
    <div
      className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-[#cf1a53] bg-[#fff5f7] shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${
          isSelected ? 'bg-[#cf1a53] text-white' : 'bg-gray-100 text-gray-600'
        }`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{label}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {label === 'Cash on Delivery' ? 'Pay when you receive your order' : 
             label === 'Online Payment' ? 'Secure payment gateway' :
             label === 'Credit/Debit Card' ? 'Visa, Mastercard, RuPay' :
             label === 'UPI' ? 'Google Pay, PhonePe, Paytm' :
             'All major banks supported'}
          </p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          isSelected 
            ? 'border-[#cf1a53] bg-[#cf1a53]' 
            : 'border-gray-300'
        }`}>
          {isSelected && (
            <div className="w-2 h-2 rounded-full bg-white"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentOption; 