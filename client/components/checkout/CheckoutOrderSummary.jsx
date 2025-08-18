import Image from 'next/image';
import { calculateCartSummary } from '../../utils/cartCalculations';

const SummaryItem = ({ item }) => {
  // Get the primary image from product images or fallback to item.image
  const getProductImage = () => {
    if (item.item?.images && item.item.images.length > 0) {
      const primary = item.item.images.find(img => img.is_primary);
      return primary ? primary.url : item.item.images[0].url;
    }
    return item.image || '/products/product.png';
  };

  // Get the selected size, fallback to product sizes, then default to 'M'
  const getSelectedSize = () => {
    return item.variantSize || 
      (item.item?.sizes && item.item.sizes.length > 0 ? item.item.sizes[0] : 'M');
  };

  // Get the product color or default
  const getProductColor = () => {
    return item.item?.color || 'Pink';
  };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Image src={getProductImage()} alt={item.name || item.item?.name} width={64} height={64} className="rounded-md object-cover border" />
          <span className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {item.quantity}
          </span>
        </div>
        <div>
          <p className="font-semibold">{item.name || item.item?.name}</p>
          <p className="text-sm text-gray-400">{getSelectedSize()} / {getProductColor()}</p>
        </div>
      </div>
      <p className="font-semibold">₹ {item.price.toLocaleString('en-IN')}</p>
    </div>
  );
};

const CheckoutOrderSummary = ({ items }) => {
  // Calculate summary using the new utility
  const summary = calculateCartSummary(items);

  return (
    <div className="bg-[#f5f5f5] p-6 rounded-lg">
      {items.map(item => <SummaryItem key={item.proId} item={item} />)}
      
      <div className="border-t border-b border-gray-300 py-6 my-4">
        <div className="flex gap-2">
          <input 
            type="text"
            placeholder="Discount code"
            className="flex-grow px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
          <button className="px-6 bg-gray-300 text-gray-600 rounded-md font-semibold hover:bg-gray-400 transition-colors">
            Apply
          </button>
        </div>
      </div>
      
      <div className="space-y-2 text-gray-800">
        <div className="flex justify-between">
          <span>MRP Total</span>
          <span className="font-semibold line-through text-gray-500">₹ {summary.mrpTotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold">₹ {summary.subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-green-600">
          <span>Discount</span>
          <span className="font-semibold">₹ {summary.discount.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span className="font-semibold">₹ {summary.shipping.toLocaleString('en-IN')}</span>
        </div>
      </div>
      
      <div className="border-t border-gray-300 mt-4 pt-4">
        <div className="flex justify-between items-center text-lg">
          <span className="font-bold">Total</span>
          <p>
            <span className="text-sm text-gray-500 mr-2">INR</span>
            <span className="font-bold text-2xl">₹ {summary.total.toLocaleString('en-IN')}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutOrderSummary; 