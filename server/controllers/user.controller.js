const userService = require('../services/user.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Get logged-in user profile
 * GET /api/users/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(req.user._id);
    return successResponse(res, 'Profile retrieved successfully', { user: profile }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Update logged-in user profile
 * PUT /api/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updatedUser = await userService.updateProfile(req.user._id, { name, email });
    return successResponse(res, 'Profile updated successfully', { user: updatedUser }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Change logged-in user password
 * PUT /api/users/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await userService.changePassword(req.user._id, { currentPassword, newPassword });
    return successResponse(res, result.message, null, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};
