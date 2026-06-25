const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional().allow(''),
  subject: Joi.string().required(),
  deadline: Joi.date().iso().required(),
  priority: Joi.string().valid('Low', 'Medium', 'High').required(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional().allow(''),
  subject: Joi.string().optional(),
  deadline: Joi.date().iso().optional(),
  priority: Joi.string().valid('Low', 'Medium', 'High').optional(),
  completed: Joi.boolean().optional(),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
};
