const express = require('express');
const { createAttendance, getAttendance, getAttendanceById, updateAttendance, deleteAttendance } = require('../controllers/attendance.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate, validateUUIDParam } = require('../middleware/validation.middleware');
const { createAttendanceSchema, updateAttendanceSchema } = require('../schemas/attendance.schema');

const router = express.Router();

router.use(authenticate); // Protect all attendance routes

router.post('/', validate(createAttendanceSchema), createAttendance);
router.get('/', getAttendance);
router.get('/:id', validateUUIDParam, getAttendanceById);
router.put('/:id', validateUUIDParam, validate(updateAttendanceSchema), updateAttendance);
router.delete('/:id', validateUUIDParam, deleteAttendance);

module.exports = router;
