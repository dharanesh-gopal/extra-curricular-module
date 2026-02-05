const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Auth validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'teacher', 'admin']).withMessage('Invalid role'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  handleValidationErrors
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Activity validation rules
const createActivityValidation = [
  body('department_id').isInt({ min: 1 }).withMessage('Valid department ID is required'),
  body('activity_name').trim().notEmpty().withMessage('Activity name is required')
    .isLength({ min: 3, max: 150 }).withMessage('Activity name must be 3-150 characters'),
  body('description').optional().trim(),
  body('category').isIn(['sports', 'clubs', 'technical', 'social', 'skill_development'])
    .withMessage('Invalid category'),
  body('max_students').isInt({ min: 1, max: 100 }).withMessage('Max students must be 1-100'),
  body('fee').isFloat({ min: 0 }).withMessage('Fee must be a positive number'),
  body('is_paid').isBoolean().withMessage('is_paid must be boolean'),
  body('start_date').optional().isISO8601().withMessage('Invalid start date'),
  body('end_date').optional().isISO8601().withMessage('Invalid end date'),
  handleValidationErrors
];

const updateActivityValidation = [
  param('id').isInt({ min: 1 }).withMessage('Valid activity ID is required'),
  body('activity_name').optional().trim().isLength({ min: 3, max: 150 }),
  body('description').optional().trim(),
  body('max_students').optional().isInt({ min: 1, max: 100 }),
  body('fee').optional().isFloat({ min: 0 }),
  handleValidationErrors
];

// Enrollment validation rules
const createEnrollmentValidation = [
  body('activity_id').isInt({ min: 1 }).withMessage('Valid activity ID is required'),
  handleValidationErrors
];

const updateEnrollmentStatusValidation = [
  param('id').isInt({ min: 1 }).withMessage('Valid enrollment ID is required'),
  body('status').isIn(['pending', 'approved', 'rejected', 'active', 'completed', 'dropped'])
    .withMessage('Invalid status'),
  body('reason_for_rejection').optional().trim(),
  handleValidationErrors
];

// Payment validation rules
const createPaymentValidation = [
  body('enrollment_id').isInt({ min: 1 }).withMessage('Valid enrollment ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('payment_method').isIn(['cash', 'card', 'upi', 'net_banking', 'other'])
    .withMessage('Invalid payment method'),
  body('transaction_id').optional().trim(),
  handleValidationErrors
];

// Attendance validation rules
const createAttendanceValidation = [
  body('enrollment_id').isInt({ min: 1 }).withMessage('Valid enrollment ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Invalid status'),
  body('duration_hours').optional().isFloat({ min: 0, max: 24 })
    .withMessage('Duration must be 0-24 hours'),
  body('remarks').optional().trim(),
  handleValidationErrors
];

// Performance validation rules
const createPerformanceValidation = [
  body('enrollment_id').isInt({ min: 1 }).withMessage('Valid enrollment ID is required'),
  body('skill_level').isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid skill level'),
  body('score').isFloat({ min: 0, max: 100 }).withMessage('Score must be 0-100'),
  body('evaluation_date').isISO8601().withMessage('Valid evaluation date is required'),
  body('remarks').optional().trim(),
  body('strengths').optional().trim(),
  body('areas_for_improvement').optional().trim(),
  handleValidationErrors
];

// Schedule validation rules
const createScheduleValidation = [
  body('activity_id').isInt({ min: 1 }).withMessage('Valid activity ID is required'),
  body('day_of_week').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day of week'),
  body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid start time format (HH:MM)'),
  body('end_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid end time format (HH:MM)'),
  body('venue').optional().trim(),
  handleValidationErrors
];

// Department validation rules
const createDepartmentValidation = [
  body('department_name').trim().notEmpty().withMessage('Department name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Department name must be 3-100 characters'),
  body('description').optional().trim(),
  body('head_teacher_id').optional().isInt({ min: 1 }).withMessage('Valid teacher ID required'),
  handleValidationErrors
];

// Query parameter validation
const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  handleValidationErrors
];

const idParamValidation = [
  param('id').isInt({ min: 1 }).withMessage('Valid ID is required'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  createActivityValidation,
  updateActivityValidation,
  createEnrollmentValidation,
  updateEnrollmentStatusValidation,
  createPaymentValidation,
  createAttendanceValidation,
  createPerformanceValidation,
  createScheduleValidation,
  createDepartmentValidation,
  paginationValidation,
  idParamValidation
};