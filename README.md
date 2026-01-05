# SurfMate - Sistem Reservasi Surfing Pantai Wediombo

Platform reservasi online untuk surf lesson di Pantai Wediombo, Gunungkidul.

## 🚀 Fitur

- 🏄 Reservasi Surf Lesson online
- 📦 Pilihan paket: Beginner & Beginner+
- 💳 Pembayaran COD (Cash on Delivery)
- 👤 Autentikasi pengguna (Surfer & Admin)
- 🔐 Login dengan Google OAuth
- 📊 Dashboard admin untuk kelola reservasi
- 📝 Sistem feedback dan ulasan
- 🌊 Monitoring kondisi ombak real-time

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **Backend**: PHP 8.2
- **Database**: MySQL 8.0
- **Container**: Docker & Docker Compose
- **Web Server**: Apache (via PHP Apache)

## 📋 Prerequisites

- Docker Desktop
- Git
- Browser modern (Chrome, Firefox, Edge)

## ⚙️ Setup & Installation

### 1. Clone Repository

```bash
git clone https://github.com/<username>/surfmate.git
cd surfmate
```

### 2. Setup Environment Variables

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Edit `.env` dan isi dengan kredensial Anda:

```env
# Database Configuration
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_DATABASE=db_surfmate
MYSQL_USER=your_db_user
MYSQL_PASSWORD=your_secure_db_password

# Application Database
DB_HOST=db
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_secure_db_password
DB_NAME=db_surfmate

# Google OAuth (opsional)
GOOGLE_CLIENT_ID=your_google_client_id_here
```

**Catatan:** Untuk mendapatkan `GOOGLE_CLIENT_ID`:
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih yang ada
3. Aktifkan Google+ API
4. Buat OAuth 2.0 Client ID (tipe: Web application)
5. Tambahkan `http://localhost:8080` ke Authorized JavaScript origins
6. Salin Client ID ke `.env`

### 3. Jalankan dengan Docker

```bash
docker-compose up -d
```

Tunggu hingga database selesai diinisialisasi (±30 detik untuk pertama kali).

### 4. Akses Aplikasi

Buka browser dan akses:
- **Website**: http://localhost:8080
- **Admin Login**: http://localhost:8080/app/components/loginAdmin.html
- **Surfer Login**: http://localhost:8080/app/components/loginSurfer.html

### 5. Login Default

**Admin:**
- Email: `admin@surfmate.com`
- Password: `admin123`

**Surfer (contoh):**
- Email: `naufal@example.com`
- Password: `password123`

## 🗄️ Database Schema

Database akan otomatis dibuat saat container pertama kali dijalankan. Schema mencakup:
- `admin` - Data administrator
- `surfer` - Data pengguna/surfer
- `paket` - Paket surf lesson
- `reservasi` - Data reservasi
- `ulasan` - Feedback pengguna

## 📁 Struktur Folder

```
surfmate/
├── app/
│   ├── assets/          # Gambar & media
│   ├── backend/         # API endpoints PHP
│   ├── components/      # HTML components
│   ├── js/             # JavaScript modules
│   ├── pages/          # Dynamic PHP pages
│   └── style/          # CSS files
├── nginx/              # Nginx config (jika ada)
├── docker-compose.yml  # Docker orchestration
├── Dockerfile         # Container setup
├── db_surfmate.sql    # Database schema & seed data
└── .env               # Environment variables (jangan push!)
```

## 🔧 Development

### Menjalankan tanpa Docker (lokal)

1. Install XAMPP/WAMP/MAMP
2. Import `db_surfmate.sql` ke MySQL
3. Edit `app/backend/db.php` sesuaikan kredensial
4. Letakkan folder di `htdocs/`
5. Akses via `http://localhost/surfmate/`

### Hot Reload

Kode di folder `app/` akan otomatis terupdate di container berkat volume mounting. Tidak perlu rebuild untuk perubahan PHP/JS/CSS.

## 🐛 Troubleshooting

**Container tidak mau start:**
```bash
docker-compose down -v
docker-compose up -d --build
```

**Database error:**
- Pastikan `.env` sudah benar
- Cek log: `docker-compose logs db`
- Tunggu health check selesai

**Login tidak berhasil:**
- Clear browser cache (Ctrl+Shift+Delete)
- Cek session cookie di DevTools
- Pastikan kredensial sesuai data di `db_surfmate.sql`

## 📝 License

Proyek ini dibuat untuk keperluan akademik/pembelajaran.

## 👨‍💻 Author

Naufal Luthfi Maulana
