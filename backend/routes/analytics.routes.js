const express = require('express');
const { getAttendanceAnalytics, getTaskAnalytics, getGlobalDashboard } = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/attendance', getAttendanceAnalytics);
router.get('/task', getTaskAnalytics);
router.get('/dashboard', getGlobalDashboard);

module.exports = router;
