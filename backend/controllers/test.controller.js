const Test = require('../models/Test');
const Subject = require('../models/Subject');
const { sendSuccess, sendError, asyncHandler } = require('../utils/errorHandler');
const { isValidObjectId, isNonEmptyString } = require('../utils/validators');

// @route  GET /api/tests
const getTests = asyncHandler(async (req, res) => {
  const { month, subject } = req.query;
  const filter = {};

  if (month) filter.month = month;
  if (subject) {
    if (!isValidObjectId(subject)) return sendError(res, 400, 'Invalid subject ID.');
    filter.subject = subject;
  }

  const tests = await Test.find(filter).populate('subject', 'name code').sort({ testDate: -1 });
  return sendSuccess(res, 200, 'Tests fetched successfully', tests);
});

// @route  GET /api/tests/:id
const getTestById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return sendError(res, 400, 'Invalid test ID.');

  const test = await Test.findById(id).populate('subject', 'name code');
  if (!test) return sendError(res, 404, 'Test not found.');

  return sendSuccess(res, 200, 'Test fetched successfully', test);
});

// @route  POST /api/tests
const createTest = asyncHandler(async (req, res) => {
  const { testName, month, subject, maxMarks, testDate } = req.body;

  if (
    !isNonEmptyString(testName) ||
    !isNonEmptyString(month) ||
    !isNonEmptyString(subject) ||
    maxMarks === undefined ||
    !testDate
  ) {
    return sendError(res, 400, 'All test fields are required.');
  }

  if (!isValidObjectId(subject)) return sendError(res, 400, 'Invalid subject ID.');

  const subjectExists = await Subject.findById(subject);
  if (!subjectExists) return sendError(res, 404, 'Subject not found.');

  if (typeof maxMarks !== 'number' || maxMarks <= 0) {
    return sendError(res, 400, 'Maximum marks must be a positive number.');
  }

  const test = await Test.create({ testName, month, subject, maxMarks, testDate });
  const populatedTest = await test.populate('subject', 'name code');

  return sendSuccess(res, 201, 'Test created successfully', populatedTest);
});

// @route  PUT /api/tests/:id
const updateTest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return sendError(res, 400, 'Invalid test ID.');

  const { testName, month, subject, maxMarks, testDate } = req.body;

  if (subject && !isValidObjectId(subject)) return sendError(res, 400, 'Invalid subject ID.');
  if (maxMarks !== undefined && (typeof maxMarks !== 'number' || maxMarks <= 0)) {
    return sendError(res, 400, 'Maximum marks must be a positive number.');
  }

  const test = await Test.findByIdAndUpdate(
    id,
    { testName, month, subject, maxMarks, testDate },
    { new: true, runValidators: true }
  ).populate('subject', 'name code');

  if (!test) return sendError(res, 404, 'Test not found.');

  return sendSuccess(res, 200, 'Test updated successfully', test);
});

// @route  DELETE /api/tests/:id
const deleteTest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return sendError(res, 400, 'Invalid test ID.');

  const test = await Test.findByIdAndDelete(id);
  if (!test) return sendError(res, 404, 'Test not found.');

  return sendSuccess(res, 200, 'Test deleted successfully', null);
});

module.exports = {
  getTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
};
