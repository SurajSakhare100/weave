import api from './api';

export async function getCart() {
  try {
    const res = await api.get(`/users/cart`);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return { success: false, result: [], message: 'Failed to load cart' };
  }
}

export async function addToCart(product: any, quantity: number = 1, variantSize?: string) {
  try {
    const cartItem = {
      proId: product?._id,
      quantity: quantity,
      price: product?.price,
      mrp: product?.mrp,
      variantSize: variantSize || product?.currVariantSize || 'M'
    };
    
    const res = await api.post(`/users/cart`, cartItem);
    return res.data;
  } catch (error: any) {
    console.error('Cart service - Error:', error);
    return { success: false, message: 'Failed to add item to cart' };
  }
}

export async function updateCartItem(itemId: string, quantity: number) {
  try {
    const res = await api.put(`/users/cart/${itemId}`, { quantity });
    return res.data;
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    return { success: false, message: 'Failed to update cart item' };
  }
}

export async function removeFromCart(itemId: string) {
  try {
    const res = await api.delete(`/users/cart/${itemId}`);
    return res.data;
  } catch (error: any) {
    console.error('Error removing from cart:', error);
    return { success: false, message: 'Failed to remove item from cart' };
  }
}

export async function clearCart() {
  try {
    const res = await api.delete(`/users/cart`);
    return res.data;
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    return { success: false, message: 'Failed to clear cart' };
  }
} 