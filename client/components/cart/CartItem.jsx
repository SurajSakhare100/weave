import { Plus, Minus, Trash2 } from 'lucide-react';

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  if (!item || !item.proId) {
    console.warn('CartItem: Invalid item data', item);
    return null;
  }

  if (!item.item || !item.item.name) {
    console.warn('CartItem: Missing product information', item);
    return null;
  }

  const productName = item.item.name;
  const productImage = item.item?.images?.[0]?.url || '/products/product.png';
  const productColor = item.item?.color || 'Pink';
  const productSize = item.variantSize ||
    (item.item?.sizes && item.item.sizes.length > 0 ? item.item.sizes[0] : 'M');

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
    <div className="w-full flex items-center bg-white border-2 border-accent rounded-lg space-x-4">
      {/* Product Image */}
      <div className="w-24 h-24 sm:w-32 sm:h-32 p-2 sm:p-4 bg-accent overflow-hidden ">
        <img
          src={productImage}
          alt={productName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/products/product.png';
          }}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm md:text-lg text-primary truncate">
          {productName}
        </h3>
        <p className="text-sm text-primary font-semibold">
          ₹ {item.price.toLocaleString('en-IN')}
        </p>
        <div className="text-sm text-secondary mt-1">
          <p className="flex items-center">
            <span className="font-medium">Size: </span>
            <span className="ml-1 font-medium">{productSize}</span>
          </p>
          <p className="flex items-center">
            <span className="font-medium">Color: </span>
            <span className="ml-1 font-medium">{productColor}</span>
          </p>
        </div>
      </div>

      {/* Quantity & Remove Section */}
       <div className="flex pb-2 md:pb-4 pr-2 md:pr-4 items-center self-end justify-between sm:justify-end gap-1.5 sm:gap-3">
          <div className="sm:w-auto  outline-offset-[-0.60px] outline-tags inline-flex justify-center items-center  border border-[#EF3B6D] rounded-sm px-3 py-1 sm:px-3  sm:py-1 gap-1.5 sm:gap-3 bg-white">
           
            {item.quantity > 1 ? (
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className=" text-[#EF3B6D] hover:text-pink-600 disabled:opacity-50 transition-colors   rounded  items-center justify-center cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            ) : (
              <button
                onClick={handleRemove}
                className="flex text-[#EF3B6D] hover:text-pink-600 disabled:opacity-50 transition-colors rounded  items-center justify-center cursor-pointer"
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
              className="text-[#EF3B6D] hover:text-pink-600 disabled:opacity-50 transition-colors rounded  flex items-center justify-center cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3 sm:h-5 sm:w-5" />
            </button>
          </div>
    </div>
    </div>
  );
};

export default CartItem;
