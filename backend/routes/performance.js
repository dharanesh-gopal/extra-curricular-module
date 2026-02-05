const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');
const { authenticateToken, isTeacherOrAdmin } = require('../middleware/auth');
const { createPerformanceValidation, idParamValidation, paginationValidation } = require('../middleware/validator');

router.get('/', authenticateToken, paginationValidation, performanceController.getAllPerformance);
router.get('/student/:studentId', authenticateToken, performanceController.getPerformanceByStudent);
router.get('/enrollment/:enrollmentId/summary', authenticateToken, performanceController.getPerformanceSummary);
router.post('/', authenticateToken, isTeacherOrAdmin, createPerformanceValidation, performanceController.addPerformance);
router.put('/:id', authenticateToken, isTeacherOrAdmin, idParamValidation, performanceController.updatePerformance);

module.exports = router;