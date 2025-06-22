// Vendor Authentication Utilities

const VENDOR_TOKEN_KEY = 'vendorToken';
const VENDOR_PROFILE_KEY = 'vendorProfile';

// Token Management
export const setVendorToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(VENDOR_TOKEN_KEY, token);
    // Set up API headers immediately
    setupVendorAuthHeader(token);
  }
};

export const getVendorToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(VENDOR_TOKEN_KEY);
    return token;
  }
  return null;
};

export const removeVendorToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(VENDOR_TOKEN_KEY);
    // Clear API headers
    clearVendorAuthHeader();
    console.log('Vendor token removed');
  }
};

// Profile Management
export const setVendorProfile = (profile: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(VENDOR_PROFILE_KEY, JSON.stringify(profile));
    console.log('Vendor profile stored:', profile ? 'Profile exists' : 'No profile');
  }
};

export const getVendorProfile = (): any | null => {
  if (typeof window !== 'undefined') {
    const profile = localStorage.getItem(VENDOR_PROFILE_KEY);
    const parsedProfile = profile ? JSON.parse(profile) : null;
    console.log('Vendor profile retrieved:', parsedProfile ? 'Profile exists' : 'No profile');
    return parsedProfile;
  }
  return null;
};

export const removeVendorProfile = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(VENDOR_PROFILE_KEY);
    console.log('Vendor profile removed');
  }
};

// Authentication Check
export const isVendorAuthenticated = (): boolean => {
  const token = getVendorToken();
  const isAuth = !!token;
  return isAuth;
};

// Logout
export const vendorLogout = () => {
  removeVendorToken();
  removeVendorProfile();
};

// API Token Setup
export const setupVendorAuthHeader = (token: string) => {
  if (typeof window !== 'undefined') {
    try {
      // Update axios default headers
      const { default: axios } = require('axios');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Error setting up vendor auth header:', error);
    }
  }
};

// Clear API headers
export const clearVendorAuthHeader = () => {
  if (typeof window !== 'undefined') {
    try {
      const { default: axios } = require('axios');
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Error clearing vendor auth header:', error);
    }
  }
};

// Initialize auth from localStorage
export const initializeVendorAuth = () => {
  const token = getVendorToken();
  const profile = getVendorProfile();
  
  if (token) {
    setupVendorAuthHeader(token);
  }
  
  return { token, profile };
};

// Check if vendor is authenticated and redirect if not
export const requireVendorAuth = (router: any) => {
  if (!isVendorAuthenticated()) {
    router.push('/vendor/login');
    return false;
  }
  return true;
}; 