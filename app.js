// Import modules
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer'); // Tambahkan nodemailer

// Create Express app
const app = express();
const PORT = process.env.PORT || 3300;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const menuRoutes = require('./routes/menu');
const reviewRoutes = require('./routes/review');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const warungRoutes = require('./routes/warung');

// Use routes
app.use('/api/menu', menuRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/warung', warungRoutes);

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kantinku'
});

// Connect to database
db.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Middleware untuk verifikasi token user
const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Akses ditolak, token tidak ditemukan' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token tidak valid' });
  }
};

// Middleware untuk verifikasi token admin
const verifyAdminToken = (req, res, next) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ error: 'Akses ditolak, token tidak ditemukan' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verifikasi apakah user adalah admin
    const query = 'SELECT * FROM admin WHERE id_admin = ?';
    db.query(query, [decoded.id], (err, results) => {
      if (err || results.length === 0) {
        return res.status(401).json({ error: 'Akses ditolak, bukan admin' });
      }
      
      req.admin = decoded;
      next();
    });
  } catch (error) {
    res.status(401).json({ error: 'Token tidak valid' });
  }
};

// Konfigurasi penyimpanan multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
  }
});

const upload = multer({ storage: storage });

// Tambahkan endpoint untuk upload gambar
app.post('/api/admin/upload', verifyAdminToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// API endpoint untuk mendapatkan semua kategori
app.get('/api/kategori', (req, res) => {
  const query = 'SELECT * FROM kategori';
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// API endpoint untuk mendapatkan semua warung
app.get('/api/warung', (req, res) => {
  const query = 'SELECT * FROM warung';
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// API endpoint untuk menambah menu (admin)
app.post('/api/admin/menu', verifyAdminToken, upload.single('foto'), (req, res) => {
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  
  const { nama_menu, harga, deskripsi, id_kategori, id_warung } = req.body;
  let foto = null;
  
  if (req.file) {
    foto = `/uploads/${req.file.filename}`;
  }
  
  if (!nama_menu || !harga || !id_kategori || !id_warung) {
    return res.status(400).json({ error: 'Nama menu, harga, kategori, dan warung diperlukan' });
  }
  
  const query = 'INSERT INTO menu (nama_menu, harga, deskripsi, id_kategori, id_warung, foto) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.query(query, [nama_menu, harga, deskripsi, id_kategori, id_warung, foto], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const activityQuery = 'INSERT INTO activity_log (admin_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)';
    const details = `Menambahkan menu baru: ${nama_menu}`;
    
    db.query(activityQuery, [req.admin.id, 'create', 'menu', result.insertId, details], (actErr) => {
      if (actErr) {
        console.error('Error logging activity:', actErr);
      }
    });
    
    res.status(201).json({
      message: 'Menu berhasil ditambahkan',
      menuId: result.insertId
    });
  });
});

// API endpoint untuk mengupdate menu (admin)
app.put('/api/admin/menu/:id', verifyAdminToken, upload.single('foto'), (req, res) => {
  const menuId = req.params.id;
  const { nama_menu, harga, deskripsi, id_kategori, id_warung } = req.body;
  let foto = req.body.foto;
  
  if (req.file) {
    foto = `/uploads/${req.file.filename}`;
  }
  
  if (!nama_menu || !harga || !id_kategori || !id_warung) {
    return res.status(400).json({ error: 'Nama menu, harga, kategori, dan warung diperlukan' });
  }
  
  const query = 'UPDATE menu SET nama_menu = ?, harga = ?, deskripsi = ?, id_kategori = ?, id_warung = ?, foto = ? WHERE id_menu = ?';
  
  db.query(query, [nama_menu, harga, deskripsi, id_kategori, id_warung, foto, menuId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Menu tidak ditemukan' });
    }
    
    const activityQuery = 'INSERT INTO activity_log (admin_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)';
    const details = `Mengubah menu: ${nama_menu}`;
    
    db.query(activityQuery, [req.admin.id, 'update', 'menu', menuId, details], (actErr) => {
      if (actErr) {
        console.error('Error logging activity:', actErr);
      }
    });
    
    res.json({
      message: 'Menu berhasil diupdate'
    });
  });
});

// API endpoint untuk menghapus menu (admin)
app.delete('/api/admin/menu/:id', verifyAdminToken, (req, res) => {
  const menuId = req.params.id;
  
  db.query('SELECT nama_menu FROM menu WHERE id_menu = ?', [menuId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Menu tidak ditemukan' });
    }
    
    const menuName = results[0].nama_menu;
    
    const query = 'DELETE FROM menu WHERE id_menu = ?';
    db.query(query, [menuId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const activityQuery = 'INSERT INTO activity_log (admin_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)';
      const details = `Menghapus menu: ${menuName}`;
      
      db.query(activityQuery, [req.admin.id, 'delete', 'menu', menuId, details], (actErr) => {
        if (actErr) {
          console.error('Error logging activity:', actErr);
        }
      });
      
      res.json({
        message: 'Menu berhasil dihapus'
      });
    });
  });
});

// API endpoint untuk menambah warung (admin)
app.post('/api/admin/warung', verifyAdminToken, upload.single('foto'), (req, res) => {
  console.log('Warung request body:', req.body);
  console.log('Warung request file:', req.file);
  
  const { nama_warung, lokasi, kontak, deskripsi } = req.body;
  let foto = null;
  
  if (req.file) {
    foto = `/uploads/${req.file.filename}`;
  }
  
  if (!nama_warung || !lokasi) {
    return res.status(400).json({ error: 'Nama warung dan lokasi diperlukan' });
  }
  
  const query = 'INSERT INTO warung (nama_warung, lokasi, kontak, deskripsi, foto) VALUES (?, ?, ?, ?, ?)';
  
  db.query(query, [nama_warung, lokasi, kontak, deskripsi, foto], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const activityQuery = 'INSERT INTO activity_log (admin_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)';
    const details = `Menambahkan warung baru: ${nama_warung}`;
    
    db.query(activityQuery, [req.admin.id, 'create', 'warung', result.insertId, details], (actErr) => {
      if (actErr) {
        console.error('Error logging activity:', actErr);
      }
    });
    
    res.status(201).json({
      message: 'Warung berhasil ditambahkan',
      warungId: result.insertId
    });
  });
});

