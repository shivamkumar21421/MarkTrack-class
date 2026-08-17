const Mark = require('../models/Mark');
const Test = require('../models/Test');
const Student = require('../models/Student');
const { sendSuccess, sendError, asyncHandler } = require('../utils/errorHandler');
const { isValidObjectId } = require('../utils/validators');

// @route  GET /api/marks
// Supports optional ?test= and ?student= filters
const getMarks = asyncHandler(async (req, res) => {
  const { test, student } = req.query;
  const filter = {};

  if (test) {
    if (!isValidObjectId(test)) return sendError(res, 400, 'Invalid test ID.');
    filter.test = test;
  }

  if (student) {
    if (!isValidObjectId(student)) return sendError(res, 400, 'Invalid student ID.');
    filter.student = student;
  }

  const marks = await Mark.find(filter)
    .populate('student', 'name rollNumber className section')
    .populate({
      path: 'test',
      select: 'testName month maxMarks testDate subject',
      populate: { path: 'subject', select: 'name code' },
    })
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, 'Marks fetched successfully', marks);
});

// @route  GET /api/marks/:id
const getMarkById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return sendError(res, 400, 'Invalid mark ID.');

  const mark = await Mark.findById(id)
    .populate('student', 'name rollNumber className section')
    .populate({
      path: 'test',
      select: 'testName month maxMarks testDate subject',
      populate: { path: 'subject', select: 'name code' },
    });

  if (!mark) return sendError(res, 404, 'Mark not found.');

  return sendSuccess(res, 200, 'Mark fetched successfully', mark);
});

// @route  POST /api/marks
const createMark = asyncHandler(async (req, res) => {
  const { student, test, marks } = req.body;

  if (!isValidObjectId(student) || !isValidObjectId(test)) {
    return sendError(res, 400, 'Valid student and test IDs are required.');
  }

  if (typeof marks !== 'number' || Number.isNaN(marks)) {
    return sendError(res, 400, 'Marks must be a number.');
  }

  const studentExists = await Student.findById(student);
  if (!studentExists) return sendError(res, 404, 'Student not found.');

  const testDoc = await Test.findById(test);
  if (!testDoc) return sendError(res, 404, 'Test not found.');

  if (marks < 0 || marks > testDoc.maxMarks) {
    return sendError(res, 400, `Marks must be between 0 and ${testDoc.maxMarks}.`);
  }

  const existing = await Mark.findOne({ student, test });
  if (existing) {
    return sendError(res, 409, 'Marks for this student and test already exist.');
  }

  const mark = await Mark.create({ student, test, marks });
  const populatedMark = await mark.populate([
    { path: 'student', select: 'name rollNumber className section' },
    { path: 'test', select: 'testName month maxMarks testDate' },
  ]);

  return sendSuccess(res, 201, 'Marks recorded successfully', populatedMark);
});

// @route  PUT /api/marks/:id
const updateMark = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return sendError(res, 400, 'Invalid mark ID.');

  const { marks } = req.body;

  if (typeof marks !== 'number' || Number.isNaN(marks)) {
    return sendError(res, 400, 'Marks must be a number.');
  }

  const existingMark = await Mark.findById(id).populate('test', 'maxMarks');
  if (!existingMark) return sendError(res, 404, 'Mark not found.');

  if (marks < 0 || marks > existingMark.test.maxMarks) {
    return sendError(res, 400, `Marks must be between 0 and ${existingMark.test.maxMarks}.`);
  }

  existingMark.marks = marks;
  await existingMark.save();

  const populatedMark = await existingMark.populate([
    { path: 'student', select: 'name rollNumber className section' },
    { path: 'test', select: 'testName month maxMarks testDate' },
  ]);

  return sendSuccess(res, 200, 'Marks updated successfully', populatedMark);
});

// @route  DELETE /api/marks/:id
const deleteMark = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return sendError(res, 400, 'Invalid mark ID.');

  const mark = await Mark.findByIdAndDelete(id);
  if (!mark) return sendError(res, 404, 'Mark not found.');

  return sendSuccess(res, 200, 'Mark deleted successfully', null);
});

// @route  GET /api/marks/student/:studentId/performance
const getStudentPerformance = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  if (!isValidObjectId(studentId)) return sendError(res, 400, 'Invalid student ID.');

  const student = await Student.findById(studentId);
  if (!student) return sendError(res, 404, 'Student not found.');

  const marks = await Mark.find({ student: studentId }).populate({
    path: 'test',
    select: 'testName month maxMarks testDate subject',
    populate: { path: 'subject', select: 'name code' },
  });

  if (marks.length === 0) {
    return sendSuccess(res, 200, 'Performance calculated successfully', {
      testsTaken: 0,
      averagePercentage: 0,
      highestScore: 0,
      subjectWisePerformance: [],
    });
  }

  let totalPercentage = 0;
  let highestPercentage = 0;
  const subjectMap = {};

  marks.forEach((mark) => {
    const percentage = (mark.marks / mark.test.maxMarks) * 100;
    totalPercentage += percentage;
    if (percentage > highestPercentage) highestPercentage = percentage;

    const subjectId = mark.test.subject?._id?.toString();
    const subjectName = mark.test.subject?.name || 'Unknown';

    if (subjectId) {
      if (!subjectMap[subjectId]) {
        subjectMap[subjectId] = {
          subjectId,
          subjectName,
          totalPercentage: 0,
          testCount: 0,
        };
      }
      subjectMap[subjectId].totalPercentage += percentage;
      subjectMap[subjectId].testCount += 1;
    }
  });

  const subjectWisePerformance = Object.values(subjectMap).map((s) => ({
    subjectId: s.subjectId,
    subjectName: s.subjectName,
    averagePercentage: Number((s.totalPercentage / s.testCount).toFixed(2)),
    testsTaken: s.testCount,
  }));

  return sendSuccess(res, 200, 'Performance calculated successfully', {
    testsTaken: marks.length,
    averagePercentage: Number((totalPercentage / marks.length).toFixed(2)),
    highestScore: Number(highestPercentage.toFixed(2)),
    subjectWisePerformance,
  });
});

module.exports = {
  getMarks,
  getMarkById,
  createMark,
  updateMark,
  deleteMark,
  getStudentPerformance,
};
