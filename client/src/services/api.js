import axios from 'axios';
import { TOKEN_STORAGE_KEY, API_BASE_URL } from '../utils/constants';

/**
 * Pre-configured Axios instance with automatic token injection
 * and standardized error handling.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: inject JWT Bearer token into outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: handle token expiration or 401s centrally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
    
    // If receiving 401 Unauthorized on protected routes, wipe token and trigger login
    if (error.response && error.response.status === 401 && !isAuthRequest) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem('stocksense_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Extract standardized error message from backend
    const message =
      error.response?.data?.message ||
      (error.response?.status === 500
        ? 'Server error or backend unreachable. Please ensure the backend is running.'
        : error.message || 'An unexpected network error occurred');

    return Promise.reject(new Error(message));
  }
);

export default api;
