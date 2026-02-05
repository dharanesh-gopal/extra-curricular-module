const mysql = require('mysql2/promise');
require('dotenv').config();

// Demo mode flag
let DEMO_MODE = false;

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'school_erp',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    DEMO_MODE = false;
    return true;
  } catch (error) {
    console.warn('⚠️  Database connection failed, running in DEMO MODE');
    console.warn('   Install and configure MySQL to use full features');
    DEMO_MODE = true;
    return true; // Return true to allow server to start
  }
};

// Execute query helper
const query = async (sql, params) => {
  if (DEMO_MODE) {
    // Return demo data based on query
    const demoData = require('./demo-data');
    
    if (sql.includes('SELECT') && sql.includes('FROM users') && sql.includes('WHERE email')) {
      const email = params[0];
      const user = demoData.demoUsers.find(u => u.email === email);
      return user ? [{...user, password_hash: demoData.demoPasswordHash}] : [];
    }
    
    if (sql.includes('SELECT') && sql.includes('FROM users') && sql.includes('WHERE user_id')) {
      const userId = params[0];
      const user = demoData.demoUsers.find(u => u.user_id === userId);
      return user ? [user] : [];
    }
    
    if (sql.includes('SELECT') && sql.includes('FROM activities')) {
      return demoData.demoActivities;
    }
    
    if (sql.includes('SELECT') && sql.includes('FROM enrollments')) {
      return demoData.demoEnrollments;
    }
    
    if (sql.includes('total_enrollments')) {
      return [demoData.demoStats];
    }
    
    // Default empty response for other queries
    return [];
  }
  
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  if (DEMO_MODE) {
    // In demo mode, just execute the callback without transaction
    return await callback({ execute: async () => [{ insertId: Math.floor(Math.random() * 1000) }] });
  }
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const isDemoMode = () => DEMO_MODE;

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  isDemoMode
};