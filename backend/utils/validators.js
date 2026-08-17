const mongoose = require('mongoose');

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isNonEmptyString = (value) => {
  return typeof value === 'string' && value.trim().length > 0;
};

const isValidRole = (role) => {
  return ['teacher', 'student'].includes(role);
};

const isValidMarks = (marks, maxMarks) => {
  return (
    typeof marks === 'number' &&
    !Number.isNaN(marks) &&
    marks >= 0 &&
    marks <= maxMarks
  );
};

module.exports = {
  isValidObjectId,
  isValidEmail,
  isNonEmptyString,
  isValidRole,
  isValidMarks,
};
