const express = require('express');
const router = express.Router();
const { getTopics, getQuestions } = require('../controllers/topicController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, getTopics);
router.get('/:id/questions', authMiddleware, getQuestions);

module.exports = router;
