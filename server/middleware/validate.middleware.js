const { errorResponse } = require('../utils/apiResponse');
const { ALL_ROLES } = require('../utils/constants');

const isValidEmail = (email) => {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

/**
 * Validate User Registration payload
 */
const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || name.trim().length < 2) {
    return errorResponse(res, 'Name is required and must be at least 2 characters long.', 400);
  }

  if (!email || !isValidEmail(email.trim())) {
    return errorResponse(res, 'A valid email address is required.', 400);
  }

  if (!password || password.length < 6) {
    return errorResponse(res, 'Password is required and must be at least 6 characters long.', 400);
  }

  if (role && !ALL_ROLES.includes(role)) {
    return errorResponse(
      res,
      `Invalid role '${role}'. Allowed roles are: ${ALL_ROLES.join(', ')}`,
      400
    );
  }

  next();
};

/**
 * Validate User Login payload
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !isValidEmail(email.trim())) {
    return errorResponse(res, 'A valid email address is required to log in.', 400);
  }

  if (!password) {
    return errorResponse(res, 'Password is required.', 400);
  }

  next();
};

/**
 * Validate Profile Update payload
 */
const validateUpdateProfile = (req, res, next) => {
  const { name, email } = req.body;

  if (!name && !email) {
    return errorResponse(res, 'At least one field (name or email) must be provided for update.', 400);
  }

  if (name && name.trim().length < 2) {
    return errorResponse(res, 'Name must be at least 2 characters long.', 400);
  }

  if (email && !isValidEmail(email.trim())) {
    return errorResponse(res, 'Please provide a valid email address.', 400);
  }

  next();
};

/**
 * Validate Change Password payload
 */
const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword) {
    return errorResponse(res, 'Current password is required.', 400);
  }

  if (!newPassword || newPassword.length < 6) {
    return errorResponse(res, 'New password is required and must be at least 6 characters long.', 400);
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword
};
