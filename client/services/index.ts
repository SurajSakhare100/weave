// ============================================================================
// SERVICE EXPORTS - PROFESSIONAL ORGANIZATION
// ============================================================================

// Core API configuration
export { default as api } from './api';

// Authentication Services
export * from './authService';

// User Services
export * from './userService';

// Product Services
export * from './productService';

// Vendor Services
export * from './vendorService';

// Order Services
export * from './orderService';

// Cart Services
export * from './cartService';

// Category Services
export * from './categoryService';

// Review Services
export * from './reviewService';

// Wishlist Services
export * from './wishlistService';

// ============================================================================
// SERVICE CATEGORIES FOR BETTER ORGANIZATION
// ============================================================================

// Authentication & User Management
export const AuthServices = {
  // User auth
  login: () => import('./authService').then(m => m.login),
  register: () => import('./authService').then(m => m.register),
  logout: () => import('./authService').then(m => m.logout),
  
  // Vendor auth
  vendorLogin: () => import('./vendorService').then(m => m.vendorLogin),
  vendorRegister: () => import('./vendorService').then(m => m.vendorRegister),
  vendorLogout: () => import('./vendorService').then(m => m.vendorLogout),
  
  // Profile management
  getUserProfile: () => import('./userService').then(m => m.getUserProfile),
  updateUserProfile: () => import('./userService').then(m => m.updateUserProfile),
  getVendorProfile: () => import('./vendorService').then(m => m.getVendorProfile),
  updateVendorProfile: () => import('./vendorService').then(m => m.updateVendorProfile),
};

// Product Management
export const ProductServices = {
  // General products
  getProducts: () => import('./productService').then(m => m.getProducts),
  getProductById: () => import('./productService').then(m => m.getProductById),
  getProductBySlug: () => import('./productService').then(m => m.getProductBySlug),
  searchProducts: () => import('./productService').then(m => m.searchProducts),
  getSimilarProducts: () => import('./productService').then(m => m.getSimilarProducts),
  
  // Vendor products
  createVendorProduct: () => import('./vendorService').then(m => m.createVendorProduct),
  updateVendorProduct: () => import('./vendorService').then(m => m.updateVendorProduct),
  deleteVendorProduct: () => import('./vendorService').then(m => m.deleteVendorProduct),
  getVendorReleasedProducts: () => import('./vendorService').then(m => m.getVendorReleasedProducts),
  getVendorDraftProducts: () => import('./vendorService').then(m => m.getVendorDraftProducts),
  getVendorScheduledProducts: () => import('./vendorService').then(m => m.getVendorScheduledProducts),
  
  // Categories
  getCategories: () => import('./categoryService').then(m => m.getCategories),
  getCategoryBySlug: () => import('./categoryService').then(m => m.getCategoryBySlug),
};

// Order Management
export const OrderServices = {
  // User orders
  getUserOrders: () => import('./orderService').then(m => m.getUserOrders),
  getUserOrderById: () => import('./orderService').then(m => m.getUserOrderById),
  createOrder: () => import('./orderService').then(m => m.createOrder),
  
  // Vendor orders
  getVendorOrders: () => import('./vendorService').then(m => m.getVendorOrders),
  getVendorOrderById: () => import('./vendorService').then(m => m.getVendorOrderById),
  updateVendorOrder: () => import('./vendorService').then(m => m.updateVendorOrder),
  updateOrderStatus: () => import('./vendorService').then(m => m.updateOrderStatus),
};

// Cart Management
export const CartServices = {
  getCart: () => import('./cartService').then(m => m.getCart),
  addToCart: () => import('./cartService').then(m => m.addToCart),
  updateCartItem: () => import('./cartService').then(m => m.updateCartItem),
  removeFromCart: () => import('./cartService').then(m => m.removeFromCart),
  clearCart: () => import('./cartService').then(m => m.clearCart),
};

// Review Management
export const ReviewServices = {
  // User reviews
  getProductReviews: () => import('./reviewService').then(m => m.getProductReviews),
  createProductReview: () => import('./reviewService').then(m => m.createProductReview),
  updateProductReview: () => import('./reviewService').then(m => m.updateProductReview),
  deleteProductReview: () => import('./reviewService').then(m => m.deleteProductReview),
  
  // Vendor reviews
  getVendorReviews: () => import('./vendorService').then(m => m.getVendorReviews),
  getVendorReviewAnalytics: () => import('./vendorService').then(m => m.getVendorReviewAnalytics),
  addVendorReviewResponse: () => import('./vendorService').then(m => m.addVendorReviewResponse),
  updateVendorReviewResponse: () => import('./vendorService').then(m => m.updateVendorReviewResponse),
  deleteVendorReviewResponse: () => import('./vendorService').then(m => m.deleteVendorReviewResponse),
};

// Wishlist Management
export const WishlistServices = {
  getWishlist: () => import('./wishlistService').then(m => m.getWishlist),
  addToWishlist: () => import('./wishlistService').then(m => m.addToWishlist),
  removeFromWishlist: () => import('./wishlistService').then(m => m.removeFromWishlist),
};

// Vendor Dashboard & Analytics
export const VendorServices = {
  getVendorDashboard: () => import('./vendorService').then(m => m.getVendorDashboard),
  getVendorEarnings: () => import('./vendorService').then(m => m.getVendorEarnings),
  
  // Product scheduling
  scheduleVendorProducts: () => import('./vendorService').then(m => m.scheduleVendorProducts),
  rescheduleVendorProducts: () => import('./vendorService').then(m => m.rescheduleVendorProducts),
  cancelScheduledProducts: () => import('./vendorService').then(m => m.cancelScheduledProducts),
  publishScheduledProducts: () => import('./vendorService').then(m => m.publishScheduledProducts),
  
  // Bulk operations
  unpublishVendorProducts: () => import('./vendorService').then(m => m.unpublishVendorProducts),
  publishVendorProducts: () => import('./vendorService').then(m => m.publishVendorProducts),
  deleteVendorProducts: () => import('./vendorService').then(m => m.deleteVendorProducts),
};

// ============================================================================
// LEGACY COMPATIBILITY EXPORTS
// ============================================================================

// For backward compatibility with existing code
export const LegacyServices = {
  // Vendor product aliases
  addVendorProduct: () => import('./vendorService').then(m => m.addVendorProduct),
  editVendorProduct: () => import('./vendorService').then(m => m.editVendorProduct),
  createProduct: () => import('./vendorService').then(m => m.createProduct),
  updateProduct: () => import('./vendorService').then(m => m.updateProduct),
  deleteProduct: () => import('./vendorService').then(m => m.deleteProduct),
  
  // Review aliases
  respondToReview: () => import('./vendorService').then(m => m.respondToReview),
  getVendorAnalytics: () => import('./vendorService').then(m => m.getVendorAnalytics),
}; 