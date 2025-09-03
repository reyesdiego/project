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

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
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
        phone: user.phone,
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
    console.log('Getting current user for ID:', req.user.id);
    
    const result = await pool.query(`
      SELECT id, username, email, first_name, last_name, COALESCE(phone, '') as phone, role, is_active 
      FROM users 
      WHERE id = $1 AND is_active = true
    `, [req.user.id]);
    const user = result.rows[0];

    console.log('Database result:', result.rows);
    console.log('User object:', user);

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

const updateUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current user to verify current password
    const userResult = await pool.query(`
      SELECT password FROM users WHERE id = $1 AND is_active = true
    `, [userId]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password using bcrypt
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the password
    const result = await pool.query(`
      UPDATE users 
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, username, email, first_name, last_name, phone, role, is_active
    `, [hashedPassword, userId]);
    const updatedUser = result.rows[0];

    res.json({ 
      user: updatedUser,
      message: 'Password updated successfully' 
    });
  } catch (error) {
    console.error('Update user password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  login,
  getCurrentUser,
  updateUserPhone,
  updateUserPassword
};
