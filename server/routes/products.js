import express from 'express';
import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getSimilarProducts,
  getProductsByCategory,
  searchProducts
} from '../controllers/productController.js';
import {
  validateProduct,
  validateId,
  validatePagination,
  validateSearch,
  validatePriceRange
} from '../middleware/validation.js';
import { protect, vendorAuth, optionalVendorAuth } from '../middleware/auth.js';
import { uploadMultiple, handleUploadError, ensureUploadsDir } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', optionalVendorAuth, validatePagination, validateSearch, validatePriceRange, getProducts);
router.get('/search', validateSearch, validatePriceRange, validatePagination, searchProducts);
router.get('/category/:categorySlug', validatePriceRange, validatePagination, getProductsByCategory);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', validateId, getProductById);
router.get('/:id/similar', validateId, getSimilarProducts);

// Protected routes (Vendor only)
router.post('/', 
  vendorAuth, 
  ensureUploadsDir,
  uploadMultiple,
  handleUploadError,
  validateProduct, 
  createProduct
);

router.put('/:id', 
  vendorAuth, 
  validateId,
  ensureUploadsDir,
  uploadMultiple,
  handleUploadError,
  validateProduct, 
  updateProduct
);

router.delete('/:id', 
  vendorAuth, 
  validateId, 
  deleteProduct
);

export default router; 