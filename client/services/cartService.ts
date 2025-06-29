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
    console.log('Cart service - Input:', { product, quantity, variantSize });
    
    // Send the exact structure the server expects
    const cartItem = {
      proId: product?._id, // Product ID
      quantity: quantity,
      price: product?.price,
      mrp: product?.mrp,
      variantSize: variantSize || product?.currVariantSize || 'M'
    };
    
    console.log('Cart service - Sending:', cartItem);
    
    const res = await api.post(`/users/cart`, cartItem);
    console.log('Cart service - Response:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('Cart service - Error:', error);
    return { success: false, message: 'Failed to add item to cart' };
  }
}

export async function updateCartItem(itemId: string, quantity: number) {
  try {
    console.log('Cart service - Updating item:', itemId, 'Quantity:', quantity);
    const res = await api.put(`/users/cart/${itemId}`, { quantity });
    console.log('Cart service - Update response:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    return { success: false, message: 'Failed to update cart item' };
  }
}

export async function removeFromCart(itemId: string) {
  try {
    console.log('Cart service - Removing item:', itemId);
    const res = await api.delete(`/users/cart/${itemId}`);
    console.log('Cart service - Remove response:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('Error removing from cart:', error);
    return { success: false, message: 'Failed to remove item from cart' };
  }
}

export async function clearCart() {
  try {
    console.log('Cart service - Clearing cart');
    const res = await api.delete(`/users/cart`);
    console.log('Cart service - Clear response:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    return { success: false, message: 'Failed to clear cart' };
  }
} 