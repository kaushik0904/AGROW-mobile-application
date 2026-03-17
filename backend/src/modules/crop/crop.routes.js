const express = require('express');
const router = express.Router();
const cropController = require('./crop.controller');
const authenticateToken = require('../../middleware/auth.middleware');

// Public route to view all market crops
router.get('/', cropController.getAllCrops);

// Protected route to create a new crop listing
router.post('/', authenticateToken, cropController.createCrop);

// Protected route to update an existing active crop listing
router.put('/:id', authenticateToken, cropController.updateCrop);

// Protected route to remove (soft-delete) an active crop listing
router.delete('/:id', authenticateToken, cropController.removeCrop);

module.exports = router;
