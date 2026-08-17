const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/errorHandler');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Not authorized. No token provided.');
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return sendError(res, 401, 'Not authorized. User no longer exists.');
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    return sendError(res, 401, 'Not authorized. Invalid or expired token.');
  }
};

module.exports = { protect };
