const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subject.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.get('/', getSubjects);
router.get('/:id', getSubjectById);

router.post('/', authorize('teacher'), createSubject);
router.put('/:id', authorize('teacher'), updateSubject);
router.delete('/:id', authorize('teacher'), deleteSubject);

module.exports = router;
