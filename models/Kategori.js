const pool = require('../config/db');

class Kategori {
  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM kategori');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM kategori WHERE id_kategori = ?', [id]);
    return rows[0];
  }

  static async create(nama_kategori) {
    const [result] = await pool.query(
      'INSERT INTO kategori (nama_kategori) VALUES (?)',
      [nama_kategori]
    );
    
    return result.insertId;
  }

  static async update(id, nama_kategori) {
    const [result] = await pool.query(
      'UPDATE kategori SET nama_kategori = ? WHERE id_kategori = ?',
      [nama_kategori, id]
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM kategori WHERE id_kategori = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Kategori;