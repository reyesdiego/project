const express = require('express');
const { 
  getDashboardStats, 
  getMonthlyScores, 
  getScoreTypesDistribution, 
  getAgentComparison 
} = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStats'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats', getDashboardStats);

/**
 * @swagger
 * /api/dashboard/monthly-scores:
 *   get:
 *     summary: Get monthly scores by agent
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           default: 2024
 *         description: Year to filter scores
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month to filter scores (optional, if not provided returns all months for the year)
 *     responses:
 *       200:
 *         description: Monthly scores aggregated by agent
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MonthlyScore'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/monthly-scores', getMonthlyScores);

/**
 * @swagger
 * /api/dashboard/score-types-distribution:
 *   get:
 *     summary: Get score types distribution
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           default: 2024
 *         description: Year to filter scores
 *     responses:
 *       200:
 *         description: Score types distribution
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ScoreTypeDistribution'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/score-types-distribution', getScoreTypesDistribution);

/**
 * @swagger
 * /api/dashboard/agent-comparison:
 *   get:
 *     summary: Get agent comparison data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           default: 2024
 *         description: Year to filter scores
 *     responses:
 *       200:
 *         description: Agent comparison data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AgentComparison'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/agent-comparison', getAgentComparison);

module.exports = router;
