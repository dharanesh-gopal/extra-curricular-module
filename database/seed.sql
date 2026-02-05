-- ============================================
-- School ERP - Sample Data
-- ============================================

-- Insert sample users (passwords are hashed for 'admin123', 'teacher123', 'student123')
-- Note: In production, use bcrypt with proper salt rounds
INSERT INTO users (role, name, email, phone, password_hash, date_of_birth, gender, address) VALUES
-- Admin
('admin', 'John Administrator', 'admin@school.com', '9876543210', '$2b$10$rKvVLZ8JxH7VnA5YhJ5pXeqGqJ5YhJ5pXeqGqJ5YhJ5pXeqGqJ5Yh', '1985-05-15', 'male', '123 Admin Street, City'),

-- Teachers
('teacher', 'Sarah Johnson', 'teacher@school.com', '9876543211', '$2b$10$rKvVLZ8JxH7VnA5YhJ5pXeqGqJ5YhJ5pXeqGqJ5YhJ5pXeqGqJ5Yh', '1988-08-20', 'female', '456 Teacher Lane, City'),
('teacher', 'Michael Chen', 'michael.chen@school.com', '9876543212', '$2b$10$rKvVLZ8JxH7VnA5YhJ5pXeqGqJ5YhJ5pXeqGqJ5YhJ5pXeqGqJ5Yh', '1990-03-12', 'male', '789 Coach Road, City'),
('teacher', 'Emily Rodriguez', 'emily.rodriguez@school.com', '9876543213', '$2b$10$rKvVLZ8JxH7VnA5YhJ5pXeqGqJ5YhJ5pXeqGqJ5YhJ5pXeqGqJ5Yh', '1987-11-25', 'female', '321 Mentor Ave, City'),

-- Students
('student', 'Alex Kumar', 'student@school.com', '9876543214', '$2b$10$rKvVLZ8JxH7VnA5YhJ5pXeqGqJ5YhJ5pXeqGqJ5YhJ5pXeqGqJ5Yh', '2008-01-10', 'male', '111 Student St, City'),
('student', 'Emma Wilson', 'emma.wilson@school.com', '9876543215', '$2b$10$rKvVLZ8JxH7VnA5YhJ5pXeqGqJ5YhJ5pXeqGqJ5YhJ5pXeqGqJ5Yh', '2008-04-22', 'female', '222 Scholar Rd, City'),
('student', 'Raj Patel', 'raj.patel@school.com', '9876543216', '$2b$10$rKvVLZ8JxH7VnA5YhJ5pXeqGqJ5YhJ5pXeqGqJ5YhJ5pXeqGqJ5Yh', '2007-09-15', 'male', '333 Learner Ln, City'),
('student', 'Sophia Lee', 'sophia.lee@school.com', '9876543217', '$2b$10$rKvVLZ8JxH7VnA5YhJ5pXeqGqJ5YhJ5pXeqGqJ5YhJ5pXeqGqJ5Yh', '2008-06-30', 'female', '444 Academy Ave, City'),
('student', 'David Brown', 'david.brown@school.com', '9876543218', '$2b$10$rKvVLZ8JxH7VnA5YhJ5pXeqGqJ5YhJ5pXeqGqJ5YhJ5pXeqGqJ5Yh', '2007-12-05', 'male', '555 Education St, City'),
('student', 'Olivia Martinez', 'olivia.martinez@school.com', '9876543219', '$2b$10$rKvVLZ8JxH7VnA5YhJ5pXeqGqJ5YhJ5pXeqGqJ5YhJ5pXeqGqJ5Yh', '2008-03-18', 'female', '666 Knowledge Rd, City');

-- Insert departments
INSERT INTO departments (department_name, description, head_teacher_id) VALUES
('Sports Department', 'Physical education and sports activities', 2),
('Arts & Culture', 'Creative and cultural activities', 3),
('Technology Club', 'Technical and innovation activities', 4),
('Social Service', 'Community service and social activities', 2);

-- Insert activities
INSERT INTO activities (department_id, activity_name, description, category, max_students, fee, is_paid, created_by, status, start_date, end_date, location) VALUES
-- Sports
(1, 'Basketball Team', 'Competitive basketball training and tournaments', 'sports', 15, 500.00, TRUE, 2, 'approved', '2026-02-01', '2026-06-30', 'Main Sports Complex'),
(1, 'Swimming Club', 'Learn swimming techniques and water safety', 'sports', 20, 800.00, TRUE, 2, 'approved', '2026-02-01', '2026-06-30', 'School Pool'),
(1, 'Yoga & Fitness', 'Yoga, meditation, and fitness training', 'sports', 30, 300.00, TRUE, 3, 'approved', '2026-02-01', '2026-12-31', 'Yoga Hall'),

