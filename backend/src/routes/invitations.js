const express = require('express');
const router = express.Router();
const { sendInvite, respondInvite, getMyInvites } = require('../controllers/invitationController');
const authMiddleware = require('../middleware/auth');

router.post('/send', authMiddleware, sendInvite);
router.put('/respond/:id', authMiddleware, respondInvite);
router.get('/my', authMiddleware, getMyInvites);

module.exports = router;
