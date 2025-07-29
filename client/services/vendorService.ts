import { setupVendorAuthHeader } from '@/utils/vendorAuth';
import api from './api';
import Cookies from 'js-cookie';

// Vendor Authentication
export async function vendorLogin(credentials: { email: string; password: string }) {
  const res = await api.post('/auth/vendor/login', credentials);
  
  // Ensure token is properly stored
  if (res.data.token) {
    const { setVendorToken } = await import('@/utils/vendorAuth');
    setVendorToken(res.data.token);
  }
  
  return res.data;
}

export async function vendorRegister(vendorData: {
  name: string;
  email: string;
  password: string;
  number?: string;
  bankAccOwner?: string;
  bankName?: string;
  bankAccNumber?: string;
  bankIFSC?: string;
  bankBranchName?: string;
  bankBranchNumber?: string;
}) {
  const res = await api.post('/auth/vendor/register', vendorData);
  return res.data;
}

export async function vendorLogout() {
  try {
    // Try to call logout endpoint if we have a token
    const token = Cookies.get('vendorToken');
    if (token) {
      await api.post('/auth/vendor/logout');
    }
  } catch (error) {
    // Logout endpoint failed, continuing with local cleanup
  } finally {
    // Always clean up local storage
    const { removeVendorToken } = await import('@/utils/vendorAuth');
    removeVendorToken();
  }
  
  return { success: true };
}

// Vendor Profile Management
export async function getVendorProfile() {
  const res = await api.get('/vendors/profile');
  return res.data;
}

export async function updateVendorProfile(data: {
  name?: string;
  email?: string;
  number?: string;
  bankAccOwner?: string;
  bankName?: string;
  bankAccNumber?: string;
  bankIFSC?: string;
  bankBranchName?: string;
  bankBranchNumber?: string;
}) {
  const res = await api.put('/vendors/profile', data);
  return res.data;
}

// Vendor Dashboard
export async function getVendorDashboard() {
  const res = await api.get('/vendors/dashboard');
  return res.data;
}

// Vendor Earnings Analytics
export async function getVendorEarnings() {
  const res = await api.get('/vendors/earnings');
  return res.data;
}

// Mock data for development/testing
export const getMockVendorEarnings = () => {
  return {
    success: true,
    data: {
      totalEarnings: 128000,
      balance: 512.64,
      totalSalesValue: 64000,
      monthlySales: [
        { month: 'Jan 2024', totalSales: 8200000, customerCost: 120 },
        { month: 'Mar 2024', totalSales: 8400000, customerCost: 90 },
        { month: 'May 2024', totalSales: 8300000, customerCost: 110 },
        { month: 'Jul 2024', totalSales: 8500000, customerCost: 85 },
        { month: 'Sept 2024', totalSales: 8800000, customerCost: 75 },
        { month: 'Nov 2024', totalSales: 8600000, customerCost: 95 }
      ],
      topCountries: [
        { country: 'United States', total: 9827.31 },
        { country: 'Germany', total: 4750.17 },
        { country: 'Netherlands', total: 1019.00 },
        { country: 'United Kingdom', total: 19.00 },
        { country: 'Italy', total: 827.01 },
        { country: 'Vietnam', total: 7750.88 }
      ],
      earningsTable: [
        { date: '2024-08-15T00:00:00.000Z', status: 'Pending', productSalesCount: 68192, earnings: 3250.13 },
        { date: '2024-03-05T00:00:00.000Z', status: 'Paid', productSalesCount: 21, earnings: 4189.09 },
        { date: '2024-01-31T00:00:00.000Z', status: 'Paid', productSalesCount: 6, earnings: 19.00 },
        { date: '2024-11-10T00:00:00.000Z', status: 'Pending', productSalesCount: 849, earnings: 4750.17 },
        { date: '2024-06-23T00:00:00.000Z', status: 'Pending', productSalesCount: 6241, earnings: 2000.47 },
        { date: '2024-02-04T00:00:00.000Z', status: 'Paid', productSalesCount: 33, earnings: 1092.10 },
        { date: '2024-04-11T00:00:00.000Z', status: 'Pending', productSalesCount: 1368, earnings: 7750.88 }
      ]
    }
  };
};

// Vendor Product Management
export async function createProduct(productData: FormData) {
  const res = await api.post('/products', productData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

export async function updateProduct(id: string, productData: FormData) {
  const res = await api.put(`/products/${id}`, productData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

export async function deleteProduct(id: string) {
  const res = await api.delete(`/products/${id}`);
  return res.data;
}

export async function getVendorProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}) {
  const res = await api.get('/products', { 
    params: { ...params, vendorOnly: true } 
  });
  return res.data;
}

// Vendor Order Management
export async function getVendorOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  const res = await api.get('/orders/vendor', { params });
  return res.data;
}

export async function getVendorOrderById(id: string) {
  const res = await api.get(`/orders/vendor/${id}`);
  return res.data;
}



export async function updateOrderStatus(id: string, status: string) {
  const res = await api.put(`/orders/vendor/${id}/status`, { status });
  return res.data;
}

// Admin functions (for admin panel)
export async function getVendors(params?: any) {
  const res = await api.get('/vendors', { params });
  return res.data;
}

export async function getVendorById(id: string) {
  const res = await api.get(`/vendors/${id}`);
  return res.data;
}

export async function updateVendor(id: string, data: any) {
  const res = await api.put(`/vendors/${id}`, data);
  return res.data;
}

export async function deleteVendor(id: string) {
  const res = await api.delete(`/vendors/${id}`);
  return res.data;
}

export async function getVendorStats() {
  const res = await api.get('/vendors/stats');
  return res.data;
}

export async function getVendorProductsAdmin(id: string, params?: any) {
  const res = await api.get(`/vendors/${id}/products`, { params });
  return res.data;
}

export async function getVendorOrdersAdmin(id: string, params?: any) {
  const res = await api.get(`/vendors/${id}/orders`, { params });
  return res.data;
} 

// Add Product
export const addVendorProduct = async (formData: FormData) => {
  return api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Edit Product
export const editVendorProduct = async (id: string, formData: FormData) => {
  return api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Delete Product
export const deleteVendorProduct = async (id:string) => {
  return api.delete(`/products/${id}`);
}; 

// Vendor Released Products
export async function getVendorReleasedProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);

  const res = await api.get(`/vendors/products/released?${queryParams}`);
  return res.data;
}

// Vendor Draft Products
export async function getVendorDraftProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);

  const res = await api.get(`/vendors/products/drafts?${queryParams}`);
  return res.data;
}

// Bulk product operations
export async function unpublishVendorProducts(productIds: string[]) {
  const res = await api.post('/vendors/products/unpublish', { productIds });
  return res.data;
}

export async function publishVendorProducts(productIds: string[]) {
  const res = await api.post('/vendors/products/publish', { productIds });
  return res.data;
}

// Scheduled Products API functions
export async function getVendorScheduledProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const res = await api.get('/vendors/products/scheduled', { params });
  return res.data;
}

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



export async function deleteVendorProducts(productIds: string[]) {
  const res = await api.delete('/vendors/products/bulk', { data: { productIds } });
  return res.data;
} 