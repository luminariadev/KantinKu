const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create initial admin if none exists
const pool = require('../config/db');

const createInitialAdmin = async () => {
  try {
    // Check if any admin exists
    const [admins] = await pool.query('SELECT * FROM admin LIMIT 1');
    
    if (admins.length === 0) {
      // Create default admin
      const username = 'admin';
      const password = 'admin123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await pool.query(
        'INSERT INTO admin (username, password_hash, nama_admin) VALUES (?, ?, ?)',
        [username, hashedPassword, 'Administrator']
      );
      
      console.log('✅ Default admin account created (username: admin, password: admin123)');
    }
  } catch (error) {
    console.error('❌ Error creating initial admin:', error);
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    // Get total warung
    const [warungCount] = await pool.query('SELECT COUNT(*) as count FROM warung');
    
    // Get total menu
    const [menuCount] = await pool.query('SELECT COUNT(*) as count FROM menu');
    
    // Get total review
    const [reviewCount] = await pool.query('SELECT COUNT(*) as count FROM review');
    
    // Get total user
    const [userCount] = await pool.query('SELECT COUNT(*) as count FROM user');
    
    res.json({
      warungCount: warungCount[0].count,
      menuCount: menuCount[0].count,
      reviewCount: reviewCount[0].count,
      userCount: userCount[0].count
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ error: 'Gagal mengambil statistik dashboard' });
  }
};

module.exports = {
  createInitialAdmin,
  getDashboardStats
};