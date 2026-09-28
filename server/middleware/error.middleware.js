const { errorResponse } = require('../utils/apiResponse');

/**
 * 404 Not Found Handler
 */
const notFound = (req, res, next) => {
  return errorResponse(res, `Endpoint not found: ${req.method} ${req.originalUrl}`, 404);
};

/**
 * Centralized Global Error Handler
 * Formats all uncaught exceptions, Mongoose validation errors, CastErrors,
 * and duplicate key errors into standard StockSense response format.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    message = `Resource not found with id: ${err.value}`;
    statusCode = 404;
  }

  // Handle Mongoose Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for ${field}. Please use another value.`;
    statusCode = 400;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join(', ');
    statusCode = 400;
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid authentication token. Please log in again.';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Authentication token has expired. Please log in again.';
    statusCode = 401;
  }

  console.error(`[Error] ${statusCode} - ${message}`);
  if (process.env.NODE_ENV === 'development' && err.stack) {
    console.error(err.stack);
  }

  return errorResponse(res, message, statusCode);
};

module.exports = {
  notFound,
  errorHandler
};
