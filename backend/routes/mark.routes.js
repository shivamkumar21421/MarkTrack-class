const express = require('express');
const router = express.Router();
const {
  getMarks,
  getMarkById,
  createMark,
  updateMark,
  deleteMark,
  getStudentPerformance,
} = require('../controllers/mark.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

// IMPORTANT: specific route must come before the generic /:id route
router.get('/student/:studentId/performance', getStudentPerformance);

router.get('/', getMarks);
router.get('/:id', getMarkById);

router.post('/', authorize('teacher'), createMark);
router.put('/:id', authorize('teacher'), updateMark);
router.delete('/:id', authorize('teacher'), deleteMark);

module.exports = router;
