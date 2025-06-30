import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { updateCartQuantity, removeCartItem } from '../features/cart/cartSlice';
import { getCart, updateCartItem, removeFromCart } from '../services/cartService';
import { Trash2, Minus, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useRouter } from 'next/router';
import Layout from "@/components/Layout"
import Image from 'next/image';
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
  const [updating, setUpdating] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

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

  const handleQuantityChange = async (proId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdating(proId);
    try {
      const response = await updateCartItem(proId, newQuantity);
      if (response.success) {
        await dispatch(updateCartQuantity({ proId, quantity: newQuantity }));
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (proId: string) => {
    setRemoving(proId);
    try {
      const response = await removeFromCart(proId);
      if (response.success) {
        await dispatch(removeCartItem(proId));
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setRemoving(null);
    }
  };

  const calculateTotal = () => {
    return items.reduce((total: number, item: CartItem) => total + (item.price * item.quantity), 0);
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item: CartItem) => (
              <CartItem
                key={item.proId}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
          <div className="lg:col-span-2">
            <OrderSummary
              summary={{
                mrpTotal: items.reduce((sum, i) => sum + (i.price * i.quantity), 0),
                itemTotal: items.reduce((sum, i) => sum + (i.price * i.quantity), 0),
                savedAmount: 0, // You can update this if you have discount logic
                deliveryFee: 40, // Example static value
                codFee: 10, // Example static value
                orderTotal: items.reduce((sum, i) => sum + (i.price * i.quantity), 0) + 40 + 10,
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
