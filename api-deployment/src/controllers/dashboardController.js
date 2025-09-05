const pool = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    const [agentsResult, scoresResult, scoreTypesResult, usersResult] = await Promise.all([
      pool.query(`
        SELECT COUNT(*) as count FROM agents WHERE is_active = true
      `),
      pool.query(`
        SELECT COUNT(*) as count FROM scores
      `),
      pool.query(`
        SELECT COUNT(*) as count FROM score_types WHERE is_active = true
      `),
      pool.query(`
        SELECT COUNT(*) as count FROM users WHERE is_active = true
      `)
    ]);

    const recentScoresResult = await pool.query(`
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
      LIMIT 5
    `);
    const recentScores = recentScoresResult.rows;

    // Transform recent scores to match expected format
    const transformedRecentScores = recentScores.map(score => ({
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

    res.json({
      totalAgents: parseInt(agentsResult.rows[0].count),
      totalScores: parseInt(scoresResult.rows[0].count),
      totalScoreTypes: parseInt(scoreTypesResult.rows[0].count),
      totalUsers: parseInt(usersResult.rows[0].count),
      recentScores: transformedRecentScores
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMonthlyScores = async (req, res) => {
  try {
    const { year, month } = req.query;
    const yearNum = parseInt(year) || new Date().getFullYear();
    const monthNum = month ? parseInt(month) : null;

    let query = `
      SELECT 
        s.*,
        a.first_name as agent_first_name,
        a.last_name as agent_last_name,
        st.score_value as score_type_value
      FROM scores s
      LEFT JOIN agents a ON s.agent_id = a.id
      LEFT JOIN score_types st ON s.score_type_id = st.id
      WHERE EXTRACT(YEAR FROM s.score_date) = $1
    `;
    let params = [yearNum];

    if (monthNum) {
      query += ` AND EXTRACT(MONTH FROM s.score_date) = $2`;
      params.push(monthNum);
    }

    const result = await pool.query(query, params);
    const scores = result.rows;

    // Aggregate scores by agent and month
    const aggregatedData = {};
    
    scores.forEach(score => {
      const agentName = `${score.agent_first_name} ${score.agent_last_name}`.trim() || 'Unknown';
      const scoreMonth = new Date(score.score_date).getMonth() + 1;
      const scoreValue = score.score_type_value || 0;
      
      if (!aggregatedData[agentName]) {
        aggregatedData[agentName] = {};
      }
      
      if (!aggregatedData[agentName][scoreMonth]) {
        aggregatedData[agentName][scoreMonth] = 0;
      }
      
      aggregatedData[agentName][scoreMonth] += Number(scoreValue);
    });

    // Transform to the expected format
    const result2 = [];
    for (const [agentName, months] of Object.entries(aggregatedData)) {
      for (const [month, totalScore] of Object.entries(months)) {
        result2.push({
          agent_name: agentName,
          month: parseInt(month),
          total_score: totalScore
        });
      }
    }

    res.json(result2);
  } catch (error) {
    console.error('Get monthly scores error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getScoreTypesDistribution = async (req, res) => {
  try {
    const { year } = req.query;
    const yearNum = parseInt(year) || new Date().getFullYear();

    const result = await pool.query(`
      SELECT 
        st.name as score_type_name,
        st.score_value as score_type_value
      FROM scores s
      LEFT JOIN score_types st ON s.score_type_id = st.id
      WHERE EXTRACT(YEAR FROM s.score_date) = $1
    `, [yearNum]);
    const scores = result.rows;

    // Aggregate by score type
    const distribution = scores.reduce((acc, score) => {
      const scoreTypeName = score.score_type_name || 'Unknown';
      const existing = acc.find(item => item.name === scoreTypeName);
      
      if (existing) {
        existing.count += 1;
        existing.total_value += Number(score.score_type_value || 0);
      } else {
        acc.push({
          name: scoreTypeName,
          count: 1,
          total_value: Number(score.score_type_value || 0)
        });
      }
      return acc;
    }, []);

    res.json(distribution);
  } catch (error) {
    console.error('Get score types distribution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAgentComparison = async (req, res) => {
  try {
    const { year } = req.query;
    const yearNum = parseInt(year) || new Date().getFullYear();

    const result = await pool.query(`
      SELECT 
        s.*,
        a.first_name as agent_first_name,
        a.last_name as agent_last_name,
        st.score_value as score_type_value
      FROM scores s
      LEFT JOIN agents a ON s.agent_id = a.id
      LEFT JOIN score_types st ON s.score_type_id = st.id
      WHERE EXTRACT(YEAR FROM s.score_date) = $1
    `, [yearNum]);
    const scores = result.rows;

    // Aggregate by agent
    const comparison = scores.reduce((acc, score) => {
      const agentName = `${score.agent_first_name} ${score.agent_last_name}`.trim() || 'Unknown';
      const existing = acc.find(item => item.agent_name === agentName);
      
      if (existing) {
        existing.total_scores += 1;
        existing.total_points += Number(score.score_type_value || 0);
        existing.avg_score = existing.total_points / existing.total_scores;
        if (new Date(score.score_date) > new Date(existing.last_score_date)) {
          existing.last_score_date = score.score_date;
        }
      } else {
        acc.push({
          agent_name: agentName,
          total_scores: 1,
          total_points: Number(score.score_type_value || 0),
          avg_score: Number(score.score_type_value || 0),
          last_score_date: score.score_date
        });
      }
      return acc;
    }, []);

    res.json(comparison);
  } catch (error) {
    console.error('Get agent comparison error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getDashboardStats,
  getMonthlyScores,
  getScoreTypesDistribution,
  getAgentComparison
};