-- Clubs
(2, 'Drama Club', 'Theater, acting, and stage performance', 'clubs', 25, 400.00, TRUE, 3, 'approved', '2026-02-01', '2026-12-31', 'Auditorium'),
(2, 'Music Band', 'Learn instruments and perform in band', 'clubs', 20, 600.00, TRUE, 3, 'approved', '2026-02-01', '2026-12-31', 'Music Room'),
(2, 'Art & Painting', 'Drawing, painting, and creative arts', 'clubs', 25, 350.00, TRUE, 4, 'approved', '2026-02-01', '2026-12-31', 'Art Studio'),

-- Technical
(3, 'Robotics Club', 'Build and program robots', 'technical', 15, 1000.00, TRUE, 4, 'approved', '2026-02-01', '2026-12-31', 'Tech Lab'),
(3, 'Coding Bootcamp', 'Learn programming and software development', 'technical', 30, 700.00, TRUE, 4, 'approved', '2026-02-01', '2026-12-31', 'Computer Lab'),
(3, 'Science Club', 'Experiments and scientific exploration', 'technical', 25, 450.00, TRUE, 2, 'approved', '2026-02-01', '2026-12-31', 'Science Lab'),

-- Social
(4, 'Community Service', 'Volunteer and help the community', 'social', 40, 0.00, FALSE, 2, 'approved', '2026-02-01', '2026-12-31', 'Various Locations'),
(4, 'Environmental Club', 'Environmental awareness and conservation', 'social', 35, 200.00, TRUE, 3, 'approved', '2026-02-01', '2026-12-31', 'School Campus'),

-- Skill Development
(3, 'Public Speaking', 'Develop communication and presentation skills', 'skill_development', 20, 500.00, TRUE, 3, 'approved', '2026-02-01', '2026-06-30', 'Conference Room'),
(2, 'Photography Club', 'Learn photography techniques and editing', 'skill_development', 18, 550.00, TRUE, 4, 'approved', '2026-02-01', '2026-12-31', 'Media Room');

-- Insert activity schedules
INSERT INTO activity_schedule (activity_id, day_of_week, start_time, end_time, venue) VALUES
-- Basketball (Mon, Wed, Fri)
(1, 'monday', '16:00:00', '18:00:00', 'Basketball Court'),
(1, 'wednesday', '16:00:00', '18:00:00', 'Basketball Court'),
(1, 'friday', '16:00:00', '18:00:00', 'Basketball Court'),

-- Swimming (Tue, Thu)
(2, 'tuesday', '15:30:00', '17:00:00', 'Swimming Pool'),
(2, 'thursday', '15:30:00', '17:00:00', 'Swimming Pool'),

-- Yoga (Mon, Wed, Fri)
(3, 'monday', '07:00:00', '08:00:00', 'Yoga Hall'),
(3, 'wednesday', '07:00:00', '08:00:00', 'Yoga Hall'),
(3, 'friday', '07:00:00', '08:00:00', 'Yoga Hall'),

-- Drama (Tue, Thu)
(4, 'tuesday', '16:00:00', '18:00:00', 'Auditorium'),
(4, 'thursday', '16:00:00', '18:00:00', 'Auditorium'),

-- Music (Wed, Sat)
(5, 'wednesday', '15:00:00', '17:00:00', 'Music Room'),
(5, 'saturday', '10:00:00', '12:00:00', 'Music Room'),

-- Art (Mon, Fri)
(6, 'monday', '15:30:00', '17:30:00', 'Art Studio'),
(6, 'friday', '15:30:00', '17:30:00', 'Art Studio'),

-- Robotics (Tue, Thu, Sat)
(7, 'tuesday', '16:00:00', '18:00:00', 'Tech Lab'),
(7, 'thursday', '16:00:00', '18:00:00', 'Tech Lab'),
(7, 'saturday', '14:00:00', '16:00:00', 'Tech Lab'),

-- Coding (Mon, Wed, Fri)
(8, 'monday', '16:00:00', '18:00:00', 'Computer Lab'),
(8, 'wednesday', '16:00:00', '18:00:00', 'Computer Lab'),
(8, 'friday', '16:00:00', '18:00:00', 'Computer Lab'),

-- Science (Wed)
(9, 'wednesday', '15:00:00', '17:00:00', 'Science Lab'),

