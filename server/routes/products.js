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
  searchProducts,
  createProductReview
} from '../controllers/productController.js';
import {
  validateProduct,
  validateId,
  validatePagination,
  validateSearch,
  validatePriceRange
} from '../middleware/validation.js';
import { protect, vendorAuth, optionalVendorAuth } from '../middleware/auth.js';
import { handleMultipleUpload, processUploadedFiles } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/',vendorAuth, validatePagination, validateSearch, validatePriceRange, getProducts);
router.get('/search', validateSearch, validatePriceRange, validatePagination, searchProducts);
router.get('/category/:categorySlug', validatePriceRange, validatePagination, getProductsByCategory);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', validateId, getProductById);
router.get('/:id/similar', validateId, getSimilarProducts);

// Route for creating a review
router.post('/:id/reviews', protect, validateId, createProductReview);

// Protected routes (Vendor only)
router.post('/', 
  vendorAuth, 
  handleMultipleUpload,
  processUploadedFiles,
  // validateProduct, 
  createProduct
);

router.put('/:id', 
  vendorAuth, 
  validateId,
  handleMultipleUpload,
  processUploadedFiles,
  // validateProduct, 
  updateProduct
);

router.delete('/:id', 
  vendorAuth, 
  validateId, 
  deleteProduct
);

export default router; 