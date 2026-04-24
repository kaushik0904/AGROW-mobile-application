const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const authenticateToken = require('../../middleware/auth.middleware');

router.post('/', authenticateToken, orderController.createOrder);
router.get('/', authenticateToken, orderController.getUserOrders);
router.get('/farmer', authenticateToken, orderController.getFarmerOrders);
router.put('/:id/status', authenticateToken, orderController.updateOrderStatus);

module.exports = router;
