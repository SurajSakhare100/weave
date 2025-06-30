import { useState } from 'react';
import { ChevronUp, Receipt } from 'lucide-react';

const OrderSummary = ({ summary }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-[#FFF6EF] rounded-2xl p-8">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <Receipt className="h-7 w-7" style={{ color: '#5E3A1C' }}/>
          <div>
            <p className="font-bold text-xl">
              To Pay
              <span className="line-through ml-2" style={{ color: '#B59C8A' }}>
                ₹ {summary.mrpTotal.toLocaleString('en-IN')}
              </span>
              <span className="ml-2" style={{ color: '#5E3A1C' }}>
                ₹ {summary.itemTotal.toLocaleString('en-IN')}
              </span>
            </p>
            <p className="text-lg font-semibold" style={{ color: '#4BA870' }}>
              ₹ {summary.savedAmount.toLocaleString('en-IN')} saved on the total!
            </p>
          </div>
        </div>
        <ChevronUp className={`h-6 w-6 transition-transform`} style={{ color: '#5E3A1C', transform: isOpen ? '' : 'rotate(180deg)' }} />
      </div>

      {isOpen && (
        <div className="mt-6 space-y-3" style={{ color: '#5E3A1C' }}>
          <div className="flex justify-between items-center pt-3 border-t border-dashed" style={{ borderColor: '#EADBC8' }}>
            <span className="text-lg">Item Total</span>
            <span className="font-bold text-lg">
              <span className="line-through mr-2" style={{ color: '#B59C8A' }}>
                ₹ {summary.mrpTotal.toLocaleString('en-IN')}
              </span>
              ₹ {summary.itemTotal.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-dashed" style={{ borderColor: '#EADBC8' }}>
            <span className="text-lg">Delivery fee</span>
            <span className="font-bold text-lg">₹ {summary.deliveryFee}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-dashed" style={{ borderColor: '#EADBC8' }}>
            <span className="text-lg">Cash/Pay on Delivery fee</span>
            <span className="font-bold text-lg">₹ {summary.codFee}</span>
          </div>
          <div className="flex justify-between items-center text-2xl font-bold pt-4 border-t-2" style={{ borderColor: '#EADBC8' }}>
            <span>Order Total</span>
            <span>₹ {summary.orderTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      <button className="w-full bg-[#E75480] text-white py-4 mt-8 rounded-xl font-semibold text-lg hover:bg-pink-600 transition-colors">
        Continue to checkout
      </button>
    </div>
  );
};

export default OrderSummary; 