const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../../core/database/connection');

const signup = async (req, res) => {
  try {
    const { name, email, phone_number, password, category } = req.body;

    if (!name || !email || !password || !category) {
      return res.status(400).json({ error: 'Name, email, password, and category are required' });
    }

    if (!['farmer', 'consumer'].includes(category)) {
      return res.status(400).json({ error: 'Category must be either farmer or consumer' });
    }

    // Check if user already exists
    const userExistsResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExistsResult.rows.length > 0) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const insertResult = await pool.query(
      'INSERT INTO users (name, email, phone_number, password, category) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone_number, category, created_at',
      [name, email, phone_number, hashedPassword, category]
    );

    const newUser = insertResult.rows[0];

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, category: newUser.category },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      token
    });
  } catch (err) {
    console.error('Error in signup:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, category: user.category },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '7d' }
    );

    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  signup,
  login
};
