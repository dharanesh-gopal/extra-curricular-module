const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticateToken, isTeacherOrAdmin, isAdmin } = require('../middleware/auth');
const { 
  createActivityValidation, 
  updateActivityValidation,
  idParamValidation,
  paginationValidation
} = require('../middleware/validator');

// Public/Student routes
router.get('/', authenticateToken, paginationValidation, activityController.getAllActivities);
router.get('/:id', authenticateToken, idParamValidation, activityController.getActivityById);
router.get('/:id/statistics', authenticateToken, idParamValidation, activityController.getActivityStatistics);

// Teacher/Admin routes
router.post('/', authenticateToken, isTeacherOrAdmin, createActivityValidation, activityController.createActivity);
router.put('/:id', authenticateToken, isTeacherOrAdmin, updateActivityValidation, activityController.updateActivity);
router.delete('/:id', authenticateToken, isTeacherOrAdmin, idParamValidation, activityController.deleteActivity);

// Admin only routes
router.put('/:id/approve', authenticateToken, isAdmin, idParamValidation, activityController.updateActivityStatus);

module.exports = router;