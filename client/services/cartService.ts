import api from './api';

export async function getCart() {
  try {
    const res = await api.get(`/users/cart`);
    return res.data;
  } catch (error: any) {
    return { success: false, result: [], message: 'Failed to load cart' };
  }
}

/**
 * New addToCart signature:
 * payload: {
 *  productId: string,
 *  quantity?: number,
 *  variantId?: string,
 *  size?: string | null,
 *  price?: number,
 *  mrp?: number,
 *  name?: string,
 *  image?: string,
 *  color?: string,
 *  colorCode?: string
 * }
 */
export async function addToCart(payload: any) {
  try {
    if (!payload || (!payload.productId && !payload.proId)) {
      throw new Error('Invalid product data');
    }

    // Normalize incoming keys
    const proId = payload.productId ?? payload.proId;
    const quantity = Math.max(1, Number(payload.quantity ?? 1));
    const price = Number(payload.price ?? payload.product?.price ?? 0);
    const mrp = Number(payload.mrp ?? payload.product?.mrp ?? 0);

    if (!price || !mrp) {
      throw new Error('Product price and MRP are required');
    }

    const body: any = {
      proId,
      quantity,
      price,
      mrp,
    };

    // optional metadata
    if (payload.variantId) body.variantId = payload.variantId;
    if (payload.size) body.size = payload.size;
    if (payload.variantSize) body.size = payload.variantSize;
    if (payload.color) body.color = payload.color;
    if (payload.colorCode) body.colorCode = payload.colorCode;
    if (payload.name) body.name = payload.name;
    if (payload.image) body.image = payload.image;

    const res = await api.post(`/users/cart`, body);
    return res.data;
  } catch (error: any) {
    return { success: false, result: [], message: error.message || 'Failed to add item to cart' };
  }
}

/**
 * updateCartItem accepts an object:
 * { proId?, cartItemId?, quantity, variantId?, size? }
 * If cartItemId is provided, it will call PUT /users/cart/{cartItemId}
 * Otherwise it will call PUT /users/cart/{proId}
 */
export async function updateCartItem(args: {
  proId?: string;
  cartItemId?: string;
  quantity: number;
  variantId?: string;
  size?: string | null;
}) {
  try {
    const { proId, cartItemId, quantity, variantId, size } = args;
    if (typeof quantity !== 'number' || quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    let res;
    const body: any = { quantity };
    if (variantId) body.variantId = variantId;
    if (typeof size !== 'undefined') body.size = size;

    if (cartItemId) {
      res = await api.put(`/users/cart/${cartItemId}`, body);
    } else if (proId) {
      res = await api.put(`/users/cart/${proId}`, body);
    } else {
      throw new Error('Missing identifier to update cart item');
    }

    return res.data;
  } catch (error: any) {
    return { success: false, result: [], message: error.message || 'Failed to update cart item' };
  }
}

/**
 * removeFromCart accepts an object:
 * { proId?, cartItemId?, variantId?, size? }
 * If cartItemId provided -> DELETE /users/cart/{cartItemId}
 * Else will call DELETE /users/cart with body containing identifiers
 */
export async function removeFromCart(args: {
  proId?: string;
  cartItemId?: string;
  variantId?: string;
  size?: string | null;
}) {
  try {
    const { proId, cartItemId, variantId, size } = args || {};

    if (cartItemId) {
      const res = await api.delete(`/users/cart/${cartItemId}`);
      return res.data;
    }

    // If backend supports DELETE /users/cart with a request body (axios supports data in config)
    const body: any = {};
    if (proId) body.proId = proId;
    if (variantId) body.variantId = variantId;
    if (typeof size !== 'undefined') body.size = size;

    const res = await api.delete(`/users/cart`, { data: body });
    return res.data;
  } catch (error: any) {
    return { success: false, result: [], message: error.message || 'Failed to remove item from cart' };
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