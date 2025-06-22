import { useState } from 'react';
import { ChevronUp, Receipt } from 'lucide-react';

const OrderSummary = ({ summary }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <Receipt className="h-6 w-6 text-gray-700"/>
          <div>
            <p className="font-semibold text-lg">
              To Pay 
              <span className="text-gray-400 line-through ml-2">₹ {summary.mrpTotal.toLocaleString('en-IN')}</span> 
              <span className="ml-2">₹ {summary.itemTotal.toLocaleString('en-IN')}</span>
            </p>
            <p className="text-sm text-brand-success font-semibold">
              ₹ {summary.savedAmount.toLocaleString('en-IN')} saved on the total!
            </p>
          </div>
        </div>
        <ChevronUp className={`h-5 w-5 transition-transform ${isOpen ? '' : 'rotate-180'}`} />
      </div>

      {isOpen && (
        <div className="mt-6 space-y-3 text-gray-700">
          <div className="flex justify-between items-center pt-3 border-t border-dashed">
            <span>Item Total</span>
            <span className="font-semibold">
              <span className="text-gray-400 line-through mr-2">₹ {summary.mrpTotal.toLocaleString('en-IN')}</span>
              ₹ {summary.itemTotal.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-dashed">
            <span>Delivery fee</span>
            <span className="font-semibold">₹ {summary.deliveryFee}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-dashed">
            <span>Cash/Pay on Delivery fee</span>
            <span className="font-semibold">₹ {summary.codFee}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold pt-4 border-t-2 border-gray-300">
            <span>Order Total</span>
            <span>₹ {summary.orderTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      <button className="w-full bg-brand-accent text-white py-3 mt-6 rounded-md font-semibold hover:bg-brand-accent-dark transition-colors">
        Continue to checkout
      </button>
    </div>
  );
};

export default OrderSummary; 