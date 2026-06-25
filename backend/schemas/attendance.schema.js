const Joi = require("joi");

const createAttendanceSchema = Joi.object({
  student_id: Joi.string().uuid().required(),
  subject: Joi.string().required(),
  present_classes: Joi.number().integer().min(0).required(),
  total_classes: Joi.number().integer().min(0).required(),
});

const updateAttendanceSchema = Joi.object({
  student_id: Joi.string().uuid().optional(),
  subject: Joi.string().optional(),
  present_classes: Joi.number().integer().min(0).optional(),
  total_classes: Joi.number().integer().min(0).optional(),
});

module.exports = {
  createAttendanceSchema,
  updateAttendanceSchema,
};
