const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Log database configuration
console.log('Database configuration:');
console.log('Host:', process.env.DB_HOST || 'localhost');
console.log('Port:', process.env.DB_PORT || 3307);
console.log('User:', process.env.DB_USER || 'root');
console.log('Database:', process.env.DB_NAME || 'kantinku');

// Buat koneksi pool database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kantinku',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test koneksi
pool.getConnection()
  .then(conn => {
    console.log('✅ Terhubung ke database');
    // Test query untuk memastikan database berfungsi
    return conn.query('SHOW TABLES')
      .then(([rows]) => {
        console.log('Tables in database:', rows.map(row => Object.values(row)[0]).join(', '));
        conn.release();
      })
      .catch(err => {
        console.error('❌ Error executing test query:', err.message);
        conn.release();
      });
  })
  .catch(err => {
    console.error('❌ Gagal terhubung ke database:', err.message);
  });

module.exports = pool;