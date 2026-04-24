const { pool } = require('../../core/database/connection');

const createHub = async (req, res) => {
  const client = await pool.connect();
  try {
    const host_id = req.user.id;
    const { crop_id, latitude, longitude, address, deadline, pledge_kg } = req.body;

    await client.query('BEGIN');

    const cropRes = await client.query('SELECT is_hub_enabled, hub_target_kg, hub_discount_percentage FROM listed_crops WHERE id = $1', [crop_id]);
    
    if (cropRes.rows.length === 0 || !cropRes.rows[0].is_hub_enabled) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'This crop is not enabled for group buying.' });
    }

    let { hub_target_kg, hub_discount_percentage } = cropRes.rows[0];

    // Fallback in case of corrupted crop data or missing migration updates
    hub_target_kg = hub_target_kg ? Number(hub_target_kg) : 50;
    hub_discount_percentage = hub_discount_percentage ? Number(hub_discount_percentage) : 10;

    const result = await client.query(
      `INSERT INTO hubs (crop_id, host_id, latitude, longitude, address, target_kg, discount_percentage, deadline, status, current_kg)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'OPEN', $9) RETURNING *`,
      [crop_id, host_id, latitude, longitude, address, hub_target_kg, hub_discount_percentage, deadline, pledge_kg || 0]
    );

    const newHub = result.rows[0];

    if (pledge_kg && Number(pledge_kg) > 0) {
      await client.query(
        `INSERT INTO hub_members (hub_id, user_id, pledge_kg, is_waitlist, status) VALUES ($1, $2, $3, false, 'PLEDGED')`,
        [newHub.id, host_id, pledge_kg]
      );
      
      if (Number(newHub.current_kg) >= Number(newHub.target_kg)) {
         await client.query(`UPDATE hubs SET status = 'PAYMENT_REQUIRED', deadline = NOW() + interval '2 hours' WHERE id = $1`, [newHub.id]);
         newHub.status = 'PAYMENT_REQUIRED';
      }
    }

    await client.query('COMMIT');

    if (req.io) {
       req.io.emit('hub_updated', { hub_id: newHub.id, current_kg: newHub.current_kg, status: newHub.status });
    }

    res.status(201).json({ message: 'Hub created', hub: newHub });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating hub:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

const getNearMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT h.*, c.crop_type, c.variety, c.price_per_kg, c.image_url, u.name as host_name
       FROM hubs h
       JOIN listed_crops c ON h.crop_id = c.id
       JOIN users u ON h.host_id = u.id
       WHERE h.status IN ('OPEN', 'PAYMENT_REQUIRED')
       ORDER BY h.created_at DESC`
    );
    res.status(200).json({ hubs: result.rows });
  } catch (error) {
    console.error('Error fetching hubs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getHubDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const hubResult = await pool.query(
      `SELECT h.*, c.crop_type, c.variety, c.price_per_kg, c.image_url, u.name as host_name
       FROM hubs h
       JOIN listed_crops c ON h.crop_id = c.id
       JOIN users u ON h.host_id = u.id
       WHERE h.id = $1`, [id]
    );
    if (hubResult.rows.length === 0) return res.status(404).json({ error: 'Hub not found' });
    
    const membersResult = await pool.query(
      `SELECT hm.*, u.name as user_name FROM hub_members hm
       JOIN users u ON hm.user_id = u.id
       WHERE hm.hub_id = $1`, [id]
    );

    const hub = hubResult.rows[0];
    hub.members = membersResult.rows;
    res.status(200).json({ hub });
  } catch (error) {
    console.error('Error getting hub details:', error);
    res.status(500).json({ error: 'Internal error' });
  }
};

const commitToHub = async (req, res) => {
  const client = await pool.connect();
  try {
    const user_id = req.user.id;
    const { id: hub_id } = req.params;
    const { pledge_kg } = req.body;

    await client.query('BEGIN');

    const userRes = await client.query(`SELECT karma_score, banned_from_hubs_until FROM users WHERE id = $1`, [user_id]);
    const user = userRes.rows[0];
    if (user.banned_from_hubs_until && new Date(user.banned_from_hubs_until) > new Date()) {
       await client.query('ROLLBACK');
       return res.status(403).json({ error: 'You are temporarily banned from joining Hubs.' });
    }

    const hubRes = await client.query('SELECT * FROM hubs WHERE id = $1 FOR UPDATE', [hub_id]);
    if (hubRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Hub not found' });
    }

    const hub = hubRes.rows[0];
    if (hub.status !== 'OPEN') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Hub is no longer accepting pledges' });
    }

    const existingPledgeRes = await client.query('SELECT pledge_kg, is_waitlist FROM hub_members WHERE hub_id = $1 AND user_id = $2', [hub_id, user_id]);
    
    let oldPledge = 0;
    let wasWaitlisted = false;

    if (existingPledgeRes.rows.length > 0) {
        oldPledge = Number(existingPledgeRes.rows[0].pledge_kg);
        wasWaitlisted = existingPledgeRes.rows[0].is_waitlist;
    }

    let virtual_current_kg = Number(hub.current_kg);
    if (!wasWaitlisted) {
        virtual_current_kg -= oldPledge;
    }

    const isWaitlist = (virtual_current_kg + Number(pledge_kg)) > hub.target_kg;
    
    await client.query(
      `INSERT INTO hub_members (hub_id, user_id, pledge_kg, is_waitlist, status) VALUES ($1, $2, $3, $4, 'PLEDGED')
       ON CONFLICT (hub_id, user_id) DO UPDATE SET pledge_kg = EXCLUDED.pledge_kg, is_waitlist = EXCLUDED.is_waitlist`,
      [hub_id, user_id, pledge_kg, isWaitlist]
    );

    let statusChanged = false;

    if (!isWaitlist) {
      virtual_current_kg += Number(pledge_kg);
    }

    await client.query('UPDATE hubs SET current_kg = $1 WHERE id = $2', [virtual_current_kg, hub_id]);
    hub.current_kg = virtual_current_kg;

    if (hub.current_kg >= hub.target_kg) {
      if (hub.status !== 'PAYMENT_REQUIRED') {
        await client.query(`UPDATE hubs SET status = 'PAYMENT_REQUIRED', deadline = NOW() + interval '2 hours' WHERE id = $1`, [hub_id]);
        statusChanged = true;
        hub.status = 'PAYMENT_REQUIRED';
      }
    } else {
      if (hub.status === 'PAYMENT_REQUIRED') {
        await client.query(`UPDATE hubs SET status = 'OPEN' WHERE id = $1`, [hub_id]);
        statusChanged = true;
        hub.status = 'OPEN';
      }
    }

    await client.query('COMMIT');
    
    // Broadcast real-time update
    if (req.io) {
       req.io.emit('hub_updated', { hub_id, current_kg: hub.current_kg, status: hub.status });
    }
    
    res.status(200).json({ message: 'Pledge successful', isWaitlist });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Commit error:', error);
    res.status(500).json({ error: 'Internal error' });
  } finally {
    client.release();
  }
};

const payForHub = async (req, res) => {
  const client = await pool.connect();
  try {
    const user_id = req.user.id;
    const { hub_id } = req.body;

    await client.query('BEGIN');
    const memberRes = await client.query(`UPDATE hub_members SET status = 'PAID' WHERE hub_id = $1 AND user_id = $2 RETURNING *`, [hub_id, user_id]);
    
    if (memberRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Pledge not found' });
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Payment successful.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Pay error:', error);
    res.status(500).json({ error: 'Internal error' });
  } finally {
    client.release();
  }
};

const cancelPledge = async (req, res) => {
  const client = await pool.connect();
  try {
    const user_id = req.user.id;
    const { id: hub_id } = req.params;

    await client.query('BEGIN');
    
    const userRes = await client.query(`SELECT karma_score, banned_from_hubs_until FROM users WHERE id = $1`, [user_id]);
    const user = userRes.rows[0];
    if (user.banned_from_hubs_until && new Date(user.banned_from_hubs_until) > new Date()) {
       await client.query('ROLLBACK');
       return res.status(403).json({ error: 'You are temporarily banned from joining Hubs.' });
    }

    const hubRes = await client.query('SELECT * FROM hubs WHERE id = $1 FOR UPDATE', [hub_id]);
    if (hubRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Hub not found' });
    }
    const hub = hubRes.rows[0];

    const pledgeRes = await client.query('SELECT pledge_kg, is_waitlist FROM hub_members WHERE hub_id = $1 AND user_id = $2 FOR UPDATE', [hub_id, user_id]);
    if (pledgeRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'No pledge found to cancel.' });
    }

    const { pledge_kg, is_waitlist } = pledgeRes.rows[0];

    await client.query('DELETE FROM hub_members WHERE hub_id = $1 AND user_id = $2', [hub_id, user_id]);

    let new_current_kg = Number(hub.current_kg);

    if (!is_waitlist) {
       new_current_kg -= Number(pledge_kg);
       await client.query('UPDATE hubs SET current_kg = $1 WHERE id = $2', [new_current_kg, hub_id]);
       
       if (new_current_kg < hub.target_kg && hub.status === 'PAYMENT_REQUIRED') {
           await client.query(`UPDATE hubs SET status = 'OPEN' WHERE id = $1`, [hub_id]);
           hub.status = 'OPEN';
       }
    }

    await client.query('COMMIT');

    if (req.io) {
       req.io.emit('hub_updated', { hub_id, current_kg: new_current_kg, status: hub.status });
    }

    res.status(200).json({ message: 'Pledge cancelled.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Cancel error:', error);
    res.status(500).json({ error: 'Internal error' });
  } finally {
    client.release();
  }
};

module.exports = { createHub, getNearMe, getHubDetails, commitToHub, payForHub, cancelPledge };
