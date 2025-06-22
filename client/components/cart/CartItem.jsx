import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Trash2 } from 'lucide-react';

const CartItem = ({ item }) => {
  const [quantity, setQuantity] = useState(item.quantity);

  return (
    <div className="rounded-lg p-4 flex items-center gap-6 shadow-sm border border-primary">
      <div className=" bg-brand-background  ">
        <Image 
          src={item.image} 
          alt={item.name} 
          width={100} 
          height={100} 
          className="rounded-md object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{item.name}</h3>
        <p className="text-gray-800 font-bold mt-1">₹ {item.price.toLocaleString('en-IN')}</p>
        <p className="text-sm text-gray-500">Size: {item.size}</p>
        <p className="text-sm text-gray-500">Color: {item.color}</p>
      </div>
      <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 py-1">
        <button 
          onClick={() => setQuantity(q => Math.max(1, q - 1))}
          className="text-red-600 hover:text-brand-accent disabled:opacity-50"
          disabled={quantity === 1}
        >
          {quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
        </button>
        <span className="font-semibold w-6 text-center text-red-600">{quantity}</span>
        <button 
          onClick={() => setQuantity(q => q + 1)}
          className="text-red-600 hover:text-brand-accent"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem; 