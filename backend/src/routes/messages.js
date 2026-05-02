const express = require('express');
const router = express.Router();
const { getConversation, sendMessage, markRead } = require('../controllers/messageController');
const authMiddleware = require('../middleware/auth');

router.get('/:userId', authMiddleware, getConversation);
router.post('/send', authMiddleware, sendMessage);
router.put('/read/:userId', authMiddleware, markRead);

module.exports = router;