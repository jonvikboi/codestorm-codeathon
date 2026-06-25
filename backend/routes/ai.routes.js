const express = require('express');
const { generateStudySchedule, analyzeAttendance, analyzeDeadlines } = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { studyScheduleSchema, attendanceSchema, deadlineSchema } = require('../schemas/ai.schema');

const router = express.Router();

router.use(authenticate); // Protect all AI routes

router.post('/study-schedule', validate(studyScheduleSchema), generateStudySchedule);
router.post('/attendance', validate(attendanceSchema), analyzeAttendance);
router.post('/deadlines', validate(deadlineSchema), analyzeDeadlines);

module.exports = router;
