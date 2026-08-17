const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/student.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// All routes require authentication
router.use(protect);

// Students can view; only teachers can view the full list/detail too (kept simple:
// both roles may GET, only teachers may write)
router.get('/', getStudents);
router.get('/:id', getStudentById);

router.post('/', authorize('teacher'), createStudent);
router.put('/:id', authorize('teacher'), updateStudent);
router.delete('/:id', authorize('teacher'), deleteStudent);

module.exports = router;
