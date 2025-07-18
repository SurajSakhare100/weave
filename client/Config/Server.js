import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance for admin API calls
const Server = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Add request interceptor to include admin token
Server.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    }
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
      // Clear admin token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// adminAxios function that takes a server parameter
export const adminAxios = async (callback) => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      throw new Error('No admin token found');
    }
    
    const server = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
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