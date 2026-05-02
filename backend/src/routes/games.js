const express = require('express');
const router = express.Router();
const { createGame, submitAnswers, getGameResult, getUserGames } = require('../controllers/gameController');
const authMiddleware = require('../middleware/auth');

router.post('/create', authMiddleware, createGame);
router.post('/submit', authMiddleware, submitAnswers);
router.get('/result/:gameId', authMiddleware, getGameResult);
router.get('/history', authMiddleware, getUserGames);

module.exports = router;