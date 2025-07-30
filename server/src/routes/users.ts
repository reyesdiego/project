import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, first_name, last_name, role, phone, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create user (admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role, phone } = req.body;

    if (!username || !email || !password || !first_name || !last_name || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['admin', 'evaluador', 'visualizador'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, email, password, first_name, last_name, role, phone) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, first_name, last_name, role, is_active, created_at, phone',
      [username, email, hashedPassword, first_name, last_name, role, phone]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    if (error.code === '23505') {
      res.status(400).json({ message: 'Username or email already exists' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Update user (admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, first_name, last_name, role, is_active, password, phone } = req.body;

    let query = 'UPDATE users SET username = $1, email = $2, first_name = $3, last_name = $4, role = $5, is_active = $6, phone = $7, updated_at = CURRENT_TIMESTAMP';
    let values = [username, email, first_name, last_name, role, is_active, phone];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = $8';
      values.push(hashedPassword);
    }

    query += ' WHERE id = $' + (values.length + 1) + ' RETURNING id, username, email, first_name, last_name, role, is_active, created_at, phone';
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    if (error.code === '23505') {
      res.status(400).json({ message: 'Username or email already exists' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;