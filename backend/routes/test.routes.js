const express = require('express');
const router = express.Router();
const {
  getTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
} = require('../controllers/test.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.get('/', getTests);
router.get('/:id', getTestById);

router.post('/', authorize('teacher'), createTest);
router.put('/:id', authorize('teacher'), updateTest);
router.delete('/:id', authorize('teacher'), deleteTest);

module.exports = router;
