const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const authenticateToken = require('../../middleware/auth.middleware');

router.post('/chat', authenticateToken, aiController.chat);

module.exports = router;
