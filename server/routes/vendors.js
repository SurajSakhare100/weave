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
  publishScheduledProducts
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
import { protect, admin, vendorAuth } from '../middleware/auth.js';
import { handleMultipleUpload } from '../middleware/upload.js';


const router = express.Router();

router.get('/profile', vendorAuth, getVendorProfile);
router.put('/profile', vendorAuth, updateVendorProfile);
router.get('/dashboard', vendorAuth, getVendorDashboard);
router.get('/earnings', vendorAuth, getVendorEarnings);
router.post('/products', vendorAuth, handleMultipleUpload, createVendorProductController);

// New route for released products
router.get('/products/released', vendorAuth, validatePagination, getVendorReleasedProducts);

// New route for draft products
router.get('/products/drafts', vendorAuth, validatePagination, getVendorDraftProducts);

// New routes for scheduled products
router.get('/products/scheduled', vendorAuth, validatePagination, getVendorScheduledProducts);
router.post('/products/schedule', vendorAuth, scheduleVendorProducts);
router.put('/products/reschedule', vendorAuth, rescheduleVendorProducts);
router.post('/products/cancel-schedule', vendorAuth, cancelScheduledProducts);
router.post('/products/publish-scheduled', vendorAuth, publishScheduledProducts);



// Bulk operations for products
router.post('/products/unpublish', vendorAuth, unpublishVendorProducts);
router.post('/products/publish', vendorAuth, publishVendorProducts);
router.delete('/products/bulk', vendorAuth, deleteVendorProducts);

router.get('/reviews', vendorAuth, validatePagination, getVendorReviews);
router.get('/reviews/analytics', vendorAuth, getVendorReviewAnalytics);

router.post('/reviews/:reviewId/responses', vendorAuth, addVendorReviewResponse);
router.put('/reviews/:reviewId/responses/:responseId', vendorAuth, updateVendorReviewResponse);
router.delete('/reviews/:reviewId/responses/:responseId', vendorAuth, deleteVendorReviewResponse);

router.get('/', protect, admin, validatePagination, validateSearch, getVendors);
router.get('/stats', protect, admin, getVendorStats);
router.get('/:id', protect, admin, validateId, getVendorById);
router.put('/:id', protect, admin, validateId, updateVendor);
router.delete('/:id', protect, admin, validateId, deleteVendor);
router.get('/:id/products', protect, admin, validateId, validatePagination, getVendorProducts);
router.get('/:id/orders', protect, admin, validateId, validatePagination, getVendorOrders);

export default router; 