// Demo data for running without database
const bcrypt = require('bcrypt');

// In-memory storage for demo mode
let enrollmentCounter = 3;
let paymentCounter = 3;
let attendanceCounter = 1;
let performanceCounter = 1;

const demoUsers = [
  {
    user_id: 1,
    role: 'admin',
    name: 'John Administrator',
    email: 'admin@school.com',
    phone: '9876543210',
    is_active: true
  },
  {
    user_id: 2,
    role: 'teacher',
    name: 'Sarah Johnson',
    email: 'teacher@school.com',
    phone: '9876543211',
    is_active: true
  },
  {
    user_id: 3,
    role: 'student',
    name: 'Alex Kumar',
    email: 'student@school.com',
    phone: '9876543214',
    is_active: true
  }
];

const demoActivities = [
  {
    activity_id: 1,
    department_id: 1,
    activity_name: 'Basketball Team',
    description: 'Competitive basketball training and tournaments',
    category: 'sports',
    max_students: 15,
    current_enrolled: 5,
    fee: 500.00,
    is_paid: true,
    status: 'approved',
    department_name: 'Sports Department',
    location: 'Main Sports Complex'
  },
  {
    activity_id: 2,
    department_id: 2,
    activity_name: 'Drama Club',
    description: 'Theater, acting, and stage performance',
    category: 'clubs',
    max_students: 25,
    current_enrolled: 12,
    fee: 400.00,
    is_paid: true,
    status: 'approved',
    department_name: 'Arts & Culture',
    location: 'Auditorium'
  },
  {
    activity_id: 3,
    department_id: 3,
    activity_name: 'Robotics Club',
    description: 'Build and program robots',
    category: 'technical',
    max_students: 15,
    current_enrolled: 8,
    fee: 1000.00,
    is_paid: true,
    status: 'approved',
    department_name: 'Technology Club',
    location: 'Tech Lab'
  },
  {
    activity_id: 4,
    department_id: 1,
    activity_name: 'Yoga & Fitness',
    description: 'Yoga, meditation, and fitness training',
    category: 'sports',
    max_students: 30,
    current_enrolled: 20,
    fee: 300.00,
    is_paid: true,
    status: 'approved',
    department_name: 'Sports Department',
    location: 'Yoga Hall'
  },
  {
    activity_id: 5,
    department_id: 2,
    activity_name: 'Music Band',
    description: 'Learn instruments and perform in band',
    category: 'clubs',
    max_students: 20,
    current_enrolled: 15,
    fee: 600.00,
    is_paid: true,
    status: 'approved',
    department_name: 'Arts & Culture',
    location: 'Music Room'
  },
  {
    activity_id: 6,
    department_id: 3,
    activity_name: 'Coding Bootcamp',
    description: 'Learn programming and software development',
    category: 'technical',
    max_students: 30,
    current_enrolled: 22,
    fee: 700.00,
    is_paid: true,
    status: 'approved',
    department_name: 'Technology Club',
    location: 'Computer Lab'
  }
];

const demoEnrollments = [
  {
    enrollment_id: 1,
    student_id: 3,
    activity_id: 1,
    status: 'active',
    enrolled_at: new Date()
  },
  {
    enrollment_id: 2,
    student_id: 3,
    activity_id: 3,
    status: 'active',
    enrolled_at: new Date()
  }
];

const demoStats = {
  total_enrollments: 2,
  active_enrollments: 2,
  completed_enrollments: 0,
  total_paid: 1500,
  pending_payments: 0
};

// Functions to manage demo data
const addEnrollment = (student_id, activity_id) => {
  enrollmentCounter++;
  const newEnrollment = {
    enrollment_id: enrollmentCounter,
    student_id,
    activity_id,
    status: 'pending',
    enrolled_at: new Date()
  };
  demoEnrollments.push(newEnrollment);
  return newEnrollment;
};

const getEnrollmentsByStudent = (student_id) => {
  return demoEnrollments.filter(e => e.student_id === student_id);
};

const checkExistingEnrollment = (student_id, activity_id) => {
  return demoEnrollments.find(e => e.student_id === student_id && e.activity_id === activity_id);
};

module.exports = {
  demoUsers,
  demoActivities,
  demoEnrollments,
  demoStats,
  // Demo password hash for 'admin123', 'teacher123', 'student123'
  demoPasswordHash: '$2b$10$rKvVLZ8JxH7VnA5YhJ5pXeqGqJ5YhJ5pXeqGqJ5YhJ5pXeqGqJ5Yh',
  // Functions
  addEnrollment,
  getEnrollmentsByStudent,
  checkExistingEnrollment,
  enrollmentCounter: () => enrollmentCounter
};