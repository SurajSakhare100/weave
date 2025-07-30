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
  createProductReview,
  getProductReviews,
  updateProductReview,
  deleteProductReview,
  addReviewResponse,
  updateReviewResponse,
  deleteReviewResponse,
  addVendorReviewResponse,
  updateVendorReviewResponse,
  deleteVendorReviewResponse
} from '../controllers/productController.js';
import {
  validateProduct,
  validateId,
  validatePagination,
  validateSearch,
  validatePriceRange
} from '../middleware/validation.js';
import { protectUser, protectVendor, optionalVendorAuth } from '../middleware/auth.js';
import { handleMultipleUpload, processUploadedFiles } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', validatePagination, validateSearch, validatePriceRange, getProducts);
router.get('/search', validateSearch, validatePriceRange, validatePagination, searchProducts);
router.get('/category/:categorySlug', validatePriceRange, validatePagination, getProductsByCategory);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', validateId, getProductById);
router.get('/:id/similar', validateId, getSimilarProducts);

// Review routes (public read, authenticated write)
router.get('/:id/reviews', validateId, getProductReviews);
router.post('/:id/reviews', protectUser, validateId, createProductReview);
router.put('/:id/reviews/:reviewId', protectUser, validateId, updateProductReview);
router.delete('/:id/reviews/:reviewId', protectUser, validateId, deleteProductReview);

// Review response routes
router.post('/:id/reviews/:reviewId/responses', protectUser, validateId, addReviewResponse);
router.put('/:id/reviews/:reviewId/responses/:responseId', protectUser, validateId, updateReviewResponse);
router.delete('/:id/reviews/:reviewId/responses/:responseId', protectUser, validateId, deleteReviewResponse);

// Vendor review response routes
router.post('/:id/reviews/:reviewId/vendor-responses', protectVendor, validateId, addVendorReviewResponse);
router.put('/:id/reviews/:reviewId/vendor-responses/:responseId', protectVendor, validateId, updateVendorReviewResponse);
router.delete('/:id/reviews/:reviewId/vendor-responses/:responseId', protectVendor, validateId, deleteVendorReviewResponse);

// Vendor product management routes
router.post('/', 
  protectVendor, 
  validateProduct,
  handleMultipleUpload,
  processUploadedFiles,
  createProduct
);

router.put('/:id', 
  protectVendor, 
  validateId,
  validateProduct,
  handleMultipleUpload,
  processUploadedFiles,
  updateProduct
);

router.delete('/:id', 
  protectVendor, 
  validateId, 
  deleteProduct
);

export default router; 