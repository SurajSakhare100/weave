import { CartItem } from '@/types/index.d';

export interface CartSummary {
  subtotal: number;
  mrpTotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export function calculateCartSummary(items: CartItem[], options: { 
  shippingFeeThreshold?: number;
  defaultShippingFee?: number;
} = {}): CartSummary {
  const {
    shippingFeeThreshold = 2000,
    defaultShippingFee = 40
  } = options;

  // Calculate subtotal (selling price) with error handling
  const subtotal = items.reduce((sum, item) => {
    if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
      console.warn('Invalid cart item for calculation:', item);
      return sum;
    }
    return sum + (item.price * item.quantity);
  }, 0);

  // Calculate MRP total
  const mrpTotal = items.reduce((sum, item) => {
    if (!item || typeof item.mrp !== 'number' || typeof item.quantity !== 'number') {
      return sum;
    }
    return sum + (item.mrp * item.quantity);
  }, 0);

  // Calculate discount (difference between MRP and selling price)
  const discount = mrpTotal - subtotal;

  // Conditional shipping fee - free if subtotal is over the threshold
  const shipping = subtotal >= shippingFeeThreshold ? 0 : defaultShippingFee;

  // Calculate total
  const total = Math.max(0, subtotal + shipping);

  return {
    subtotal,
    mrpTotal,
    shipping,
    discount,
    total
  };
}
