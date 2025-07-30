// Vendor Authentication Utilities

import Cookies from 'js-cookie';

const VENDOR_TOKEN_KEY = 'vendorToken';

// Token Management
export const setVendorToken = (token: string) => {
  Cookies.set(VENDOR_TOKEN_KEY, token, { expires: 7, sameSite: 'Lax' });
  // Clear other tokens to prevent conflicts
  Cookies.remove('userToken');
  Cookies.remove('adminToken');
};

export const getVendorToken = (): string | null => {
  return Cookies.get(VENDOR_TOKEN_KEY) || null;
};

export const removeVendorToken = () => {
  Cookies.remove(VENDOR_TOKEN_KEY);
};

// Setup vendor auth header for API calls
export const setupVendorAuthHeader = (token: string) => {
  if (typeof window !== 'undefined') {
    // This will be handled by the API interceptor
    setVendorToken(token);
  }
};

// Check if vendor is authenticated
export const isVendorAuthenticated = (): boolean => {
  return !!getVendorToken();
};

// Get vendor token for API calls
export const getVendorAuthHeader = (): string | null => {
  const token = getVendorToken();
  return token ? `Bearer ${token}` : null;
}; 