import Cookies from 'js-cookie';

/**
 * Clear all old tokens that don't have userType field
 * This should be called when migrating from old token format
 */
export const clearOldTokens = () => {
  // Clear all possible token cookies
  Cookies.remove('userToken');
  Cookies.remove('vendorToken');
  Cookies.remove('adminToken');
  
  // Clear any other potential token storage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userToken');
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    
    // Clear session storage as well
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('vendorToken');
    sessionStorage.removeItem('adminToken');
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
  const adminToken = Cookies.get('adminToken');
  
  if (userToken || vendorToken || adminToken) {
    try {
      // Try to decode the token to check if it has userType field
      const token = userToken || vendorToken || adminToken;
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