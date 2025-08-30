const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const getUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, email, first_name, last_name, phone, role, is_active, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `);
    const users = result.rows;
console.log(users)
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, email, first_name, last_name, phone, role, is_active, password } = req.body;

    // Check if username already exists
    const existingResult = await pool.query(`
      SELECT id FROM users WHERE username = $1
    `, [username]);
    const existingUser = existingResult.rows[0];

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password || 'default123', 10);

    const result = await pool.query(`
      INSERT INTO users (username, email, first_name, last_name, phone, role, is_active, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, username, email, first_name, last_name, phone, role, is_active, created_at
    `, [username, email, first_name, last_name, phone || null, role || 'evaluator', is_active !== undefined ? is_active : true, hashedPassword]);
    const newUser = result.rows[0];

    res.status(201).json({ user: newUser });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, first_name, last_name, phone, role, is_active } = req.body;

    // Check if username already exists for other users
    if (username) {
      const existingResult = await pool.query(`
        SELECT id FROM users WHERE username = $1 AND id != $2
      `, [username, id]);
      const existingUser = existingResult.rows[0];

      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }

    const result = await pool.query(`
      UPDATE users 
      SET username = COALESCE($1, username),
          email = COALESCE($2, email),
          first_name = COALESCE($3, first_name),
          last_name = COALESCE($4, last_name),
          phone = $5,
          role = COALESCE($6, role),
          is_active = COALESCE($7, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING id, username, email, first_name, last_name, phone, role, is_active, created_at, updated_at
    `, [username, email, first_name, last_name, phone || null, role, is_active, id]);
    const updatedUser = result.rows[0];

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      DELETE FROM users WHERE id = $1
      RETURNING id, username
    `, [id]);
    const deletedUser = result.rows[0];

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', user: deletedUser });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};
