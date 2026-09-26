import api from './api';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../utils/constants';

/**
 * Authentication and User Profile API Service
 */
export const authService = {
  /**
   * Register a new user
   */
  async register({ name, email, password, role }) {
    const response = await api.post('/auth/register', { name, email, password, role });
    const { user, token } = response.data.data;
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
    return { user, token };
  },

  /**
   * Authenticate user with credentials
   */
  async login({ email, password }) {
    const response = await api.post('/auth/login', { email, password });
    const { user, token } = response.data.data;
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
    return { user, token };
  },

  /**
   * Retrieve current authenticated user
   */
  async getMe() {
    const response = await api.get('/auth/me');
    const user = response.data.data.user;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Logout user and clear tokens
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  },

  /**
   * Get user profile
   */
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data.data.user;
  },

  /**
   * Update profile
   */
  async updateProfile({ name, email }) {
    const response = await api.put('/users/profile', { name, email });
    const updatedUser = response.data.data.user;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  /**
   * Change user password
   */
  async changePassword({ currentPassword, newPassword }) {
    const response = await api.put('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export default authService;
