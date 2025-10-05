import { setVendorToken } from '@/utils/vendorAuth';
import api from './api';
import Cookies from 'js-cookie';

// ============================================================================
// VENDOR AUTHENTICATION
// ============================================================================

export async function vendorLogin(credentials: { email: string; password: string }) {
  const res = await api.post('/auth/vendor/login', credentials);
  
  if (res.data.token) {
    setVendorToken(res.data.token);
  }
  
  return res.data;
}

export async function vendorRegister(vendorData: {
  name: string;
  email: string;
  password: string;
  number?: string;
  businessName?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
}) {
  const res = await api.post('/auth/vendor/register', vendorData);
  
  if (res.data.token) {
    setVendorToken(res.data.token);
  }
  
  return res.data;
}

export async function vendorLogout() {
  try {
    await api.post('/auth/vendor/logout');
  } catch (error) {
    // Ignore errors on logout
  }
  
  Cookies.remove('vendorToken');
  return { success: true, message: 'Vendor logged out successfully' };
}

// ============================================================================
// VENDOR PROFILE & DASHBOARD
// ============================================================================

export async function getVendorProfile() {
  const res = await api.get('/vendors/profile');
  return res.data;
}

export async function updateVendorProfile(profileData: any) {
  const res = await api.put('/vendors/profile', profileData);
  return res.data;
}

export async function getVendorDashboard() {
  const res = await api.get('/vendors/dashboard');
  return res.data;
}

export async function getVendorEarnings(params?: any) {
  const res = await api.get('/vendors/earnings', { params });
  return res.data;
}

// ============================================================================
// VENDOR PRODUCTS - CORE OPERATIONS
// ============================================================================

export async function getVendorProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  const res = await api.get('/vendors/products', { params });
  return res.data;
}

export async function createVendorProduct(productData: FormData) {
  const res = await api.post('/vendors/products', productData, {
    headers: { 
      'Content-Type': 'multipart/form-data' 
    }
  });
  return res.data;
}

export async function updateVendorProduct(productId: string, productData: any) {
  const res = await api.put(`/vendors/products/${productId}`, productData);
  return res.data;
}

export async function deleteVendorProduct(productId: string) {
  const res = await api.delete(`/vendors/products/${productId}`);
  return res.data;
}

// ============================================================================
// VENDOR PRODUCTS - STATUS-BASED LISTS
// ============================================================================

export async function getVendorReleasedProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const res = await api.get('/vendors/products/released', { params });
  return res.data;
}

export async function getVendorDraftProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const res = await api.get('/vendors/products/drafts', { params });
  return res.data;
}

export async function getVendorScheduledProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const res = await api.get('/vendors/products/scheduled', { params });
  return res.data;
}

// ============================================================================
// VENDOR PRODUCTS - BULK OPERATIONS
// ============================================================================

export async function unpublishVendorProducts(productIds: string[]) {
  const res = await api.post('/vendors/products/unpublish', { productIds });
  return res.data;
}

export async function publishVendorProducts(productIds: string[]) {
  const res = await api.post('/vendors/products/publish', { productIds });
  return res.data;
}

export async function deleteVendorProducts(productIds: string[]) {
  const res = await api.delete('/vendors/products/bulk', { data: { productIds } });
  return res.data;
}

// ============================================================================
// VENDOR PRODUCTS - SCHEDULING
// ============================================================================

export async function scheduleVendorProducts(data: {
  productIds: string[];
  scheduledDate: string;
  scheduledTime: string;
}) {
  const res = await api.post('/vendors/products/schedule', data);
  return res.data;
}

export async function rescheduleVendorProducts(data: {
  productIds: string[];
  scheduledDate: string;
  scheduledTime: string;
}) {
  const res = await api.put('/vendors/products/reschedule', data);
  return res.data;
}

export async function cancelScheduledProducts(productIds: string[]) {
  const res = await api.post('/vendors/products/cancel-schedule', { productIds });
  return res.data;
}

export async function publishScheduledProducts(productIds: string[]) {
  const res = await api.post('/vendors/products/publish-scheduled', { productIds });
  return res.data;
}

// ============================================================================
// VENDOR REVIEWS
// ============================================================================

export async function getVendorReviews(params?: any) {
  const res = await api.get('/vendors/reviews', { params });
  return res.data;
}

