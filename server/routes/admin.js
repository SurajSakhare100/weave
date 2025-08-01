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
  deleteMainSubCategory,
  deleteSubCategory,
  addHeaderCategory,
  addMainSubCategory,
  addSubCategory
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
router.put('/products/:productId/approve', approveProduct);
router.put('/products/:productId/reject', rejectProduct);

// Category management routes
router.get('/categories/all-types', getAllCategories);
router.get('/categories/:id', getCategory);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Legacy category routes (for compatibility)
router.put('/addHeaderCategory', addHeaderCategory);
router.put('/addMainSubCategory', addMainSubCategory);
router.put('/addSubCategory', addSubCategory);

// Category deletion routes
router.delete('/categories/:id/main-sub/:uni_id', deleteMainSubCategory);
router.delete('/categories/:id/sub/:uni_id', deleteSubCategory);

export default router; 