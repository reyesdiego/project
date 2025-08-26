const pool = require('../config/database');

const getScoreTypes = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM score_types ORDER BY name ASC
    `);
    const scoreTypes = result.rows;

    res.json({ scoreTypes });
  } catch (error) {
    console.error('Get score types error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createScoreType = async (req, res) => {
  try {
    const { name, description, score_value, is_active } = req.body;

    const result = await pool.query(`
      INSERT INTO score_types (name, description, score_value, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, description || null, score_value, is_active !== undefined ? is_active : true]);
    const newScoreType = result.rows[0];

    res.status(201).json({ scoreType: newScoreType });
  } catch (error) {
    console.error('Create score type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateScoreType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, score_value, is_active } = req.body;

    const result = await pool.query(`
      UPDATE score_types 
      SET name = COALESCE($1, name),
          description = $2,
          score_value = COALESCE($3, score_value),
          is_active = COALESCE($4, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [name, description || null, score_value, is_active, id]);
    const updatedScoreType = result.rows[0];

    if (!updatedScoreType) {
      return res.status(404).json({ error: 'Score type not found' });
    }

    res.json({ scoreType: updatedScoreType });
  } catch (error) {
    console.error('Update score type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteScoreType = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      DELETE FROM score_types WHERE id = $1
      RETURNING id, name
    `, [id]);
    const deletedScoreType = result.rows[0];

    if (!deletedScoreType) {
      return res.status(404).json({ error: 'Score type not found' });
    }

    res.json({ message: 'Score type deleted successfully', scoreType: deletedScoreType });
  } catch (error) {
    console.error('Delete score type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getScoreTypes,
  createScoreType,
  updateScoreType,
  deleteScoreType
};
