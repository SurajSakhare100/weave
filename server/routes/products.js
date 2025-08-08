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
  deleteVendorReviewResponse,
  getFrequentlyBoughtTogether,
  getComparableProducts
} from '../controllers/productController.js';
import {
  validateProduct,
  validateId,
  validatePagination,
  validateSearch,
  validatePriceRange
} from '../middleware/validation.js';
import { protectUser, protectVendor, protectVendorWithStatus, optionalVendorAuth } from '../middleware/auth.js';
import { handleMultipleUpload, processUploadedFiles } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', validatePagination, validateSearch, validatePriceRange, getProducts);
router.get('/search', validateSearch, validatePriceRange, validatePagination, searchProducts);
router.get('/category/:categorySlug', validatePriceRange, validatePagination, getProductsByCategory);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', validateId, getProductById);
router.get('/:id/similar', validateId, getSimilarProducts);
router.get('/:id/frequently-bought', validateId, getFrequentlyBoughtTogether);
router.get('/:id/comparable', validateId, getComparableProducts);

// Review routes (public read, authenticated write)
router.get('/:id/reviews', validateId, getProductReviews);
router.post('/:id/reviews', protectUser, validateId, createProductReview);
router.put('/:id/reviews/:reviewId', protectUser, validateId, updateProductReview);
router.delete('/:id/reviews/:reviewId', protectUser, validateId, deleteProductReview);

router.get('/:id/comparable', validateId, getComparableProducts);

router.get('/:id/similar', validateId, getSimilarProducts);
router.get('/:id/frequently-bought', validateId, getFrequentlyBoughtTogether);

// Review response routes
router.post('/:id/reviews/:reviewId/responses', protectUser, validateId, addReviewResponse);
router.put('/:id/reviews/:reviewId/responses/:responseId', protectUser, validateId, updateReviewResponse);
router.delete('/:id/reviews/:reviewId/responses/:responseId', protectUser, validateId, deleteReviewResponse);

// Vendor review response routes
router.post('/:id/reviews/:reviewId/vendor-responses', protectVendorWithStatus, validateId, addVendorReviewResponse);
router.put('/:id/reviews/:reviewId/vendor-responses/:responseId', protectVendorWithStatus, validateId, updateVendorReviewResponse);
router.delete('/:id/reviews/:reviewId/vendor-responses/:responseId', protectVendorWithStatus, validateId, deleteVendorReviewResponse);

// Vendor product management routes
router.post('/', 
  protectVendorWithStatus, 
  validateProduct,
  handleMultipleUpload,
  processUploadedFiles,
  createProduct
);

router.put('/:id', 
  protectVendorWithStatus, 
  validateId,
  validateProduct,
  handleMultipleUpload,
  processUploadedFiles,
  updateProduct
);

router.delete('/:id', 
  protectVendorWithStatus, 
  validateId, 
  deleteProduct
);

export default router; 