const { pool } = require('../../core/database/connection');

const createCrop = async (req, res) => {
  try {
    const { crop_type, variety, category, quantity, price_per_kg, harvest_date, image_url, is_hub_enabled, hub_target_kg, hub_discount_percentage } = req.body;
    
    // Assume req.user is populated by the auth middleware
    const farmer_id = req.user.id;

    if (!crop_type || !category || !quantity || !price_per_kg) {
      return res.status(400).json({ error: 'Crop type, category, quantity, and price are required' });
    }

    const insertResult = await pool.query(
      `INSERT INTO listed_crops 
       (farmer_id, crop_type, variety, category, quantity, price_per_kg, harvest_date, image_url, is_hub_enabled, hub_target_kg, hub_discount_percentage) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [farmer_id, crop_type, variety, category, quantity, price_per_kg, harvest_date, image_url, is_hub_enabled || false, hub_target_kg || 0, hub_discount_percentage || 0]
    );

    res.status(201).json({
      message: 'Crop listed successfully',
      crop: insertResult.rows[0]
    });
  } catch (err) {
    console.error('Error listing crop:', err);
    res.status(500).json({ error: 'Internal server error while listing crop' });
  }
};

const getAllCrops = async (req, res) => {
  try {
    // Join with users table to get farmer details
    const result = await pool.query(`
      SELECT 
        lc.*, 
        u.name as farmer_name, 
        u.phone_number as farmer_phone 
      FROM listed_crops lc
      JOIN users u ON lc.farmer_id = u.id
      WHERE lc.status = 'active'
      ORDER BY lc.created_at DESC
    `);
    
    res.status(200).json({
      crops: result.rows
    });
  } catch (err) {
    console.error('Error fetching crops:', err);
    res.status(500).json({ error: 'Internal server error while fetching crops' });
  }
};

const updateCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const farmer_id = req.user.id;
    const { crop_type, variety, category, quantity, price_per_kg, harvest_date, image_url, is_hub_enabled, hub_target_kg, hub_discount_percentage } = req.body;

    if (!crop_type || !category || !quantity || !price_per_kg) {
      return res.status(400).json({ error: 'Crop type, category, quantity, and price are required' });
    }

    const updateResult = await pool.query(
      `UPDATE listed_crops 
       SET crop_type = $1, variety = $2, category = $3, quantity = $4, price_per_kg = $5, harvest_date = $6, image_url = $7, is_hub_enabled = $8, hub_target_kg = $9, hub_discount_percentage = $10
       WHERE id = $11 AND farmer_id = $12 AND status = 'active'
       RETURNING *`,
      [crop_type, variety, category, quantity, price_per_kg, harvest_date, image_url, is_hub_enabled || false, hub_target_kg || 0, hub_discount_percentage || 0, id, farmer_id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Crop not found or you do not have permission to edit it' });
    }

    res.status(200).json({
      message: 'Crop updated successfully',
      crop: updateResult.rows[0]
    });
  } catch (err) {
    console.error('Error updating crop:', err);
    res.status(500).json({ error: 'Internal server error while updating crop' });
  }
};

const removeCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const farmer_id = req.user.id;

    // Soft delete by setting status to 'inactive'
    const removeResult = await pool.query(
      `UPDATE listed_crops 
       SET status = 'inactive' 
       WHERE id = $1 AND farmer_id = $2
       RETURNING id, status`,
      [id, farmer_id]
    );

    if (removeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Crop not found or already inactive' });
    }

    res.status(200).json({
      message: 'Crop removed successfully',
      crop: removeResult.rows[0]
    });
  } catch (err) {
    console.error('Error removing crop:', err);
    res.status(500).json({ error: 'Internal server error while removing crop' });
  }
};

module.exports = {
  createCrop,
  getAllCrops,
  updateCrop,
  removeCrop
};
