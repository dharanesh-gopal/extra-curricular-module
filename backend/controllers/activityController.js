const { query, transaction } = require('../config/database');

// Get all activities with filters
const getAllActivities = async (req, res) => {
  try {
    const { 
      category, 
      status, 
      department_id, 
      search,
      page = 1, 
      limit = 10 
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    // Build WHERE clause
    if (category) {
      conditions.push('a.category = ?');
      params.push(category);
    }
    if (status) {
      conditions.push('a.status = ?');
      params.push(status);
    } else {
      // Default: show only approved/active activities for students
      if (req.user.role === 'student') {
        conditions.push("a.status IN ('approved', 'active')");
      }
    }
    if (department_id) {
      conditions.push('a.department_id = ?');
      params.push(department_id);
    }
    if (search) {
      conditions.push('(a.activity_name LIKE ? OR a.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM activities a 
      ${whereClause}
    `;
    const [countResult] = await query(countQuery, params);
    const total = countResult.total;

    // Get activities with department info
    const activitiesQuery = `
      SELECT 
        a.*,
        d.department_name,
        u.name as created_by_name,
        (a.max_students - a.current_enrolled) as available_seats
      FROM activities a
      LEFT JOIN departments d ON a.department_id = d.department_id
      LEFT JOIN users u ON a.created_by = u.user_id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), offset);
    
    const activities = await query(activitiesQuery, params);

    // Get schedules for each activity
    for (let activity of activities) {
      const schedules = await query(
        'SELECT * FROM activity_schedule WHERE activity_id = ? ORDER BY FIELD(day_of_week, "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday")',
        [activity.activity_id]
      );
      activity.schedules = schedules;
    }

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activities',
      error: error.message
    });
  }
};

// Get single activity by ID
const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    const activities = await query(
      `SELECT 
        a.*,
        d.department_name,
        u.name as created_by_name,
        (a.max_students - a.current_enrolled) as available_seats
      FROM activities a
      LEFT JOIN departments d ON a.department_id = d.department_id
      LEFT JOIN users u ON a.created_by = u.user_id
      WHERE a.activity_id = ?`,
      [id]
    );

    if (activities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    const activity = activities[0];

    // Get schedules
    const schedules = await query(
      'SELECT * FROM activity_schedule WHERE activity_id = ? ORDER BY FIELD(day_of_week, "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday")',
      [id]
    );
    activity.schedules = schedules;

    // Get enrollment count by status
    const enrollmentStats = await query(
      `SELECT 
        status,
        COUNT(*) as count
      FROM enrollments
      WHERE activity_id = ?
      GROUP BY status`,
      [id]
    );
    activity.enrollment_stats = enrollmentStats;

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity',
      error: error.message
    });
  }
};

// Create new activity
const createActivity = async (req, res) => {
  try {
    const {
      department_id,
      activity_name,
      description,
      category,
      max_students,
      fee,
      is_paid,
      start_date,
      end_date,
      location,
      requirements,
      schedules
    } = req.body;

    const result = await transaction(async (connection) => {
      // Insert activity
      const [activityResult] = await connection.execute(
        `INSERT INTO activities 
        (department_id, activity_name, description, category, max_students, fee, is_paid, 
         created_by, start_date, end_date, location, requirements, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          department_id,
          activity_name,
          description || null,
          category,
          max_students,
          fee,
          is_paid,
          req.user.user_id,
          start_date || null,
          end_date || null,
          location || null,
          requirements || null,
          req.user.role === 'admin' ? 'approved' : 'pending'
        ]
      );

      const activityId = activityResult.insertId;

      // Insert schedules if provided
      if (schedules && schedules.length > 0) {
        for (const schedule of schedules) {
          await connection.execute(
            `INSERT INTO activity_schedule (activity_id, day_of_week, start_time, end_time, venue)
             VALUES (?, ?, ?, ?, ?)`,
            [activityId, schedule.day_of_week, schedule.start_time, schedule.end_time, schedule.venue || null]
          );
        }
      }

      return activityId;
    });

    // Get created activity
    const activities = await query(
      `SELECT a.*, d.department_name 
       FROM activities a
       LEFT JOIN departments d ON a.department_id = d.department_id
       WHERE a.activity_id = ?`,
      [result]
    );

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: activities[0]
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create activity',
      error: error.message
    });
  }
};

// Update activity
const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if activity exists
    const activities = await query(
      'SELECT * FROM activities WHERE activity_id = ?',
      [id]
    );

    if (activities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    const activity = activities[0];

    // Check permissions
    if (req.user.role !== 'admin' && activity.created_by !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own activities'
      });
    }

    // Build update query
    const allowedFields = [
      'activity_name', 'description', 'category', 'max_students', 
      'fee', 'is_paid', 'start_date', 'end_date', 'location', 'requirements'
    ];
    
    const updateFields = [];
    const values = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    await query(
      `UPDATE activities SET ${updateFields.join(', ')} WHERE activity_id = ?`,
      values
    );

    // Get updated activity
    const updatedActivities = await query(
      `SELECT a.*, d.department_name 
       FROM activities a
       LEFT JOIN departments d ON a.department_id = d.department_id
       WHERE a.activity_id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Activity updated successfully',
      data: updatedActivities[0]
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update activity',
      error: error.message
    });
  }
};

// Approve/reject activity (Admin only)
const updateActivityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const activities = await query(
      'SELECT * FROM activities WHERE activity_id = ?',
      [id]
    );

    if (activities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    await query(
      'UPDATE activities SET status = ? WHERE activity_id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: `Activity ${status} successfully`
    });
  } catch (error) {
    console.error('Update activity status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update activity status',
      error: error.message
    });
  }
};

// Delete activity
const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const activities = await query(
      'SELECT * FROM activities WHERE activity_id = ?',
      [id]
    );

    if (activities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    const activity = activities[0];

    // Check permissions
    if (req.user.role !== 'admin' && activity.created_by !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own activities'
      });
    }

    // Check if there are active enrollments
    const enrollments = await query(
      "SELECT COUNT(*) as count FROM enrollments WHERE activity_id = ? AND status IN ('approved', 'active')",
      [id]
    );

    if (enrollments[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete activity with active enrollments'
      });
    }

    await query('DELETE FROM activities WHERE activity_id = ?', [id]);

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete activity',
      error: error.message
    });
  }
};

// Get activity statistics
const getActivityStatistics = async (req, res) => {
  try {
    const { id } = req.params;

    // Get basic stats
    const stats = await query(
      `SELECT 
        COUNT(DISTINCT e.enrollment_id) as total_enrollments,
        COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.enrollment_id END) as active_enrollments,
        COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.enrollment_id END) as completed_enrollments,
        COUNT(DISTINCT a.attendance_id) as total_sessions,
        AVG(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100 as attendance_percentage,
        AVG(p.score) as average_score,
        COUNT(DISTINCT CASE WHEN p.certificate_eligible = 1 THEN p.performance_id END) as certificate_eligible_count
      FROM activities act
      LEFT JOIN enrollments e ON act.activity_id = e.activity_id
      LEFT JOIN attendance a ON e.enrollment_id = a.enrollment_id
      LEFT JOIN performance p ON e.enrollment_id = p.enrollment_id
      WHERE act.activity_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Get activity statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  updateActivityStatus,
  deleteActivity,
  getActivityStatistics
};