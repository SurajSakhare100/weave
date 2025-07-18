import { getVendorToken, setupVendorAuthHeader } from './vendorAuth';
import { debugAuth } from './debugAuth';

/**
 * Initialize vendor authentication on app startup
 * This should be called in _app.tsx or similar
 */
export const initializeVendorAuth = () => {
  if (typeof window === 'undefined') return;
  
  console.log('Initializing vendor authentication...');
  debugAuth();
  
  const token = getVendorToken();
  if (token) {
    console.log('Vendor token found, setting up auth headers');
    setupVendorAuthHeader(token);
    return { isAuthenticated: true, token };
  } else {
    console.log('No vendor token found');
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