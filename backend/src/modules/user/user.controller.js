const { pool } = require('../../core/database/connection');

const followUser = async (req, res) => {
  try {
    const follower_id = req.user.id;
    const { following_id } = req.params;

    if (follower_id === parseInt(following_id, 10)) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    await pool.query(
      `INSERT INTO follows (follower_id, following_id) 
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [follower_id, following_id]
    );

    res.status(200).json({ message: 'Successfully followed user' });
  } catch (err) {
    console.error('Error following user:', err);
    res.status(500).json({ error: 'Internal server error while following user' });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const follower_id = req.user.id;
    const { following_id } = req.params;

    await pool.query(
      `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
      [follower_id, following_id]
    );

    res.status(200).json({ message: 'Successfully unfollowed user' });
  } catch (err) {
    console.error('Error unfollowing user:', err);
    res.status(500).json({ error: 'Internal server error while unfollowing user' });
  }
};

module.exports = {
  followUser,
  unfollowUser
};