// API endpoint untuk mengupdate warung (admin)
app.put('/api/admin/warung/:id', verifyAdminToken, upload.single('foto'), (req, res) => {
  const warungId = req.params.id;
  const { nama_warung, lokasi, kontak, deskripsi } = req.body;
  let foto = req.body.foto;
  
  if (req.file) {
    foto = `/uploads/${req.file.filename}`;
  }
  
  if (!nama_warung || !lokasi) {
    return res.status(400).json({ error: 'Nama warung dan lokasi diperlukan' });
  }
  
  const query = 'UPDATE warung SET nama_warung = ?, lokasi = ?, kontak = ?, deskripsi = ?, foto = ? WHERE id_warung = ?';
  
  db.query(query, [nama_warung, lokasi, kontak, deskripsi, foto, warungId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Warung tidak ditemukan' });
    }
    
    const activityQuery = 'INSERT INTO activity_log (admin_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)';
    const details = `Mengubah warung: ${nama_warung}`;
    
    db.query(activityQuery, [req.admin.id, 'update', 'warung', warungId, details], (actErr) => {
      if (actErr) {
        console.error('Error logging activity:', actErr);
      }
    });
    
    res.json({
      message: 'Warung berhasil diupdate'
    });
  });
});

// API endpoint untuk menghapus warung (admin)
app.delete('/api/admin/warung/:id', verifyAdminToken, (req, res) => {
  const warungId = req.params.id;
  
  db.query('SELECT nama_warung FROM warung WHERE id_warung = ?', [warungId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Warung tidak ditemukan' });
    }
    
    const warungName = results[0].nama_warung;
    
    const query = 'DELETE FROM warung WHERE id_warung = ?';
    db.query(query, [warungId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const activityQuery = 'INSERT INTO activity_log (admin_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)';
      const details = `Menghapus warung: ${warungName}`;
      
      db.query(activityQuery, [req.admin.id, 'delete', 'warung', warungId, details], (actErr) => {
        if (actErr) {
          console.error('Error logging activity:', actErr);
        }
      });
      
      res.json({
        message: 'Warung berhasil dihapus'
      });
    });
  });
});

