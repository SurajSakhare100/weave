import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchCart, updateCartQuantity, removeCartItem, clearCartAsync } from '../../features/cart/cartSlice';
import { Button } from '../../components/ui/button';
import { useRouter } from 'next/router';
import MainLayout from "@/components/layout/MainLayout"
import Breadcrumb from "@/components/ui/Breadcrumb"
import { ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { calculateCartSummary } from '../../utils/cartCalculations';
import CartItem from '@/components/cart/CartItem.jsx';


const CartPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { items, loading, error } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch cart only once when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart())
        .then(() => setIsInitialLoading(false))
        .catch((error) => {
          setIsInitialLoading(false);
          toast.error('Failed to load cart. Please try again.');
        });
    } else {
      setIsInitialLoading(false);
    }
  }, [isAuthenticated, dispatch]);

  // Normalize items and build a stable unique key per product+variant+size so similar products with different variants are treated separately
  const normalizedItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items
      .filter(item => item && item.proId && item.item) // keep existing guard
      .map((it: any) => {
        const proId = String(it.proId);
        // variant id can come from multiple shapes
        const variantId = it.item?.variantId ?? it.variantId ?? it.item?.variant?._id ?? '';
        // size may be stored directly on item or under item.size / variantSize
        const size = (it.item?.size ?? it.item?.variantSize ?? it.size ?? '') as string;
        // color metadata
        const color = it.item?.color ?? it.color ?? it.item?.colorName ?? null;
        const colorCode = it.item?.colorCode ?? it.colorCode ?? null;
        // image fallback
        const image = it.item?.image ?? it.image ?? it.item?.images?.[0]?.url ?? it.item?.productImage ?? null;
        // title / name fallback
        const title = it.item?.name ?? it.item?.title ?? it.item?.productName ?? it.item?.itemName ?? it.item?.item?.name ?? it.name ?? '';
        // prefer a server-provided cart item id if present (e.g. it._id or it.cartId)
        const cartItemId = it._id ?? it.cartId ?? '';
        const uniqueKey = cartItemId || `${proId}_${variantId || 'novar'}_${size || 'nosize'}_${color || 'nocolor'}`;
        return {
          ...it,
          proId,
          variantId,
          size,
          color,
          colorCode,
          image,
          title,
          cartItemId,
          uniqueKey,
        };
      });
  }, [items]);

  // Memoize cart summary to prevent unnecessary recalculations
  const cartSummary = useMemo(() => {
    return calculateCartSummary(normalizedItems);
  }, [normalizedItems]);

  const { subtotal, mrpTotal, shipping, discount, total } = cartSummary;

  // Find item helper
  const findNormalizedItem = useCallback((uniqueKey: string) => {
    return normalizedItems.find((i: any) => i.uniqueKey === uniqueKey);
  }, [normalizedItems]);

  const handleQuantityChange = useCallback(async (uniqueKey: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const item = findNormalizedItem(uniqueKey);
    if (!item) {
      toast.error('Invalid item');
      return;
    }

    try {
      // Build explicit payload: prefer cartItemId, also include proId/productId, and only set variantId/size when present
      const payload: any = { quantity: newQuantity };

      if (item.cartItemId) {
        payload.cartItemId = item.cartItemId;
      }

      // include both shapes backend might accept
      payload.proId = item.proId;
      payload.productId = item.proId;

      if (item.variantId && item.variantId !== '') payload.variantId = item.variantId;
      if (item.size && item.size !== '') payload.size = item.size;

      await dispatch(updateCartQuantity(payload)).unwrap();
      toast.success('Quantity updated successfully');
    } catch (error: any) {
      console.error('Failed to update quantity:', error);
      toast.error(error.message || 'Failed to update quantity. Please try again.');
    }
  }, [dispatch, findNormalizedItem]);

  const handleRemoveItem = useCallback(async (uniqueKey: string) => {
    const item = findNormalizedItem(uniqueKey);
    if (!item) {
      toast.error('Invalid item');
      return;
    }
    try {
      // Prefer removing by cartItemId (server-side unique id).
      // Fallback to proId + variantId/size/color when cartItemId not available.
      const payload: any = {};
      if (item.cartItemId) {
        payload.cartItemId = item.cartItemId;
      } else {
        payload.proId = item.proId;
        if (item.variantId && item.variantId !== '') payload.variantId = item.variantId;
        if (item.size && item.size !== '') payload.size = item.size;
        if (item.color && item.color !== '') payload.color = item.color;
      }

      await dispatch(removeCartItem(payload)).unwrap();

      // ensure UI stays in sync
      await dispatch(fetchCart());

      toast.success('Item removed from cart');
    } catch (error: any) {
      console.error('Failed to remove item:', error);
      toast.error(error.message || 'Failed to remove item. Please try again.');
    }
  }, [dispatch, findNormalizedItem]);

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

  // Only show loader on initial page load, not during operations
  if (isInitialLoading) {
    return (
      <MainLayout>
         <section className="py-8 sm:py-12 lg:py-16 bg-[#faf5f2] min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex justify-center items-center py-12 sm:py-16 lg:py-20">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-b-2 border-pink-500"></div>
            </div>
          </div>
        </section>
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

  if (normalizedItems.length === 0) {
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
      <div className=" mt-16 sm:mt-0 min-h-screen bg-white pb-28 sm:pb-12 pt-2 sm:pt-12">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className='hidden sm:block'>
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Cart', isCurrent: true }
              ]}
              className=" w-full mb-4 sm:mb-8"
            />
          </div>
          <div className="w-full lg:w-7xl flex-col lg:flex-row flex gap-6 sm:gap-8">
            {/* Cart Items */}
            <div className="w-full lg:w-lg flex flex-col gap-4 sm:gap-6 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 scrollbar-none sm:max-h-[60vh]">
              {normalizedItems.map((item: any) => (
                <CartItem
                  key={item.uniqueKey}
                  item={item}
                  // bind handlers to uniqueKey so CartItem doesn't need to know composite ids
                  onQuantityChange={(newQty: number) => handleQuantityChange(item.uniqueKey, newQty)}
                  onRemove={() => handleRemoveItem(item.uniqueKey)}
                />
              ))}
            </div>
            {/* Enhanced Order Summary */}
            <div className='flex-col  sm:flex-1 justify-start sm:max-w-3xl w-full'>
              <div className="w-full  space-y-4 sm:space-y-6">
                {/* Summary Card */}
                <div className="bg-[#fff9f5] w-full rounded-xl p-4 sm:p-6 mb-2 relative">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 mb-2">
                    <div className="w-8 h-8 bg-secondary text-white rounded flex items-center justify-center font-bold text-xl">🧾</div>
                    <div className='flex flex-col gap-1 justify-start'>
                      <div className='flex gap-2 items-center'>
                        <span className="text-primary font-bold text-base sm:text-xl">To Pay</span>
                        <span className="text-secondary  font-bold line-through text-sm sm:text-xl">₹ {mrpTotal.toLocaleString()}</span>
                        <span className=" font-bold text-base sm:text-xl text-primary">₹ {total.toLocaleString()}</span>
                      </div>
                      <div>
                        <div className=" font-semibold mb-4 text-sm sm:text-lg text-feedback-success">₹ {discount - 40} saved on the total!</div>

                      </div>
                    </div>
                    <button
                      className="absolute top-4 sm:top-6 right-4 sm:right-6 p-1 bg-transparent border-none outline-none cursor-pointer"
                      onClick={() => setSummaryOpen((open) => !open)}
                      aria-label="Toggle summary details"
                    >
                      {summaryOpen ? (
                        <ChevronUp className="h-6 w-6 sm:h-7 sm:w-7 text-secondary transition-transform duration-200" />
                      ) : (
                        <ChevronDown className="h-6 w-6 sm:h-7 sm:w-7 text-secondary transition-transform duration-200" />
                      )}
                    </button>
                  </div>
                  {summaryOpen && (
                    <div className=" divide-[#ead6ca94] divide-dashed divide-y-2">
                      <div className="flex justify-between py-3 sm:py-5 text-secondary text-sm sm:text-base items-center">
                        <span>Item Total</span>
                        <span className="flex items-center gap-2 font-medium">
                          <span className="line-through text-[#B59C8A] font-bold text-xs sm:text-base">₹ {mrpTotal.toLocaleString()}</span>
                          <span className="text-primary font-bold text-sm sm:text-lg">₹ {subtotal.toLocaleString()}</span>
                        </span>
                      </div>
                      <div className="flex justify-between py-3 sm:py-5 text-secondary text-sm sm:text-base items-center">
                        <span>Delivery fee</span>
                        <span className="text-primary font-bold">₹ {shipping}</span>
                      </div>
                      <div className="flex justify-between py-3 sm:py-5 text-secondary text-sm sm:text-base items-center">
                        <span>Cash/Pay on Delivery fee</span>
                        <span className="text-primary font-bold">₹ 0</span>
                      </div>
                      <div className="flex justify-between py-3 sm:py-5 font-bold text-primary text-base sm:text-lg items-center">
                        <span>Order Total</span>
                        <span>₹ {total.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="h-2 sm:h-0" />
              </div>
              <div className="hidden sm:flex justify-start py-8">
                <Button
                  onClick={() => router.push('/checkout/address')}
                  className="bg-button hover:bg-hover text-white px-10 py-5 text-base font-semibold rounded-sm w-[320px] cursor-pointer"
                >
                  Continue to checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-gray-200 sm:hidden"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}
        >
          <div className="max-w-7xl mx-auto px-5 py-3 h-auto flex items-center justify-between">
            <Button
              onClick={() => router.push('/checkout/address')}
              className="w-full h-full bg-[#EF3B6D] hover:bg-[#e22e61] text-white py-3 text-base font-semibold rounded-sm cursor-pointer"
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