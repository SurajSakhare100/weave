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
  createVendorProductController
} from '../controllers/vendorController.js';
import {
  validateId,
  validatePagination,
  validateSearch
} from '../middleware/validation.js';
import { protect, admin, vendorAuth } from '../middleware/auth.js';
import { handleMultipleUpload } from '../middleware/upload.js';

const router = express.Router();

// Vendor routes (requires vendor authentication)
router.get('/profile', vendorAuth, getVendorProfile);
router.put('/profile', vendorAuth, updateVendorProfile);
router.get('/dashboard', vendorAuth, getVendorDashboard);
router.post('/products', vendorAuth, handleMultipleUpload, createVendorProductController);

// Admin routes
router.get('/', protect, admin, validatePagination, validateSearch, getVendors);
router.get('/stats', protect, admin, getVendorStats);
router.get('/:id', protect, admin, validateId, getVendorById);
router.put('/:id', protect, admin, validateId, updateVendor);
router.delete('/:id', protect, admin, validateId, deleteVendor);
router.get('/:id/products', protect, admin, validateId, validatePagination, getVendorProducts);
router.get('/:id/orders', protect, admin, validateId, validatePagination, getVendorOrders);

export default router; 