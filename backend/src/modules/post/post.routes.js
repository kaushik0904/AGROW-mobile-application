const express = require('express');
const router = express.Router();
const postController = require('./post.controller');
const authenticateToken = require('../../middleware/auth.middleware');

// Public route to view all posts (we pass authenticateToken optionally, but our frontend always sends it)
// We will use authenticateToken so we can resolve the current user ID for following status and privacy
router.get('/', authenticateToken, postController.getAllPosts);

// Protected route to create a new post
router.post('/', authenticateToken, postController.createPost);

// Protected routes to modify a post
router.put('/:id', authenticateToken, postController.updatePost);
router.delete('/:id', authenticateToken, postController.deletePost);

module.exports = router;
