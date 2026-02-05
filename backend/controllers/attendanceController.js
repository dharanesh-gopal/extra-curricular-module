const { query, transaction } = require('../config/database');

// Get attendance records
const getAllAttendance = async (req, res) => {
  try {
    const { activity_id, enrollment_id, date, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (activity_id) {
      conditions.push('e.activity_id = ?');
      params.push(activity_id);
    }

    if (enrollment_id) {
      conditions.push('att.enrollment_id = ?');
      params.push(enrollment_id);
    }

    if (date) {
      conditions.push('att.date = ?');
      params.push(date);
    }

    // Role-based filtering
    if (req.user.role === 'student') {
      conditions.push('e.student_id = ?');
      params.push(req.user.user_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const attendanceQuery = `
      SELECT 
        att.*,
        e.student_id,
        s.name as student_name,
        a.activity_name,
        marker.name as marked_by_name
      FROM attendance att
      LEFT JOIN enrollments e ON att.enrollment_id = e.enrollment_id
      LEFT JOIN users s ON e.student_id = s.user_id
      LEFT JOIN activities a ON e.activity_id = a.activity_id
      LEFT JOIN users marker ON att.marked_by = marker.user_id
      ${whereClause}
      ORDER BY att.date DESC, att.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), offset);

    const attendance = await query(attendanceQuery, params);

    res.json({
      success: true,
      data: { attendance }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance',
      error: error.message
    });
  }
};

// Mark attendance
const markAttendance = async (req, res) => {
  try {
    const { enrollment_id, date, status, duration_hours, remarks } = req.body;

    // Verify enrollment exists
    const enrollments = await query(
      'SELECT * FROM enrollments WHERE enrollment_id = ?',
      [enrollment_id]
    );

    if (enrollments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if attendance already marked for this date
    const existing = await query(
      'SELECT * FROM attendance WHERE enrollment_id = ? AND date = ?',
      [enrollment_id, date]
    );

    if (existing.length > 0) {
      // Update existing attendance
      await query(
        `UPDATE attendance 
         SET status = ?, duration_hours = ?, remarks = ?, marked_by = ?
         WHERE attendance_id = ?`,
        [status, duration_hours || 0, remarks || null, req.user.user_id, existing[0].attendance_id]
      );

      const updated = await query(
        'SELECT * FROM attendance WHERE attendance_id = ?',
        [existing[0].attendance_id]
      );

      return res.json({
        success: true,
        message: 'Attendance updated successfully',
        data: updated[0]
      });
    }

    // Create new attendance record
    const result = await query(
      `INSERT INTO attendance (enrollment_id, date, status, duration_hours, remarks, marked_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [enrollment_id, date, status, duration_hours || 0, remarks || null, req.user.user_id]
    );

    const attendance = await query(
      'SELECT * FROM attendance WHERE attendance_id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance[0]
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance',
      error: error.message
    });
  }
};

// Get attendance by activity
const getAttendanceByActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { date } = req.query;

    let dateCondition = '';
    const params = [activityId];

    if (date) {
      dateCondition = 'AND att.date = ?';
      params.push(date);
    }

    const attendance = await query(
      `SELECT 
        att.*,
        e.student_id,
        s.name as student_name,
        s.email as student_email
      FROM attendance att
      LEFT JOIN enrollments e ON att.enrollment_id = e.enrollment_id
      LEFT JOIN users s ON e.student_id = s.user_id
      WHERE e.activity_id = ? ${dateCondition}
      ORDER BY att.date DESC, s.name ASC`,
      params
    );

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Get attendance by activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance',
      error: error.message
    });
  }
};

// Get attendance summary for student
const getAttendanceSummary = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const summary = await query(
      `SELECT 
        COUNT(*) as total_sessions,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused_count,
        SUM(duration_hours) as total_hours,
        ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendance_percentage
      FROM attendance
      WHERE enrollment_id = ?`,
      [enrollmentId]
    );

    res.json({
      success: true,
      data: summary[0]
    });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance summary',
      error: error.message
    });
  }
};

module.exports = {
  getAllAttendance,
  markAttendance,
  getAttendanceByActivity,
  getAttendanceSummary
};