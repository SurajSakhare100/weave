import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Trash2 } from 'lucide-react';

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  return (
    <div className="flex items-center rounded-2xl border-2 border-[#FFF6EF]  gap-8 overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-center bg-[#FFF6EF] h-full p-4" >
        <Image 
          src={item.image || '/products/product.png'} 
          alt={item.name} 
          width={120} 
          height={120} 
          className="rounded-md object-cover"
        />
      </div>
      <div className="flex items-center justify-between gap-4 p-4 w-full">
      <div className="">
        <h3 className="font-bold text-lg ">{item.name}</h3>
        <p className="text-md font-bold ">₹ {item.price.toLocaleString('en-IN')}</p>
        <p className="text-sm">Size: {item.size || 'M'}</p>
        <p className="text-sm">Color: {item.color || 'Pink'}</p>
      </div>
      <div className="flex items-center border border-[#E75480] rounded-md px-4 py-1 gap-3">
        {item.quantity > 1 ? (
          <button 
            onClick={() => onQuantityChange(item.proId, item.quantity - 1)}
            className="text-[#E75480] hover:text-pink-600"
          >
            <Minus className="h-5 w-5" />
          </button>
        ) : (
          <button 
            onClick={() => onRemove(item.proId)}
            className="text-[#E75480] hover:text-pink-600"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
        <span className="text-[#E75480] font-semibold text-lg">{item.quantity}</span>
        <button 
          onClick={() => onQuantityChange(item.proId, item.quantity + 1)}
          className="text-[#E75480] hover:text-pink-600"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      </div>
    </div>
  );
};

export default CartItem; 