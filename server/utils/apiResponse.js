/**
 * StockSense Standard API Response Utilities
 *
 * Ensures consistent response format across all endpoints:
 * Success: { success: true, message: string, data: object }
 * Error:   { success: false, message: string, [errors]: array/object }
 */

const successResponse = (res, message = 'Success', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const payload = {
    success: false,
    message
  };

  if (errors) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  successResponse,
  errorResponse
};
