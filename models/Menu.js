const pool = require('../config/db');

class Menu {
  static async findAll() {
    const [rows] = await pool.query(`
      SELECT m.*, w.nama_warung, k.nama_kategori
      FROM menu m
      JOIN warung w ON m.id_warung = w.id_warung
      JOIN kategori k ON m.id_kategori = k.id_kategori
    `);
    return rows;
  }

static async findById(id) {
  const [rows] = await pool.query(`
    SELECT m.*, w.nama_warung, w.kontak, k.nama_kategori
    FROM menu m
    JOIN warung w ON m.id_warung = w.id_warung
    JOIN kategori k ON m.id_kategori = k.id_kategori
    WHERE m.id_menu = ?
  `, [id]);
  return rows[0];
}

  static async findByWarung(warungId) {
    const [rows] = await pool.query(`
      SELECT m.*, k.nama_kategori
      FROM menu m
      JOIN kategori k ON m.id_kategori = k.id_kategori
      WHERE m.id_warung = ?
    `, [warungId]);
    return rows;
  }

  static async findByKategori(kategoriId) {
    const [rows] = await pool.query(`
      SELECT m.*, w.nama_warung
      FROM menu m
      JOIN warung w ON m.id_warung = w.id_warung
      WHERE m.id_kategori = ?
    `, [kategoriId]);
    return rows;
  }

  static async create(menuData) {
    const { id_warung, id_kategori, nama_menu, harga, deskripsi, foto } = menuData;
    
    const [result] = await pool.query(
      'INSERT INTO menu (id_warung, id_kategori, nama_menu, harga, deskripsi, foto) VALUES (?, ?, ?, ?, ?, ?)',
      [id_warung, id_kategori, nama_menu, harga, deskripsi, foto]
    );
    
    return result.insertId;
  }

  static async update(id, menuData) {
    const { id_warung, id_kategori, nama_menu, harga, deskripsi, foto } = menuData;
    
    const [result] = await pool.query(
      'UPDATE menu SET id_warung = ?, id_kategori = ?, nama_menu = ?, harga = ?, deskripsi = ?, foto = ? WHERE id_menu = ?',
      [id_warung, id_kategori, nama_menu, harga, deskripsi, foto, id]
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM menu WHERE id_menu = ?', [id]);
    return result.affectedRows > 0;
  }

  static async findAllWithUserReviews() {
    const [rows] = await pool.query(`
      SELECT m.*, w.nama_warung, r.id_user, r.rating, r.komentar, u.nama as nama_user
      FROM menu m
      JOIN warung w ON m.id_warung = w.id_warung
      LEFT JOIN review r ON m.id_menu = r.id_menu
      LEFT JOIN user u ON r.id_user = u.id_user
      ORDER BY m.id_menu, r.id_user
    `);

    // Process results to group reviews by menu and user
    const menuMap = new Map();
    rows.forEach(row => {
      if (!menuMap.has(row.id_menu)) {
        menuMap.set(row.id_menu, {
          id_menu: row.id_menu,
          nama_menu: row.nama_menu,
          harga: row.harga,
          deskripsi: row.deskripsi,
          foto: row.foto,
          id_warung: row.id_warung,
          nama_warung: row.nama_warung,
          reviews: []
        });
      }
      if (row.id_user) {
        menuMap.get(row.id_menu).reviews.push({
          id_user: row.id_user,
          rating: row.rating,
          komentar: row.komentar,
          nama_user: row.nama_user
        });
      }
    });

    return Array.from(menuMap.values());
  }
}

module.exports = Menu;
