const { query, transaction } = require('../config/database');

// Get all enrollments with filters
const getAllEnrollments = async (req, res) => {
  try {
    const { 
      student_id, 
      activity_id, 
      status,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    // Role-based filtering
    if (req.user.role === 'student') {
      conditions.push('e.student_id = ?');
      params.push(req.user.user_id);
    } else {
      if (student_id) {
        conditions.push('e.student_id = ?');
        params.push(student_id);
      }
    }

    if (activity_id) {
      conditions.push('e.activity_id = ?');
      params.push(activity_id);
    }

    if (status) {
      conditions.push('e.status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM enrollments e ${whereClause}`;
    const [countResult] = await query(countQuery, params);
    const total = countResult.total;

    // Get enrollments with related data
    const enrollmentsQuery = `
      SELECT 
        e.*,
        s.name as student_name,
        s.email as student_email,
        a.activity_name,
        a.category,
        a.fee,
        d.department_name,
        approver.name as approved_by_name
      FROM enrollments e
      LEFT JOIN users s ON e.student_id = s.user_id
      LEFT JOIN activities a ON e.activity_id = a.activity_id
      LEFT JOIN departments d ON a.department_id = d.department_id
      LEFT JOIN users approver ON e.approved_by = approver.user_id
      ${whereClause}
      ORDER BY e.enrolled_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), offset);

    const enrollments = await query(enrollmentsQuery, params);

    // Get payment status for each enrollment
    for (let enrollment of enrollments) {
      const payments = await query(
        'SELECT payment_status, amount, payment_date FROM payments WHERE enrollment_id = ?',
        [enrollment.enrollment_id]
      );
      enrollment.payment = payments.length > 0 ? payments[0] : null;
    }

    res.json({
      success: true,
      data: {
        enrollments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get enrollments',
      error: error.message
    });
  }
};

// Get single enrollment by ID
const getEnrollmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollments = await query(
      `SELECT 
        e.*,
        s.name as student_name,
        s.email as student_email,
        s.phone as student_phone,
        a.activity_name,
        a.category,
        a.fee,
        a.description as activity_description,
        d.department_name,
        approver.name as approved_by_name
      FROM enrollments e
      LEFT JOIN users s ON e.student_id = s.user_id
      LEFT JOIN activities a ON e.activity_id = a.activity_id
      LEFT JOIN departments d ON a.department_id = d.department_id
      LEFT JOIN users approver ON e.approved_by = approver.user_id
      WHERE e.enrollment_id = ?`,
      [id]
    );

    if (enrollments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    const enrollment = enrollments[0];

    // Check permissions
    if (req.user.role === 'student' && enrollment.student_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get payment info
    const payments = await query(
      'SELECT * FROM payments WHERE enrollment_id = ?',
      [id]
    );
    enrollment.payment = payments.length > 0 ? payments[0] : null;

    // Get attendance summary
    const attendanceSummary = await query(
      `SELECT 
        COUNT(*) as total_sessions,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(duration_hours) as total_hours
      FROM attendance
      WHERE enrollment_id = ?`,
      [id]
    );
    enrollment.attendance_summary = attendanceSummary[0];

    // Get performance records
    const performance = await query(
      'SELECT * FROM performance WHERE enrollment_id = ? ORDER BY evaluation_date DESC',
      [id]
    );
    enrollment.performance = performance;

    res.json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Get enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get enrollment',
      error: error.message
    });
  }
};

// Create new enrollment (Student enrolls in activity)
const createEnrollment = async (req, res) => {
  try {
    const { activity_id } = req.body;
    const student_id = req.user.user_id;
    const { isDemoMode } = require('../config/database');

    // Check if activity exists and is available
    const activities = await query(
      'SELECT * FROM activities WHERE activity_id = ? AND status IN ("approved", "active")',
      [activity_id]
    );

    if (activities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found or not available for enrollment'
      });
    }

    const activity = activities[0];

    // Check if seats are available
    if (activity.current_enrolled >= activity.max_students) {
      return res.status(400).json({
        success: false,
        message: 'No seats available for this activity'
      });
    }

    // Check if already enrolled
    if (isDemoMode()) {
      const demoData = require('../config/demo-data');
      const existing = demoData.checkExistingEnrollment(student_id, activity_id);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'You are already enrolled in this activity'
        });
      }
      
      // Add enrollment in demo mode
      const newEnrollment = demoData.addEnrollment(student_id, activity_id);
      
      res.status(201).json({
        success: true,
        message: 'Enrollment request submitted successfully',
        data: {
          ...newEnrollment,
          activity_name: activity.activity_name,
          fee: activity.fee
        }
      });
      return;
    }

    const existingEnrollments = await query(
      'SELECT * FROM enrollments WHERE student_id = ? AND activity_id = ?',
      [student_id, activity_id]
    );

    if (existingEnrollments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this activity'
      });
    }

    const result = await transaction(async (connection) => {
      // Create enrollment
      const [enrollmentResult] = await connection.execute(
        'INSERT INTO enrollments (student_id, activity_id, status) VALUES (?, ?, ?)',
        [student_id, activity_id, 'pending']
      );

      const enrollmentId = enrollmentResult.insertId;

      // Create payment record if activity is paid
      if (activity.is_paid && activity.fee > 0) {
        await connection.execute(
          `INSERT INTO payments (enrollment_id, amount, payment_status, due_date)
           VALUES (?, ?, 'pending', DATE_ADD(NOW(), INTERVAL 7 DAY))`,
          [enrollmentId, activity.fee]
        );
      }

      // Create notification for teacher
      await connection.execute(
        `INSERT INTO notifications (user_id, title, message, type, related_id)
         VALUES (?, ?, ?, 'enrollment', ?)`,
        [
          activity.created_by,
          'New Enrollment Request',
          `${req.user.name} has requested to enroll in ${activity.activity_name}`,
          enrollmentId
        ]
      );

      return enrollmentId;
    });

    // Get created enrollment
    const enrollments = await query(
      `SELECT e.*, a.activity_name, a.fee
       FROM enrollments e
       LEFT JOIN activities a ON e.activity_id = a.activity_id
       WHERE e.enrollment_id = ?`,
      [result]
    );

    res.status(201).json({
      success: true,
      message: 'Enrollment request submitted successfully',
      data: enrollments[0]
    });
  } catch (error) {
    console.error('Create enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create enrollment',
      error: error.message
    });
  }
};

// Update enrollment status (Teacher/Admin approves/rejects)
const updateEnrollmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason_for_rejection, notes } = req.body;

    // Get enrollment
    const enrollments = await query(
      `SELECT e.*, a.activity_name, a.max_students, a.current_enrolled, s.name as student_name
       FROM enrollments e
       LEFT JOIN activities a ON e.activity_id = a.activity_id
       LEFT JOIN users s ON e.student_id = s.user_id
       WHERE e.enrollment_id = ?`,
      [id]
    );

    if (enrollments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    const enrollment = enrollments[0];

    // Check if seats are available for approval
    if (status === 'approved' && enrollment.current_enrolled >= enrollment.max_students) {
      return res.status(400).json({
        success: false,
        message: 'No seats available for this activity'
      });
    }

    await transaction(async (connection) => {
      // Update enrollment
      await connection.execute(
        `UPDATE enrollments 
         SET status = ?, approved_by = ?, approved_at = NOW(), 
             reason_for_rejection = ?, notes = ?
         WHERE enrollment_id = ?`,
        [status, req.user.user_id, reason_for_rejection || null, notes || null, id]
      );

      // Create notification for student
      let notificationMessage = '';
      if (status === 'approved') {
        notificationMessage = `Your enrollment in ${enrollment.activity_name} has been approved!`;
      } else if (status === 'rejected') {
        notificationMessage = `Your enrollment in ${enrollment.activity_name} has been rejected. ${reason_for_rejection || ''}`;
      }

      if (notificationMessage) {
        await connection.execute(
          `INSERT INTO notifications (user_id, title, message, type, related_id)
           VALUES (?, ?, ?, 'enrollment', ?)`,
          [enrollment.student_id, 'Enrollment Update', notificationMessage, id]
        );
      }
    });

    res.json({
      success: true,
      message: `Enrollment ${status} successfully`
    });
  } catch (error) {
    console.error('Update enrollment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update enrollment status',
      error: error.message
    });
  }
};

// Cancel enrollment (Student cancels their own enrollment)
const cancelEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollments = await query(
      'SELECT * FROM enrollments WHERE enrollment_id = ? AND student_id = ?',
      [id, req.user.user_id]
    );

    if (enrollments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    const enrollment = enrollments[0];

    if (enrollment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed enrollment'
      });
    }

    await query(
      "UPDATE enrollments SET status = 'dropped' WHERE enrollment_id = ?",
      [id]
    );

    res.json({
      success: true,
      message: 'Enrollment cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel enrollment',
      error: error.message
    });
  }
};

// Get student's enrollment summary
const getStudentEnrollmentSummary = async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user.user_id : req.params.studentId;

    const summary = await query(
      `SELECT 
        COUNT(*) as total_enrollments,
        SUM(CASE WHEN e.status = 'pending' THEN 1 ELSE 0 END) as pending_enrollments,
        SUM(CASE WHEN e.status = 'active' THEN 1 ELSE 0 END) as active_enrollments,
        SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) as completed_enrollments,
        SUM(CASE WHEN p.payment_status = 'paid' THEN p.amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN p.payment_status = 'pending' THEN p.amount ELSE 0 END) as pending_payments
      FROM enrollments e
      LEFT JOIN payments p ON e.enrollment_id = p.enrollment_id
      WHERE e.student_id = ?`,
      [studentId]
    );

    res.json({
      success: true,
      data: summary[0]
    });
  } catch (error) {
    console.error('Get enrollment summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get enrollment summary',
      error: error.message
    });
  }
};

module.exports = {
  getAllEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollmentStatus,
  cancelEnrollment,
  getStudentEnrollmentSummary
};