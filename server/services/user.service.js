const User = require('../models/User');

/**
 * Get user profile by ID
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User profile not found');
    error.statusCode = 404;
    throw error;
  }
  return user.toJSON();
};

/**
 * Update user profile (name, email)
 */
const updateProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (updateData.name) {
    user.name = updateData.name.trim();
  }

  if (updateData.email && updateData.email.toLowerCase().trim() !== user.email) {
    const emailCandidate = updateData.email.toLowerCase().trim();
    const existing = await User.findOne({ email: emailCandidate, _id: { $ne: userId } });
    if (existing) {
      const error = new Error('This email address is already in use by another account');
      error.statusCode = 400;
      throw error;
    }
    user.email = emailCandidate;
  }

  await user.save();
  return user.toJSON();
};

/**
 * Change password after validating current password
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    const error = new Error('Current password does not match');
    error.statusCode = 400;
    throw error;
  }

  if (currentPassword === newPassword) {
    const error = new Error('New password cannot be the same as your current password');
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Password updated successfully' };
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};
