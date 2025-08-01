import Cookies from 'js-cookie';

/**
 * Clear all old tokens that don't have userType field
 * This should be called when migrating from old token format
 */
export const clearOldTokens = () => {
  // Clear cookies for user and vendor authentication
  Cookies.remove('userToken');
  Cookies.remove('vendorToken');
  
  // Note: Admin tokens are HTTP-only cookies and will be cleared by the server
  // No need to clear localStorage as we're using pure cookie-based authentication
  
  // Clear any other potential token storage (for backward compatibility)
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userToken');
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('token');
    
    // Clear session storage as well
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('vendorToken');
    sessionStorage.removeItem('token');
  }
  
  console.log('All old tokens cleared. Please log in again.');
  
  // Reload the page to ensure clean state
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};

/**
 * Check if current tokens are in the new format
 */
export const checkTokenFormat = () => {
  const userToken = Cookies.get('userToken');
  const vendorToken = Cookies.get('vendorToken');
  
  // Note: Admin tokens are HTTP-only cookies and cannot be accessed via js-cookie
  
  if (userToken || vendorToken) {
    try {
      // Try to decode the token to check if it has userType field
      const token = userToken || vendorToken;
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      if (!payload.userType) {
        console.warn('Old token format detected. Clearing tokens...');
        clearOldTokens();
        return false;
      }
      
      return true;
    } catch (error) {
      console.warn('Invalid token format. Clearing tokens...');
      clearOldTokens();
      return false;
    }
  }
  
  return true;
};

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).clearAllTokens = clearOldTokens;
  (window as any).checkTokenFormat = checkTokenFormat;
} 