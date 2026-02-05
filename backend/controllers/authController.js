const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, date_of_birth, gender, address } = req.body;

    // Check if user already exists
    const existingUsers = await query(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, phone, date_of_birth, gender, address) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, password_hash, role, phone || null, date_of_birth || null, gender || null, address || null]
    );

    // Generate token
    const token = generateToken(result.insertId, role);

    // Get created user (without password)
    const users = await query(
      'SELECT user_id, name, email, role, phone, date_of_birth, gender, created_at FROM users WHERE user_id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: users[0],
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { isDemoMode } = require('../config/database');

    // Get user by email
    const users = await query(
      'SELECT user_id, name, email, password_hash, role, phone, is_active FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check if account is active
    if (user.is_active === false) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.'
      });
    }

    // Verify password
    let isPasswordValid = false;
    
    if (isDemoMode()) {
      // In demo mode, accept the demo passwords
      const demoPasswords = {
        'admin@school.com': 'admin123',
        'teacher@school.com': 'teacher123',
        'student@school.com': 'student123'
      };
      isPasswordValid = demoPasswords[email] === password;
    } else {
      isPasswordValid = await bcrypt.compare(password, user.password_hash);
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.user_id, user.role);

    // Remove password from response
    delete user.password_hash;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const users = await query(
      `SELECT user_id, name, email, role, phone, date_of_birth, gender, 
              address, profile_image, created_at, updated_at 
       FROM users WHERE user_id = ?`,
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, date_of_birth, gender, address } = req.body;
    const userId = req.user.user_id;

    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (phone) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (date_of_birth) {
      updates.push('date_of_birth = ?');
      values.push(date_of_birth);
    }
    if (gender) {
      updates.push('gender = ?');
      values.push(gender);
    }
    if (address) {
      updates.push('address = ?');
      values.push(address);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(userId);

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`,
      values
    );

    // Get updated user
    const users = await query(
      `SELECT user_id, name, email, role, phone, date_of_birth, gender, 
              address, profile_image, created_at, updated_at 
       FROM users WHERE user_id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: users[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.user_id;

    // Get current password hash
    const users = await query(
      'SELECT password_hash FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [newPasswordHash, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// Verify token (for frontend to check if token is still valid)
const verifyToken = async (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user
    }
  });
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  verifyToken
};