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

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user details
    const userResult = await pool.query(
      `SELECT id, name, email, phone_number, category, farm_name, farm_size, location, profile_image, created_at 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get followers count
    const followersResult = await pool.query(
      `SELECT COUNT(*) FROM follows WHERE following_id = $1`,
      [userId]
    );
    const followersCount = parseInt(followersResult.rows[0].count, 10);

    // Get following count
    const followingResult = await pool.query(
      `SELECT COUNT(*) FROM follows WHERE follower_id = $1`,
      [userId]
    );
    const followingCount = parseInt(followingResult.rows[0].count, 10);

    res.status(200).json({
      user: {
        ...user,
        followersCount,
        followingCount
      }
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Internal server error while fetching profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, farm_name, farm_size, location, profile_image } = req.body;

    const updateResult = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           farm_name = COALESCE($2, farm_name),
           farm_size = COALESCE($3, farm_size),
           location = COALESCE($4, location),
           profile_image = COALESCE($5, profile_image)
       WHERE id = $6
       RETURNING id, name, email, phone_number, category, farm_name, farm_size, location, profile_image`,
      [name, farm_name, farm_size, location, profile_image, userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updateResult.rows[0]
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Internal server error while updating profile' });
  }
};

const getPublicProfile = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { id } = req.params;

    // Fetch user details
    const userResult = await pool.query(
      `SELECT id, name, category, farm_name, farm_size, location, profile_image, created_at 
       FROM users WHERE id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get followers count
    const followersResult = await pool.query(
      `SELECT COUNT(*) FROM follows WHERE following_id = $1`,
      [id]
    );
    const followersCount = parseInt(followersResult.rows[0].count, 10);

    // Get following count
    const followingResult = await pool.query(
      `SELECT COUNT(*) FROM follows WHERE follower_id = $1`,
      [id]
    );
    const followingCount = parseInt(followingResult.rows[0].count, 10);

    // Check if current user is following this profile
    const isFollowingResult = await pool.query(
      `SELECT EXISTS(SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2)`,
      [currentUserId, id]
    );
    const isFollowing = isFollowingResult.rows[0].exists;

    res.status(200).json({
      user: {
        ...user,
        followersCount,
        followingCount,
        is_following: isFollowing
      }
    });
  } catch (err) {
    console.error('Error fetching public profile:', err);
    res.status(500).json({ error: 'Internal server error while fetching public profile' });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getProfile,
  updateProfile,
  getPublicProfile
};
