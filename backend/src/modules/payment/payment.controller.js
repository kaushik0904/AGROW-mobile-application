const { pool } = require('../../core/database/connection');

// Mock Payment Intent creation
const createPaymentIntent = async (req, res) => {
  const client = await pool.connect();
  try {
    const { amount, type, reference_id } = req.body;
    const user_id = req.user.id;

    if (!amount || !type || !reference_id) {
      return res.status(400).json({ error: 'Missing required payment details' });
    }

    // Simulate calling Stripe API
    const mockPaymentIntentId = 'pi_mock_' + Math.random().toString(36).substr(2, 9);
    
    await client.query('BEGIN');

    if (type === 'ORDER') {
      await client.query(
        `UPDATE orders SET payment_status = 'held_in_escrow', payment_id = $1 WHERE id = $2 AND consumer_id = $3`,
        [mockPaymentIntentId, reference_id, user_id]
      );
    } else if (type === 'HUB') {
      await client.query(
        `UPDATE hub_members SET status = 'PAID', payment_id = $1 WHERE hub_id = $2 AND user_id = $3`,
        [mockPaymentIntentId, reference_id, user_id]
      );
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Payment successful', payment_id: mockPaymentIntentId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// Mock Escrow Release
const releaseEscrow = async (req, res) => {
  const client = await pool.connect();
  try {
    const { order_id } = req.body;
    const user_id = req.user.id; // The consumer confirming receipt

    await client.query('BEGIN');
    
    // Ensure the order belongs to this consumer
    const orderRes = await client.query(`SELECT id, status, payment_status FROM orders WHERE id = $1 AND consumer_id = $2`, [order_id, user_id]);
    if (orderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found or unauthorized' });
    }

    const order = orderRes.rows[0];
    if (order.status !== 'delivered') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cannot release escrow before delivery' });
    }

    if (order.payment_status === 'released') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Funds already released' });
    }

    // Release funds (mock transfer to farmer)
    await client.query(`UPDATE orders SET payment_status = 'released' WHERE id = $1`, [order_id]);

    await client.query('COMMIT');
    res.status(200).json({ message: 'Escrow released successfully to the farmer' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error releasing escrow:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

module.exports = {
  createPaymentIntent,
  releaseEscrow
};
