const axios = require('axios');
const { query } = require('../config/database');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

// Predict dropout risk
const predictDropoutRisk = async (req, res) => {
  try {
    const { student_id, activity_id } = req.body;

    // Get student data
    const studentData = await query(
      `SELECT 
        e.enrollment_id,
        e.student_id,
        e.activity_id,
        COUNT(DISTINCT a.attendance_id) as total_sessions,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
        AVG(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100 as attendance_percentage,
        AVG(p.score) as average_score,
        COUNT(DISTINCT p.performance_id) as total_evaluations,
        DATEDIFF(NOW(), e.enrolled_at) as days_enrolled
      FROM enrollments e
      LEFT JOIN attendance a ON e.enrollment_id = a.enrollment_id
      LEFT JOIN performance p ON e.enrollment_id = p.enrollment_id
      WHERE e.student_id = ? AND e.activity_id = ? AND e.status = 'active'
      GROUP BY e.enrollment_id`,
      [student_id, activity_id]
    );

    if (studentData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active enrollment found for this student and activity'
      });
    }

    // Call AI service
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict-dropout`, {
      student_data: studentData[0]
    });

    // Save prediction to database
    await query(
      `INSERT INTO ai_predictions (student_id, activity_id, model_type, prediction_result, confidence_score, risk_level, recommended_actions)
       VALUES (?, ?, 'dropout_risk', ?, ?, ?, ?)`,
      [
        student_id,
        activity_id,
        JSON.stringify(aiResponse.data.prediction),
        aiResponse.data.confidence,
        aiResponse.data.risk_level,
        aiResponse.data.recommended_actions
      ]
    );

    res.json({
      success: true,
      data: aiResponse.data
    });
  } catch (error) {
    console.error('Predict dropout risk error:', error);
    
    // Fallback to rule-based prediction if AI service is unavailable
    if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
      return ruleBasedDropoutPrediction(req, res);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to predict dropout risk',
      error: error.message
    });
  }
};

// Rule-based dropout prediction (fallback)
const ruleBasedDropoutPrediction = async (req, res) => {
  try {
    const { student_id, activity_id } = req.body;

    const studentData = await query(
      `SELECT 
        AVG(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100 as attendance_percentage,
        AVG(p.score) as average_score,
        COUNT(DISTINCT a.attendance_id) as total_sessions
      FROM enrollments e
      LEFT JOIN attendance a ON e.enrollment_id = a.enrollment_id
      LEFT JOIN performance p ON e.enrollment_id = p.enrollment_id
      WHERE e.student_id = ? AND e.activity_id = ? AND e.status = 'active'`,
      [student_id, activity_id]
    );

    if (studentData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found'
      });
    }

    const data = studentData[0];
    const attendance = data.attendance_percentage || 0;
    const score = data.average_score || 0;

    let risk_level = 'low';
    let risk_score = 0;
    let factors = [];
    let recommended_actions = '';

    // Rule-based logic
    if (attendance < 60) {
      risk_score += 0.4;
      factors.push('low_attendance');
    } else if (attendance < 75) {
      risk_score += 0.2;
      factors.push('moderate_attendance');
    }

    if (score < 50) {
      risk_score += 0.4;
      factors.push('low_performance');
    } else if (score < 70) {
      risk_score += 0.2;
      factors.push('moderate_performance');
    }

    if (data.total_sessions < 3) {
      risk_score += 0.1;
      factors.push('insufficient_data');
    }

    if (risk_score >= 0.5) {
      risk_level = 'high';
      recommended_actions = 'Immediate intervention required. Schedule counseling session and contact parents.';
    } else if (risk_score >= 0.3) {
      risk_level = 'medium';
      recommended_actions = 'Monitor closely. Provide additional support and encouragement.';
    } else {
      risk_level = 'low';
      recommended_actions = 'Continue current engagement level. Maintain regular monitoring.';
    }

    const prediction = {
      risk_score,
      risk_level,
      factors,
      attendance_percentage: attendance,
      average_score: score,
      recommended_actions,
      model_type: 'rule_based'
    };

    // Save prediction
    await query(
      `INSERT INTO ai_predictions (student_id, activity_id, model_type, prediction_result, confidence_score, risk_level, recommended_actions)
       VALUES (?, ?, 'rule_based', ?, ?, ?, ?)`,
      [student_id, activity_id, JSON.stringify(prediction), risk_score, risk_level, recommended_actions]
    );

    res.json({
      success: true,
      data: {
        prediction,
        confidence: risk_score,
        risk_level,
        recommended_actions,
        note: 'Using rule-based prediction (AI service unavailable)'
      }
    });
  } catch (error) {
    console.error('Rule-based prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to predict dropout risk',
      error: error.message
    });
  }
};

// Recommend activities
const recommendActivities = async (req, res) => {
  try {
    const { student_id } = req.body;

    // Get student's enrollment history
    const enrollmentHistory = await query(
      `SELECT 
        a.category,
        a.activity_id,
        AVG(p.score) as avg_score,
        COUNT(DISTINCT e.enrollment_id) as enrollment_count
      FROM enrollments e
      LEFT JOIN activities a ON e.activity_id = a.activity_id
      LEFT JOIN performance p ON e.enrollment_id = p.enrollment_id
      WHERE e.student_id = ?
      GROUP BY a.category, a.activity_id`,
      [student_id]
    );

    // Call AI service
    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/recommend-activity`, {
        student_id,
        enrollment_history: enrollmentHistory
      });

      res.json({
        success: true,
        data: aiResponse.data
      });
    } catch (aiError) {
      // Fallback to simple recommendation
      const recommendations = await simpleRecommendation(student_id, enrollmentHistory);
      res.json({
        success: true,
        data: recommendations,
        note: 'Using simple recommendation (AI service unavailable)'
      });
    }
  } catch (error) {
    console.error('Recommend activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to recommend activities',
      error: error.message
    });
  }
};

