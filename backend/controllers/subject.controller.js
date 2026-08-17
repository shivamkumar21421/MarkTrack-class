const Subject = require('../models/Subject');
const { sendSuccess, sendError, asyncHandler } = require('../utils/errorHandler');
const { isValidObjectId, isNonEmptyString } = require('../utils/validators');

// @route  GET /api/subjects
const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find().sort({ name: 1 });
  return sendSuccess(res, 200, 'Subjects fetched successfully', subjects);
});

// @route  GET /api/subjects/:id
const getSubjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return sendError(res, 400, 'Invalid subject ID.');

  const subject = await Subject.findById(id);
  if (!subject) return sendError(res, 404, 'Subject not found.');

  return sendSuccess(res, 200, 'Subject fetched successfully', subject);
});

// @route  POST /api/subjects
const createSubject = asyncHandler(async (req, res) => {
  const { name, code } = req.body;

  if (!isNonEmptyString(name) || !isNonEmptyString(code)) {
    return sendError(res, 400, 'Subject name and code are required.');
  }

  const existing = await Subject.findOne({ code: code.toUpperCase() });
  if (existing) return sendError(res, 409, 'A subject with this code already exists.');

  const subject = await Subject.create({ name, code });
  return sendSuccess(res, 201, 'Subject created successfully', subject);
});

// @route  PUT /api/subjects/:id
const updateSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return sendError(res, 400, 'Invalid subject ID.');

  const { name, code } = req.body;

  const subject = await Subject.findByIdAndUpdate(
    id,
    { name, code },
    { new: true, runValidators: true }
  );

  if (!subject) return sendError(res, 404, 'Subject not found.');

  return sendSuccess(res, 200, 'Subject updated successfully', subject);
});

// @route  DELETE /api/subjects/:id
const deleteSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return sendError(res, 400, 'Invalid subject ID.');

  const subject = await Subject.findByIdAndDelete(id);
  if (!subject) return sendError(res, 404, 'Subject not found.');

  return sendSuccess(res, 200, 'Subject deleted successfully', null);
});

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};
