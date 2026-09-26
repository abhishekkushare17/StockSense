const mongoose = require('mongoose');
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

/**
 * Validate Product Creation payload
 */
const validateCreateProduct = (req, res, next) => {
  const { name, sku, code, category, reorderLevel, initialStock, warehouseId } = req.body;

  if (!name || !name.trim()) {
    return errorResponse(res, 'Product name is required and cannot be empty.', 400);
  }

  const targetSku = (sku || code || '').trim();
  if (!targetSku) {
    return errorResponse(res, 'Product SKU/code is required.', 400);
  }

  if (!category) {
    return errorResponse(res, 'Category is required.', 400);
  }

  if (!mongoose.Types.ObjectId.isValid(category)) {
    return errorResponse(res, 'Category ID must be a valid ObjectId.', 400);
  }

  if (reorderLevel !== undefined && Number(reorderLevel) < 0) {
    return errorResponse(res, 'Reorder level cannot be negative.', 400);
  }

  if (initialStock !== undefined && Number(initialStock) < 0) {
    return errorResponse(res, 'Initial stock cannot be negative.', 400);
  }

  if (warehouseId && !mongoose.Types.ObjectId.isValid(warehouseId)) {
    return errorResponse(res, 'Warehouse ID must be a valid ObjectId.', 400);
  }

  next();
};

/**
 * Validate Category Creation payload
 */
const validateCreateCategory = (req, res, next) => {
  const { name, code } = req.body;

  if (!name || !name.trim()) {
    return errorResponse(res, 'Category name is required and cannot be empty.', 400);
  }

  if (!code || !code.trim()) {
    return errorResponse(res, 'Category code is required and cannot be empty.', 400);
  }

  next();
};

/**
 * Validate Warehouse Creation payload
 */
const validateCreateWarehouse = (req, res, next) => {
  const { name, code } = req.body;

  if (!name || !name.trim()) {
    return errorResponse(res, 'Warehouse name is required and cannot be empty.', 400);
  }

  if (!code || !code.trim()) {
    return errorResponse(res, 'Warehouse code is required and cannot be empty.', 400);
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateCreateProduct,
  validateCreateCategory,
  validateCreateWarehouse
};