-- Community Service (Saturday)
(10, 'saturday', '09:00:00', '12:00:00', 'Various'),

-- Environmental (Friday)
(11, 'friday', '15:00:00', '17:00:00', 'Campus'),

-- Public Speaking (Thu)
(12, 'thursday', '16:00:00', '18:00:00', 'Conference Room'),

-- Photography (Sat)
(13, 'saturday', '10:00:00', '13:00:00', 'Media Room');

-- Insert enrollments
INSERT INTO enrollments (student_id, activity_id, status, approved_by, approved_at) VALUES
-- Alex Kumar (student_id: 5)
(5, 1, 'active', 2, NOW()), -- Basketball
(5, 8, 'active', 4, NOW()), -- Coding
(5, 10, 'active', 2, NOW()), -- Community Service

-- Emma Wilson (student_id: 6)
(6, 4, 'active', 3, NOW()), -- Drama
(6, 5, 'active', 3, NOW()), -- Music
(6, 13, 'active', 4, NOW()), -- Photography

-- Raj Patel (student_id: 7)
(7, 7, 'active', 4, NOW()), -- Robotics
(7, 8, 'active', 4, NOW()), -- Coding
(7, 9, 'active', 2, NOW()), -- Science

-- Sophia Lee (student_id: 8)
(8, 2, 'active', 2, NOW()), -- Swimming
(8, 6, 'active', 4, NOW()), -- Art
(8, 11, 'active', 3, NOW()), -- Environmental

-- David Brown (student_id: 9)
(9, 1, 'active', 2, NOW()), -- Basketball
(9, 7, 'active', 4, NOW()), -- Robotics
(9, 12, 'active', 3, NOW()), -- Public Speaking

-- Olivia Martinez (student_id: 10)
(10, 3, 'active', 3, NOW()), -- Yoga
(10, 4, 'active', 3, NOW()), -- Drama
(10, 10, 'active', 2, NOW()); -- Community Service

-- Insert payments
INSERT INTO payments (enrollment_id, amount, payment_status, payment_method, transaction_id, payment_date, receipt_number) VALUES
(1, 500.00, 'paid', 'upi', 'TXN001234567', NOW(), 'RCP001'),
(2, 700.00, 'paid', 'card', 'TXN001234568', NOW(), 'RCP002'),
(3, 0.00, 'paid', 'cash', NULL, NOW(), 'RCP003'),
(4, 400.00, 'paid', 'upi', 'TXN001234569', NOW(), 'RCP004'),
(5, 600.00, 'paid', 'net_banking', 'TXN001234570', NOW(), 'RCP005'),
(6, 550.00, 'paid', 'card', 'TXN001234571', NOW(), 'RCP006'),
(7, 1000.00, 'paid', 'upi', 'TXN001234572', NOW(), 'RCP007'),
(8, 700.00, 'paid', 'card', 'TXN001234573', NOW(), 'RCP008'),
(9, 450.00, 'paid', 'cash', NULL, NOW(), 'RCP009'),
(10, 800.00, 'paid', 'upi', 'TXN001234574', NOW(), 'RCP010'),
(11, 350.00, 'paid', 'card', 'TXN001234575', NOW(), 'RCP011'),
(12, 200.00, 'paid', 'cash', NULL, NOW(), 'RCP012'),
(13, 500.00, 'paid', 'upi', 'TXN001234576', NOW(), 'RCP013'),
(14, 1000.00, 'paid', 'net_banking', 'TXN001234577', NOW(), 'RCP014'),
(15, 500.00, 'paid', 'card', 'TXN001234578', NOW(), 'RCP015'),
(16, 300.00, 'paid', 'upi', 'TXN001234579', NOW(), 'RCP016'),
(17, 400.00, 'paid', 'cash', NULL, NOW(), 'RCP017'),
(18, 0.00, 'paid', 'cash', NULL, NOW(), 'RCP018');

-- Insert attendance records (last 10 sessions)
INSERT INTO attendance (enrollment_id, date, status, duration_hours, marked_by) VALUES
-- Alex Kumar - Basketball
(1, '2026-01-13', 'present', 2.0, 2),
(1, '2026-01-15', 'present', 2.0, 2),
(1, '2026-01-17', 'present', 2.0, 2),
(1, '2026-01-20', 'absent', 0.0, 2),
(1, '2026-01-22', 'present', 2.0, 2),

