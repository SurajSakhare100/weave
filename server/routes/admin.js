import express from 'express';
import {
  getPendingVendors,
  approveVendor,
  rejectVendor,
  getPendingProducts,
  approveProduct,
  rejectProduct,
  getApprovalStats,
  getDashboardStats,
  getAllProducts,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  addHeaderCategory,
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getLayouts,
  updateLayout,
  getVendorStats
} from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/auth.js';
import { validatePagination } from '../middleware/validation.js';

const router = express.Router();

// All routes require admin authentication
router.use(protectAdmin);

// Approval statistics
router.get('/approval-stats', getApprovalStats);

// Dashboard statistics
router.get('/dashboard-stats', getDashboardStats);

// Product management routes
router.get('/getProducts', getAllProducts);

// Vendor approval routes
router.get('/vendors/pending', validatePagination, getPendingVendors);
router.put('/vendors/:vendorId/approve', approveVendor);
router.put('/vendors/:vendorId/reject', rejectVendor);

// Product approval routes
router.get('/products/pending', validatePagination, getPendingProducts);
router.post('/products/approve', approveProduct);
router.put('/products/:productId/reject', rejectProduct);

// Category management routes
router.get('/categories/all-types', getAllCategories);
router.get('/categories/:id', getCategory);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Legacy category routes (for compatibility)
router.put('/addHeaderCategory', addHeaderCategory);

// Coupon management routes
router.get('/coupons', validatePagination, getAllCoupons);
router.get('/coupons/:id', getCouponById);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Layout management routes
router.get('/layouts', getLayouts);
router.put('/layouts/:id', updateLayout);

// Vendor statistics
router.get('/vendors/stats', getVendorStats);

export default router; 