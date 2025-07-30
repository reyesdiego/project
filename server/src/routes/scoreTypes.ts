import express from 'express';
import pool from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all score types
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM score_types WHERE is_active = true ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get score types error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create score type
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, description, score_value } = req.body;

    if (!name || score_value === undefined) {
      return res.status(400).json({ message: 'Name and score_value are required' });
    }

    const result = await pool.query(
      'INSERT INTO score_types (name, description, score_value) VALUES ($1, $2, $3) RETURNING *',
      [name, description, score_value]
    );

    res.status(201).json({
      message: 'Score type created successfully',
      scoreType: result.rows[0]
    });
  } catch (error) {
    console.error('Create score type error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update score type
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, score_value, is_active } = req.body;

    const result = await pool.query(
      'UPDATE score_types SET name = $1, description = $2, score_value = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, description, score_value, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Score type not found' });
    }

    res.json({
      message: 'Score type updated successfully',
      scoreType: result.rows[0]
    });
  } catch (error) {
    console.error('Update score type error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete score type
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM score_types WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Score type not found' });
    }

    res.json({ message: 'Score type deleted successfully' });
  } catch (error) {
    console.error('Delete score type error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;