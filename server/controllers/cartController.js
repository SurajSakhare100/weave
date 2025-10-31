import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import userHelpers from '../helpers/userHelpers.js';
import User from '../models/User.js';
import { toObjectId } from '../utils/generateToken.js';

// GET /users/cart
export const getCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      res.status(401);
      throw new Error('User not authenticated');
    }

    const cart = await userHelpers.getCartItems(userId);
    return res.json({ success: true, ...cart });
  } catch (error) {
    console.error('Cart controller - Get cart error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to load cart' });
  }
});

// POST /users/cart
export const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    res.status(401);
    throw new Error('User not authenticated');
  }

  const item = req.body || {};
  // Accept either proId or productId
  const incomingProId = item.proId ?? item.productId ?? item.proId;
  if (!incomingProId) {
    res.status(400);
    throw new Error('Product ID is required');
  }

  const proId = toObjectId(incomingProId);
  if (!proId) {
    res.status(400);
    throw new Error('Invalid product ID format');
  }

  if (!item.price || !item.mrp) {
    res.status(400);
    throw new Error('Product price and MRP are required');
  }

  // Determine size (support variantSize or size)
  let selectedSize = null;
  if (item.variantSize) selectedSize = item.variantSize;
  else if (item.size) selectedSize = item.size;

  const cartItem = {
    proId,
    quantity: Math.max(1, item.quantity || 1),
    price: item.price,
    mrp: item.mrp,
  };

  if (item.variantId) cartItem.variantId = item.variantId;
  if (selectedSize) cartItem.size = selectedSize;
  if (item.color) cartItem.color = item.color;
  if (item.colorCode) cartItem.colorCode = item.colorCode;
  if (item.name) cartItem.name = item.name;
  if (item.image) cartItem.image = item.image;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const result = await userHelpers.addToCart({ userId, item: cartItem });

  // Return updated cart
  const updatedCart = await userHelpers.getCartItems(userId);
  res.json({ success: true, added: true, ...updatedCart });
});

// PUT /users/cart/:itemId
// Accepts either cartItemId in params or proId in params; also accepts cartItemId/proId/variantId/size in body.
export const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    res.status(401);
    throw new Error('User not authenticated');
  }

  const paramsId = req.params.itemId;
  const { quantity, variantId, size, cartItemId, proId: bodyProId } = req.body || {};

  if (typeof quantity !== 'number') {
    res.status(400);
    throw new Error('Quantity must be a number');
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // If quantity <= 0 treat as removal
  if (quantity <= 0) {
    // Prefer cartItemId from body, then params, then proId
    const removeCartItemId = cartItemId ?? paramsId ?? bodyProId;
    // Try to remove by cart item id or by product id
    await userHelpers.removeItemCart({ userId, cartItemId: removeCartItemId, proId: toObjectId(removeCartItemId) });
    const cart = await userHelpers.getCartItems(userId);
    return res.json({ success: true, removed: true, ...cart });
  }

  // Update quantity: prefer explicit cartItemId, else use proId (params or body)
  if (cartItemId) {
    await userHelpers.changeQuantityCart({ userId, cartItemId, quantity });
  } else {
    const proIdToUse = bodyProId ?? paramsId;
    const proObjectId = toObjectId(proIdToUse);
    await userHelpers.changeQuantityCart({ userId, proId: proObjectId, variantId, size, quantity });
  }

  const cart = await userHelpers.getCartItems(userId);
  res.json({ success: true, updated: true, ...cart });
});

// DELETE /users/cart/:itemId  OR DELETE /users/cart  (with body containing identifiers)
export const removeFromCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      res.status(401);
      throw new Error('User not authenticated');
    }

    const paramId = req.params.itemId;
    const { proId: bodyProId, cartItemId: bodyCartItemId, variantId, size } = req.body || {};

    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Prefer explicit cartItemId, then param id, then proId in body
    const targetCartItemId = bodyCartItemId ?? paramId;
    const targetProId = bodyProId ?? (paramId && !targetCartItemId ? paramId : undefined);

    await userHelpers.removeItemCart({
      userId,
      cartItemId: targetCartItemId,
      proId: targetProId ? toObjectId(targetProId) : undefined,
      variantId,
      size
    });

    const cart = await userHelpers.getCartItems(userId);
    res.json({ success: true, removed: true, ...cart });
  } catch (error) {
    console.error('Cart controller - Remove error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /users/cart/cleanup (Admin only)
export const cleanupCart = asyncHandler(async (req, res) => {
  try {
    await userHelpers.cleanupInvalidCartItems();
    res.json({ success: true, message: 'Cart cleanup completed' });
  } catch (error) {
    console.error('Cart controller - Cleanup error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to cleanup cart' });
  }
});

// DELETE /users/cart
export const clearCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      res.status(401);
      throw new Error('User not authenticated');
    }
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    await userHelpers.emtyCart(userId);

    const cart = await userHelpers.getCartItems(userId);
    res.json({ success: true, message: 'Cart cleared successfully', ...cart });
  } catch (error) {
    console.error('Cart controller - Clear cart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});