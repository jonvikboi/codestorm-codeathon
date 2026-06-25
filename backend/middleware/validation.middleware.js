const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      data: { errors: errorMessages },
    });
  }
  next();
};

const validateUUIDParam = (req, res, next) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (req.params.id && !uuidRegex.test(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      data: { errors: ['The provided ID must be a valid UUID v4'] },
    });
  }
  next();
};

module.exports = {
  validate,
  validateUUIDParam,
};
