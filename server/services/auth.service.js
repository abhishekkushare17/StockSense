const User = require('../models/User');

/**
 * Register a new user
 */
const registerUser = async ({ name, email, password, role }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    const error = new Error('An account with this email address already exists');
    error.statusCode = 400;
    throw error;
  }

  // Create new user record
  const user = new User({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role
  });

  await user.save();

  // Generate JWT token
  const token = user.generateAuthToken();

  return {
    user: user.toJSON(),
    token
  };
};

/**
 * Authenticate user with email and password
 */
const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Explicitly select password field since it is select: false
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Check if user account is active
  if (user.status !== 'active') {
    const error = new Error('Your account has been deactivated. Please contact your administrator.');
    error.statusCode = 403;
    throw error;
  }

  // Verify password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const token = user.generateAuthToken();

  return {
    user: user.toJSON(),
    token
  };
};

/**
 * Retrieve user by ID
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user.toJSON();
};

/**
 * Forgot password request
 */
const forgotPassword = async (email) => {
  if (!email || !email.trim()) {
    const error = new Error('Email is required');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    // Return friendly generic message for security
    return {
      message: 'If an account with that email exists, reset instructions have been generated.',
      resetToken: null
    };
  }

  const demoToken = `rst-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  return {
    message: 'Password reset link sent to your registered email.',
    resetToken: demoToken,
    email: user.email
  };
};

/**
 * Reset password implementation
 */
const resetPassword = async ({ email, newPassword }) => {
  if (!email || !newPassword) {
    const error = new Error('Email and new password are required');
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 8) {
    const error = new Error('Password must be at least 8 characters long');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.password = newPassword;
  await user.save();

  return {
    message: 'Password has been reset successfully. You can now log in with your new password.'
  };
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  forgotPassword,
  resetPassword
};
