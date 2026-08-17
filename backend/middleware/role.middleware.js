const { sendError } = require('../utils/errorHandler');

// Usage: authorize('teacher') or authorize('teacher', 'student')
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return sendError(res, 403, 'Access denied. Insufficient permissions.');
    }
    next();
  };
};

module.exports = { authorize };
