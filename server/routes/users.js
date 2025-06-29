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
import { protect, admin } from '../middleware/auth.js';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/dashboard', getUserDashboard);

// Address routes
router.get('/addresses', getUserAddresses);
router.post('/addresses', addUserAddress);
router.put('/addresses/:addressId', updateUserAddress);
router.delete('/addresses/:addressId', deleteUserAddress);
router.put('/addresses/:addressId/default', setDefaultAddress);

// Cart routes - Fixed to use token-based auth instead of ID parameters
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.put('/cart/:itemId', updateCartItem);
router.delete('/cart/:itemId', removeFromCart);
router.delete('/cart', clearCart);

// Admin routes
router.get('/', admin, validatePagination, validateSearch, getUsers);
router.get('/stats', admin, getUserStats);
router.get('/:id', admin, validateId, getUserById);
router.put('/:id', admin, validateId, updateUser);
router.delete('/:id', admin, validateId, deleteUser);
router.get('/:id/orders', admin, validateId, validatePagination, getUserOrders);

export default router; 