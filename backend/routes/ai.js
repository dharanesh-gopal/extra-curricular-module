const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken, isTeacherOrAdmin } = require('../middleware/auth');

// AI prediction routes
router.post('/predict/dropout', authenticateToken, isTeacherOrAdmin, aiController.predictDropoutRisk);
router.post('/recommend/activities', authenticateToken, aiController.recommendActivities);
router.post('/predict/performance', authenticateToken, isTeacherOrAdmin, aiController.predictPerformance);
router.post('/cluster/students', authenticateToken, isTeacherOrAdmin, aiController.clusterStudents);
router.get('/predictions/history', authenticateToken, aiController.getPredictionHistory);

module.exports = router;