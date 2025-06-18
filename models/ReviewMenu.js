const pool = require('../config/db');

class ReviewMenu {
  static async findAll() {
    const [rows] = await pool.query(`
      SELECT rm.*, u.username, u.nama, w.nama_warung, m.nama_menu, m.id_menu
      FROM review_menu rm
      JOIN user u ON rm.id_user = u.id_user
      JOIN menu m ON rm.id_menu = m.id_menu
      JOIN warung w ON m.id_warung = w.id_warung
      ORDER BY rm.tanggal DESC
    `);
    return rows;
  }

  static async findByMenu(menuId) {
    const [rows] = await pool.query(`
      SELECT rm.*, u.username, u.nama
      FROM review_menu rm
      JOIN user u ON rm.id_user = u.id_user
      WHERE rm.id_menu = ?
      ORDER BY rm.tanggal DESC
    `, [menuId]);
    return rows;
  }

  static async findByUser(userId) {
    const [rows] = await pool.query(`
      SELECT rm.*, w.nama_warung, m.nama_menu
      FROM review_menu rm
      JOIN menu m ON rm.id_menu = m.id_menu
      JOIN warung w ON m.id_warung = w.id_warung
      WHERE rm.id_user = ?
      ORDER BY rm.tanggal DESC
    `, [userId]);
    return rows;
  }

  static async create(reviewData) {
    const { id_user, id_menu, rating, komentar } = reviewData;
    
    try {
      // Check if user already reviewed this specific menu
      const [existing] = await pool.query(
        'SELECT id FROM review_menu WHERE id_user = ? AND id_menu = ?',
        [id_user, id_menu]
      );
      
      if (existing.length > 0) {
        // Update existing review
        const [result] = await pool.query(
          'UPDATE review_menu SET rating = ?, komentar = ?, tanggal = CURRENT_TIMESTAMP WHERE id_user = ? AND id_menu = ?',
          [rating, komentar, id_user, id_menu]
        );
        return existing[0].id;
      } else {
        // Create new review
        const [result] = await pool.query(
          'INSERT INTO review_menu (id_user, id_menu, rating, komentar) VALUES (?, ?, ?, ?)',
          [id_user, id_menu, rating, komentar]
        );
        return result.insertId;
      }
    } catch (error) {
      console.error('Database error in ReviewMenu.create:', error);
      throw new Error('Database error: ' + error.message);
    }
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM review_menu WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ReviewMenu;