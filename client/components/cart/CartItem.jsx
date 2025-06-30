import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Trash2 } from 'lucide-react';

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  return (
    <div className="flex items-center bg-[#FFF6EF] rounded-2xl p-6 gap-8 shadow-sm">
      <div className="flex-shrink-0 flex items-center justify-center bg-transparent" style={{ minWidth: 140 }}>
        <Image 
          src={item.image || '/products/product.png'} 
          alt={item.name} 
          width={120} 
          height={120} 
          className="rounded-md object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-xl mb-2">{item.name}</h3>
        <p className="text-2xl font-bold mb-2">₹ {item.price.toLocaleString('en-IN')}</p>
        <p className="text-lg mb-1" style={{ color: '#8B6E4E' }}>Size: {item.size}</p>
        <p className="text-lg" style={{ color: '#8B6E4E' }}>Color: {item.color}</p>
      </div>
      <div className="flex items-center border border-[#E75480] rounded-xl px-4 py-2 gap-3">
        <button 
          onClick={() => onRemove(item.proId)}
          className="text-[#E75480] hover:text-pink-600"
        >
          <Trash2 className="h-5 w-5" />
        </button>
        <span className="text-[#E75480] font-semibold text-lg">{item.quantity}</span>
        <button 
          onClick={() => onQuantityChange(item.proId, item.quantity + 1)}
          className="text-[#E75480] hover:text-pink-600"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default CartItem; 