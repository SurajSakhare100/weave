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
  updateVendorProduct,
  deleteVendorProduct,
  acceptVendor,
  reapplyVendor
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
import { protectVendor, protectVendorWithStatus, protectAdmin } from '../middleware/auth.js';
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
router.post('/accept', protectAdmin, acceptVendor);

// Vendor routes (allow access but check approval status)a
router.get('/profile', protectVendorWithStatus, getVendorProfile);
router.put('/profile', protectVendorWithStatus, updateVendorProfile);
router.get('/dashboard', protectVendorWithStatus, getVendorDashboard);
router.get('/earnings', protectVendorWithStatus, getVendorEarnings);
router.post('/reapply', protectVendorWithStatus, reapplyVendor);


// Vendor product routes (allow access but check approval status)
router.get('/products', protectVendorWithStatus, validatePagination, getVendorProducts);
router.post('/products', protectVendorWithStatus, handleMultipleUpload, createVendorProductController);
router.put('/products/:id', protectVendorWithStatus, handleMultipleUpload, updateVendorProduct);
router.delete('/products/:id', protectVendorWithStatus, validateId, deleteVendorProduct);
router.get('/products/released', protectVendorWithStatus, validatePagination, getVendorReleasedProducts);
router.get('/products/drafts', protectVendorWithStatus, validatePagination, getVendorDraftProducts);
router.get('/products/scheduled', protectVendorWithStatus, validatePagination, getVendorScheduledProducts);
router.post('/products/schedule', protectVendorWithStatus, scheduleVendorProducts);
router.put('/products/reschedule', protectVendorWithStatus, rescheduleVendorProducts);
router.post('/products/cancel-schedule', protectVendorWithStatus, cancelScheduledProducts);
router.post('/products/publish-scheduled', protectVendorWithStatus, publishScheduledProducts);

// Bulk operations for products (allow access but check approval status)
router.post('/products/unpublish', protectVendorWithStatus, unpublishVendorProducts);
router.post('/products/publish', protectVendorWithStatus, publishVendorProducts);
router.delete('/products/bulk', protectVendorWithStatus, deleteVendorProducts);

// Vendor review routes (allow access but check approval status)
router.get('/reviews', protectVendorWithStatus, validatePagination, getVendorReviews);
router.get('/reviews/analytics', protectVendorWithStatus, getVendorReviewAnalytics);
router.post('/reviews/:reviewId/responses', protectVendorWithStatus, addVendorReviewResponse);
router.put('/reviews/:reviewId/responses/:responseId', protectVendorWithStatus, updateVendorReviewResponse);
router.delete('/reviews/:reviewId/responses/:responseId', protectVendorWithStatus, deleteVendorReviewResponse);

// Vendor order routes (allow access but check approval status)
router.get('/orders', protectVendorWithStatus, validatePagination, getVendorOrders);
router.get('/orders/:id', protectVendorWithStatus, validateId, getVendorOrderById);
router.put('/orders/:id', protectVendorWithStatus, validateId, updateVendorOrder);
router.put('/orders/:id/status', protectVendorWithStatus, validateId, updateOrderStatus);

export default router; 