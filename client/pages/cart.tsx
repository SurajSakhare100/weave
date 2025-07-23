import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { updateCartQuantity, removeCartItem } from '../features/cart/cartSlice';
import { getCart } from '../services/cartService';
import { Button } from '../components/ui/button';
import { useRouter } from 'next/router';
import MainLayout from "@/components/layout/MainLayout"
import Breadcrumb from "@/components/ui/Breadcrumb"
import CartItem from '../components/cart/CartItem';
import { ChevronUp, ChevronDown } from 'lucide-react';

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
  const [summaryOpen, setSummaryOpen] = useState(true);

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

  // Calculate totals
  const itemTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = items.length > 0 ? 40 : 0;
  const discount = Math.round(itemTotal * 0.1); // 10% discount for demo
  const totalAmount = itemTotal + deliveryFee - discount;

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please login to view your cart</h2>
            <Button onClick={() => router.push('/login')}>Login</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <Button onClick={() => router.push('/products')}>Continue Shopping</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col gap-8">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Cart', isCurrent: true }
            ]}
            className="mb-8 text-lg"
          />
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
            {/* Enhanced Order Summary */}
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-[#fff9f5] rounded-xl p-6 mb-2 relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-[#6c4323] text-white rounded flex items-center justify-center font-bold text-xl">🧾</div>
                  <span className="text-[#6c4323] font-bold text-lg">To Pay</span>
                  <span className="text-[#6c4323] line-through text-lg">₹ {(itemTotal + discount).toLocaleString()}</span>
                  <span className="text-[#6c4323] font-bold text-lg">₹ {(itemTotal + deliveryFee + 10 - discount).toLocaleString()}</span>
                  <button
                    className="absolute top-6 right-6 p-1 bg-transparent border-none outline-none cursor-pointer"
                    onClick={() => setSummaryOpen((open) => !open)}
                    aria-label="Toggle summary details"
                  >
                    {summaryOpen ? (
                      <ChevronUp className="h-7 w-7 text-[#8b7355] transition-transform duration-200" />
                    ) : (
                      <ChevronDown className="h-7 w-7 text-[#8b7355] transition-transform duration-200" />
                    )}
                  </button>
                </div>
                <div className="text-[#3ca06b] font-semibold mb-4 text-base">₹ {discount} saved on the total!</div>
                {summaryOpen && (
                  <div className="divide-y divide-[#f5e7df]">
                    <div className="flex justify-between py-4 text-[#8b7355] text-base items-center">
                      <span>Item Total</span>
                      <span className="flex items-center gap-2 font-medium">
                        <span className="line-through text-[#bcae9e]">₹ {(itemTotal + discount).toLocaleString()}</span>
                        <span className="text-[#6c4323] font-bold">₹ {itemTotal.toLocaleString()}</span>
                      </span>
                    </div>
                    <div className="flex justify-between py-4 text-[#8b7355] text-base items-center">
                      <span>Delivery fee</span>
                      <span className="text-[#6c4323] font-bold">₹ {deliveryFee}</span>
                    </div>
                    <div className="flex justify-between py-4 text-[#8b7355] text-base items-center">
                      <span>Cash/Pay on Delivery fee</span>
                      <span className="text-[#6c4323] font-bold">₹ 10</span>
                    </div>
                    <div className="flex justify-between py-4 font-bold text-[#6c4323] text-lg items-center">
                      <span>Order Total</span>
                      <span>₹ {(itemTotal + deliveryFee + 10 - discount).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Checkout Button */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <Button 
                  onClick={() => router.push('/checkout/address')}
                  className="w-full bg-[#cf1a53] hover:bg-[#cf1a53]/90 text-white py-3 text-lg font-semibold"
                >
                  Proceed to Checkout
                </Button>
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/products')}
                    className="w-full"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CartPage;
