-- ============================================
-- School ERP - Extracurricular Activities Module
-- Database Schema
-- ============================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS ai_predictions;
DROP TABLE IF EXISTS performance;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS activity_schedule;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    role ENUM('student', 'teacher', 'admin') NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Departments Table
-- ============================================
CREATE TABLE departments (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(100) NOT NULL,
    description TEXT,
    head_teacher_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (head_teacher_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_department_name (department_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Activities Table
-- ============================================
CREATE TABLE activities (
    activity_id INT PRIMARY KEY AUTO_INCREMENT,
    department_id INT NOT NULL,
    activity_name VARCHAR(150) NOT NULL,
    description TEXT,
    category ENUM('sports', 'clubs', 'technical', 'social', 'skill_development') NOT NULL,
    max_students INT NOT NULL DEFAULT 30,
    current_enrolled INT DEFAULT 0,
    fee DECIMAL(10, 2) DEFAULT 0.00,
    is_paid BOOLEAN DEFAULT FALSE,
    created_by INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'active', 'inactive') DEFAULT 'pending',
    start_date DATE,
    end_date DATE,
    location VARCHAR(200),
    requirements TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Activity Schedule Table
-- ============================================
CREATE TABLE activity_schedule (
    schedule_id INT PRIMARY KEY AUTO_INCREMENT,
    activity_id INT NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(activity_id) ON DELETE CASCADE,
    INDEX idx_activity_id (activity_id),
    INDEX idx_day_of_week (day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Enrollments Table
-- ============================================
CREATE TABLE enrollments (
    enrollment_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    activity_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'active', 'completed', 'dropped') DEFAULT 'pending',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    approved_by INT,
    completion_date DATE,
    reason_for_rejection TEXT,
    notes TEXT,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(activity_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    UNIQUE KEY unique_enrollment (student_id, activity_id),
    INDEX idx_student_id (student_id),
    INDEX idx_activity_id (activity_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Payments Table
-- ============================================
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    enrollment_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method ENUM('cash', 'card', 'upi', 'net_banking', 'other') DEFAULT 'cash',
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP NULL,
    due_date DATE,
    receipt_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id) ON DELETE CASCADE,
    INDEX idx_enrollment_id (enrollment_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_transaction_id (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Attendance Table
-- ============================================
CREATE TABLE attendance (
    attendance_id INT PRIMARY KEY AUTO_INCREMENT,
    enrollment_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
    duration_hours DECIMAL(4, 2) DEFAULT 0.00,
    marked_by INT,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(user_id) ON DELETE SET NULL,
    UNIQUE KEY unique_attendance (enrollment_id, date),
    INDEX idx_enrollment_id (enrollment_id),
    INDEX idx_date (date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Performance Table
-- ============================================
CREATE TABLE performance (
    performance_id INT PRIMARY KEY AUTO_INCREMENT,
    enrollment_id INT NOT NULL,
    skill_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner',
    score DECIMAL(5, 2),
    max_score DECIMAL(5, 2) DEFAULT 100.00,
    evaluation_date DATE NOT NULL,
    evaluated_by INT,
    remarks TEXT,
    strengths TEXT,
    areas_for_improvement TEXT,
    certificate_eligible BOOLEAN DEFAULT FALSE,
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id) ON DELETE CASCADE,
    FOREIGN KEY (evaluated_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_enrollment_id (enrollment_id),
    INDEX idx_skill_level (skill_level),
    INDEX idx_evaluation_date (evaluation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- AI Predictions Table
-- ============================================
CREATE TABLE ai_predictions (
    prediction_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    activity_id INT,
    model_type ENUM('dropout_risk', 'performance_forecast', 'recommendation', 'clustering', 'rule_based') NOT NULL,
    prediction_result JSON NOT NULL,
    confidence_score DECIMAL(5, 4),
    risk_level ENUM('low', 'medium', 'high'),
    recommended_actions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(activity_id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_activity_id (activity_id),
    INDEX idx_model_type (model_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Notifications Table (Bonus)
-- ============================================
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('enrollment', 'payment', 'attendance', 'performance', 'ai_alert', 'general') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Triggers for automatic updates
-- ============================================

-- Update current_enrolled count when enrollment is approved
DELIMITER //
CREATE TRIGGER update_enrollment_count_insert
AFTER INSERT ON enrollments
FOR EACH ROW
BEGIN
    IF NEW.status = 'approved' OR NEW.status = 'active' THEN
        UPDATE activities 
        SET current_enrolled = current_enrolled + 1 
        WHERE activity_id = NEW.activity_id;
    END IF;
END//

CREATE TRIGGER update_enrollment_count_update
AFTER UPDATE ON enrollments
FOR EACH ROW
BEGIN
    IF OLD.status != 'approved' AND OLD.status != 'active' 
       AND (NEW.status = 'approved' OR NEW.status = 'active') THEN
        UPDATE activities 
        SET current_enrolled = current_enrolled + 1 
        WHERE activity_id = NEW.activity_id;
    ELSEIF (OLD.status = 'approved' OR OLD.status = 'active') 
           AND NEW.status != 'approved' AND NEW.status != 'active' THEN
        UPDATE activities 
        SET current_enrolled = current_enrolled - 1 
        WHERE activity_id = NEW.activity_id;
    END IF;
END//

DELIMITER ;

-- ============================================
-- Views for common queries
-- ============================================

-- Student enrollment summary
CREATE VIEW student_enrollment_summary AS
SELECT 
    u.user_id,
    u.name,
    u.email,
    COUNT(e.enrollment_id) as total_enrollments,
    SUM(CASE WHEN e.status = 'active' THEN 1 ELSE 0 END) as active_enrollments,
    SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) as completed_enrollments,
    SUM(CASE WHEN p.payment_status = 'paid' THEN p.amount ELSE 0 END) as total_paid
FROM users u
LEFT JOIN enrollments e ON u.user_id = e.student_id
LEFT JOIN payments p ON e.enrollment_id = p.enrollment_id
WHERE u.role = 'student'
GROUP BY u.user_id, u.name, u.email;

-- Activity statistics
CREATE VIEW activity_statistics AS
SELECT 
    a.activity_id,
    a.activity_name,
    a.category,
    a.max_students,
    a.current_enrolled,
    a.fee,
    d.department_name,
    COUNT(DISTINCT e.enrollment_id) as total_enrollments,
    COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.enrollment_id END) as active_students,
    AVG(perf.score) as average_score,
    COUNT(DISTINCT att.attendance_id) as total_sessions,
    AVG(CASE WHEN att.status = 'present' THEN 1 ELSE 0 END) * 100 as attendance_percentage
FROM activities a
LEFT JOIN departments d ON a.department_id = d.department_id
LEFT JOIN enrollments e ON a.activity_id = e.activity_id
LEFT JOIN performance perf ON e.enrollment_id = perf.enrollment_id
LEFT JOIN attendance att ON e.enrollment_id = att.enrollment_id
GROUP BY a.activity_id, a.activity_name, a.category, a.max_students, 
         a.current_enrolled, a.fee, d.department_name;

-- ============================================
-- Indexes for performance optimization
-- ============================================

-- Composite indexes for common queries
CREATE INDEX idx_enrollment_student_activity ON enrollments(student_id, activity_id, status);
CREATE INDEX idx_attendance_enrollment_date ON attendance(enrollment_id, date);
CREATE INDEX idx_performance_enrollment_date ON performance(enrollment_id, evaluation_date);
CREATE INDEX idx_payment_enrollment_status ON payments(enrollment_id, payment_status);

-- ============================================
-- End of Schema
-- ============================================