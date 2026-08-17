const Student = require('../models/Student');
const User = require('../models/User');
const { sendSuccess, sendError, asyncHandler } = require('../utils/errorHandler');
const { isValidObjectId, isNonEmptyString, isValidEmail } = require('../utils/validators');

// @route  GET /api/students
const getStudents = asyncHandler(async (req, res) => {
  const { search, className, section } = req.query;
  const filter = {};

  if (className) filter.className = className;
  if (section) filter.section = section;

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { rollNumber: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const students = await Student.find(filter).sort({ createdAt: -1 });
  return sendSuccess(res, 200, 'Students fetched successfully', students);
});

// @route  GET /api/students/:id
const getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return sendError(res, 400, 'Invalid student ID.');

  const student = await Student.findById(id);
  if (!student) return sendError(res, 404, 'Student not found.');

  return sendSuccess(res, 200, 'Student fetched successfully', student);
});

// @route POST /api/students
const createStudent = asyncHandler(async (req, res) => {
  const {
    name,
    rollNumber,
    className,
    section,
    email,
    password,
  } = req.body;

  if (
    !isNonEmptyString(name) ||
    !isNonEmptyString(rollNumber) ||
    !isNonEmptyString(className) ||
    !isNonEmptyString(section) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(password)
  ) {
    return sendError(res, 400, 'All student fields are required.');
  }

  if (!isValidEmail(email)) {
    return sendError(res, 400, 'Please provide a valid email address.');
  }

  if (password.length < 6) {
    return sendError(
      res,
      400,
      'Student password must be at least 6 characters long.'
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check whether this email already exists as a User
  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    return sendError(
      res,
      409,
      'A user with this email already exists.'
    );
  }

  // Check whether a Student record already exists
  const existingStudent = await Student.findOne({
    email: normalizedEmail,
  });

  if (existingStudent) {
    return sendError(
      res,
      409,
      'A student with this email already exists.'
    );
  }

  // Create login account
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: 'student',
  });

  try {
    // Create academic/student profile linked to User
    const student = await Student.create({
      name: name.trim(),
      rollNumber: rollNumber.trim(),
      className: className.trim(),
      section: section.trim(),
      email: normalizedEmail,
      userId: user._id,
    });

    return sendSuccess(
      res,
      201,
      'Student account and record created successfully.',
      student
    );
  } catch (error) {
    // If Student creation fails, remove the User account
    // so we don't leave an orphan login account.
    await User.findByIdAndDelete(user._id);
    throw error;
  }
});

// @route  PUT /api/students/:id
const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return sendError(res, 400, 'Invalid student ID.');

  const { name, rollNumber, className, section, email } = req.body;

  if (email && !isValidEmail(email)) {
    return sendError(res, 400, 'Please provide a valid email address.');
  }

  const student = await Student.findByIdAndUpdate(
    id,
    { name, rollNumber, className, section, email },
    { new: true, runValidators: true }
  );

  if (!student) return sendError(res, 404, 'Student not found.');

  return sendSuccess(res, 200, 'Student updated successfully', student);
});

// @route  DELETE /api/students/:id
const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return sendError(res, 400, 'Invalid student ID.');

  const student = await Student.findByIdAndDelete(id);
  if (!student) return sendError(res, 404, 'Student not found.');

  return sendSuccess(res, 200, 'Student deleted successfully', null);
});

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