// API endpoints for reviews
app.get('/api/reviews/menu/:id', (req, res) => {
  const menuId = req.params.id;

  const query = `
    SELECT r.*, u.username, u.nama
    FROM review r
    JOIN user u ON r.id_user = u.id_user
    WHERE r.id_menu = ?
    ORDER BY r.tanggal DESC
  `;

  db.query(query, [menuId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);
  });
});

app.post('/api/reviews', verifyToken, (req, res) => {
  const { id_warung, id_menu, rating, komentar } = req.body;
  const userId = req.user.id;

  console.log(`Adding review for menu ID: ${id_menu} by user ID: ${userId}`);

  if (!id_warung || !id_menu || !rating) {
    return res.status(400).json({ error: 'ID warung, ID menu, dan rating diperlukan' });
  }

  db.query(
    'SELECT id_review FROM review WHERE id_user = ? AND id_menu = ?',
    [userId, id_menu],
    (err, results) => {
      if (err) {
        console.error('Database error when checking existing review:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        console.log(`Updating existing review ID: ${results[0].id_review}`);
        const updateQuery = `
          UPDATE review 
          SET rating = ?, komentar = ?, tanggal = CURRENT_TIMESTAMP 
          WHERE id_user = ? AND id_menu = ?
        `;

        db.query(updateQuery, [rating, komentar, userId, id_menu], (err, result) => {
          if (err) {
            console.error('Database error when updating review:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            success: true,
            id: results[0].id_review,
            message: 'Ulasan berhasil diperbarui'
          });
        });
      } else {
        console.log('Creating new review');
        const insertQuery = `
          INSERT INTO review (id_user, id_warung, id_menu, rating, komentar)
          VALUES (?, ?, ?, ?, ?)
        `;

        db.query(insertQuery, [userId, id_warung, id_menu, rating, komentar], (err, result) => {
          if (err) {
            console.error('Database error when creating review:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          console.log(`New review created with ID: ${result.insertId}`);
          res.status(201).json({
            success: true,
            id: result.insertId,
            message: 'Ulasan berhasil ditambahkan'
          });
        });
      }
    }
  );
});

app.get('/api/reviews/user', verifyToken, (req, res) => {
  const userId = req.user.id;
  
  console.log(`Getting reviews for user ID: ${userId}`);
  
  const query = `
    SELECT r.*, w.nama_warung
    FROM review r
    JOIN warung w ON r.id_warung = w.id_warung
    WHERE r.id_user = ?
    ORDER BY r.tanggal DESC
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Database error when getting user reviews:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    console.log(`Found ${results.length} reviews for user ID: ${userId}`);
    res.json(results);
  });
});

app.post('/api/menu/favorites/:id', verifyToken, (req, res) => {
  const menuId = req.params.id;
  const userId = req.user.id;
  
  console.log(`Adding menu ID ${menuId} to favorites for user ID ${userId}`);
  
  db.query('SELECT id_menu FROM menu WHERE id_menu = ?', [menuId], (err, results) => {
    if (err) {
      console.error('Database error when checking menu:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      console.log(`Menu ID ${menuId} not found`);
      return res.status(404).json({ error: 'Menu tidak ditemukan' });
    }
    
    db.query(
      'SELECT id_favorite FROM favorite_menu WHERE id_user = ? AND id_menu = ?',
      [userId, menuId],
      (err, favResults) => {
        if (err) {
          console.error('Database error when checking favorites:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (favResults.length > 0) {
          console.log(`Menu ID ${menuId} already in favorites for user ID ${userId}`);
          return res.json({
            success: true,
            id: favResults[0].id_favorite,
            message: 'Menu sudah ada di favorit'
          });
        }
        
        db.query(
          'INSERT INTO favorite_menu (id_user, id_menu) VALUES (?, ?)',
          [userId, menuId],
          (err, result) => {
            if (err) {
              console.error('Database error when adding to favorites:', err);
              return res.status(500).json({ error: 'Database error' });
            }
            
            console.log(`Menu ID ${menuId} added to favorites for user ID ${userId}`);
            res.status(201).json({
              success: true,
              id: result.insertId,
              message: 'Menu berhasil ditambahkan ke favorit'
            });
          }
        );
      }
    );
  });
});

app.delete('/api/menu/favorites/:id', verifyToken, (req, res) => {
  const menuId = req.params.id;
  const userId = req.user.id;
  
  console.log(`Removing menu ID ${menuId} from favorites for user ID ${userId}`);
  
  db.query(
    'SELECT id_favorite FROM favorite_menu WHERE id_user = ? AND id_menu = ?',
    [userId, menuId],
    (err, results) => {
      if (err) {
        console.error('Database error when checking favorites:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        console.log(`Menu ID ${menuId} not in favorites for user ID ${userId}`);
        return res.json({
          success: true,
          message: 'Menu tidak ada di favorit'
        });
      }
      
      db.query(
        'DELETE FROM favorite_menu WHERE id_user = ? AND id_menu = ?',
        [userId, menuId],
        (err, result) => {
          if (err) {
            console.error('Database error when removing from favorites:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          
          console.log(`Menu ID ${menuId} removed from favorites for user ID ${userId}`);
          res.json({
            success: true,
            message: 'Menu berhasil dihapus dari favorit'
          });
        }
      );
    }
  );
});

app.get('/api/menu/favorites', verifyToken, (req, res) => {
  const userId = req.user.id;
  
  console.log(`Getting favorites for user ID: ${userId}`);
  
  const query = `
    SELECT f.*, m.nama_menu, m.harga, m.foto, w.nama_warung
    FROM favorite_menu f
    JOIN menu m ON f.id_menu = m.id_menu
    JOIN warung w ON m.id_warung = w.id_warung
    WHERE f.id_user = ?
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Database error when getting favorites:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    console.log(`Found ${results.length} favorites for user ID: ${userId}`);
    res.json(results);
  });
});

// API endpoint untuk mendapatkan recent activities
app.get('/api/admin/activities', verifyAdminToken, (req, res) => {
  const limit = req.query.limit || 10;
  
  const query = `
    SELECT al.*, a.username as admin_username 
    FROM activity_log al
    LEFT JOIN admin a ON al.admin_id = a.id_admin
    ORDER BY al.timestamp DESC
    LIMIT ?
  `;
  
  db.query(query, [parseInt(limit)], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(results);
  });
});

