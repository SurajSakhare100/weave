import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Check for vendor token first
      const vendorToken = localStorage.getItem('vendorToken');
      if (vendorToken) {
        config.headers.Authorization = `Bearer ${vendorToken}`;
        console.log('API Request - Using vendor token:', config.url);
        return config;
      }
      // Fallback to user token from cookie
      const userToken = Cookies.get('userToken');
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
        console.log('API Request - Using user token:', config.url);
      } else {
        console.log('API Request - No token found:', config.url);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response - Success:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.log('API Response Error:', error.response?.status, error.response?.data, error.config?.url);
    if (error.response?.status === 401) {
      // Clear tokens on unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vendorToken');
        localStorage.removeItem('vendorProfile');
        Cookies.remove('userToken');
        // Don't redirect automatically, let components handle it
      }
    }
    return Promise.reject(error);
  }
);

export default api; 