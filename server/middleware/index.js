const { protect, authorize } = require('./auth.middleware');
const { notFound, errorHandler } = require('./error.middleware');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword
} = require('./validate.middleware');
const asyncHandler = require('./async.middleware');

module.exports = {
  protect,
  authorize,
  notFound,
  errorHandler,
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  asyncHandler
};
