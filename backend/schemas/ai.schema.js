const Joi = require('joi');

const studyScheduleSchema = Joi.object({
  subjects: Joi.array().items(Joi.string()).min(1).required(),
  deadline: Joi.date().iso().required(),
});

const attendanceSchema = Joi.object({
  attendance: Joi.any().required(),
});

const deadlineSchema = Joi.object({
  task: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      deadline: Joi.date().iso().required(),
      priority: Joi.string().valid('Low', 'Medium', 'High').required(),
      completed: Joi.boolean().optional()
    }).unknown(true)
  ).min(1).required(),
});

module.exports = {
  studyScheduleSchema,
  attendanceSchema,
  deadlineSchema,
};
