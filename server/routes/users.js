import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserDashboard,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserOrders,
  getUserStats,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress
} from '../controllers/userController.js';
import {
  validateId,
  validatePagination,
  validateSearch
} from '../middleware/validation.js';
import { protectUser, protectAdmin } from '../middleware/auth.js';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart, cleanupCart } from '../controllers/cartController.js';

const router = express.Router();

// User routes (require user authentication)
router.get('/profile', protectUser, getUserProfile);
router.put('/profile', protectUser, updateUserProfile);
router.get('/dashboard', protectUser, getUserDashboard);

// User address routes
router.get('/addresses', protectUser, getUserAddresses);
router.post('/addresses', protectUser, addUserAddress);
router.put('/addresses/:addressId', protectUser, updateUserAddress);
router.delete('/addresses/:addressId', protectUser, deleteUserAddress);
router.put('/addresses/:addressId/default', protectUser, setDefaultAddress);

// User cart routes
router.get('/cart', protectUser, getCart);
router.post('/cart', protectUser, addToCart);
router.put('/cart/:itemId', protectUser, updateCartItem);
router.delete('/cart/:itemId', protectUser, removeFromCart);
router.delete('/cart', protectUser, clearCart);
router.post('/cart/cleanup', protectUser, cleanupCart);

// Admin routes (require admin authentication)
router.get('/', protectAdmin, validatePagination, validateSearch, getUsers);
router.get('/stats', protectAdmin, getUserStats);
router.get('/:id', protectAdmin, validateId, getUserById);
router.put('/:id', protectAdmin, validateId, updateUser);
router.delete('/:id', protectAdmin, validateId, deleteUser);
router.get('/:id/orders', protectAdmin, validateId, validatePagination, getUserOrders);

export default router; 