import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Utility to get the correct token for a given URL
function getAuthToken(url: string) {
  // Vendor endpoints
  if (url.includes('/vendors')) {
    return Cookies.get('vendorToken');
  }
  // User endpoints
  if (url.includes('/users')) {
    return Cookies.get('userToken');
  }
  // Fallback: prefer userToken
  return Cookies.get('userToken') || Cookies.get('vendorToken');
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = getAuthToken(config.url || '');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log('API Request - No token found:', config.url);
      }
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and server issues
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different types of errors gracefully
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Clear tokens on unauthorized
          if (typeof window !== 'undefined') {
            Cookies.remove('userToken');
            Cookies.remove('vendorToken');
            // Redirect to login if not already there
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
          break;
        case 403:
          console.error('Access forbidden:', error.response.data);
          break;
        case 404:
          console.error('Resource not found:', error.response.data);
          break;
        case 500:
          console.error('Server error:', error.response.data);
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      // Network error or server not responding
      console.error('Network error - server may be down:', error.message);
      // Don't throw error, return a graceful response
      return Promise.resolve({
        data: { 
          success: false, 
          message: 'Server is currently unavailable. Please try again later.',
          error: 'NETWORK_ERROR'
        }
      });
    } else {
      // Other errors
      console.error('Request setup error:', error.message);
    }
    
    // Return a graceful error response instead of throwing
    return Promise.resolve({
      data: { 
        success: false, 
        message: error.response?.data?.message || 'Something went wrong. Please try again.',
        error: 'API_ERROR'
      }
    });
  }
);

export default api; 