const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.registerUser({ name, email, password, role });
    return successResponse(res, 'User registered successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate user & get token
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    return successResponse(res, 'Login successful', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res, next) => {
  try {
    return successResponse(res, 'Current user profile retrieved', { user: req.user }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    return successResponse(res, 'Logged out successfully', null, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout
};
