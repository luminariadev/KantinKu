const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async findById(id) {
    try {
      console.log('Finding user by ID:', id);
      const [rows] = await pool.query('SELECT * FROM user WHERE id_user = ?', [id]);
      console.log('User found by ID:', rows[0] || 'Not found');
      return rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      console.log('Finding user by username:', username);
      const [rows] = await pool.query('SELECT * FROM user WHERE username = ?', [username]);
      console.log('User found by username:', rows[0] || 'Not found');
      return rows[0];
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      console.log('Finding user by email:', email);
      const [rows] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
      console.log('User found by email:', rows[0] || 'Not found');
      return rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      console.log('Creating new user:', userData.username);
      const { username, email, password, nama } = userData;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await pool.query(
        'INSERT INTO user (username, email, password_hash, nama) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, nama]
      );
      
      console.log('User created with ID:', result.insertId);
      return result.insertId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async verifyPassword(user, password) {
    try {
      console.log('Verifying password for user:', user.username);
      const result = await bcrypt.compare(password, user.password_hash);
      console.log('Password verification result:', result);
      return result;
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }
}

module.exports = User;