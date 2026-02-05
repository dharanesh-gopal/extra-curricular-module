const { query, transaction } = require('../config/database');

// Get all performance records
const getAllPerformance = async (req, res) => {
  try {
    const { student_id, activity_id, enrollment_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (enrollment_id) {
      conditions.push('p.enrollment_id = ?');
      params.push(enrollment_id);
    }

    if (activity_id) {
      conditions.push('e.activity_id = ?');
      params.push(activity_id);
    }

    if (student_id) {
      conditions.push('e.student_id = ?');
      params.push(student_id);
    }

    // Role-based filtering
    if (req.user.role === 'student') {
      conditions.push('e.student_id = ?');
      params.push(req.user.user_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const performanceQuery = `
      SELECT 
        p.*,
        e.student_id,
        s.name as student_name,
        a.activity_name,
        a.category,
        evaluator.name as evaluated_by_name
      FROM performance p
      LEFT JOIN enrollments e ON p.enrollment_id = e.enrollment_id
      LEFT JOIN users s ON e.student_id = s.user_id
      LEFT JOIN activities a ON e.activity_id = a.activity_id
      LEFT JOIN users evaluator ON p.evaluated_by = evaluator.user_id
      ${whereClause}
      ORDER BY p.evaluation_date DESC
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), offset);

    const performance = await query(performanceQuery, params);

    res.json({
      success: true,
      data: { performance }
    });
  } catch (error) {
    console.error('Get performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance records',
      error: error.message
    });
  }
};

// Add performance record
const addPerformance = async (req, res) => {
  try {
    const {
      enrollment_id,
      skill_level,
      score,
      max_score,
      evaluation_date,
      remarks,
      strengths,
      areas_for_improvement
    } = req.body;

    // Verify enrollment exists
    const enrollments = await query(
      `SELECT e.*, s.name as student_name, a.activity_name
       FROM enrollments e
       LEFT JOIN users s ON e.student_id = s.user_id
       LEFT JOIN activities a ON e.activity_id = a.activity_id
       WHERE e.enrollment_id = ?`,
      [enrollment_id]
    );

    if (enrollments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    const enrollment = enrollments[0];

    // Check certificate eligibility (score >= 75%)
    const percentage = (score / (max_score || 100)) * 100;
    const certificate_eligible = percentage >= 75;

    const result = await transaction(async (connection) => {
      // Insert performance record
      const [performanceResult] = await connection.execute(
        `INSERT INTO performance 
        (enrollment_id, skill_level, score, max_score, evaluation_date, evaluated_by, 
         remarks, strengths, areas_for_improvement, certificate_eligible)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          enrollment_id,
          skill_level,
          score,
          max_score || 100,
          evaluation_date,
          req.user.user_id,
          remarks || null,
          strengths || null,
          areas_for_improvement || null,
          certificate_eligible
        ]
      );

      // Create notification for student
      await connection.execute(
        `INSERT INTO notifications (user_id, title, message, type, related_id)
         VALUES (?, ?, ?, 'performance', ?)`,
        [
          enrollment.student_id,
          'Performance Evaluation',
          `Your performance in ${enrollment.activity_name} has been evaluated. Score: ${score}/${max_score || 100}`,
          performanceResult.insertId
        ]
      );

      return performanceResult.insertId;
    });

    const performance = await query(
      'SELECT * FROM performance WHERE performance_id = ?',
      [result]
    );

    res.status(201).json({
      success: true,
      message: 'Performance record added successfully',
      data: performance[0]
    });
  } catch (error) {
    console.error('Add performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add performance record',
      error: error.message
    });
  }
};

// Get performance by student
const getPerformanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check permissions
    if (req.user.role === 'student' && req.user.user_id !== parseInt(studentId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const performance = await query(
      `SELECT 
        p.*,
        a.activity_name,
        a.category,
        evaluator.name as evaluated_by_name
      FROM performance p
      LEFT JOIN enrollments e ON p.enrollment_id = e.enrollment_id
      LEFT JOIN activities a ON e.activity_id = a.activity_id
      LEFT JOIN users evaluator ON p.evaluated_by = evaluator.user_id
      WHERE e.student_id = ?
      ORDER BY p.evaluation_date DESC`,
      [studentId]
    );

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Get performance by student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance records',
      error: error.message
    });
  }
};

// Update performance record
const updatePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      skill_level,
      score,
      max_score,
      remarks,
      strengths,
      areas_for_improvement,
      certificate_issued
    } = req.body;

    const updates = [];
    const values = [];

    if (skill_level) {
      updates.push('skill_level = ?');
      values.push(skill_level);
    }
    if (score !== undefined) {
      updates.push('score = ?');
      values.push(score);
      
      // Recalculate certificate eligibility
      const maxScore = max_score || 100;
      const percentage = (score / maxScore) * 100;
      updates.push('certificate_eligible = ?');
      values.push(percentage >= 75);
    }
    if (max_score !== undefined) {
      updates.push('max_score = ?');
      values.push(max_score);
    }
    if (remarks !== undefined) {
      updates.push('remarks = ?');
      values.push(remarks);
    }
    if (strengths !== undefined) {
      updates.push('strengths = ?');
      values.push(strengths);
    }
    if (areas_for_improvement !== undefined) {
      updates.push('areas_for_improvement = ?');
      values.push(areas_for_improvement);
    }
    if (certificate_issued !== undefined) {
      updates.push('certificate_issued = ?');
      values.push(certificate_issued);
      if (certificate_issued) {
        updates.push('certificate_date = NOW()');
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    await query(
      `UPDATE performance SET ${updates.join(', ')} WHERE performance_id = ?`,
      values
    );

    const performance = await query(
      'SELECT * FROM performance WHERE performance_id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Performance record updated successfully',
      data: performance[0]
    });
  } catch (error) {
    console.error('Update performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update performance record',
      error: error.message
    });
  }
};

// Get performance summary for enrollment
const getPerformanceSummary = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const summary = await query(
      `SELECT 
        COUNT(*) as total_evaluations,
        AVG(score) as average_score,
        MAX(score) as highest_score,
        MIN(score) as lowest_score,
        skill_level as current_skill_level,
        certificate_eligible,
        certificate_issued
      FROM performance
      WHERE enrollment_id = ?
      ORDER BY evaluation_date DESC
      LIMIT 1`,
      [enrollmentId]
    );

    res.json({
      success: true,
      data: summary[0] || {}
    });
  } catch (error) {
    console.error('Get performance summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance summary',
      error: error.message
    });
  }
};

module.exports = {
  getAllPerformance,
  addPerformance,
  getPerformanceByStudent,
  updatePerformance,
  getPerformanceSummary
};