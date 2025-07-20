import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000,
});

function getAuthToken(url: string): string | undefined {
  if (url.includes('/vendors')) {
    return Cookies.get('vendorToken');
  }
  if (url.includes('/users')) {
    return Cookies.get('userToken');
  }
  return Cookies.get('userToken') || Cookies.get('vendorToken');
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
    if (error.response) {
      switch (error.response.status) {
        case 401:
          if (typeof window !== 'undefined') {
            Cookies.remove('userToken');
            Cookies.remove('vendorToken');
            const currentPath = window.location.pathname;
            if (currentPath.includes('/vendor/') && currentPath !== '/vendor/login') {
              window.location.href = '/vendor/login';
            } else if (!currentPath.includes('/vendor/') && currentPath !== '/login') {
              window.location.href = '/login';
            }
          }
          break;
        case 403:
          break;
        case 404:
          break;
        case 500:
          break;
        default:
          break;
      }
    } else if (error.request) {
      return Promise.resolve({
        data: { 
          success: false, 
          message: 'Server is currently unavailable. Please try again later.',
          error: 'NETWORK_ERROR'
        }
      });
    }
    
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