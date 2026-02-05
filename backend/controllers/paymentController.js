const { query, transaction } = require('../config/database');

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const { student_id, payment_status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    // Role-based filtering
    if (req.user.role === 'student') {
      conditions.push('e.student_id = ?');
      params.push(req.user.user_id);
    } else if (student_id) {
      conditions.push('e.student_id = ?');
      params.push(student_id);
    }

    if (payment_status) {
      conditions.push('p.payment_status = ?');
      params.push(payment_status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const paymentsQuery = `
      SELECT 
        p.*,
        e.student_id,
        s.name as student_name,
        s.email as student_email,
        a.activity_name,
        a.category
      FROM payments p
      LEFT JOIN enrollments e ON p.enrollment_id = e.enrollment_id
      LEFT JOIN users s ON e.student_id = s.user_id
      LEFT JOIN activities a ON e.activity_id = a.activity_id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), offset);

    const payments = await query(paymentsQuery, params);

    res.json({
      success: true,
      data: { payments }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payments',
      error: error.message
    });
  }
};

// Create payment
const createPayment = async (req, res) => {
  try {
    const { enrollment_id, amount, payment_method, transaction_id } = req.body;

    // Verify enrollment exists and belongs to user (if student)
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

    if (req.user.role === 'student' && enrollments[0].student_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const result = await transaction(async (connection) => {
      // Create payment
      const [paymentResult] = await connection.execute(
        `INSERT INTO payments (enrollment_id, amount, payment_status, payment_method, transaction_id, payment_date, receipt_number)
         VALUES (?, ?, 'paid', ?, ?, NOW(), ?)`,
        [enrollment_id, amount, payment_method, transaction_id || null, `RCP${Date.now()}`]
      );

      // Create notification
      await connection.execute(
        `INSERT INTO notifications (user_id, title, message, type, related_id)
         VALUES (?, 'Payment Successful', ?, 'payment', ?)`,
        [enrollments[0].student_id, `Payment of ₹${amount} received successfully`, paymentResult.insertId]
      );

      return paymentResult.insertId;
    });

    const payments = await query('SELECT * FROM payments WHERE payment_id = ?', [result]);

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: payments[0]
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message
    });
  }
};

// Get payment by student
const getPaymentsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check permissions
    if (req.user.role === 'student' && req.user.user_id !== parseInt(studentId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const payments = await query(
      `SELECT 
        p.*,
        a.activity_name,
        a.category
      FROM payments p
      LEFT JOIN enrollments e ON p.enrollment_id = e.enrollment_id
      LEFT JOIN activities a ON e.activity_id = a.activity_id
      WHERE e.student_id = ?
      ORDER BY p.created_at DESC`,
      [studentId]
    );

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get payments by student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payments',
      error: error.message
    });
  }
};

module.exports = {
  getAllPayments,
  createPayment,
  getPaymentsByStudent
};