import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Trash2 } from 'lucide-react';

const CartItem = ({ item, onQuantityChange, onRemove, isUpdating = false }) => {
  // Validate item data
  if (!item || !item.proId) {
    console.warn('CartItem: Invalid item data', item);
    return null;
  }

  // Validate required fields
  if (!item.item || !item.item.name) {
    console.warn('CartItem: Missing product information', item);
    return null;
  }

  const productName = item.item.name;
  const productImage = item.item?.images?.[0]?.url || '/products/product.png';
  const productColor = item.item?.color || 'Pink';
  // Use variantSize from cart item, fallback to product sizes, then default to 'M'
  const productSize = item.variantSize || 
    (item.item?.sizes && item.item.sizes.length > 0 ? item.item.sizes[0] : 'M');

  // Validate price and quantity
  const isValidPrice = typeof item.price === 'number' && item.price >= 0;
  const isValidQuantity = typeof item.quantity === 'number' && item.quantity > 0;

  if (!isValidPrice || !isValidQuantity) {
    console.warn('CartItem: Invalid price or quantity', { price: item.price, quantity: item.quantity });
    return null;
  }

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && onQuantityChange) {
      onQuantityChange(item.proId, newQuantity);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(item.proId);
    }
  };

  return (
    <div className={`flex items-center rounded-2xl border-2 border-[#FFF6EF] gap-8 overflow-hidden ${isUpdating ? 'opacity-50' : ''}`}>
      <div className="flex-shrink-0 flex items-center aspect-square justify-center bg-[#FFF6EF] h-full p-4" >
        <Image 
          src={productImage} 
          alt={productName} 
          width={120} 
          height={120} 
          className=" rounded-md object-contain"
          onError={(e) => {
            e.target.src = '/products/product.png';
          }}
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
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="text-[#E75480] hover:text-pink-600 disabled:opacity-50"
            disabled={isUpdating}
          >
            <Minus className="h-5 w-5" />
          </button>
        ) : (
          <button 
            onClick={handleRemove}
            className="text-[#E75480] hover:text-pink-600 disabled:opacity-50"
            disabled={isUpdating}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
        <span className="text-[#E75480] font-semibold text-lg">{item.quantity}</span>
        <button 
          onClick={() => handleQuantityChange(item.quantity + 1)}
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