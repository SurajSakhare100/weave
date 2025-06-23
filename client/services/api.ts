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
      // Check for vendor token in cookie
      const vendorToken = Cookies.get('vendorToken');
      if (vendorToken) {
        config.headers.Authorization = `Bearer ${vendorToken}`;
        return config;
      }
      // Fallback to user token from cookie
      const userToken = Cookies.get('userToken');
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
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
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear tokens on unauthorized
      if (typeof window !== 'undefined') {
        Cookies.remove('userToken');
      }
    }
    return Promise.reject(error);
  }
);

export default api; 