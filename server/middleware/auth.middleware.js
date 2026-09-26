const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Protect middleware:
 * Validates JWT from Authorization header (Bearer <token>)
 * Attaches decoded user document to req.user
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Access denied. No authentication token provided.', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, env.jwtSecret);

    // Fetch user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 'The user belonging to this token no longer exists.', 401);
    }

    if (user.status !== 'active') {
      return errorResponse(res, 'Your account has been deactivated. Please contact an administrator.', 403);
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Authentication token has expired. Please log in again.', 401);
    }
    return errorResponse(res, 'Invalid authentication token. Please log in again.', 401);
  }
};

/**
 * Authorize middleware:
 * Restricts access to users with specified roles
 * Usage: router.get('/admin-only', protect, authorize('Inventory Manager'), controller)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required before checking permissions.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
        403
      );
    }

    next();
  };
};

module.exports = {
  protect,
  authorize
};
