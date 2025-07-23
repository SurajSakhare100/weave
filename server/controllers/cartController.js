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
    res.json(cart);
  } catch (error) {
    console.error('Cart controller - Get cart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /users/cart
export const addToCart = asyncHandler(async (req, res) => {
  try {
    
    const userId = req.user._id;
    if (!userId) {
      res.status(401);
      throw new Error('User not authenticated');
    }
    
    const item = req.body;
    
    // Validate and convert proId to ObjectId
    if (!item.proId) {
      res.status(400);
      throw new Error('Product ID is required');
    }
    
    // Convert proId to ObjectId using utility function
    const proId = toObjectId(item.proId);
    if (!proId) {
      res.status(400);
      throw new Error('Invalid product ID format');
    }
    
    // Prepare cart item with proper ObjectId
    const cartItem = {
      proId: proId,
      quantity: item.quantity || 1,
      price: item.price,
      mrp: item.mrp,
      variantSize: item.variantSize || item.size
    };
    
    
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    const result = await userHelpers.addToCart({ userId, item: cartItem });
    res.json({ success: true, result });
  } catch (error) {
    console.error('Cart controller - Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /users/cart/:itemId
export const updateCartItem = asyncHandler(async (req, res) => {
  try {
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
      return res.json({ success: true, removed: true, cart });
    }

    await userHelpers.changeQuantityCart({ userId, proId, quantity });
    const cart = await userHelpers.getCartItems(userId);
    res.json({ success: true, updated: true, cart });
  } catch (error) {
    console.error('Cart controller - Update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
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
    res.json({ success: true, removed: true, cart });
  } catch (error) {
    console.error('Cart controller - Remove error:', error);
    res.status(500).json({ success: false, message: error.message });
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
    res.json({ success: true, message: 'Cart cleared successfully', cart });
  } catch (error) {
    console.error('Cart controller - Clear cart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}); 