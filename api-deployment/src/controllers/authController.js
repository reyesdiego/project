const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const result = await pool.query(`
      SELECT * FROM users WHERE username = $1 AND is_active = true
    `, [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For now, use simple password check (in production, use bcrypt)
    if (password !== 'admin123') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, email, first_name, last_name, phone, role, is_active 
      FROM users 
      WHERE id = $1 AND is_active = true
    `, [req.user.id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUserPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.id;

    const result = await pool.query(`
      UPDATE users 
      SET phone = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, username, email, first_name, last_name, phone, role, is_active
    `, [phone, userId]);
    const updatedUser = result.rows[0];

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update user phone error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  login,
  getCurrentUser,
  updateUserPhone
};
