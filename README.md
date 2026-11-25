<div align="center">
  <img src="bookroom/public/bookroom-symbol.svg" alt="Logo BookRoom" width="120" />
  <h1>BookRoom</h1>
  <p><strong>Sistem Manajemen Perpustakaan Kampus</strong></p>
  <p>Katalog digital, pengajuan peminjaman, antrean reservasi, dan pengelolaan denda dalam satu aplikasi web.</p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-16-17365A?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/React-19-17365A?style=flat-square&logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-17365A?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/PostgreSQL-SQL-17365A?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  </p>
</div>

## Navigasi

- [Tentang BookRoom](#tentang-bookroom)
- [Fitur Utama Sistem](#fitur-utama-sistem)
- [Alur Peminjaman dan Reservasi](#alur-peminjaman-dan-reservasi)
- [Tingkat Pengguna](#tingkat-pengguna)
- [Teknologi](#teknologi)
- [Struktur Proyek](#struktur-proyek)
- [Langkah Pemasangan](#langkah-pemasangan)
- [Akun Demo](#akun-demo)

## Tentang BookRoom

**BookRoom** adalah aplikasi perpustakaan kampus yang membantu pengunjung menemukan buku dan membantu petugas mengelola peminjaman buku fisik. Mahasiswa bisa melihat stok sebelum datang, mengajukan pinjaman, dan mengikuti statusnya dari **Pinjaman Saya**. Pegawai mencatat penerimaan dan pengembalian buku, sementara Admin bisa melihat statistik serta mengunduh laporan.

## Fitur Utama Sistem

### 1. Beranda dan katalog publik

- **Beranda.** Menampilkan hingga lima buku terpopuler, pencarian cepat, dan pengumuman terbaru.
- **Katalog.** Cari dengan judul, penulis, atau ISBN. Pilih kategori dan ketersediaan, urutkan hasil, lalu lihat dalam bentuk kisi atau daftar.
- **Detail buku.** Lihat sampul, sinopsis, kategori, penerbit, tahun terbit, stok, aturan pinjam, rating, dan ulasan.
- **Pengumuman dan layanan.** Baca pengumuman yang sudah tayang dan cek jam operasional serta panduan peminjaman.

### 2. Peminjaman, perpanjangan, pengembalian, dan denda

- Mahasiswa mengajukan pinjaman dari detail buku. Maksimal **tiga pinjaman atau pengajuan aktif**. Pengajuan untuk judul yang sama hanya bisa dibuat lagi setelah transaksi sebelumnya ditutup.
- Pegawai atau Admin menyetujui atau menolak pengajuan. Stok berkurang saat buku disetujui. Alasan penolakan tampil di riwayat mahasiswa.
- Mahasiswa dapat mengajukan **satu perpanjangan per transaksi** hingga hari jatuh tempo. Persetujuan petugas menambah masa pinjam.
- Saat buku kembali, petugas mencatat pengembalian dan stok bertambah. Jika terlambat, **denda = jumlah hari terlambat × tarif harian**. 
- Petugas memilih **Tandai Lunas** setelah pembayaran diterima. Denda tertunggak memblokir pengajuan pinjam dan reservasi baru.

### 3. Reservasi buku

- Jika buku habis atau stok tersisa sedang ditahan untuk pemesan lain, mahasiswa dapat ikut antrean dari detail buku. Maksimal **tiga reservasi aktif**.
- Saat stok tersedia, pemesan terdepan memperoleh notifikasi **Siap Diambil**. Eksemplar ditahan selama **dua hari** agar pemesan dapat mengajukan pinjaman.
- Posisi antrean, batas ambil, dan pilihan batal dapat dilihat dari **Pinjaman Saya**. Jika batas ambil lewat, sistem bisa meneruskan giliran saat antrean diproses lagi.

### 4. Pengelolaan perpustakaan

- **Koleksi Buku.** Pegawai dan Admin dapat menambah dan mengubah buku, mengunggah sampul, serta mengatur eksemplar, durasi, dan tarif denda. ISBN baru harus unik dan terdiri dari **10 atau 13 digit**, tahun terbit maksimal **2026**, durasi **7–14 hari**, dan denda **Rp1.000–Rp2.000 per hari**.
- **Hapus buku.** Buku tanpa pengajuan atau riwayat peminjaman bisa dihapus selama aturan relasinya terpenuhi. Buku yang sudah punya riwayat tetap tercatat meskipun stoknya penuh.
- **Pengumuman.** Pegawai dan Admin bisa mengatur kategori, tanggal rilis, dan status publikasi. Pengumuman **Published** tampil setelah tanggal rilis.
- **Pengguna dan kategori.** Admin dapat mengelola akun serta kategori yang digunakan untuk mengelompokkan koleksi. Buku yang masih terhubung ke kategori perlu dipindahkan sebelum kategorinya dihapus.

### 5. Unduh Laporan CSV untuk Admin

| Laporan | Di mana mengunduh | Isi |
| --- | --- | --- |
| Riwayat peminjaman | **Dashboard → Unduh Riwayat Peminjaman (CSV)** atau **Log Transaksi → Ekspor hasil filter (CSV)** | Data mahasiswa, buku, tanggal, status transaksi, denda, dan petugas. |
| Denda | **Log Transaksi → Ekspor denda (CSV)** | Hari terlambat, tarif, jumlah tagihan, status, dan informasi pelunasan. |
| Rekap bulanan | **Dashboard → Unduh Rekap Bulanan (CSV)** | Jumlah pengajuan, persetujuan, penolakan, dan pengembalian per bulan serta nominal denda. |

Di **Log Transaksi**, terapkan pencarian dan filter yang tersedia sebelum mengunduh. CSV dapat dibuka di Excel atau Google Sheets.

### 6. Notifikasi Mahasiswa

Ikon lonceng menunjukkan jumlah pesan yang belum dibaca. Pemberitahuan mencakup pengingat jatuh tempo **H-1**, persetujuan atau penolakan, pengembalian, denda, dan kabar reservasi.

Buka lonceng di navbar atau **Pinjaman Saya → Notifikasi**. Di halaman itu, mahasiswa dapat menandai satu pesan sebagai dibaca. **Tandai semua dibaca** tersedia di kedua tempat dan statusnya ikut diperbarui di navbar serta dashboard.

### 7. Profil, rating, dan ulasan

Admin, Pegawai, dan Mahasiswa bisa mengedit nama, email, NIM/NIP, nomor HP, dan kata sandi sendiri. Mahasiswa juga bisa mengubah program studi. Mengganti email, NIM/NIP, atau kata sandi membutuhkan kata sandi saat ini. Setelah buku dikembalikan, mahasiswa bisa memberi **rating 1–5 bintang** dan menulis ulasan dari riwayat transaksi.

## Alur Peminjaman dan Reservasi

### Alur Peminjaman

```text
Mahasiswa memilih buku di katalog
        │
        ▼
Klik Ajukan Pinjam
        │
        ▼
Menunggu Konfirmasi
        ├── Ditolak ──► Alasan tampil di riwayat
        │
        ▼ Disetujui oleh petugas
Dipinjam ──► Stok berkurang dan tanggal jatuh tempo ditetapkan
        │
        ▼
Petugas mencatat pengembalian
        │
        ▼
Selesai ──► Stok bertambah dan mahasiswa dapat memberi ulasan
        └── Jika terlambat ──► Denda dicatat sebagai Tertunggak
```

### Alur Reservasi

```text
Buku tidak tersedia untuk dipinjam
        │
        ▼
Mahasiswa memilih Reservasi / Antre
        │
        ▼
Menunggu ──► Posisi antrean tampil di Pinjaman Saya
        │
        ▼ Stok tersedia dan giliran tiba
Siap Diambil ──► Buku ditahan dua hari
        ├── Lewat batas ambil ──► Bisa menjadi Kedaluwarsa
        │
        ▼
Mahasiswa mengajukan pinjaman
        │
        ▼ Petugas menyetujui
Reservasi Dipenuhi
```

## Tingkat Pengguna

| Peran | Cara masuk | Yang dapat dilakukan |
| --- | --- | --- |
| **Tamu** | Buka beranda atau katalog tanpa login | Cari buku, lihat detail dan ulasan, baca pengumuman, dan cek informasi layanan. |
| **Mahasiswa** | Daftar dengan email kampus atau masuk dengan akun yang sudah ada | Ajukan pinjam, perpanjang, reservasi, cek denda dan riwayat, baca notifikasi, beri ulasan, dan edit profil sendiri. |
| **Pegawai Perpustakaan** | Masuk untuk membuka Dashboard Pegawai | Kelola koleksi dan pengumuman, proses peminjaman dan perpanjangan, catat buku kembali dan pelunasan, pantau reservasi, serta edit profil sendiri. |
| **Admin** | Masuk untuk membuka Dashboard Admin | Kelola akun dan kategori, akses pengelolaan koleksi dan sirkulasi, lihat statistik serta log transaksi, unduh CSV, dan edit profil sendiri. |

## Teknologi

| Bagian | Yang digunakan |
| --- | --- |
| **Frontend** | React 19 dan JavaScript JSX untuk halaman dan komponen. Tailwind CSS 4 serta CSS Modules untuk layout dan tampilan responsif. |
| **Backend** | Next.js 16 App Router dengan Server Actions untuk formulir dan Route Handlers untuk API serta unduhan CSV. |
| **Database** | PostgreSQL dan `pg`.|
| **Pengolahan gambar dan akun** | Sharp untuk sampul WebP, serta Node.js `crypto` untuk hash kata sandi dan token sesi. |


## Struktur Proyek

Repositori menyimpan README di root. Kode aplikasi dan perintah npm ada di folder `bookroom/`.

```text
BOOKROOM-FINAL-PROJECT/
├── README.md
└── bookroom/
    ├── .env.example              # Contoh pengaturan lokal
    ├── package.json              # Skrip npm dan paket aplikasi
    ├── package-lock.json         # Versi paket yang dipakai npm ci
    ├── next.config.mjs
    ├── eslint.config.mjs
    ├── jsconfig.json
    ├── database/
    │   ├── schema.sql            # Tabel, relasi, dan view PostgreSQL
    │   └── seed.sql              # Data buku, transaksi, dan akun demo
    ├── public/
    │   ├── bookroom-symbol.svg
    │   └── uploads/
    │       └── sampul-buku/
    └── src/
        ├── app/
        │   ├── (site)/           # Beranda, katalog, layanan, dan area mahasiswa
        │   ├── actions/          # Aksi server untuk formulir dan transaksi
        │   ├── admin/            # Dashboard dan pengelolaan Admin
        │   ├── api/              # Katalog, notifikasi, statistik, dan ekspor
        │   ├── login/
        │   ├── pegawai/          # Dashboard dan layanan sirkulasi
        │   ├── register/
        │   └── uploads/          # Rute penyajian sampul
        ├── components/
        │   ├── account/          # Profil dan formulir akun
        │   ├── art/              # Ilustrasi dan banner
        │   ├── auth/             # Formulir masuk dan daftar
        │   ├── books/            # Kartu dan sampul buku
        │   ├── managers/         # Pengelolaan data
        │   ├── site/             # Navigasi dan komponen publik
        │   ├── staff/            # Sidebar dan tindakan sirkulasi
        │   ├── student/          # Notifikasi dan tindakan mahasiswa
        │   └── ui/               # Dialog, ikon, input, dan komponen umum
        ├── lib/                  # Koneksi database dan aturan aplikasi
        └── middleware.js         # Pemeriksaan awal rute yang dilindungi
```

## Instalasi

### Langkah Pemasangan

Siapkan **Git**, **Node.js 20.9 atau lebih baru**, **npm**, dan **PostgreSQL**. Jika memakai antarmuka grafis untuk database, siapkan **pgAdmin**.

1. **Kloning repositori dan masuk ke folder aplikasi.**

   ```bash
   git clone https://github.com/AuraResky/BOOKROOM-FINAL-PROJECT.git
   cd BOOKROOM-FINAL-PROJECT/bookroom
   ```

2. **Pasang paket yang dibutuhkan BookRoom.**

   ```bash
   npm ci
   ```

   Perintah ini memasang versi paket yang tercatat di `package-lock.json`.

3. **Siapkan database PostgreSQL.** Di pgAdmin, buat database kosong bernama `bookroom`. 
Buka **Query Tool** pada database tersebut dan jalankan [`schema.sql`](bookroom/database/schema.sql), lalu [`seed.sql`](bookroom/database/seed.sql). 
Sampul buku untuk data contoh sudah tersedia di `bookroom/public/uploads/sampul-buku/`.


4. **Konfigurasi variabel lingkungan.** Salin [`.env.example`](bookroom/.env.example) ke `.env.local` di folder `bookroom`, lalu isi kredensial PostgreSQL lokalmu.

   ```dotenv
   DATABASE_URL="postgresql://postgres:PASSWORD_POSTGRES@localhost:5432/bookroom"
   SESSION_SECRET="GANTI_DENGAN_KUNCI_ACAK_MINIMAL_32_KARAKTER"
   CAMPUS_EMAIL_DOMAIN=unhas.ac.id
   APP_TIMEZONE=Asia/Makassar
   NEXT_PUBLIC_APP_TIMEZONE=Asia/Makassar
   SESSION_COOKIE_SECURE=false
   ```

   Ganti `PASSWORD_POSTGRES` dengan kata sandi PostgreSQL milikmu. 
   Buat nilai `SESSION_SECRET` dengan `node -p "require('node:crypto').randomBytes(32).toString('hex')"`. 
   Simpan pengaturan asli di `.env.local` dan simpan file itu di komputer lokal.

5. **Jalankan server pengembangan.**

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

## Akun Demo

Setelah mengimpor `seed.sql`, ada 13 akun contoh dengan kata sandi **`RoomBook`**. Gunakan akun dengan status **Aktif** untuk masuk. Akun **Nonaktif** bisa dipakai untuk menguji penolakan saat login.

| Peran | Email | Kata sandi | Status awal |
| --- | --- | --- | --- |
| Admin | `admin@unhas.ac.id` | `RoomBook` | Aktif |
| Admin | `ratna.kusuma@unhas.ac.id` | `RoomBook` | Aktif |
| Pegawai Perpustakaan | `pegawai@unhas.ac.id` | `RoomBook` | Aktif |
| Pegawai Perpustakaan | `budi.dirga@unhas.ac.id` | `RoomBook` | Aktif |
| Pegawai Perpustakaan | `sri.ayu@unhas.ac.id` | `RoomBook` | Aktif |
| Mahasiswa | `mahasiswa@unhas.ac.id` | `RoomBook` | Aktif |
| Mahasiswa | `aliyah@unhas.ac.id` | `RoomBook` | Aktif |
| Mahasiswa | `aura@unhas.ac.id` | `RoomBook` | Aktif |
| Mahasiswa | `mawaddah@unhas.ac.id` | `RoomBook` | Aktif |
| Mahasiswa | `nita@unhas.ac.id` | `RoomBook` | Aktif |
| Mahasiswa | `salwa@unhas.ac.id` | `RoomBook` | Aktif |
| Mahasiswa | `talista@unhas.ac.id` | `RoomBook` | Aktif |
| Mahasiswa | `visya@unhas.ac.id` | `RoomBook` | Nonaktif |
