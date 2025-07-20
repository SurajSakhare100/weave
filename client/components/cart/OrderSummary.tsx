import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface OrderSummaryProps {
  className?: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ className = '' }) => {
  const { items } = useSelector((state: RootState) => state.cart);

  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 100 : 0; // Free shipping over certain amount
  const total = subtotal + shipping;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({items.length} items)</span>
          <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">
            {shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}
          </span>
        </div>
        
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between font-semibold">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {items.length === 0 && (
        <p className="text-center text-gray-500 mt-4">Your cart is empty</p>
      )}
    </div>
  );
};

export default OrderSummary; 