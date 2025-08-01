import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchCart, updateCartQuantity, removeCartItem, clearCartAsync } from '../features/cart/cartSlice';
import { Button } from '../components/ui/button';
import { useRouter } from 'next/router';
import MainLayout from "@/components/layout/MainLayout"
import Breadcrumb from "@/components/ui/Breadcrumb"
import CartItem from '../components/cart/CartItem.jsx';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface CartItem {
  proId: string;
  quantity: number;
  price: number;
  mrp: number;
  variantSize?: string;
  item: {
    _id: string;
    name: string;
    images?: {
      url: string;
    }[];
    color?: string;
    size?: string;
  };
}

const CartPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { items, loading, error } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [debounceTimers, setDebounceTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart()).catch((error) => {
        toast.error('Failed to load cart. Please try again.');
      });
    }
  }, [isAuthenticated, dispatch]);

  // Refresh cart when user returns to the page
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated) {
        dispatch(fetchCart());
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated, dispatch]);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      debounceTimers.forEach(timer => clearTimeout(timer));
    };
  }, [debounceTimers]);

  const handleQuantityChange = useCallback(async (proId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    // Clear existing timer for this item
    const existingTimer = debounceTimers.get(proId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set loading state immediately
    setUpdatingItems(prev => new Set(prev).add(proId));
    
    // Create new debounced timer
    const timer = setTimeout(async () => {
      try {
        await dispatch(updateCartQuantity({ proId, quantity: newQuantity })).unwrap();
        toast.success('Quantity updated successfully');
      } catch (error: any) {
        console.error('Failed to update quantity:', error);
        toast.error(error.message || 'Failed to update quantity. Please try again.');
      } finally {
        setUpdatingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(proId);
          return newSet;
        });
        // Remove timer from map
        setDebounceTimers(prev => {
          const newMap = new Map(prev);
          newMap.delete(proId);
          return newMap;
        });
      }
    }, 500); // 500ms debounce delay
    
    // Store the timer
    setDebounceTimers(prev => new Map(prev).set(proId, timer));
  }, [dispatch, debounceTimers]);

  const handleRemoveItem = async (proId: string) => {
    if (!proId) {
      toast.error('Invalid item');
      return;
    }
    
    // Clear any pending debounce timer for this item
    const existingTimer = debounceTimers.get(proId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      setDebounceTimers(prev => {
        const newMap = new Map(prev);
        newMap.delete(proId);
        return newMap;
      });
    }
    
    setUpdatingItems(prev => new Set(prev).add(proId));
    try {
      await dispatch(removeCartItem(proId)).unwrap();
      toast.success('Item removed from cart');
    } catch (error: any) {
      console.error('Failed to remove item:', error);
      toast.error(error.message || 'Failed to remove item. Please try again.');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(proId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart? This action cannot be undone.')) {
      return;
    }
    
    // Clear all pending debounce timers
    debounceTimers.forEach(timer => clearTimeout(timer));
    setDebounceTimers(new Map());
    
    try {
      await dispatch(clearCartAsync()).unwrap();
      toast.success('Cart cleared successfully');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast.error('Failed to clear cart. Please try again.');
    }
  };

  // Calculate totals with better error handling
  const itemTotal = items.reduce((sum, item) => {
    if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
      return sum;
    }
    return sum + (item.price * item.quantity);
  }, 0);
  
  const deliveryFee = 40;
  const discount = 0; // 10% discount for demo
  const totalAmount = Math.max(0, itemTotal + deliveryFee - discount);

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

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Error loading cart</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => dispatch(fetchCart())}>Try Again</Button>
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
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Shopping Cart ({items.length} items)</h2>
                {items.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cart
                  </Button>
                )}
              </div>
              {items.filter(item => item && item.proId && item.item).map((item: CartItem) => (
                <CartItem 
                  key={item.proId} 
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                  isUpdating={updatingItems.has(item.proId)}
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
              <div className="w-fit mt-6">
                <Button
                  onClick={() => router.push('/checkout/address')}
                  className="w-full bg-bg-button  text-white py-3 px-10 text-lg font-semibold"
                >
                  Continue to checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CartPage;
