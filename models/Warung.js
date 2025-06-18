const pool = require('../config/db');

class Warung {
  static async findAll() {
    const [rows] = await pool.query(`
      SELECT w.*, 
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(r.id_review) as total_reviews
      FROM warung w
      LEFT JOIN review r ON w.id_warung = r.id_warung
      GROUP BY w.id_warung
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT w.*, 
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(r.id_review) as total_reviews
      FROM warung w
      LEFT JOIN review r ON w.id_warung = r.id_warung
      WHERE w.id_warung = ?
      GROUP BY w.id_warung
    `, [id]);
    return rows[0];
  }

  static async create(warungData) {
    const { nama_warung, lokasi, deskripsi, kontak, foto } = warungData;
    
    const [result] = await pool.query(
      'INSERT INTO warung (nama_warung, lokasi, deskripsi, kontak, foto) VALUES (?, ?, ?, ?, ?)',
      [nama_warung, lokasi, deskripsi, kontak, foto]
    );
    
    return result.insertId;
  }

  static async update(id, warungData) {
    const { nama_warung, lokasi, deskripsi, kontak, foto } = warungData;
    
    const [result] = await pool.query(
      'UPDATE warung SET nama_warung = ?, lokasi = ?, deskripsi = ?, kontak = ?, foto = ? WHERE id_warung = ?',
      [nama_warung, lokasi, deskripsi, kontak, foto, id]
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM warung WHERE id_warung = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Warung;