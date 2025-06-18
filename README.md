<div align="center">
  <img src="https://img.icons8.com/color/48/000000/food.png" alt="KantinKu Logo" width="80"/>
  <h1>🍽️ KantinKu</h1>
  <p>Aplikasi web modern untuk mengelola menu kantin kampus dengan fitur interaktif untuk pengguna dan admin.</p>
  
  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript" alt="JavaScript Badge"/>
    <img src="https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js" alt="Node.js Badge"/>
    <img src="https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express" alt="Express Badge"/>
    <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql" alt="MySQL Badge"/>
    <img src="https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens" alt="JWT Badge"/>
    <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License Badge"/>
  </p>
</div>

---

## 🌟 Apa itu KantinKu?

**KantinKu** adalah aplikasi web yang dirancang untuk memudahkan mahasiswa dan staf kampus dalam menjelajahi menu makanan dari berbagai warung kantin. Dengan antarmuka yang ramah pengguna, aplikasi ini memungkinkan pengguna untuk melihat daftar menu, memberikan ulasan, menandai favorit, dan mengelola data melalui panel admin. Dibangun dengan teknologi modern, KantinKu menawarkan pengalaman yang cepat dan aman dengan autentikasi berbasis JWT.

### ✨ Fitur Utama
- 🔍 **Jelajahi Menu**: Lihat daftar warung dan menu dengan detail harga dan deskripsi.
- ❤️ **Favoritkan Menu**: Tandai menu favorit untuk akses cepat.
- ✍️ **Ulasan Menu**: Berikan ulasan (satu kali per menu per pengguna).
- 🧑 **Manajemen Role**: Hak akses berbeda untuk pengguna dan admin.
- 🔐 **Autentikasi Aman**: Login menggunakan JWT dengan token yang valid selama 1 jam.
- 📊 **Log Aktivitas**: Pantau aktivitas pengguna melalui tabel `activity_log`.

---

## 🚀 Cara Menjalankan Proyek

### 📋 Prasyarat
- Node.js (v18.x atau lebih baru)
- MySQL (v8.0 atau lebih baru)
- Git
- Text editor (VS Code direkomendasikan)

### 1. Clone Repository
```bash
git clone https://github.com/your-username/kantinku.git
cd kantinku
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment
Buat file `.env` di root proyek dan isi dengan konfigurasi berikut:

```env
PORT=3300
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=kantinku
JWT_SECRET=your_secret_key
```

### 4. Siapkan Database
- Impor file `database/kantinku.sql` ke MySQL untuk membuat struktur tabel dan data awal.
- Pastikan tabel seperti `activity_log`, `review_menu`, dan lainnya telah dibuat.

### 5. Jalankan Aplikasi
Jalankan server dalam mode produksi:
```bash
npm start
```

Atau dalam mode pengembangan dengan nodemon:
```bash
npm run dev
```

Buka browser dan akses:
👉 [http://localhost:3300](http://localhost:3300)

---

## 🗂 Struktur Proyek

```plaintext
kantinku/
├── app.js                 # Entry point aplikasi Express
├── public/               # File statis (HTML, CSS, JS frontend)
├── controllers/          # Logika bisnis untuk user, admin, menu, dll
├── models/               # Koneksi dan query database MySQL
├── routes/               # Definisi rute API
├── middlewares/          # Middleware untuk autentikasi JWT dan validasi
├── database/             # File SQL untuk struktur dan seed data
│   └── kantinku.sql
├── tests/                # Test suite untuk API
└── .env                  # File konfigurasi environment
```

---

## 🔐 Autentikasi

- **JWT-Based**: Pengguna dan admin login menggunakan JSON Web Token (JWT).
- **Durasi Token**: Token valid selama **1 jam**, setelah itu pengguna diarahkan ke halaman login dengan notifikasi.
- **Role-Based Access**: Admin memiliki akses ke fitur manajemen, sementara pengguna hanya dapat melihat dan berinteraksi dengan menu.

---

## 🛠️ Teknologi yang Digunakan

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Frontend**: HTML, CSS (Tailwind CSS), JavaScript
- **Autentikasi**: JSON Web Token (JWT)
- **Testing**: Jest (untuk pengujian API)

---

## 🧪 Testing

KantinKu menyediakan pengujian otomatis untuk memastikan fitur favorit dan ulasan berfungsi dengan baik. Jalankan pengujian dengan:

```bash
npm test
```

File pengujian utama:
- `tests/favoriteFeature.test.js`: Menguji endpoint API untuk menambah/hapus favorit dan ulasan.

---

## 📝 Catatan Penting

- **Database**: Pastikan Anda menggunakan versi terbaru dari `kantinku.sql` untuk mendapatkan tabel seperti `activity_log` dan `review_menu`.
- **Kebersihan Kode**: File duplikat atau usang telah dihapus untuk menjaga proyek tetap rapi.
- **Keamanan**: Selalu gunakan `JWT_SECRET` yang kuat di file `.env` untuk mencegah kebocoran token.
- **Kontribusi**: Silakan buka *issue* atau *pull request* untuk perbaikan atau fitur baru.

---

## 🎯 Rencana Pengembangan

- [ ] Integrasi dashboard analitik untuk admin.
- [ ] Fitur notifikasi real-time untuk reservasi baru.
- [ ] Opsi filter dan pencarian menu yang lebih canggih.
- [ ] Versi mobile dengan React Native (lihat konversi sebelumnya!).

---

## 👨‍💻 Pengembang

Dikembangkan oleh tim untuk tugas **Rekayasa Perangkat Lunak**.  
📧 Hubungi kami melalui [rizkianuari83@gmail.com](mailto:rizkianuari83@gmail.com) untuk pertanyaan, laporan bug, atau kontribusi.

---

<div align="center">
  <p>🌟 <strong>Beri bintang di GitHub jika Anda menyukai proyek ini!</strong> 🌟</p>
  <p>Made with ❤️ for campus foodies!</p>
</div>

---

