import api from './api';
import Cookies from 'js-cookie';

// Cookie names for different user types
const USER_TOKEN_KEY = 'userToken';
const VENDOR_TOKEN_KEY = 'vendorToken';
const ADMIN_TOKEN_KEY = 'adminToken';

// User Authentication
export async function login(data: { email: string; password: string }) {
  const res = await api.post('/auth/login', data);
  // Set token in cookie with user type
  if (res.data.token) {
    Cookies.set(USER_TOKEN_KEY, res.data.token, { expires: 7, sameSite: 'Lax' });
    // Clear other tokens to prevent conflicts
    Cookies.remove(VENDOR_TOKEN_KEY);
    Cookies.remove(ADMIN_TOKEN_KEY);
  }
  return res.data;
}

export async function register(data: { firstName: string; lastName: string; email: string; password: string; number?: string }) {
  const res = await api.post('/auth/register', data);
  // Set token in cookie
  if (res.data.token) {
    Cookies.set(USER_TOKEN_KEY, res.data.token, { expires: 7, sameSite: 'Lax' });
    // Clear other tokens to prevent conflicts
    Cookies.remove(VENDOR_TOKEN_KEY);
    Cookies.remove(ADMIN_TOKEN_KEY);
  }
  return res.data;
}

// Vendor Authentication
export async function vendorLogin(data: { email: string; password: string }) {
  const res = await api.post('/auth/vendor/login', data);
  // Set token in cookie with vendor type
  if (res.data.token) {
    Cookies.set(VENDOR_TOKEN_KEY, res.data.token, { expires: 7, sameSite: 'Lax' });
    // Clear other tokens to prevent conflicts
    Cookies.remove(USER_TOKEN_KEY);
    Cookies.remove(ADMIN_TOKEN_KEY);
  }
  return res.data;
}

export async function vendorRegister(data: { 
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
  const res = await api.post('/auth/vendor/register', data);
  // Set token in cookie
  if (res.data.token) {
    Cookies.set(VENDOR_TOKEN_KEY, res.data.token, { expires: 7, sameSite: 'Lax' });
    // Clear other tokens to prevent conflicts
    Cookies.remove(USER_TOKEN_KEY);
    Cookies.remove(ADMIN_TOKEN_KEY);
  }
  return res.data;
}

// Admin Authentication
export async function adminLogin(data: { email: string; password: string }) {
  const res = await api.post('/auth/admin/login', data);
  // Set token in cookie with admin type
  if (res.data.token) {
    Cookies.set(ADMIN_TOKEN_KEY, res.data.token, { expires: 7, sameSite: 'Lax' });
    // Clear other tokens to prevent conflicts
    Cookies.remove(USER_TOKEN_KEY);
    Cookies.remove(VENDOR_TOKEN_KEY);
  }
  return res.data;
}

// Universal logout - clears all tokens
export async function logout() {
  // Clear all cookies
  Cookies.remove(USER_TOKEN_KEY);
  Cookies.remove(VENDOR_TOKEN_KEY);
  Cookies.remove(ADMIN_TOKEN_KEY);
  
  // Call logout endpoint if possible
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Ignore errors on logout
  }
  
  return { success: true, message: 'Logged out successfully' };
}

// Token getters
export function getUserToken() {
  return Cookies.get(USER_TOKEN_KEY) || null;
}

export function getVendorToken() {
  return Cookies.get(VENDOR_TOKEN_KEY) || null;
}

export function getAdminToken() {
  return Cookies.get(ADMIN_TOKEN_KEY) || null;
}

// Check current user type
export function getCurrentUserType(): 'user' | 'vendor' | 'admin' | null {
  if (getUserToken()) return 'user';
  if (getVendorToken()) return 'vendor';
  if (getAdminToken()) return 'admin';
  return null;
}

// Check if any user is logged in
export function isAuthenticated(): boolean {
  return !!(getUserToken() || getVendorToken() || getAdminToken());
}

// Clear specific token type
export function clearUserToken() {
  Cookies.remove(USER_TOKEN_KEY);
}

export function clearVendorToken() {
  Cookies.remove(VENDOR_TOKEN_KEY);
}

export function clearAdminToken() {
  Cookies.remove(ADMIN_TOKEN_KEY);
} 