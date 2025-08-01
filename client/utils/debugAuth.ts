// Debug utility for authentication
import Cookies from 'js-cookie';

export const debugAuth = () => {
  // Debug functionality removed for production
  // This function is kept for potential future debugging needs
};

export const clearAllAuth = () => {
  // Clear cookies for user and vendor authentication
  Cookies.remove('vendorToken');
  Cookies.remove('userToken');
  
  // Note: Admin tokens are HTTP-only cookies and will be cleared by the server
  // No need to clear localStorage as we're using pure cookie-based authentication
}; 