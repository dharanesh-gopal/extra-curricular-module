const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { authenticateToken, isTeacherOrAdmin } = require('../middleware/auth');
const { 
  createEnrollmentValidation, 
  updateEnrollmentStatusValidation,
  idParamValidation,
  paginationValidation
} = require('../middleware/validator');

// All authenticated users
router.get('/', authenticateToken, paginationValidation, enrollmentController.getAllEnrollments);
router.get('/:id', authenticateToken, idParamValidation, enrollmentController.getEnrollmentById);
router.get('/student/:studentId/summary', authenticateToken, enrollmentController.getStudentEnrollmentSummary);

// Student routes
router.post('/', authenticateToken, createEnrollmentValidation, enrollmentController.createEnrollment);
router.delete('/:id', authenticateToken, idParamValidation, enrollmentController.cancelEnrollment);

// Teacher/Admin routes
router.put('/:id/status', authenticateToken, isTeacherOrAdmin, updateEnrollmentStatusValidation, enrollmentController.updateEnrollmentStatus);

module.exports = router;