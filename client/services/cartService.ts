import api from './api';

export async function getCart() {
  try {
    console.log('Cart service - getCart called');
    const res = await api.get(`/users/cart`);
    console.log('Cart service - getCart response:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('Cart service - getCart error:', error);
    console.error('Cart service - getCart error response:', error.response?.data);
    return { success: false, result: [], message: 'Failed to load cart' };
  }
}

export async function addToCart(product: any, quantity: number = 1, variantSize?: string) {
  try {
    console.log('Cart service - Input:', { product, quantity, variantSize });
    
    // Validate product data
    if (!product || !product._id) {
      throw new Error('Invalid product data');
    }

    if (!product.price || !product.mrp) {
      throw new Error('Product price and MRP are required');
    }

    // Ensure we have a valid size - use provided variantSize, fallback to product sizes, then default to 'M'
    let selectedSize = 'M';
    if (variantSize) {
      selectedSize = variantSize;
    } else if (product?.sizes && product.sizes.length > 0) {
      selectedSize = product.sizes[0];
    } else if (product?.currVariantSize) {
      selectedSize = product.currVariantSize;
    }

    const cartItem = {
      proId: product._id,
      quantity: Math.max(1, quantity), // Ensure quantity is at least 1
      price: product.price,
      mrp: product.mrp,
      variantSize: selectedSize
    };
    
    console.log('Cart service - Sending cart item:', cartItem);
    
    const res = await api.post(`/users/cart`, cartItem);
    console.log('Cart service - Response:', res.data);
    
    return res.data;
  } catch (error: any) {
    console.error('Cart service - Error:', error);
    return { success: false, message: error.message || 'Failed to add item to cart' };
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
    const res = await api.delete(`/users/cart`);  // Clear the entire cart
    return res.data;
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    return { success: false, message: 'Failed to clear cart' };
  }
} 