const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ScoreTeam API',
      version: '1.0.0',
      description: 'REST API for ScoreTeam application - Agent evaluation and scoring system',
      contact: {
        name: 'ScoreTeam Support',
        email: 'support@scoreteam.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://api.scoreteam.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'admin' },
            email: { type: 'string', format: 'email', example: 'admin@scoreteam.com' },
            first_name: { type: 'string', example: 'Admin' },
            last_name: { type: 'string', example: 'User' },
            phone: { type: 'string', example: '+1234567890' },
            role: { type: 'string', example: 'admin' },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Agent: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            first_name: { type: 'string', example: 'John' },
            last_name: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john.doe@company.com' },
            phone: { type: 'string', example: '+1234567890' },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        ScoreType: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Excellent Performance' },
            description: { type: 'string', example: 'Outstanding work and exceptional results' },
            score_value: { type: 'integer', example: 10 },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Score: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            agent_id: { type: 'integer', example: 1 },
            score_type_id: { type: 'integer', example: 1 },
            assigned_by: { type: 'integer', example: 1 },
            score_date: { type: 'string', format: 'date', example: '2024-01-15' },
            comment: { type: 'string', example: 'Great performance this month' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            agent: {
              type: 'object',
              properties: {
                first_name: { type: 'string', example: 'John' },
                last_name: { type: 'string', example: 'Doe' }
              }
            },
            score_type: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Excellent Performance' },
                score_value: { type: 'integer', example: 10 }
              }
            },
            assigned_by_user: {
              type: 'object',
              properties: {
                first_name: { type: 'string', example: 'Admin' },
                last_name: { type: 'string', example: 'User' }
              }
            }
          }
        },
        DashboardStats: {
          type: 'object',
          properties: {
            totalAgents: { type: 'integer', example: 25 },
            totalScores: { type: 'integer', example: 150 },
            totalScoreTypes: { type: 'integer', example: 6 },
            totalUsers: { type: 'integer', example: 10 },
            recentScores: {
              type: 'array',
              items: { $ref: '#/components/schemas/Score' }
            }
          }
        },
        MonthlyScore: {
          type: 'object',
          properties: {
            agent_name: { type: 'string', example: 'John Doe' },
            month: { type: 'integer', example: 1 },
            total_score: { type: 'integer', example: 85 }
          }
        },
        ScoreTypeDistribution: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Excellent Performance' },
            count: { type: 'integer', example: 45 },
            total_value: { type: 'integer', example: 450 }
          }
        },
        AgentComparison: {
          type: 'object',
          properties: {
            agent_name: { type: 'string', example: 'John Doe' },
            total_scores: { type: 'integer', example: 12 },
            total_points: { type: 'integer', example: 95 },
            avg_score: { type: 'number', format: 'float', example: 7.9 },
            last_score_date: { type: 'string', format: 'date', example: '2024-01-15' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Error message' },
            details: {
              type: 'array',
              items: { type: 'string' },
              example: ['Validation error details']
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
