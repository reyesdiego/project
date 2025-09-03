const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Validation schemas
const userSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  phone: Joi.string().allow('', null).optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string(),
  is_active: Joi.boolean().default(true)
});

const agentSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().allow('', null).optional(),
  is_active: Joi.boolean().default(true)
});

const scoreTypeSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().optional(),
  score_value: Joi.number().required(),
  is_active: Joi.boolean().default(true)
});

const scoreSchema = Joi.object({
  agent_id: Joi.number().integer().positive().required(),
  score_type_id: Joi.number().integer().positive().required(),
  assigned_by: Joi.number().integer().positive().optional(),
  score_date: Joi.date().default(Date.now),
  comment: Joi.string().allow('').optional()
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

module.exports = {
  validate,
  userSchema,
  agentSchema,
  scoreTypeSchema,
  scoreSchema,
  loginSchema
};
