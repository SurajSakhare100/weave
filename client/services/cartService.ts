import api from './api';

export async function getCart() {
  try {
    const res = await api.get(`/users/cart`);
    return res.data;
  } catch (error: any) {
    return { success: false, result: [], message: 'Failed to load cart' };
  }
}

export async function addToCart(product: any, quantity: number = 1, variantSize?: string) {
  try {
    if (!product || !product._id) {
      throw new Error('Invalid product data');
    }

    if (!product.price || !product.mrp) {
      throw new Error('Product price and MRP are required');
    }

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
      quantity: Math.max(1, quantity),
      price: product.price,
      mrp: product.mrp,
      variantSize: selectedSize,
      item: {
        _id: product._id,
        name: product.name || 'Unknown Product',
        images: product.images || [],
        color: product.color,
        size: product.size
      }
    };
    
    const res = await api.post(`/users/cart`, cartItem);
    
    return res.data;
  } catch (error: any) {
    return { success: false, result: [], message: error.message || 'Failed to add item to cart' };
  }
}

export async function updateCartItem(itemId: string, quantity: number) {
  try {
    // Validate quantity
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    const res = await api.put(`/users/cart/${itemId}`, { quantity });
    return res.data;
  } catch (error: any) {
    return { success: false, result: [], message: 'Failed to update cart item' };
  }
}

export async function removeFromCart(itemId: string) {
  try {
    const res = await api.delete(`/users/cart/${itemId}`);
    return res.data;
  } catch (error: any) {
    return { success: false, result: [], message: 'Failed to remove item from cart' };
  }
}

export async function clearCart() {
  try {
    const res = await api.delete(`/users/cart`);  // Clear the entire cart
    return res.data;
  } catch (error: any) {
    return { success: false, result: [], message: 'Failed to clear cart' };
  }
}