// API endpoint untuk menangani form kontak
app.post('/api/contact', (req, res) => {
  console.log('Menerima request ke /api/contact:', {
    body: req.body,
    headers: req.headers,
  });

  const { name, email, message } = req.body;

  // Validasi input
  if (!name || !email || !message) {
    console.warn('Validasi gagal:', { name, email, message });
    return res.status(400).json({ success: false, message: 'Nama, email, dan pesan diperlukan' });
  }

  // Sanitasi dasar
  const sanitizedName = name.trim();
  const sanitizedEmail = email.trim().toLowerCase();
  const sanitizedMessage = message.trim();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
    }
  });

  const currentDateTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  const mailOptions = {
    from: `"KantinKu Contact" <${process.env.EMAIL_USER}>`,
    replyTo: sanitizedEmail,
    to: process.env.EMAIL_USER,
    subject: `Pesan baru dari ${sanitizedName} - KantinKu (${currentDateTime})`,
    html: `
      <h2>Pesan Baru dari KantinKu</h2>
      <p><strong>Nama:</strong> ${sanitizedName}</p>
      <p><strong>Email:</strong> ${sanitizedEmail}</p>
      <p><strong>Pesan:</strong><br>${sanitizedMessage}</p>
      <p><strong>Diterima pada:</strong> ${currentDateTime}</p>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error mengirim email:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengirim email' });
    }
    console.log('Email terkirim:', info.response);
    res.json({ success: true, message: 'Pesan berhasil dikirim!' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});