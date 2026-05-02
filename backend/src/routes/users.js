const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, deleteUser, changeRole } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, getAllUsers);
router.get('/:id', authMiddleware, getUserById);
router.delete('/:id', authMiddleware, deleteUser);
router.put('/:id/role', authMiddleware, changeRole);

module.exports = router;
