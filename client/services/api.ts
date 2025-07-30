import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000,
});

// Cookie names for different user types
const USER_TOKEN_KEY = 'userToken';
const VENDOR_TOKEN_KEY = 'vendorToken';
const ADMIN_TOKEN_KEY = 'adminToken';

function getAuthToken(url: string): string | undefined {
  // Determine which token to use based on the URL path
  if (url.includes('/vendors') || url.includes('/vendor') || url.includes('/orders/vendor')) {
    return Cookies.get(VENDOR_TOKEN_KEY);
  }
  if (url.includes('/admin') || url.includes('/admins')) {
    return Cookies.get(ADMIN_TOKEN_KEY);
  }
  if (url.includes('/users') || url.includes('/auth/profile') || url.includes('/cart') || url.includes('/orders') || url.includes('/wishlist')) {
    return Cookies.get(USER_TOKEN_KEY);
  }
  
  // For general routes, try to get the most appropriate token
  // Priority: user > vendor > admin
  return Cookies.get(USER_TOKEN_KEY) || Cookies.get(VENDOR_TOKEN_KEY) || Cookies.get(ADMIN_TOKEN_KEY);
}

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = getAuthToken(config.url || '');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear all tokens on authentication failure
      if (typeof window !== 'undefined') {
        Cookies.remove(USER_TOKEN_KEY);
        Cookies.remove(VENDOR_TOKEN_KEY);
        Cookies.remove(ADMIN_TOKEN_KEY);
        
        // Redirect to appropriate login page based on current route
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/vendor')) {
          window.location.href = '/vendor/login';
        } else if (currentPath.startsWith('/admin')) {
          window.location.href = '/admin/login';
        } else {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 