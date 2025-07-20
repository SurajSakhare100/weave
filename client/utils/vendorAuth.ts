// Vendor Authentication Utilities

import Cookies from 'js-cookie';

const VENDOR_TOKEN_KEY = 'vendorToken';

// Token Management
export const setVendorToken = (token: string) => {
  Cookies.set(VENDOR_TOKEN_KEY, token, { expires: 7, sameSite: 'Lax' });
};

export const getVendorToken = (): string | null => {
  return Cookies.get(VENDOR_TOKEN_KEY) || null;
};

export const removeVendorToken = () => {
  Cookies.remove(VENDOR_TOKEN_KEY);
  clearVendorAuthHeader();
};

// Authentication Check
export const isVendorAuthenticated = (): boolean => {
  const token = getVendorToken();
  return !!token;
};

// Logout
export const vendorLogout = () => {
  removeVendorToken();
};

// API Token Setup
export const setupVendorAuthHeader = (token: string) => {
  try {
    // Import the api instance instead of global axios
    const api = require('@/services/api').default;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } catch (error) {
    console.error('Error setting up vendor auth header:', error);
  }
};

// Clear API headers
export const clearVendorAuthHeader = () => {
  try {
    // Import the api instance instead of global axios
    const api = require('@/services/api').default;
    delete api.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error('Error clearing vendor auth header:', error);
  }
};

// Initialize auth from cookie
export const initializeVendorAuth = () => {
  const token = getVendorToken();
  if (token) {
    setupVendorAuthHeader(token);
  }
  return { token };
};

// Check if vendor is authenticated and redirect if not
export const requireVendorAuth = (router: any) => {
  if (!isVendorAuthenticated()) {
    router.push('/vendor/login');
    return false;
  }
  return true;
}; 