import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import userHelpers from '../helpers/userHelpers.js';
import User from '../models/User.js';
import { toObjectId } from '../utils/generateToken.js';

// GET /users/cart
export const getCart = asyncHandler(async (req, res) => {
  try {
    console.log('Cart controller - getCart called');
    const userId = req.user._id;
    console.log('Cart controller - User ID:', userId);
    
    if (!userId) {
      res.status(401);
      throw new Error('User not authenticated');
    }
    
    const cart = await userHelpers.getCartItems(userId);
    console.log('Cart controller - getCartItems result:', cart);
    
    const response = { success: true, ...cart };
    console.log('Cart controller - Sending response:', response);
    
    res.json(response);
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
  
  const item = req.body;
  console.log('Cart controller - Request body:', item);
  console.log('Cart controller - User ID:', userId);
  
  // Validate required fields
  if (!item.proId) {
    res.status(400);
    throw new Error('Product ID is required');
  }
  
  if (!item.price || !item.mrp) {
    res.status(400);
    throw new Error('Product price and MRP are required');
  }
  
  // Convert proId to ObjectId using utility function
  const proId = toObjectId(item.proId);
  console.log('Cart controller - Converted proId:', proId);
  
  if (!proId) {
    res.status(400);
    throw new Error('Invalid product ID format');
  }
  
  // Ensure we have a valid size - use variantSize, fallback to size, then default to 'M'
  let selectedSize = 'M';
  if (item.variantSize) {
    selectedSize = item.variantSize;
  } else if (item.size) {
    selectedSize = item.size;
  }
  
  // Prepare cart item with proper ObjectId
  const cartItem = {
    proId: proId,
    quantity: Math.max(1, item.quantity || 1), // Ensure quantity is at least 1
    price: item.price,
    mrp: item.mrp,
    variantSize: selectedSize
  };
  
  console.log('Cart controller - Prepared cart item:', cartItem);
  
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  const result = await userHelpers.addToCart({ userId, item: cartItem });
  console.log('Cart controller - addToCart result:', result);
  
  // Return updated cart data after adding item
  const updatedCart = await userHelpers.getCartItems(userId);
  console.log('Cart controller - Updated cart:', updatedCart);
  
  res.json({ success: true, added: true, ...updatedCart });
});

// PUT /users/cart/:itemId
export const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    res.status(401);
    throw new Error('User not authenticated');
  }

  const proId = toObjectId(req.params.itemId);
  if (!proId) {
    res.status(400);
    throw new Error('Invalid product ID format');
  }

  const { quantity } = req.body;

  if (typeof quantity !== 'number') {
    res.status(400);
    throw new Error('Quantity must be a number');
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (quantity <= 0) {
    await userHelpers.removeItemCart({ userId, proId });
    const cart = await userHelpers.getCartItems(userId);
    return res.json({ success: true, removed: true, ...cart });
  }

  await userHelpers.changeQuantityCart({ userId, proId, quantity });
  const cart = await userHelpers.getCartItems(userId);
  res.json({ success: true, updated: true, ...cart });
});

// DELETE /users/cart/:itemId
export const removeFromCart = asyncHandler(async (req, res) => {
  try {
    
    const userId = req.user._id;
    if (!userId) {
      res.status(401);
      throw new Error('User not authenticated');
    }
    
    // Convert itemId to ObjectId using utility function
    const proId = toObjectId(req.params.itemId);
    if (!proId) {
      res.status(400);
      throw new Error('Invalid product ID format');
    }
    
    
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    await userHelpers.removeItemCart({ userId, proId });
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
    const userId = req.user._id;
    if (!userId) {
      res.status(401);
      throw new Error('User not authenticated');
    }
    
    // Call the cleanup function
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
    
    // Use the proper cart clearing function
    await userHelpers.emtyCart(userId);
    
    // Return empty cart data
    const cart = await userHelpers.getCartItems(userId);
    res.json({ success: true, message: 'Cart cleared successfully', ...cart });
  } catch (error) {
    console.error('Cart controller - Clear cart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}); 