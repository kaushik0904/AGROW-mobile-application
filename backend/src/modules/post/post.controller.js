const { pool } = require('../../core/database/connection');

// Helper to check user authentication dynamically (for public vs auth routes)
const extractUserId = (req) => {
  return req.user ? req.user.id : null;
};

const createPost = async (req, res) => {
  try {
    const { content, category, image_url } = req.body;
    const farmer_id = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Post content is required' });
    }

    const insertResult = await pool.query(
      `INSERT INTO posts 
       (farmer_id, content, category, image_url) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [farmer_id, content, category, image_url]
    );

    res.status(201).json({
      message: 'Post created successfully',
      post: insertResult.rows[0]
    });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Internal server error while creating post' });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const { tab, user_id } = req.query; // 'foryou', 'following', 'yourposts', user_id
    const currentUser = extractUserId(req);
    
    let query = `
      SELECT 
        p.*, 
        u.name as author_name,
        EXISTS(
          SELECT 1 FROM follows f 
          WHERE f.follower_id = $1 AND f.following_id = p.farmer_id
        ) as is_following,
        (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id) as comments_count,
        EXISTS(
          SELECT 1 FROM post_likes pl2 
          WHERE pl2.post_id = p.id AND pl2.user_id = $1
        ) as is_liked
      FROM posts p
      JOIN users u ON p.farmer_id = u.id
    `;
    
    let queryParams = [currentUser];

    if (user_id) {
      query += ` WHERE p.farmer_id = $2 `;
      queryParams.push(user_id);
    } else if (tab === 'following' && currentUser) {
      query += `
        JOIN follows f2 ON p.farmer_id = f2.following_id
        WHERE f2.follower_id = $1
      `;
    } else if (tab === 'yourposts' && currentUser) {
      query += ` WHERE p.farmer_id = $1 `;
    }

    query += ` ORDER BY p.created_at DESC`;

    const result = await pool.query(query, queryParams);
    
    res.status(200).json({
      posts: result.rows
    });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Internal server error while fetching posts' });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const farmer_id = req.user.id;
    const { content, image_url } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Post content is required' });
    }

    const updateResult = await pool.query(
      `UPDATE posts 
       SET content = $1, image_url = $2
       WHERE id = $3 AND farmer_id = $4
       RETURNING *`,
      [content, image_url, id, farmer_id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or you do not have permission to edit it' });
    }

    res.status(200).json({
      message: 'Post updated successfully',
      post: updateResult.rows[0]
    });
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ error: 'Internal server error while updating post' });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const farmer_id = req.user.id;

    const deleteResult = await pool.query(
      `DELETE FROM posts 
       WHERE id = $1 AND farmer_id = $2
       RETURNING id`,
      [id, farmer_id]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or you do not have permission to delete it' });
    }

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: 'Internal server error while deleting post' });
  }
};

const toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const checkLike = await pool.query(
      `SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (checkLike.rows.length > 0) {
      // Unlike
      await pool.query(`DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2`, [id, userId]);
      res.json({ message: 'Post unliked', is_liked: false });
    } else {
      // Like
      await pool.query(`INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)`, [id, userId]);
      res.json({ message: 'Post liked', is_liked: true });
    }
  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(500).json({ error: 'Internal server error while toggling like' });
  }
};

const getPostComments = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT c.*, u.name as author_name, u.profile_image 
       FROM post_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at DESC`,
      [id]
    );
    res.json({ comments: result.rows });
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Internal server error while fetching comments' });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const result = await pool.query(
      `INSERT INTO post_comments (post_id, user_id, content) 
       VALUES ($1, $2, $3) RETURNING *`,
      [id, userId, content.trim()]
    );
    res.status(201).json({ message: 'Comment added', comment: result.rows[0] });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Internal server error while adding comment' });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
  toggleLikePost,
  getPostComments,
  addComment
};
