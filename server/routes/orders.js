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
  getAdminOrderStats,
  getVendorOrders,
  getVendorOrderById,
  updateVendorOrderStatus,
  getVendorOrderStats
} from '../controllers/order/index.js';
import {
  recordOnlineSalesFromOrder,
  updateOrderStatusAndRecordSales,
  getOrderSalesBreakdown
} from '../controllers/onlineSalesController.js';
import {
  validateOrder,
  validateId,
  validatePagination
} from '../middleware/validation.js';
import { protectUser, protectAdmin, protectVendor, protectVendorWithStatus } from '../middleware/auth.js';

const router = express.Router();

// Admin routes (must come first to avoid conflicts with parameterized routes)
router.get('/admin-stats', protectAdmin, getAdminOrderStats);
router.get('/stats', protectAdmin, getOrderStats);
router.get('/', protectAdmin, validatePagination, getOrders);
router.put('/:id/deliver', protectAdmin, validateId, updateOrderToDelivered);
router.put('/:id/status', protectAdmin, validateId, updateOrderStatus);

// Vendor routes
router.get('/vendor', protectVendorWithStatus, validatePagination, getVendorOrders);
router.get('/vendor/:id', protectVendorWithStatus, validateId, getVendorOrderById);
router.put('/vendor/:id/status', protectVendorWithStatus, validateId, updateVendorOrderStatus);
router.get('/vendor/stats', protectVendorWithStatus, getVendorOrderStats);

// User routes (parameterized routes should come last)
router.post('/', protectUser, createOrder);
router.get('/myorders', protectUser, validatePagination, getMyOrders);
router.get('/:id', protectUser, validateId, getOrderById);
router.put('/:id/pay', protectUser, validateId, updateOrderToPaid);
router.put('/:id/cancel', protectUser, validateId, cancelOrder);

// Online sales management routes
router.post('/:id/record-sales', protectAdmin, validateId, recordOnlineSalesFromOrder);
router.put('/:id/status-with-sales', protectAdmin, validateId, updateOrderStatusAndRecordSales);
router.get('/:id/sales', protectAdmin, validateId, getOrderSalesBreakdown);

export default router; 