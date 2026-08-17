const mongoose = require('mongoose');

const testSchema = new mongoose.Schema(
  {
    testName: {
      type: String,
      required: [true, 'Test name is required'],
      trim: true,
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
      trim: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks is required'],
      min: [1, 'Maximum marks must be at least 1'],
    },
    testDate: {
      type: Date,
      required: [true, 'Test date is required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Test', testSchema);
