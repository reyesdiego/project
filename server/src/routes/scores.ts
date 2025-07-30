import express from 'express';
import pool from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get scores with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { agent_id, month, year, page = 1, limit = 10 } = req.query;
    
    let query = `
      SELECT s.*, 
        a.first_name || ' ' || a.last_name as agent_name,
        st.name as score_type_name,
        st.score_value,
        u.first_name || ' ' || u.last_name as assigned_by_name
      FROM scores s
      JOIN agents a ON s.agent_id = a.id
      JOIN score_types st ON s.score_type_id = st.id
      JOIN users u ON s.assigned_by = u.id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    let paramCount = 0;

    if (agent_id) {
      paramCount++;
      query += ` AND s.agent_id = $${paramCount}`;
      queryParams.push(agent_id);
    }

    if (month && year) {
      paramCount++;
      query += ` AND EXTRACT(MONTH FROM s.score_date) = $${paramCount}`;
      queryParams.push(month);
      paramCount++;
      query += ` AND EXTRACT(YEAR FROM s.score_date) = $${paramCount}`;
      queryParams.push(year);
    } else if (year) {
      paramCount++;
      query += ` AND EXTRACT(YEAR FROM s.score_date) = $${paramCount}`;
      queryParams.push(year);
    }

    query += ' ORDER BY s.score_date DESC, s.created_at DESC';

    // Add pagination
    const offset = (Number(page) - 1) * Number(limit);
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(Number(limit));
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);

    const result = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*)
      FROM scores s
      WHERE 1=1
    `;
    const countParams: any[] = [];
    let countParamCount = 0;

    if (agent_id) {
      countParamCount++;
      countQuery += ` AND s.agent_id = $${countParamCount}`;
      countParams.push(agent_id);
    }

    if (month && year) {
      countParamCount++;
      countQuery += ` AND EXTRACT(MONTH FROM s.score_date) = $${countParamCount}`;
      countParams.push(month);
      countParamCount++;
      countQuery += ` AND EXTRACT(YEAR FROM s.score_date) = $${countParamCount}`;
      countParams.push(year);
    } else if (year) {
      countParamCount++;
      countQuery += ` AND EXTRACT(YEAR FROM s.score_date) = $${countParamCount}`;
      countParams.push(year);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      scores: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get scores error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create score
router.post('/', authenticateToken, requireRole(['admin', 'evaluador']), async (req: any, res) => {
  try {
    const { agent_id, score_type_id, score_date, comment } = req.body;

    if (!agent_id || !score_type_id || !score_date) {
      return res.status(400).json({ message: 'agent_id, score_type_id, and score_date are required' });
    }

    const result = await pool.query(
      'INSERT INTO scores (agent_id, score_type_id, assigned_by, score_date, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [agent_id, score_type_id, req.user.id, score_date, comment]
    );

    res.status(201).json({
      message: 'Score assigned successfully',
      score: result.rows[0]
    });
  } catch (error) {
    console.error('Create score error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update score
router.put('/:id', authenticateToken, requireRole(['admin', 'evaluador']), async (req, res) => {
  try {
    const { id } = req.params;
    const { agent_id, score_type_id, score_date, comment } = req.body;

    const result = await pool.query(
      'UPDATE scores SET agent_id = $1, score_type_id = $2, score_date = $3, comment = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [agent_id, score_type_id, score_date, comment, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Score not found' });
    }

    res.json({
      message: 'Score updated successfully',
      score: result.rows[0]
    });
  } catch (error) {
    console.error('Update score error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete score
router.delete('/:id', authenticateToken, requireRole(['admin', 'evaluador']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM scores WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Score not found' });
    }

    res.json({ message: 'Score deleted successfully' });
  } catch (error) {
    console.error('Delete score error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;