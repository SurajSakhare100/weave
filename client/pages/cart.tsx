import Layout from '@/components/Layout';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { removeItem, clearCart, updateQuantity } from '../features/cart/cartSlice';

export default function CartPage() {
  const cart = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  return (
    <Layout>
      <section className="py-16 bg-[#faf5f2] text-black min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Your Cart</h1>
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="text-6xl mb-4">🛒</span>
              <p className="text-lg text-gray-500 mb-4">Your cart is empty.</p>
              <Link href="/products" className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition">Shop Products</Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow p-6">
              <ul className="divide-y">
                {cart.map(item => (
                  <li key={item.id} className="py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{item.name}</div>
                      <div className="text-gray-500">₹{item.price} each</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50" 
                        onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))} 
                        disabled={item.quantity === 1}
                      >
                        -
                      </button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <button 
                        className="px-2 py-1 bg-gray-200 rounded" 
                        onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                      >
                        +
                      </button>
                      <span className="ml-4 font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                      <button 
                        className="ml-2 text-red-500 hover:underline" 
                        onClick={() => dispatch(removeItem(item.id))}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <span className="font-bold text-xl">Total: ₹{total.toFixed(2)}</span>
                <div className="flex gap-2 mt-4 sm:mt-0">
                  <button 
                    className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600" 
                    onClick={() => dispatch(clearCart())}
                  >
                    Clear Cart
                  </button>
                  <Link 
                    href="/checkout" 
                    className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
} 