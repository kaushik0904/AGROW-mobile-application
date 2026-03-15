const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const authenticateToken = require('../../middleware/auth.middleware');

router.post('/:following_id/follow', authenticateToken, userController.followUser);
router.delete('/:following_id/follow', authenticateToken, userController.unfollowUser);

module.exports = router;
