const mongoose = require('mongoose');

const markSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: [true, 'Test is required'],
    },
    marks: {
      type: Number,
      required: [true, 'Marks is required'],
      min: [0, 'Marks cannot be negative'],
    },
  },
  { timestamps: true }
);

// Prevent duplicate marks for the same student and test
markSchema.index({ student: 1, test: 1 }, { unique: true });

module.exports = mongoose.model('Mark', markSchema);
