import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { updateCartQuantity, removeCartItem } from '@/features/cart/cartSlice';
import { AppDispatch } from '@/store/store';

interface CartItemProps {
  item: {
    _id: string;
    proId: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    image?: string;
  };
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch(updateCartQuantity({ proId: item.proId, quantity: newQuantity }));
    }
  };

  const handleRemove = () => {
    dispatch(removeCartItem(item.proId));
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200">
      <div className="flex-shrink-0">
        <img
          src={item.image || '/placeholder-product.png'}
          alt={item.name}
          className="w-16 h-16 object-cover rounded-md"
        />
      </div>
      
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{item.name}</h3>
        <p className="text-sm text-gray-500">₹{item.price}</p>
        {item.size && (
          <p className="text-sm text-gray-500">Size: {item.size}</p>
        )}
        {item.color && (
          <p className="text-sm text-gray-500">Color: {item.color}</p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={item.quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center text-gray-900">{item.quantity}</span>
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      <div className="text-right">
        <p className="font-medium text-gray-900">₹{item.price * item.quantity}</p>
        <button
          onClick={handleRemove}
          className="text-red-500 hover:text-red-700 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem; 