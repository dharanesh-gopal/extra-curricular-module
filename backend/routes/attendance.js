const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken, isTeacherOrAdmin } = require('../middleware/auth');
const { createAttendanceValidation, idParamValidation, paginationValidation } = require('../middleware/validator');

router.get('/', authenticateToken, paginationValidation, attendanceController.getAllAttendance);
router.get('/activity/:activityId', authenticateToken, attendanceController.getAttendanceByActivity);
router.get('/enrollment/:enrollmentId/summary', authenticateToken, attendanceController.getAttendanceSummary);
router.post('/', authenticateToken, isTeacherOrAdmin, createAttendanceValidation, attendanceController.markAttendance);

module.exports = router;