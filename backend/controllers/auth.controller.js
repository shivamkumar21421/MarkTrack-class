const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError, asyncHandler } = require('../utils/errorHandler');
const { isValidEmail, isNonEmptyString, isValidRole } = require('../utils/validators');

// @route  POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
    return sendError(res, 400, 'Name, email and password are required.');
  }

  if (!isValidEmail(email)) {
    return sendError(res, 400, 'Please provide a valid email address.');
  }

  if (password.length < 6) {
    return sendError(res, 400, 'Password must be at least 6 characters long.');
  }

  if (!isValidRole(role)) {
    return sendError(res, 400, "Role must be either 'teacher' or 'student'.");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return sendError(res, 409, 'A user with this email already exists.');
  }

  const user = await User.create({ name, email, password, role });

  const token = generateToken({ userId: user._id, role: user.role });

  return sendSuccess(res, 201, 'User registered successfully', {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// @route  POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    return sendError(res, 400, 'Email and password are required.');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    return sendError(res, 401, 'Invalid email or password.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return sendError(res, 401, 'Invalid email or password.');
  }

  const token = generateToken({ userId: user._id, role: user.role });

  return sendSuccess(res, 200, 'Login successful', {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// @route  GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    return sendError(res, 404, 'User not found.');
  }

  return sendSuccess(res, 200, 'User fetched successfully', {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

module.exports = { register, login, getMe };
