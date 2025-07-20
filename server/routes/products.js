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
import { protect, vendorAuth, optionalVendorAuth } from '../middleware/auth.js';
import { handleMultipleUpload, processUploadedFiles } from '../middleware/upload.js';

const router = express.Router();

router.get('/', validatePagination, validateSearch, validatePriceRange, getProducts);
router.get('/search', validateSearch, validatePriceRange, validatePagination, searchProducts);
router.get('/category/:categorySlug', validatePriceRange, validatePagination, getProductsByCategory);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', validateId, getProductById);
router.get('/:id/similar', validateId, getSimilarProducts);

router.get('/:id/reviews', validateId, getProductReviews);
router.post('/:id/reviews', protect, validateId, createProductReview);
router.put('/:id/reviews/:reviewId', protect, validateId, updateProductReview);
router.delete('/:id/reviews/:reviewId', protect, validateId, deleteProductReview);

router.post('/:id/reviews/:reviewId/responses', protect, validateId, addReviewResponse);
router.put('/:id/reviews/:reviewId/responses/:responseId', protect, validateId, updateReviewResponse);
router.delete('/:id/reviews/:reviewId/responses/:responseId', protect, validateId, deleteReviewResponse);

router.post('/', 
  vendorAuth, 
  handleMultipleUpload,
  processUploadedFiles,
  createProduct
);

router.put('/:id', 
  vendorAuth, 
  validateId,
  handleMultipleUpload,
  processUploadedFiles,
  updateProduct
);

router.delete('/:id', 
  vendorAuth, 
  validateId, 
  deleteProduct
);

export default router; 