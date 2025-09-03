const pool = require('../config/database');

const getAgents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM agents ORDER BY first_name ASC
    `);
    const agents = result.rows;

    res.json({ agents });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT * FROM agents WHERE id = $1
    `, [id]);
    const agent = result.rows[0];

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({ agent });
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createAgent = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, is_active } = req.body;

    const result = await pool.query(`
      INSERT INTO agents (first_name, last_name, email, phone, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [first_name, last_name, email || null, phone || null, is_active !== undefined ? is_active : true]);
    const newAgent = result.rows[0];

    res.status(201).json({ agent: newAgent });
  } catch (error) {
    console.error('Create agent error:', error);
    
    // Handle unique constraint violation for email
    if (error.code === '23505' && error.constraint === 'unique_agent_email') {
      return res.status(409).json({ error: 'El email ya está en uso por otro agente' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, is_active } = req.body;

    const result = await pool.query(`
      UPDATE agents 
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          email = $3,
          phone = $4,
          is_active = COALESCE($5, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [first_name, last_name, email || null, phone || null, is_active, id]);
    const updatedAgent = result.rows[0];

    if (!updatedAgent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({ agent: updatedAgent });
  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      DELETE FROM agents WHERE id = $1
      RETURNING id, first_name, last_name
    `, [id]);
    const deletedAgent = result.rows[0];

    if (!deletedAgent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({ message: 'Agent deleted successfully', agent: deletedAgent });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent
};