// Simple recommendation fallback
const simpleRecommendation = async (student_id, enrollmentHistory) => {
  // Get categories student has tried
  const triedCategories = enrollmentHistory.map(e => e.category);
  
  // Get popular activities in untried categories
  const recommendations = await query(
    `SELECT 
      a.*,
      d.department_name,
      COUNT(DISTINCT e.enrollment_id) as popularity,
      AVG(p.score) as avg_score
    FROM activities a
    LEFT JOIN departments d ON a.department_id = d.department_id
    LEFT JOIN enrollments e ON a.activity_id = e.activity_id
    LEFT JOIN performance p ON e.enrollment_id = p.enrollment_id
    WHERE a.status = 'approved' 
      AND a.current_enrolled < a.max_students
      ${triedCategories.length > 0 ? `AND a.category NOT IN (${triedCategories.map(() => '?').join(',')})` : ''}
    GROUP BY a.activity_id
    ORDER BY popularity DESC, avg_score DESC
    LIMIT 5`,
    triedCategories
  );

  return {
    recommendations,
    reason: 'Based on popularity and availability'
  };
};

// Predict performance
const predictPerformance = async (req, res) => {
  try {
    const { student_id, activity_id } = req.body;

    // Get historical performance data
    const performanceData = await query(
      `SELECT 
        p.score,
        p.evaluation_date,
        p.skill_level,
        a.status as attendance_status,
        a.date as attendance_date
      FROM enrollments e
      LEFT JOIN performance p ON e.enrollment_id = p.enrollment_id
      LEFT JOIN attendance a ON e.enrollment_id = a.enrollment_id
      WHERE e.student_id = ? AND e.activity_id = ?
      ORDER BY p.evaluation_date DESC, a.date DESC`,
      [student_id, activity_id]
    );

    if (performanceData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No performance data found'
      });
    }

    // Call AI service
    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict-performance`, {
        performance_data: performanceData
      });

      res.json({
        success: true,
        data: aiResponse.data
      });
    } catch (aiError) {
      // Simple trend analysis
      const scores = performanceData.filter(p => p.score).map(p => p.score);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const trend = scores.length > 1 && scores[0] > scores[scores.length - 1] ? 'improving' : 'stable';

      res.json({
        success: true,
        data: {
          predicted_score: avgScore,
          trend,
          confidence: 0.7,
          note: 'Using simple trend analysis (AI service unavailable)'
        }
      });
    }
  } catch (error) {
    console.error('Predict performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to predict performance',
      error: error.message
    });
  }
};

// Cluster students
const clusterStudents = async (req, res) => {
  try {
    const { activity_id } = req.body;

    // Get student data for clustering
    const studentData = await query(
      `SELECT 
        e.student_id,
        s.name as student_name,
        AVG(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100 as attendance_percentage,
        AVG(p.score) as average_score,
        p.skill_level
      FROM enrollments e
      LEFT JOIN users s ON e.student_id = s.user_id
      LEFT JOIN attendance a ON e.enrollment_id = a.enrollment_id
      LEFT JOIN performance p ON e.enrollment_id = p.enrollment_id
      WHERE e.activity_id = ? AND e.status = 'active'
      GROUP BY e.student_id, s.name, p.skill_level`,
      [activity_id]
    );

    if (studentData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No student data found for this activity'
      });
    }

    // Call AI service
    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/cluster-students`, {
        student_data: studentData
      });

      res.json({
        success: true,
        data: aiResponse.data
      });
    } catch (aiError) {
      // Simple grouping by skill level
      const clusters = {
        beginner: studentData.filter(s => s.skill_level === 'beginner'),
        intermediate: studentData.filter(s => s.skill_level === 'intermediate'),
        advanced: studentData.filter(s => s.skill_level === 'advanced' || s.skill_level === 'expert')
      };

      res.json({
        success: true,
        data: {
          clusters,
          note: 'Using skill-level grouping (AI service unavailable)'
        }
      });
    }
  } catch (error) {
    console.error('Cluster students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cluster students',
      error: error.message
    });
  }
};

// Get AI predictions history
const getPredictionHistory = async (req, res) => {
  try {
    const { student_id, model_type, limit = 10 } = req.query;
    const conditions = [];
    const params = [];

    if (student_id) {
      conditions.push('student_id = ?');
      params.push(student_id);
    }

    if (model_type) {
      conditions.push('model_type = ?');
      params.push(model_type);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(parseInt(limit));

    const predictions = await query(
      `SELECT * FROM ai_predictions ${whereClause} ORDER BY created_at DESC LIMIT ?`,
      params
    );

    res.json({
      success: true,
      data: predictions
    });
  } catch (error) {
    console.error('Get prediction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get prediction history',
      error: error.message
    });
  }
};

module.exports = {
  predictDropoutRisk,
  recommendActivities,
  predictPerformance,
  clusterStudents,
  getPredictionHistory
};