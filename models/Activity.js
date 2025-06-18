const pool = require('../config/db');

class Activity {
  static async create(data) {
    const { admin_id, action, entity_type, entity_id, details } = data;
    const timestamp = new Date();
    
    const [result] = await pool.query(
      'INSERT INTO activity_log (admin_id, action, entity_type, entity_id, details, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      [admin_id, action, entity_type, entity_id, details, timestamp]
    );
    
    return result.insertId;
  }

  static async getRecent(limit = 10) {
    const [rows] = await pool.query(`
      SELECT al.*, a.username as admin_username 
      FROM activity_log al
      LEFT JOIN admin a ON al.admin_id = a.id_admin
      ORDER BY al.timestamp DESC
      LIMIT ?
    `, [limit]);
    
    return rows;
  }
}

module.exports = Activity;