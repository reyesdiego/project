import express from 'express';
import pool from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all agents
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM agents ORDER BY first_name, last_name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get agent by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM agents WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create agent
router.post('/', authenticateToken, requireRole(['admin', 'evaluador']), async (req, res) => {
  try {
    const { first_name, last_name, area, position, hire_date, email, phone } = req.body;

    if (!first_name || !last_name || !area || !position || !hire_date) {
      return res.status(400).json({ message: 'Required fields: first_name, last_name, area, position, hire_date' });
    }

    const result = await pool.query(
      'INSERT INTO agents (first_name, last_name, area, position, hire_date, email, phone) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [first_name, last_name, area, position, hire_date, email, phone]
    );

    res.status(201).json({
      message: 'Agent created successfully',
      agent: result.rows[0]
    });
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update agent
router.put('/:id', authenticateToken, requireRole(['admin', 'evaluador']), async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, area, position, hire_date, email, phone, is_active } = req.body;

    const result = await pool.query(
      'UPDATE agents SET first_name = $1, last_name = $2, area = $3, position = $4, hire_date = $5, email = $6, phone = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING *',
      [first_name, last_name, area, position, hire_date, email, phone, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json({
      message: 'Agent updated successfully',
      agent: result.rows[0]
    });
  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete agent
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM agents WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;