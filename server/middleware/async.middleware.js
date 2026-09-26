/**
 * Async handler wrapper to eliminate try-catch boilerplate in route handlers.
 * Any unhandled promise rejection is caught and passed to next().
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
