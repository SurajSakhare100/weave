import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { updateCartQuantity, removeCartItem } from '../features/cart/cartSlice';
import { getCart } from '../services/cartService';
import { Button } from '../components/ui/button';
import { useRouter } from 'next/router';
import Layout from "@/components/Layout"
import CartItem from '../components/cart/CartItem';
import OrderSummary from '../components/cart/OrderSummary';

interface CartItem {
  proId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

const CartPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { items, loading } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      const response = await getCart();
      if (response.success) {
        // Cart is already loaded via Redux, no need to dispatch again
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const handleQuantityChange = (proId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    dispatch(updateCartQuantity({ proId, quantity: newQuantity }));
  };

  const handleRemoveItem = (proId: string) => {
    dispatch(removeCartItem(proId));
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please login to view your cart</h2>
            <Button onClick={() => router.push('/login')}>Login</Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <Button onClick={() => router.push('/products')}>Continue Shopping</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col gap-8">
          <nav className="flex items-center space-x-2 text-lg mb-8">
            <span className="text-[#6c4323] font-bold">Home</span>
            <span className="text-[#b59c8a] text-2xl">&gt;</span>
            <span className="text-[#6c4323] font-medium">Cart</span>
          </nav>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cart Items */}
            <div className="flex flex-col gap-6">
              {items.map((item: CartItem) => (
                <CartItem
                  key={item.proId}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
            {/* Order Summary */}
            <div>
              <OrderSummary
                summary={{
                  mrpTotal: items.reduce((sum, i) => sum + (i.price * i.quantity), 0),
                  itemTotal: items.reduce((sum, i) => sum + (i.price * i.quantity), 0),
                  savedAmount: 243, // Example value, replace with real calculation if needed
                  deliveryFee: 40, 
                  codFee: 10,
                  orderTotal: items.reduce((sum, i) => sum + (i.price * i.quantity), 0) + 40 + 10,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
