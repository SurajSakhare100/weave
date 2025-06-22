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
  updateVendorOrderStatus
} from '../controllers/orderController.js';
import {
  validateOrder,
  validateId,
  validatePagination
} from '../middleware/validation.js';
import { protect, admin, vendorAuth } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes
router.post('/', validateOrder, createOrder);
router.get('/myorders', validatePagination, getMyOrders);
router.get('/:id', validateId, getOrderById);
router.put('/:id/pay', validateId, updateOrderToPaid);
router.put('/:id/cancel', validateId, cancelOrder);

// Vendor routes
router.get('/vendor', vendorAuth, validatePagination, getVendorOrders);
router.get('/vendor/:id', vendorAuth, validateId, getVendorOrderById);
router.put('/vendor/:id/status', vendorAuth, validateId, updateVendorOrderStatus);

// Admin routes
router.get('/', admin, validatePagination, getOrders);
router.put('/:id/deliver', admin, validateId, updateOrderToDelivered);
router.put('/:id/status', admin, validateId, updateOrderStatus);
router.get('/stats', admin, getOrderStats);

export default router; 