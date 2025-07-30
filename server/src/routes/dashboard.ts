import express from 'express';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [agentsCount, scoresCount, scoreTypesCount, usersCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM agents WHERE is_active = true'),
      pool.query('SELECT COUNT(*) FROM scores'),
      pool.query('SELECT COUNT(*) FROM score_types WHERE is_active = true'),
      pool.query('SELECT COUNT(*) FROM users WHERE is_active = true')
    ]);

    res.json({
      agents: parseInt(agentsCount.rows[0].count),
      scores: parseInt(scoresCount.rows[0].count),
      scoreTypes: parseInt(scoreTypesCount.rows[0].count),
      users: parseInt(usersCount.rows[0].count)
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get monthly scores by agent
router.get('/monthly-scores', authenticateToken, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const result = await pool.query(`
      SELECT
        a.first_name || ' ' || a.last_name as agent_name,
        EXTRACT(MONTH FROM s.score_date) as month,
        COALESCE(SUM(st.score_value), 0) as total_score
      FROM scores s
        JOIN agents a ON s.agent_id = a.id
        JOIN score_types st ON s.score_type_id = st.id
      WHERE EXTRACT(YEAR FROM s.score_date) = $1
      GROUP BY a.id, a.first_name, a.last_name, EXTRACT(MONTH FROM s.score_date)
      HAVING SUM(st.score_value) IS NOT NULL
      ORDER BY month, agent_name
    `, [year]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get monthly scores error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get score types distribution
router.get('/score-types-distribution', authenticateToken, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const result = await pool.query(`
      SELECT
        st.name,
        COUNT(*)::int as count,
        SUM(st.score_value)::float as total_value
      FROM scores s
        JOIN score_types st ON s.score_type_id = st.id
      WHERE EXTRACT(YEAR FROM s.score_date) = $1
      GROUP BY st.id, st.name
      ORDER BY count DESC
    `, [year]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get score types distribution error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get agent performance comparison
router.get('/agent-comparison', authenticateToken, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const result = await pool.query(`
      SELECT
        a.first_name || ' ' || a.last_name as agent_name,
        COUNT(s.id) as total_scores,
        SUM(st.score_value) as total_points,
        AVG(st.score_value) as avg_score,
        MAX(s.score_date) as last_score_date
      FROM agents a
             LEFT JOIN scores s ON a.id = s.agent_id AND EXTRACT(YEAR FROM s.score_date) = $1
             LEFT JOIN score_types st ON s.score_type_id = st.id
      WHERE a.is_active = true
      GROUP BY a.id, a.first_name, a.last_name
      ORDER BY total_points DESC NULLS LAST
    `, [year]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get agent comparison error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get score evolution for specific agent
router.get('/agent-evolution/:agentId', authenticateToken, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { year = new Date().getFullYear() } = req.query;

    const result = await pool.query(`
      SELECT
        EXTRACT(MONTH FROM s.score_date) as month,
        SUM(st.score_value) as total_score,
        COUNT(s.id) as score_count
      FROM scores s
        JOIN score_types st ON s.score_type_id = st.id
      WHERE s.agent_id = $1 AND EXTRACT(YEAR FROM s.score_date) = $2
      GROUP BY EXTRACT(MONTH FROM s.score_date)
      ORDER BY month
    `, [agentId, year]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get agent evolution error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;