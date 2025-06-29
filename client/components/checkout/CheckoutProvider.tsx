import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { getCart } from '../../services/cartService';
import { placeOrder } from '../../services/orderService';

interface CheckoutItem {
  proId: string;
  name: string;
  price: number;
  mrp: number;
  quantity: number;
  variantSize?: string;
  image?: string;
}

interface ShippingAddress {
  name: string;
  address: string[];
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

interface CheckoutContextType {
  // Cart data
  cartItems: CheckoutItem[];
  cartLoading: boolean;
  cartError: string | null;
  
  // Address
  selectedAddress: ShippingAddress | null;
  setSelectedAddress: (address: ShippingAddress) => void;
  setShippingAddress: (address: ShippingAddress) => void;
  
  // Payment
  paymentMethod: 'online' | 'cod';
  setPaymentMethod: (method: 'online' | 'cod') => void;
  
  // Order
  orderLoading: boolean;
  orderError: string | null;
  placeOrder: () => Promise<boolean>;
  
  // Totals
  itemTotal: number;
  deliveryFee: number;
  totalAmount: number;
  discount: number;
  
  // Actions
  refreshCart: () => Promise<void>;
  clearCheckoutState: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};

interface CheckoutProviderProps {
  children: ReactNode;
}

// Helper functions for localStorage
const getStoredAddress = (): ShippingAddress | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('checkout_address');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const setStoredAddress = (address: ShippingAddress | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (address) {
      localStorage.setItem('checkout_address', JSON.stringify(address));
    } else {
      localStorage.removeItem('checkout_address');
    }
  } catch (error) {
    console.error('Error storing address:', error);
  }
};

const getStoredPaymentMethod = (): 'online' | 'cod' => {
  if (typeof window === 'undefined') return 'online';
  try {
    const stored = localStorage.getItem('checkout_payment_method');
    return (stored as 'online' | 'cod') || 'online';
  } catch {
    return 'online';
  }
};

const setStoredPaymentMethod = (method: 'online' | 'cod') => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('checkout_payment_method', method);
  } catch (error) {
    console.error('Error storing payment method:', error);
  }
};

export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CheckoutItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);
  
  const [selectedAddress, setSelectedAddressState] = useState<ShippingAddress | null>(null);
  const [paymentMethod, setPaymentMethodState] = useState<'online' | 'cod'>('online');
  
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Load stored state on mount
  useEffect(() => {
    const storedAddress = getStoredAddress();
    const storedPaymentMethod = getStoredPaymentMethod();
    
    if (storedAddress) {
      setSelectedAddressState(storedAddress);
    }
    if (storedPaymentMethod) {
      setPaymentMethodState(storedPaymentMethod);
    }
  }, []);

  const setSelectedAddress = (address: ShippingAddress) => {
    setSelectedAddressState(address);
    setStoredAddress(address);
  };

  const setPaymentMethod = (method: 'online' | 'cod') => {
    setPaymentMethodState(method);
    setStoredPaymentMethod(method);
  };

  const clearCheckoutState = () => {
    setSelectedAddressState(null);
    setPaymentMethodState('online');
    setStoredAddress(null);
    setStoredPaymentMethod('online');
  };

  const refreshCart = async () => {
    try {
      setCartLoading(true);
      setCartError(null);
      
      const response = await getCart();
      if (response.success === false) {
        setCartError(response.message || 'Failed to load cart');
        setCartItems([]);
      } else {
        const items = response.result || [];
        setCartItems(items.map((item: any) => ({
          proId: item.proId,
          name: item.item?.name || item.name,
          price: item.price,
          mrp: item.mrp,
          quantity: item.quantity,
          variantSize: item.variantSize,
          image: item.item?.files?.[0] ? `/uploads/${item.item.files[0]}` : "/products/product.png"
        })));
      }
    } catch (error: unknown) {
      console.error('Error refreshing cart:', error);
      setCartError('Failed to load cart');
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const itemTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = cartItems.length > 0 ? 40 : 0;
  const discount = Math.round(itemTotal * 0.1); // 10% discount for demo
  const totalAmount = itemTotal + deliveryFee - discount;

  const handlePlaceOrder = async (): Promise<boolean> => {
    if (!selectedAddress) {
      setOrderError('Please select a delivery address');
      return false;
    }

    if (cartItems.length === 0) {
      setOrderError('Cart is empty');
      return false;
    }

    try {
      setOrderLoading(true);
      setOrderError(null);

      const orderData = {
        items: cartItems,
        shippingAddress: selectedAddress,
        paymentMethod,
        totalAmount,
        itemTotal,
        deliveryFee,
        discount
      };

      const response = await placeOrder(orderData);
      
      if (response.success === false) {
        setOrderError(response.message || 'Failed to place order');
        return false;
      }

      // Clear cart and checkout state after successful order
      setCartItems([]);
      clearCheckoutState();
      return true;
    } catch (error: unknown) {
      console.error('Error placing order:', error);
      setOrderError('Failed to place order. Please try again.');
      return false;
    } finally {
      setOrderLoading(false);
    }
  };

  const value: CheckoutContextType = {
    cartItems,
    cartLoading,
    cartError,
    selectedAddress,
    setSelectedAddress,
    setShippingAddress: setSelectedAddress,
    paymentMethod,
    setPaymentMethod,
    orderLoading,
    orderError,
    placeOrder: handlePlaceOrder,
    itemTotal,
    deliveryFee,
    totalAmount,
    discount,
    refreshCart,
    clearCheckoutState
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}; 