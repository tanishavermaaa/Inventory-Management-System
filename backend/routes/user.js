const express = require('express');
const router  = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { getUsers, makeAdmin, removeAdmin, deleteUser, getProfile, changePassword, updateProfile } = require('../controllers/userController');

router.get('/profile',         authMiddleware, getProfile);
router.put('/profile',         authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);

router.get('/',                authMiddleware, adminMiddleware, getUsers);
router.put('/:id/make-admin',  authMiddleware, adminMiddleware, makeAdmin);
router.put('/:id/remove-admin',authMiddleware, adminMiddleware, removeAdmin);
router.delete('/:id',          authMiddleware, adminMiddleware, deleteUser);

module.exports = router;