export async function getVendorReviewAnalytics(params?: any) {
  const res = await api.get('/vendors/reviews/analytics', { params });
  return res.data;
}

export async function addVendorReviewResponse(reviewId: string, responseData: any) {
  const res = await api.post(`/vendors/reviews/${reviewId}/responses`, responseData);
  return res.data;
}

export async function updateVendorReviewResponse(reviewId: string, responseId: string, responseData: any) {
  const res = await api.put(`/vendors/reviews/${reviewId}/responses/${responseId}`, responseData);
  return res.data;
}

export async function deleteVendorReviewResponse(reviewId: string, responseId: string) {
  const res = await api.delete(`/vendors/reviews/${reviewId}/responses/${responseId}`);
  return res.data;
}

// ============================================================================
// LEGACY COMPATIBILITY ALIASES
// ============================================================================

// Product operations
export const addVendorProduct = createVendorProduct;
export const editVendorProduct = updateVendorProduct;
export const createProduct = createVendorProduct;
export const updateProduct = updateVendorProduct;
export const deleteProduct = deleteVendorProduct;

// Review operations
export const respondToReview = addVendorReviewResponse;

// Analytics
export const getVendorAnalytics = getVendorReviewAnalytics;

// ============================================================================
// MISSING ROUTES - TO BE IMPLEMENTED
// ============================================================================

// These routes don't exist in the backend yet, but are commonly needed
export async function getVendorOrders(params?: any) {
  const res = await api.get('/vendors/orders', { params });
  return res.data;
}

export async function getVendorOrderById(orderId: string) {
  const res = await api.get(`/vendors/orders/${orderId}`);
  return res.data;
}

export async function updateVendorOrder(orderId: string, orderData: any) {
  const res = await api.put(`/vendors/orders/${orderId}`, orderData);
  return res.data;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const res = await api.put(`/vendors/orders/${orderId}/status`, { status });
  return res.data;
}

// ============================================================================
// VENDOR SALES MANAGEMENT
// ============================================================================

export async function recordOfflineSale(saleData: {
  productId: string;
  quantity: number;
  unitPrice: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  paymentMethod: string;
  discount?: number;
  notes?: string;
  saleLocation?: string;
  invoiceNumber?: string;
}) {
  const res = await api.post('/vendors/sales/offline', saleData);
  return res.data;
}

export async function getVendorSales(params?: {
  page?: number;
  limit?: number;
  saleType?: 'online' | 'offline' | 'all';
  startDate?: string;
  endDate?: string;
  productId?: string;
  status?: string;
}) {
  const res = await api.get('/vendors/sales', { params });
  return res.data;
}

export async function getSalesAnalytics(params?: {
  days?: number;
}) {
  const res = await api.get('/vendors/sales/analytics', { params });
  return res.data;
}

// ============================================================================
// VENDOR STOCK MANAGEMENT
// ============================================================================

export async function updateProductStock(productId: string, stockData: {
  quantity: number;
  movementType: 'in' | 'out' | 'adjustment' | 'return' | 'damage';
  reason: string;
  notes?: string;
  unitCost?: number;
  batchNumber?: string;
  expiryDate?: string;
}) {
  const res = await api.put(`/vendors/stock/${productId}`, stockData);
  return res.data;
}

export async function getStockMovements(params?: {
  page?: number;
  limit?: number;
  productId?: string;
  movementType?: string;
  startDate?: string;
  endDate?: string;
}) {
  const res = await api.get('/vendors/stock/movements', { params });
  return res.data;
}

export async function getStockAnalytics(params?: {
  days?: number;
}) {
  const res = await api.get('/vendors/stock/analytics', { params });
  return res.data;
}

export async function getProductStockHistory(productId: string, params?: {
  limit?: number;
}) {
  const res = await api.get(`/vendors/stock/${productId}/history`, { params });
  return res.data;
}

// ============================================================================
// VENDOR SETTINGS
// ============================================================================

export async function updateVendorSettings(settings: {
  enableOfflineSales?: boolean;
  defaultPaymentMethods?: string[];
  stockManagementEnabled?: boolean;
  lowStockThreshold?: number;
  autoStockDeduction?: boolean;
  businessType?: 'retail' | 'wholesale' | 'both';
  operatingHours?: any;
  notifications?: any;
}) {
  const res = await api.put('/vendors/settings', settings);
  return res.data;
}