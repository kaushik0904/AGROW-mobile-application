const express = require('express');
const router = express.Router();
const hubController = require('./hub.controller');
const authenticateToken = require('../../middleware/auth.middleware');

router.post('/create', authenticateToken, hubController.createHub);
router.get('/near-me', authenticateToken, hubController.getNearMe);
router.get('/:id', authenticateToken, hubController.getHubDetails);
router.post('/:id/commit', authenticateToken, hubController.commitToHub);
router.delete('/:id/commit', authenticateToken, hubController.cancelPledge);
router.post('/pay', authenticateToken, hubController.payForHub);

module.exports = router;
