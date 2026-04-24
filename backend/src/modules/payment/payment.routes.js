const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const authenticateToken = require('../../middleware/auth.middleware');

router.post('/create-intent', authenticateToken, paymentController.createPaymentIntent);
router.post('/release', authenticateToken, paymentController.releaseEscrow);

module.exports = router;
