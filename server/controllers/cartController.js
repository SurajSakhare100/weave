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
    console.log('Cart controller - Cart data:', JSON.stringify(cart, null, 2));
    res.json(cart);
  } catch (error) {
    console.error('Cart controller - Get cart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /users/cart
export const addToCart = asyncHandler(async (req, res) => {
  try {
    console.log('Cart controller - Request body:', req.body);
    console.log('Cart controller - User:', req.user);
    
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
    
    console.log('Cart controller - Cart item:', cartItem);
    
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    const result = await userHelpers.addToCart({ userId, item: cartItem });
    console.log('Cart controller - Helper result:', result);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Cart controller - Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /users/cart/:itemId
export const updateCartItem = asyncHandler(async (req, res) => {
  try {
    console.log('Cart controller - Update request params:', req.params);
    console.log('Cart controller - Update request body:', req.body);
    
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
    
    console.log('Cart controller - Converted proId:', proId);
    
    const { quantity } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    if (quantity <= 0) {
      await userHelpers.removeItemCart({ userId, proId });
      return res.json({ success: true, removed: true });
    }
    
    await userHelpers.changeQuantityCart({ userId, proId, action: 0, quantity });
    res.json({ success: true, updated: true });
  } catch (error) {
    console.error('Cart controller - Update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /users/cart/:itemId
export const removeFromCart = asyncHandler(async (req, res) => {
  try {
    console.log('Cart controller - Remove request params:', req.params);
    
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
    
    console.log('Cart controller - Converted proId for remove:', proId);
    
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    await userHelpers.removeItemCart({ userId, proId });
    res.json({ success: true, removed: true });
  } catch (error) {
    console.error('Cart controller - Remove error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /users/cart - Clear entire cart
export const clearCart = asyncHandler(async (req, res) => {
  try {
    console.log('Cart controller - Clear cart request');
    
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
    
    // Clear the entire cart
    user.cart = [];
    await user.save();
    
    console.log('Cart controller - Cart cleared successfully');
    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Cart controller - Clear cart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}); 