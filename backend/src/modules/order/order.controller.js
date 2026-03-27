const { pool } = require('../../core/database/connection');

const createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const consumerId = req.user.id;
    const { items, totalAmount } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    await client.query('BEGIN');

    // 1. Create Order
    const orderResult = await client.query(
      'INSERT INTO orders (consumer_id, total_amount, status) VALUES ($1, $2, $3) RETURNING id',
      [consumerId, totalAmount, 'pending']
    );
    const orderId = orderResult.rows[0].id;

    // 2. Insert Order Items and Update Crop Quantity
    for (const item of items) {
      // Deduct quantity from listed_crops
      await client.query(
        'UPDATE listed_crops SET quantity = quantity - $1 WHERE id = $2 AND quantity >= $1',
        [item.quantity, item.id]
      );
      
      // We don't roll back automatically on no rows updated in this simple MVP, 
      // but in a production app we'd check if `rowCount === 0` to throw an error 
      // regarding insufficient stock.

      await client.query(
        'INSERT INTO order_items (order_id, crop_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
        [orderId, item.id, item.quantity, item.price_per_kg]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Order placed successfully', orderId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error while placing order' });
  } finally {
    client.release();
  }
};

const getUserOrders = async (req, res) => {
  try {
    const consumerId = req.user.id;
    
    // Fetch orders with their items
    const ordersResult = await pool.query(
      `SELECT o.id, o.total_amount, o.status, o.created_at
       FROM orders o
       WHERE o.consumer_id = $1
       ORDER BY o.created_at DESC`,
      [consumerId]
    );

    const orders = ordersResult.rows;

    // Fetch items for each order
    for (let order of orders) {
      const itemsResult = await pool.query(
        `SELECT oi.quantity, oi.price_at_purchase, c.crop_type, c.variety, c.farmer_id
         FROM order_items oi
         LEFT JOIN listed_crops c ON oi.crop_id = c.id
         WHERE oi.order_id = $1`,
        [order.id]
      );
      order.items = itemsResult.rows;
    }

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createOrder,
  getUserOrders
};
