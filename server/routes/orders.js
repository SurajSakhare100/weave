import express from 'express';
import {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  cancelOrder,
  updateOrderStatus,
  getOrderStats,
  getVendorOrders,
  getVendorOrderById,
  updateVendorOrderStatus,
  getVendorOrderStats
} from '../controllers/orderController.js';
import {
  validateOrder,
  validateId,
  validatePagination
} from '../middleware/validation.js';
import { protectUser, protectAdmin, protectVendor } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.post('/', protectUser, createOrder);
router.get('/myorders', protectUser, validatePagination, getMyOrders);
router.get('/:id', protectUser, validateId, getOrderById);
router.put('/:id/pay', protectUser, validateId, updateOrderToPaid);
router.put('/:id/cancel', protectUser, validateId, cancelOrder);

// Vendor routes
router.get('/vendor', protectVendor, validatePagination, getVendorOrders);
router.get('/vendor/:id', protectVendor, validateId, getVendorOrderById);
router.put('/vendor/:id/status', protectVendor, validateId, updateVendorOrderStatus);
router.get('/vendor/stats', protectVendor, getVendorOrderStats);

// Admin routes
router.get('/', protectAdmin, validatePagination, getOrders);
router.put('/:id/deliver', protectAdmin, validateId, updateOrderToDelivered);
router.put('/:id/status', protectAdmin, validateId, updateOrderStatus);
router.get('/stats', protectAdmin, getOrderStats);

export default router; 