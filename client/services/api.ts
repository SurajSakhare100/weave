import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check for vendor token first
    if (typeof window !== 'undefined') {
      const vendorToken = localStorage.getItem('vendorToken');
      if (vendorToken) {
        config.headers.Authorization = `Bearer ${vendorToken}`;
        return config;
      }
      
      // Fallback to user token
      const userToken = localStorage.getItem('token');
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
        console.log('API Request: Using user token for', config.url);
      } else {
        console.log('API Request: No token found for', config.url);
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
  (response) => response,
  (error) => {
    console.log('API Response Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      // Clear tokens on unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vendorToken');
        localStorage.removeItem('vendorProfile');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      // Redirect to login
      window.location.href = '/vendor/login';
    }
    return Promise.reject(error);
  }
);

export default api; 