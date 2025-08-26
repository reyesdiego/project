const pool = require('../config/database');

const getScores = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.*,
        a.first_name as agent_first_name,
        a.last_name as agent_last_name,
        st.name as score_type_name,
        st.score_value as score_type_value,
        u.first_name as assigned_by_first_name,
        u.last_name as assigned_by_last_name
      FROM scores s
      LEFT JOIN agents a ON s.agent_id = a.id
      LEFT JOIN score_types st ON s.score_type_id = st.id
      LEFT JOIN users u ON s.assigned_by = u.id
      ORDER BY s.score_date DESC
    `);
    const scores = result.rows;

    // Transform the data to match the expected format
    const transformedScores = scores.map(score => ({
      id: score.id,
      agent_id: score.agent_id,
      score_type_id: score.score_type_id,
      assigned_by: score.assigned_by,
      score_date: score.score_date,
      comment: score.comment,
      created_at: score.created_at,
      updated_at: score.updated_at,
      agent: {
        first_name: score.agent_first_name,
        last_name: score.agent_last_name
      },
      score_type: {
        name: score.score_type_name,
        score_value: score.score_type_value
      },
      assigned_by_user: {
        first_name: score.assigned_by_first_name,
        last_name: score.assigned_by_last_name
      }
    }));

    res.json({ scores: transformedScores });
  } catch (error) {
    console.error('Get scores error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createScore = async (req, res) => {
  try {
    const { agent_id, score_type_id, score_date, comment } = req.body;
    const assigned_by = req.user.id;

    const result = await pool.query(`
      INSERT INTO scores (agent_id, score_type_id, assigned_by, score_date, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [agent_id, score_type_id, assigned_by, score_date || new Date(), comment || null]);
    const newScore = result.rows[0];

    // Get the created score with related data
    const scoreWithRelationsResult = await pool.query(`
      SELECT 
        s.*,
        a.first_name as agent_first_name,
        a.last_name as agent_last_name,
        st.name as score_type_name,
        st.score_value as score_type_value,
        u.first_name as assigned_by_first_name,
        u.last_name as assigned_by_last_name
      FROM scores s
      LEFT JOIN agents a ON s.agent_id = a.id
      LEFT JOIN score_types st ON s.score_type_id = st.id
      LEFT JOIN users u ON s.assigned_by = u.id
      WHERE s.id = $1
    `, [newScore.id]);
    const scoreWithRelations = scoreWithRelationsResult.rows[0];

    const transformedScore = {
      id: scoreWithRelations.id,
      agent_id: scoreWithRelations.agent_id,
      score_type_id: scoreWithRelations.score_type_id,
      assigned_by: scoreWithRelations.assigned_by,
      score_date: scoreWithRelations.score_date,
      comment: scoreWithRelations.comment,
      created_at: scoreWithRelations.created_at,
      updated_at: scoreWithRelations.updated_at,
      agent: {
        first_name: scoreWithRelations.agent_first_name,
        last_name: scoreWithRelations.agent_last_name
      },
      score_type: {
        name: scoreWithRelations.score_type_name,
        score_value: scoreWithRelations.score_type_value
      },
      assigned_by_user: {
        first_name: scoreWithRelations.assigned_by_first_name,
        last_name: scoreWithRelations.assigned_by_last_name
      }
    };

    res.status(201).json({ score: transformedScore });
  } catch (error) {
    console.error('Create score error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { agent_id, score_type_id, score_date, comment } = req.body;

    const result = await pool.query(`
      UPDATE scores 
      SET agent_id = COALESCE($1, agent_id),
          score_type_id = COALESCE($2, score_type_id),
          score_date = COALESCE($3, score_date),
          comment = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [agent_id, score_type_id, score_date, comment || null, id]);
    const updatedScore = result.rows[0];

    if (!updatedScore) {
      return res.status(404).json({ error: 'Score not found' });
    }

    // Get the updated score with related data
    const scoreWithRelationsResult = await pool.query(`
      SELECT 
        s.*,
        a.first_name as agent_first_name,
        a.last_name as agent_last_name,
        st.name as score_type_name,
        st.score_value as score_type_value,
        u.first_name as assigned_by_first_name,
        u.last_name as assigned_by_last_name
      FROM scores s
      LEFT JOIN agents a ON s.agent_id = a.id
      LEFT JOIN score_types st ON s.score_type_id = st.id
      LEFT JOIN users u ON s.assigned_by = u.id
      WHERE s.id = $1
    `, [id]);
    const scoreWithRelations = scoreWithRelationsResult.rows[0];

    const transformedScore = {
      id: scoreWithRelations.id,
      agent_id: scoreWithRelations.agent_id,
      score_type_id: scoreWithRelations.score_type_id,
      assigned_by: scoreWithRelations.assigned_by,
      score_date: scoreWithRelations.score_date,
      comment: scoreWithRelations.comment,
      created_at: scoreWithRelations.created_at,
      updated_at: scoreWithRelations.updated_at,
      agent: {
        first_name: scoreWithRelations.agent_first_name,
        last_name: scoreWithRelations.agent_last_name
      },
      score_type: {
        name: scoreWithRelations.score_type_name,
        score_value: scoreWithRelations.score_type_value
      },
      assigned_by_user: {
        first_name: scoreWithRelations.assigned_by_first_name,
        last_name: scoreWithRelations.assigned_by_last_name
      }
    };

    res.json({ score: transformedScore });
  } catch (error) {
    console.error('Update score error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteScore = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      DELETE FROM scores WHERE id = $1
      RETURNING id
    `, [id]);
    const deletedScore = result.rows[0];

    if (!deletedScore) {
      return res.status(404).json({ error: 'Score not found' });
    }

    res.json({ message: 'Score deleted successfully' });
  } catch (error) {
    console.error('Delete score error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getScores,
  createScore,
  updateScore,
  deleteScore
};
