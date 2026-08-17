// Standard success response
const sendSuccess = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Standard error response
const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

// Central error-handling middleware (catches thrown/async errors)
const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return sendError(res, 409, 'Duplicate record. This entry already exists.');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return sendError(res, 400, messages.join(', '));
  }

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    return sendError(res, 400, 'Invalid ID format.');
  }

  return sendError(res, err.statusCode || 500, err.message || 'Server Error');
};

// Wrap async route handlers to forward errors to errorMiddleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { sendSuccess, sendError, errorMiddleware, asyncHandler };