-- Emma Wilson - Drama
(4, '2026-01-14', 'present', 2.0, 3),
(4, '2026-01-16', 'present', 2.0, 3),
(4, '2026-01-21', 'present', 2.0, 3),

-- Raj Patel - Robotics
(7, '2026-01-14', 'present', 2.0, 4),
(7, '2026-01-16', 'present', 2.0, 4),
(7, '2026-01-18', 'present', 2.0, 4),
(7, '2026-01-21', 'late', 1.5, 4),

-- Sophia Lee - Swimming
(10, '2026-01-14', 'present', 1.5, 2),
(10, '2026-01-16', 'present', 1.5, 2),
(10, '2026-01-21', 'present', 1.5, 2),

-- David Brown - Basketball
(13, '2026-01-13', 'present', 2.0, 2),
(13, '2026-01-15', 'present', 2.0, 2),
(13, '2026-01-17', 'absent', 0.0, 2),
(13, '2026-01-20', 'present', 2.0, 2),
(13, '2026-01-22', 'present', 2.0, 2);

-- Insert performance records
INSERT INTO performance (enrollment_id, skill_level, score, evaluation_date, evaluated_by, remarks, certificate_eligible) VALUES
(1, 'intermediate', 78.5, '2026-01-20', 2, 'Good progress in dribbling and shooting', TRUE),
(2, 'advanced', 88.0, '2026-01-20', 4, 'Excellent problem-solving skills', TRUE),
(4, 'intermediate', 82.0, '2026-01-19', 3, 'Great stage presence and expression', TRUE),
(5, 'advanced', 90.5, '2026-01-19', 3, 'Outstanding musical talent', TRUE),
(7, 'advanced', 92.0, '2026-01-18', 4, 'Exceptional robotics skills', TRUE),
(8, 'intermediate', 85.0, '2026-01-18', 4, 'Strong coding fundamentals', TRUE),
(10, 'beginner', 72.0, '2026-01-17', 2, 'Good improvement in swimming techniques', FALSE),
(13, 'intermediate', 80.0, '2026-01-20', 2, 'Consistent performance and teamwork', TRUE);

-- Insert sample AI predictions
INSERT INTO ai_predictions (student_id, activity_id, model_type, prediction_result, confidence_score, risk_level, recommended_actions) VALUES
(5, 1, 'dropout_risk', '{"risk_score": 0.25, "factors": ["good_attendance", "improving_performance"]}', 0.8500, 'low', 'Continue current engagement level'),
(7, 7, 'performance_forecast', '{"predicted_score": 95.5, "trend": "improving", "next_evaluation": "2026-02-15"}', 0.9200, NULL, 'Encourage participation in competitions'),
(6, 4, 'dropout_risk', '{"risk_score": 0.15, "factors": ["excellent_attendance", "high_engagement"]}', 0.9100, 'low', 'Maintain current support'),
(9, 1, 'dropout_risk', '{"risk_score": 0.45, "factors": ["irregular_attendance", "average_performance"]}', 0.7800, 'medium', 'Schedule counseling session, monitor attendance'),
(8, 2, 'performance_forecast', '{"predicted_score": 78.0, "trend": "stable", "next_evaluation": "2026-02-10"}', 0.8300, NULL, 'Provide additional practice sessions');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, related_id) VALUES
(5, 'Enrollment Approved', 'Your enrollment in Basketball Team has been approved!', 'enrollment', 1),
(5, 'Payment Successful', 'Payment of ₹500 received for Basketball Team', 'payment', 1),
(6, 'Performance Evaluation', 'Your Drama Club performance has been evaluated. Score: 82/100', 'performance', 4),
(7, 'AI Alert', 'Great progress! You are predicted to score 95+ in your next robotics evaluation', 'ai_alert', 7),
(9, 'Attendance Alert', 'Your attendance in Basketball is below 80%. Please improve.', 'attendance', 13);

-- ============================================
-- Summary Statistics
-- ============================================

SELECT 'Database seeded successfully!' as Status;

SELECT 
    'Users' as Table_Name, 
    COUNT(*) as Record_Count 
FROM users
UNION ALL
SELECT 'Departments', COUNT(*) FROM departments
UNION ALL
SELECT 'Activities', COUNT(*) FROM activities
UNION ALL
SELECT 'Enrollments', COUNT(*) FROM enrollments
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments
UNION ALL
SELECT 'Attendance', COUNT(*) FROM attendance
UNION ALL
SELECT 'Performance', COUNT(*) FROM performance
UNION ALL
SELECT 'AI Predictions', COUNT(*) FROM ai_predictions
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications;