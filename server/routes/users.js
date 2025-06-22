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
  getUserStats
} from '../controllers/userController.js';
import {
  validateId,
  validatePagination,
  validateSearch
} from '../middleware/validation.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/dashboard', getUserDashboard);

// Admin routes
router.get('/', admin, validatePagination, validateSearch, getUsers);
router.get('/stats', admin, getUserStats);
router.get('/:id', admin, validateId, getUserById);
router.put('/:id', admin, validateId, updateUser);
router.delete('/:id', admin, validateId, deleteUser);
router.get('/:id/orders', admin, validateId, validatePagination, getUserOrders);

export default router; 