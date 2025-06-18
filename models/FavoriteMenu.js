const pool = require('../config/db');

class FavoriteMenu {
  static async findByUser(userId) {
    const [rows] = await pool.query(`
      SELECT f.*, m.nama_menu, m.harga, m.foto, w.nama_warung
      FROM favorite_menu f
      JOIN menu m ON f.id_menu = m.id_menu
      JOIN warung w ON m.id_warung = w.id_warung
      WHERE f.id_user = ?
    `, [userId]);
    return rows;
  }

  static async isFavorite(userId, menuId) {
    const [rows] = await pool.query(
      'SELECT * FROM favorite_menu WHERE id_user = ? AND id_menu = ?',
      [userId, menuId]
    );
    return rows.length > 0;
  }

  static async add(userId, menuId) {
    try {
      // Delete first to ensure no duplicates
      await pool.query(
        'DELETE FROM favorite_menu WHERE id_user = ? AND id_menu = ?',
        [userId, menuId]
      );
      
      // Then insert
      const [result] = await pool.query(
        'INSERT INTO favorite_menu (id_user, id_menu) VALUES (?, ?)',
        [userId, menuId]
      );
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return null;
      }
      throw error;
    }
  }

  static async remove(userId, menuId) {
    const [result] = await pool.query(
      'DELETE FROM favorite_menu WHERE id_user = ? AND id_menu = ?',
      [userId, menuId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = FavoriteMenu;