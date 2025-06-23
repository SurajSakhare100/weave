import api from './api';
import Cookies from 'js-cookie';

// Vendor Authentication
export async function vendorLogin(credentials: { email: string; password: string }) {
  const res = await api.post('/auth/vendor/login', credentials);
  // Set token in cookie
  if (res.data.token) {
    Cookies.set('vendorToken', res.data.token, { expires: 7, sameSite: 'Lax' });
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
  Cookies.remove('vendorToken');
  const res = await api.post('/auth/vendor/logout');
  return res.data;
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