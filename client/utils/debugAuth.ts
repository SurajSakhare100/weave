// Debug utility for authentication
import Cookies from 'js-cookie';

export const debugAuth = () => {
  // Debug functionality removed for production
  // This function is kept for potential future debugging needs
};

export const clearAllAuth = () => {
  Cookies.remove('vendorToken');
  Cookies.remove('userToken');
  if (typeof window !== 'undefined') {
    localStorage.clear();
  }
}; 