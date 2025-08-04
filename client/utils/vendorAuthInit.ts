import { getVendorToken } from './vendorAuth';

export const initializeVendorAuth = () => {
  if (typeof window === 'undefined') return;
  
  const token = getVendorToken();
  if (token) {
    return { isAuthenticated: true, token };
  } else {
    return { isAuthenticated: false, token: null };
  }
};

/**
 * Check if vendor is authenticated
 */
export const checkVendorAuth = () => {
  const token = getVendorToken();
  return !!token;
};

/**
 * Get vendor authentication status
 */
export const getVendorAuthStatus = () => {
  const token = getVendorToken();
  return {
    isAuthenticated: !!token,
    token: token || null,
    hasToken: !!token
  };
}; 