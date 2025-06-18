# 🧾 KantinKu

**KantinKu** adalah aplikasi web untuk menampilkan dan mengelola menu makanan dari kantin kampus. Aplikasi ini menyediakan fitur untuk melihat daftar warung dan menu, memberi ulasan, serta menandai menu favorit oleh user yang login.

---

## 🚀 Cara Menjalankan Proyek

### 1. Clone Repository

```bash
git clone <url-repo-anda>
cd kantinku
```

### 2. Install Dependensi

```bash
npm install
```

### 3. Konfigurasi Environment

Buat file `.env` di root proyek dan isi dengan:

```env
PORT=3300
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=kantinku
JWT_SECRET=your_secret_key
```

### 4. Jalankan Server

```bash
npm start
```

Atau dengan nodemon (mode dev):

```bash
npm run dev
```

Kemudian buka browser dan akses:  
👉 `http://localhost:3300`

---

## 🗂 Struktur Proyek

| Folder / File     | Deskripsi                                                 |
|-------------------|------------------------------------------------------------|
| `app.js`          | Entry point aplikasi Express                               |
| `public/`         | File statis (HTML, CSS, JS frontend)                       |
| `controllers/`    | Logika utama untuk user, admin, menu, review, favorit, dll |
| `models/`         | Koneksi dan query ke database MySQL                        |
| `routes/`         | Routing API untuk user, admin, menu, review, dll           |
| `middlewares/`    | Middleware otentikasi JWT dan pengecekan role              |
| `database/kantinku.sql` | File struktur dan seed data awal MySQL               |
| `tests/`          | Pengujian otomatis fitur-fitur API                         |

---

## 🔐 Fitur Autentikasi

- Login user & admin menggunakan JWT
- Token berlaku selama **1 jam**
- Jika token kedaluwarsa, user akan otomatis logout dan diarahkan ke halaman login dengan notifikasi

---

## 📋 Fitur Aplikasi

- 🔍 Lihat daftar warung & menu
- ❤️ Tambah/hapus menu favorit
- ✍️ Beri ulasan menu (1 kali per menu per user)
- 🧑 Role admin dan user dengan hak akses berbeda

---

## 🧪 Testing

Tersedia file `tests/favoriteFeature.test.js` untuk menguji API favorit dan ulasan. Jalankan dengan:

```bash
npm test
```

---

## 🧼 Catatan

- Pastikan `database/kantinku.sql` adalah versi terbaru (berisi tabel `activity_log`, `review_menu`, dll)
- File duplikat atau lama telah dibersihkan untuk menjaga struktur proyek tetap rapi

---

## 👨‍💻 Pengembang

Proyek ini dikembangkan untuk tugas Rekayasa Perangkat Lunak.  
Hubungi melalui email untuk kontribusi atau laporan bug.