import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Trash2 } from 'lucide-react';

const CartItem = ({ item, onQuantityChange, onRemove, isUpdating = false }) => {
  const productName = item.item?.name || 'Product';
  const productImage = item.item?.images?.[0]?.url || '/products/product.png';
  const productColor = item.item?.color || 'Pink';
  const productSize = item.variantSize || item.item?.size || 'M';

  return (
    <div className={`flex items-center rounded-2xl border-2 border-[#FFF6EF] gap-8 overflow-hidden ${isUpdating ? 'opacity-50' : ''}`}>
      <div className="flex-shrink-0 flex items-center justify-center bg-[#FFF6EF] h-full p-4" >
        <Image 
          src={productImage} 
          alt={productName} 
          width={120} 
          height={120} 
          className="rounded-md object-cover"
        />
      </div>
      <div className="flex items-center justify-between gap-4 p-4 w-full">
      <div className="">
        <h3 className="font-bold text-lg ">{productName}</h3>
        <p className="text-md font-bold ">₹ {item.price.toLocaleString('en-IN')}</p>
        <p className="text-sm">Size: {productSize}</p>
        <p className="text-sm">Color: {productColor}</p>
      </div>
      <div className="flex items-center border border-[#E75480] rounded-md px-4 py-1 gap-3">
        {item.quantity > 1 ? (
          <button 
            onClick={() => onQuantityChange(item.proId, item.quantity - 1)}
            className="text-[#E75480] hover:text-pink-600 disabled:opacity-50"
            disabled={isUpdating}
          >
            <Minus className="h-5 w-5" />
          </button>
        ) : (
          <button 
            onClick={() => onRemove(item.proId)}
            className="text-[#E75480] hover:text-pink-600 disabled:opacity-50"
            disabled={isUpdating}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
        <span className="text-[#E75480] font-semibold text-lg">{item.quantity}</span>
        <button 
          onClick={() => onQuantityChange(item.proId, item.quantity + 1)}
          className="text-[#E75480] hover:text-pink-600 disabled:opacity-50"
          disabled={isUpdating}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      </div>
    </div>
  );
};

export default CartItem; 