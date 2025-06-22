import Image from 'next/image';

const SummaryItem = ({ item }) => (
  <div className="flex items-center justify-between py-4">
    <div className="flex items-center gap-4">
      <div className="relative">
        <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md object-cover border" />
        <span className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {item.quantity}
        </span>
      </div>
      <div>
        <p className="font-semibold">{item.name}</p>
        <p className="text-sm text-gray-400">{item.size} / {item.color}</p>
      </div>
    </div>
    <p className="font-semibold">₹ {item.price.toLocaleString('en-IN')}</p>
  </div>
);

const CheckoutOrderSummary = ({ items, summary }) => {
  return (
    <div className="bg-[#f5f5f5] p-6 rounded-lg">
      {items.map(item => <SummaryItem key={item.id} item={item} />)}
      
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
          <span>Subtotal</span>
          <span className="font-semibold">₹ {summary.subtotal.toLocaleString('en-IN')}</span>
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