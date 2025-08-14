import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchCart, updateCartQuantity, removeCartItem, clearCartAsync } from '../features/cart/cartSlice';
import { Button } from '../components/ui/button';
import { useRouter } from 'next/router';
import MainLayout from "@/components/layout/MainLayout"
import Breadcrumb from "@/components/ui/Breadcrumb"
import MobilePageHeader from "@/components/ui/MobilePageHeader"
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
        <MobilePageHeader title="Cart" />
        <div className="min-h-screen bg-white pb-28 sm:pb-12 pt-2 sm:pt-12">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className='hidden sm:block'>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Cart', isCurrent: true }
            ]}
            className=" w-full mb-4 sm:mb-8 text-base sm:text-2xl"
          />
          </div>
          <div className="sm:w-7xl flex-col sm:flex-row flex gap-6 sm:gap-8">
            {/* Cart Items */}
            <div className="sm:w-lg flex flex-col gap-4 sm:gap-6">
              {/* <div className="hidden sm:block flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Shopping Cart ({items.length} items)</h2>
                {items.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 w-fit"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cart
                  </Button>
                )}
              </div> */}
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
           <div className='flex-col  sm:flex-1 justify-start sm:max-w-3xl w-full'> 
           <div className="w-full  space-y-4 sm:space-y-6">
              {/* Summary Card */}
              <div className="bg-[#fff9f5] w-full rounded-xl p-4 sm:p-6 mb-2 relative">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-8 h-8 bg-[#6c4323] text-white rounded flex items-center justify-center font-bold text-xl">🧾</div>
                  <div className='flex gap-2 items-center'>
                  <span className="text-[#6c4323] font-bold text-base sm:text-lg">To Pay</span>
                  <span className="text-[#6c4323] line-through text-sm sm:text-lg">₹ {(itemTotal + discount).toLocaleString()}</span>
                  <span className=" font-bold text-base sm:text-lg">₹ {(itemTotal + deliveryFee + 10 - discount).toLocaleString()}</span>
                  </div>
                  <button
                    className="absolute top-4 sm:top-6 right-4 sm:right-6 p-1 bg-transparent border-none outline-none cursor-pointer"
                    onClick={() => setSummaryOpen((open) => !open)}
                    aria-label="Toggle summary details"
                  >
                    {summaryOpen ? (
                      <ChevronUp className="h-6 w-6 sm:h-7 sm:w-7 text-[#8b7355] transition-transform duration-200" />
                    ) : (
                      <ChevronDown className="h-6 w-6 sm:h-7 sm:w-7 text-[#8b7355] transition-transform duration-200" />
                    )}
                  </button>
                </div>
                <div className=" font-semibold mb-4 text-sm sm:text-base text-feedback-success">₹ {discount} saved on the total!</div>
                {summaryOpen && (
                  <div className="divide-y divide-[#f5e7df]">
                    <div className="flex justify-between py-3 sm:py-4 text-[#8b7355] text-sm sm:text-base items-center">
                      <span>Item Total</span>
                      <span className="flex items-center gap-2 font-medium">
                        <span className="line-through text-[#bcae9e] text-xs sm:text-sm">₹ {(itemTotal + discount).toLocaleString()}</span>
                        <span className="text-[#6c4323] font-bold text-sm sm:text-base">₹ {itemTotal.toLocaleString()}</span>
                      </span>
                    </div>
                    <div className="flex justify-between py-3 sm:py-4 text-[#8b7355] text-sm sm:text-base items-center">
                      <span>Delivery fee</span>
                      <span className="text-[#6c4323] font-bold">₹ {deliveryFee}</span>
                    </div>
                    <div className="flex justify-between py-3 sm:py-4 text-[#8b7355] text-sm sm:text-base items-center">
                      <span>Cash/Pay on Delivery fee</span>
                      <span className="text-[#6c4323] font-bold">₹ 10</span>
                    </div>
                    <div className="flex justify-between py-3 sm:py-4 font-bold text-[#6c4323] text-base sm:text-lg items-center">
                      <span>Order Total</span>
                      <span>₹ {(itemTotal + deliveryFee + 10 - discount).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Spacer for sticky button on mobile */}
              <div className="h-2 sm:h-0" />
            </div>
            <div className="hidden sm:flex justify-start py-8">
            <Button
              onClick={() => router.push('/checkout/address')}
              className="bg-[#EF3B6D] hover:bg-[#e22e61] text-white px-10 py-5 text-base font-semibold rounded-lg w-[320px]"
            >
              Continue to checkout
            </Button>
          </div>
           </div>
            
          </div>
          {/* Desktop/Tablet CTA below grid, centered */}
          
        </div>

        {/* Sticky checkout bar (mobile) */}
        <div
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-gray-200 sm:hidden"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
        >
          <div className="max-w-7xl mx-auto px-5 py-3 h-auto flex items-center justify-between">
            <Button
              onClick={() => router.push('/checkout/address')}
              className="w-full h-full bg-[#EF3B6D] hover:bg-[#e22e61] text-white py-4 text-base font-semibold rounded-lg"
            >
              Continue to checkout
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CartPage;
