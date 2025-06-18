const pool = require('../config/db');

class Review {
  static async findAll() {
    const [rows] = await pool.query(
      "SELECT r.*, u.username, u.nama, w.nama_warung, m.nama_menu, m.id_menu " +
      "FROM review r " +
      "JOIN user u ON r.id_user = u.id_user " +
      "JOIN warung w ON r.id_warung = w.id_warung " +
      "JOIN menu m ON r.id_menu = m.id_menu " +
      "ORDER BY r.tanggal DESC"
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      "SELECT r.*, u.username, u.nama, w.nama_warung, m.nama_menu " +
      "FROM review r " +
      "JOIN user u ON r.id_user = u.id_user " +
      "JOIN warung w ON r.id_warung = w.id_warung " +
      "JOIN menu m ON r.id_menu = m.id_menu " +
      "WHERE r.id_review = ?",
      [id]
    );
    return rows[0];
  }

  static async findByMenu(menuId) {
    const [rows] = await pool.query(
      "SELECT r.*, u.username, u.nama " +
      "FROM review r " +
      "JOIN user u ON r.id_user = u.id_user " +
      "WHERE r.id_menu = ? " +
      "ORDER BY r.tanggal DESC",
      [menuId]
    );
    return rows;
  }

  static async findByUser(userId) {
    const [rows] = await pool.query(
      "SELECT r.*, w.nama_warung, m.nama_menu " +
      "FROM review r " +
      "JOIN warung w ON r.id_warung = w.id_warung " +
      "JOIN menu m ON r.id_menu = m.id_menu " +
      "WHERE r.id_user = ? " +
      "ORDER BY r.tanggal DESC",
      [userId]
    );
    return rows;
  }

  static async create(reviewData) {
    const { id_user, id_warung, id_menu, rating, komentar } = reviewData;
    
    try {
      // Check if user already reviewed this specific menu
      const [existing] = await pool.query(
        "SELECT id_review FROM review WHERE id_user = ? AND id_menu = ?",
        [id_user, id_menu]
      );
      
      if (existing.length > 0) {
        // Update existing review
        const [result] = await pool.query(
          "UPDATE review SET rating = ?, komentar = ?, tanggal = CURRENT_TIMESTAMP WHERE id_user = ? AND id_menu = ?",
          [rating, komentar, id_user, id_menu]
        );
        return existing[0].id_review;
      } else {
        // Create new review
        const [result] = await pool.query(
          "INSERT INTO review (id_user, id_warung, id_menu, rating, komentar) VALUES (?, ?, ?, ?, ?)",
          [id_user, id_warung, id_menu, rating, komentar]
        );
        return result.insertId;
      }
    } catch (error) {
      console.error('Database error in Review.create:', error);
      throw new Error('Database error: ' + error.message);
    }
  }

  static async update(id, reviewData) {
    const { rating, komentar } = reviewData;
    
    const [result] = await pool.query(
      "UPDATE review SET rating = ?, komentar = ?, tanggal = CURRENT_TIMESTAMP WHERE id_review = ?",
      [rating, komentar, id]
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query("DELETE FROM review WHERE id_review = ?", [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Review;
