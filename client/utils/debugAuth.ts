// Debug utility for authentication
import Cookies from 'js-cookie';

export const debugAuth = () => {
  console.log('=== AUTH DEBUG ===');
  
  // Check all cookies
  const allCookies = Cookies.get();
  console.log('All cookies:', allCookies);
  
  // Check vendor token specifically
  const vendorToken = Cookies.get('vendorToken');
  console.log('Vendor token:', vendorToken);
  console.log('Vendor token exists:', !!vendorToken);
  
  // Check user token
  const userToken = Cookies.get('userToken');
  console.log('User token:', userToken);
  console.log('User token exists:', !!userToken);
  
  // Check localStorage
  if (typeof window !== 'undefined') {
    console.log('localStorage:', Object.keys(localStorage));
  }
  
  console.log('=== END DEBUG ===');
};

export const clearAllAuth = () => {
  Cookies.remove('vendorToken');
  Cookies.remove('userToken');
  if (typeof window !== 'undefined') {
    localStorage.clear();
  }
  console.log('All auth data cleared');
}; 