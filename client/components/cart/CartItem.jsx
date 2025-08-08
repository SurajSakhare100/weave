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
    <div className={` flex flex-row items-center rounded-xl outline-none sm:rounded-2xl border-1 border-[#FFF6EF] gap-6 sm:gap-6 lg:gap-8 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300 ${isUpdating ? 'opacity-50' : ''}`}>
      {/* Product Image */}
      <div className="flex-shrink-0 flex h-full items-center justify-center bg-[#FFF6EF] p-3 sm:p-4 w-auto">
        <div className="relative aspect-square w-24 h-24 sm:w-24 sm:h-24 lg:w-28 lg:h-28">
          <Image 
            src={productImage} 
            alt={productName} 
            fill
            className="rounded-lg object-cover"
            onError={(e) => {
              e.target.src = '/products/product.png';
            }}
          />
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-row items-start justify-between gap-3 sm:gap-4 py-3 sm:py-4 pr-4 w-full">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg lg:text-xl text-[#6c4323] line-clamp-2 mb-1 sm:mb-2">
            {productName}
          </h3>
          <p className="text-lg sm:text-xl font-semibold text-[#6c4323] mb-2">
            ₹{item.price.toLocaleString('en-IN')}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center  sm:gap-4 text-sm text-[#8b7355]">
            <span className="flex items-center ">
              <span className="font-medium">Size:</span>
              <span className=" px-2 py-1 rounded text-xs font-medium">
                {productSize}
              </span>
            </span>
            <span className="flex items-center ga">
              <span className="font-medium">Color:</span>
              <span className=" px-2 py-1 rounded text-xs font-medium">
                {productColor}
              </span>
            </span>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex   items-center self-end justify-between sm:justify-end gap-1.5 sm:gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center w-14 sm:w-auto h-5 px-1.5 py-2 rounded outline outline-[0.60px] outline-offset-[-0.60px] outline-tags inline-flex justify-center items-center gap-1.5 border border-[#EF3B6D] rounded-sm px-2 py-1.5 sm:px-3  sm:py-2 gap-1.5 sm:gap-3 bg-white">
            {/* Mobile: always show remove */}
            <button 
              onClick={handleRemove}
              className="block sm:hidden text-[#EF3B6D] hover:text-pink-600 disabled:opacity-50 transition-colors  rounded flex items-center justify-center"
              disabled={isUpdating}
              aria-label="Remove item"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            {/* Desktop/Tablet: decrement or remove */}
            {item.quantity > 1 ? (
              <button 
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className="hidden sm:flex text-[#EF3B6D] hover:text-pink-600 disabled:opacity-50 transition-colors  sm:p-2 rounded  items-center justify-center"
                disabled={isUpdating}
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            ) : (
              <button 
                onClick={handleRemove}
                className="hidden sm:flex text-[#EF3B6D] hover:text-pink-600 disabled:opacity-50 transition-colors  sm:p-2 rounded  items-center justify-center"
                disabled={isUpdating}
                aria-label="Remove item"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            )}
            <span className="text-[#EF3B6D] font-semibold text-xs sm:text-lg  text-center">
              {item.quantity}
            </span>
            <button 
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="text-[#EF3B6D] hover:text-pink-600 disabled:opacity-50 transition-colors  sm:p-2 rounded  flex items-center justify-center"
              disabled={isUpdating}
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Removed separate mobile remove button; integrated into control pill */}
        </div>
      </div>
    </div>
  );
};

export default CartItem; 