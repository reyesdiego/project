const express = require('express');
const { getScoreTypes, createScoreType, updateScoreType, deleteScoreType } = require('../controllers/scoreTypeController');
const { authenticateToken } = require('../middleware/auth');
const { validate, scoreTypeSchema } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/score-types:
 *   get:
 *     summary: Get all score types
 *     tags: [Score Types]
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
 *         description: Number of score types per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name or description
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: min_score_value
 *         schema:
 *           type: integer
 *         description: Filter by minimum score value
 *       - in: query
 *         name: max_score_value
 *         schema:
 *           type: integer
 *         description: Filter by maximum score value
 *     responses:
 *       200:
 *         description: List of score types retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 scoreTypes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ScoreType'
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
 *                       example: 6
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getScoreTypes);

/**
 * @swagger
 * /api/score-types:
 *   post:
 *     summary: Create a new score type
 *     tags: [Score Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - score_value
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: 'Excellent Performance'
 *                 description: Name of the score type
 *               description:
 *                 type: string
 *                 example: 'Outstanding work and exceptional results'
 *                 description: Optional description of the score type
 *               score_value:
 *                 type: integer
 *                 example: 10
 *                 description: Numeric value associated with this score type
 *               is_active:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *                 description: Whether this score type is active
 *     responses:
 *       201:
 *         description: Score type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 scoreType:
 *                   $ref: '#/components/schemas/ScoreType'
 *                 message:
 *                   type: string
 *                   example: Score type created successfully
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
 *       409:
 *         description: Score type name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validate(scoreTypeSchema), createScoreType);

/**
 * @swagger
 * /api/score-types/{id}:
 *   put:
 *     summary: Update an existing score type
 *     tags: [Score Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Score type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - score_value
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: 'Excellent Performance'
 *                 description: Name of the score type
 *               description:
 *                 type: string
 *                 example: 'Updated description of outstanding work'
 *                 description: Optional description of the score type
 *               score_value:
 *                 type: integer
 *                 example: 10
 *                 description: Numeric value associated with this score type
 *               is_active:
 *                 type: boolean
 *                 example: true
 *                 description: Whether this score type is active
 *     responses:
 *       200:
 *         description: Score type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 scoreType:
 *                   $ref: '#/components/schemas/ScoreType'
 *                 message:
 *                   type: string
 *                   example: Score type updated successfully
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
 *         description: Score type not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Score type name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', validate(scoreTypeSchema), updateScoreType);

/**
 * @swagger
 * /api/score-types/{id}:
 *   delete:
 *     summary: Delete a score type
 *     tags: [Score Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Score type ID
 *     responses:
 *       200:
 *         description: Score type deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Score type deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Score type not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Cannot delete score type that is being used by scores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', deleteScoreType);

module.exports = router;
