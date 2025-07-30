import express from 'express';
import {
  getVendorProfile,
  updateVendorProfile,
  getVendorDashboard,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  getVendorProducts,
  getVendorOrders,
  getVendorOrderById,
  updateVendorOrder,
  updateOrderStatus,
  getVendorStats,
  createVendorProductController,
  getVendorReviews,
  getVendorReviewAnalytics,
  getVendorEarnings,
  getVendorReleasedProducts,
  getVendorDraftProducts,
  unpublishVendorProducts,
  deleteVendorProducts,
  publishVendorProducts,
  getVendorScheduledProducts,
  scheduleVendorProducts,
  rescheduleVendorProducts,
  cancelScheduledProducts,
  publishScheduledProducts,
  updateVendorProduct
} from '../controllers/vendorController.js';
import {
  addVendorReviewResponse,
  updateVendorReviewResponse,
  deleteVendorReviewResponse
} from '../controllers/productController.js';
import {
  validateId,
  validatePagination,
  validateSearch
} from '../middleware/validation.js';
import { protectVendor, protectAdmin } from '../middleware/auth.js';
import { handleMultipleUpload } from '../middleware/upload.js';

const router = express.Router();

// Admin routes (require admin authentication) - Put these FIRST to avoid conflicts
router.get('/admin/list', protectAdmin, validatePagination, validateSearch, getVendors);
router.get('/admin/stats', protectAdmin, getVendorStats);
router.get('/admin/:id', protectAdmin, validateId, getVendorById);
router.put('/admin/:id', protectAdmin, validateId, updateVendor);
router.delete('/admin/:id', protectAdmin, validateId, deleteVendor);
router.get('/admin/:id/products', protectAdmin, validateId, validatePagination, getVendorProducts);
router.get('/admin/:id/orders', protectAdmin, validateId, validatePagination, getVendorOrders);

// Vendor routes (require vendor authentication)
router.get('/profile', protectVendor, getVendorProfile);
router.put('/profile', protectVendor, updateVendorProfile);
router.get('/dashboard', protectVendor, getVendorDashboard);
router.get('/earnings', protectVendor, getVendorEarnings);

// Vendor product routes
router.post('/products', protectVendor, handleMultipleUpload, createVendorProductController);
router.put('/products/:id', protectVendor, handleMultipleUpload, updateVendorProduct);
router.get('/products/released', protectVendor, validatePagination, getVendorReleasedProducts);
router.get('/products/drafts', protectVendor, validatePagination, getVendorDraftProducts);
router.get('/products/scheduled', protectVendor, validatePagination, getVendorScheduledProducts);
router.post('/products/schedule', protectVendor, scheduleVendorProducts);
router.put('/products/reschedule', protectVendor, rescheduleVendorProducts);
router.post('/products/cancel-schedule', protectVendor, cancelScheduledProducts);
router.post('/products/publish-scheduled', protectVendor, publishScheduledProducts);

// Bulk operations for products
router.post('/products/unpublish', protectVendor, unpublishVendorProducts);
router.post('/products/publish', protectVendor, publishVendorProducts);
router.delete('/products/bulk', protectVendor, deleteVendorProducts);

// Vendor review routes
router.get('/reviews', protectVendor, validatePagination, getVendorReviews);
router.get('/reviews/analytics', protectVendor, getVendorReviewAnalytics);
router.post('/reviews/:reviewId/responses', protectVendor, addVendorReviewResponse);
router.put('/reviews/:reviewId/responses/:responseId', protectVendor, updateVendorReviewResponse);
router.delete('/reviews/:reviewId/responses/:responseId', protectVendor, deleteVendorReviewResponse);

// Vendor order routes
router.get('/orders', protectVendor, validatePagination, getVendorOrders);
router.get('/orders/:id', protectVendor, validateId, getVendorOrderById);
router.put('/orders/:id', protectVendor, validateId, updateVendorOrder);
router.put('/orders/:id/status', protectVendor, validateId, updateOrderStatus);

export default router; 