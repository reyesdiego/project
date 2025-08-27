const express = require('express');
const { getScores, createScore, updateScore, deleteScore } = require('../controllers/scoreController');
const { authenticateToken } = require('../middleware/auth');
const { validate, scoreSchema } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/scores:
 *   get:
 *     summary: Get all scores
 *     tags: [Scores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of scores per page
 *       - in: query
 *         name: agent_id
 *         schema:
 *           type: integer
 *         description: Filter by agent ID
 *       - in: query
 *         name: score_type_id
 *         schema:
 *           type: integer
 *         description: Filter by score type ID
 *       - in: query
 *         name: assigned_by
 *         schema:
 *           type: integer
 *         description: Filter by user who assigned the score
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter scores from this date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter scores until this date (YYYY-MM-DD)
 *       - in: query
 *         name: include_relations
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include agent, score type, and user details
 *     responses:
 *       200:
 *         description: List of scores retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 scores:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Score'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     totalPages:
 *                       type: integer
 *                       example: 15
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getScores);

/**
 * @swagger
 * /api/scores:
 *   post:
 *     summary: Create a new score
 *     tags: [Scores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agent_id
 *               - score_type_id
 *             properties:
 *               agent_id:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: ID of the agent being scored
 *               score_type_id:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: ID of the score type
 *               assigned_by:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: ID of the user assigning the score (optional, defaults to current user)
 *               score_date:
 *                 type: string
 *                 format: date
 *                 example: '2024-01-15'
 *                 description: Date of the score (defaults to current date)
 *               comment:
 *                 type: string
 *                 example: 'Excellent performance this month'
 *                 description: Optional comment about the score (can be empty)
 *     responses:
 *       201:
 *         description: Score created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score:
 *                   $ref: '#/components/schemas/Score'
 *                 message:
 *                   type: string
 *                   example: Score created successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Agent or score type not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validate(scoreSchema), createScore);

/**
 * @swagger
 * /api/scores/{id}:
 *   put:
 *     summary: Update an existing score
 *     tags: [Scores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Score ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agent_id
 *               - score_type_id
 *             properties:
 *               agent_id:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: ID of the agent being scored
 *               score_type_id:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: ID of the score type
 *               assigned_by:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: ID of the user assigning the score (optional, defaults to current user)
 *               score_date:
 *                 type: string
 *                 format: date
 *                 example: '2024-01-15'
 *                 description: Date of the score
 *               comment:
 *                 type: string
 *                 example: 'Updated comment about the score'
 *                 description: Optional comment about the score (can be empty)
 *     responses:
 *       200:
 *         description: Score updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score:
 *                   $ref: '#/components/schemas/Score'
 *                 message:
 *                   type: string
 *                   example: Score updated successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Score, agent, or score type not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', validate(scoreSchema), updateScore);

/**
 * @swagger
 * /api/scores/{id}:
 *   delete:
 *     summary: Delete a score
 *     tags: [Scores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Score ID
 *     responses:
 *       200:
 *         description: Score deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Score deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Score not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', deleteScore);

module.exports = router;
