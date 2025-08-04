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
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center rounded-xl sm:rounded-2xl border-2 border-[#FFF6EF] gap-4 sm:gap-6 lg:gap-8 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300 ${isUpdating ? 'opacity-50' : ''}`}>
      {/* Product Image */}
      <div className="flex-shrink-0 flex items-center justify-center bg-[#FFF6EF] p-3 sm:p-4 w-full sm:w-auto">
        <div className="relative aspect-square w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 w-full">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg lg:text-xl text-gray-900 line-clamp-2 mb-1 sm:mb-2">
            {productName}
          </h3>
          <p className="text-lg sm:text-xl font-bold text-[#E75480] mb-2">
            ₹{item.price.toLocaleString('en-IN')}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span className="font-medium">Size:</span>
              <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                {productSize}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium">Color:</span>
              <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                {productColor}
              </span>
            </span>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center border border-[#E75480] rounded-lg px-2 sm:px-3 py-1 sm:py-2 gap-2 sm:gap-3 bg-white">
            {item.quantity > 1 ? (
              <button 
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className="text-[#E75480] hover:text-pink-600 disabled:opacity-50 transition-colors p-1 sm:p-2 rounded min-w-[32px] min-h-[32px] flex items-center justify-center"
                disabled={isUpdating}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            ) : (
              <button 
                onClick={handleRemove}
                className="text-[#E75480] hover:text-pink-600 disabled:opacity-50 transition-colors p-1 sm:p-2 rounded min-w-[32px] min-h-[32px] flex items-center justify-center"
                disabled={isUpdating}
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
            <span className="text-[#E75480] font-semibold text-base sm:text-lg min-w-[24px] text-center">
              {item.quantity}
            </span>
            <button 
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="text-[#E75480] hover:text-pink-600 disabled:opacity-50 transition-colors p-1 sm:p-2 rounded min-w-[32px] min-h-[32px] flex items-center justify-center"
              disabled={isUpdating}
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Remove Button for Mobile */}
          <div className="sm:hidden">
            <button 
              onClick={handleRemove}
              className="text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors p-2 rounded-lg border border-red-200 hover:bg-red-50 min-w-[40px] min-h-[40px] flex items-center justify-center"
              disabled={isUpdating}
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem; 