import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance for admin API calls
const Server = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  withCredentials: true, // Include cookies
});

// Add request interceptor (no need to manually add Authorization header for cookie-based auth)
Server.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
Server.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on authentication failure
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// adminAxios function that takes a server parameter
export const adminAxios = async (callback) => {
  try {
    const server = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      withCredentials: true, // Include cookies
    });
    
    return await callback(server);
  } catch (error) {
    console.error('Admin API error:', error);
    throw error;
  }
};

// ServerId for admin operations
export const ServerId = 'admin-server';

export default Server; 