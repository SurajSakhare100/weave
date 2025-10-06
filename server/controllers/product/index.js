// Main product controllers
export {
  getProducts,
  getProductById,
  getProductBySlug
} from './productController.js';

// CRUD operations
export {
  createProduct,
  updateProduct,
  deleteProduct
} from './productCRUDController.js';

// Search and filtering
export {
  getSimilarProducts,
  getProductsByCategory,
  searchProducts,
  getFrequentlyBoughtTogether,
  getComparableProducts,
  getAvailableColors
} from './productSearchController.js';

// Review management
export {
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
} from './productReviewController.js';
