const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class Admin {
  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM admin WHERE id_admin = ?', [id]);
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM admin WHERE username = ?', [username]);
    return rows[0];
  }

  static async create(adminData) {
    const { username, password, nama_admin } = adminData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      'INSERT INTO admin (username, password_hash, nama_admin) VALUES (?, ?, ?)',
      [username, hashedPassword, nama_admin]
    );
    
    return result.insertId;
  }

  static async verifyPassword(admin, password) {
    return await bcrypt.compare(password, admin.password_hash);
  }
}

module.exports = Admin;