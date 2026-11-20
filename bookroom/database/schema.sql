BEGIN;
CREATE TABLE pengguna (
 id SERIAL PRIMARY KEY, 
 nama_lengkap VARCHAR(120) NOT NULL, email VARCHAR(150) NOT NULL,
 kata_sandi_hash TEXT NOT NULL, peran VARCHAR(20) NOT NULL CHECK(peran IN ('admin','pegawai','mahasiswa')),
 nomor_identitas VARCHAR(30) NOT NULL, nomor_telepon VARCHAR(20), program_studi VARCHAR(100),
 aktif BOOLEAN NOT NULL DEFAULT TRUE, dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(), diubah_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX pengguna_email_unique ON pengguna(LOWER(email));
CREATE UNIQUE INDEX pengguna_identity_unique ON pengguna(nomor_identitas);
CREATE TABLE kategori_buku (
 id SERIAL PRIMARY KEY, nama_kategori VARCHAR(80) NOT NULL, kode_klasifikasi VARCHAR(20) NOT NULL,
 deskripsi TEXT, dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX kategori_code_unique ON kategori_buku(UPPER(kode_klasifikasi));
CREATE UNIQUE INDEX kategori_name_unique ON kategori_buku(LOWER(nama_kategori));
CREATE TABLE gambar (
 id SERIAL PRIMARY KEY, nama_file TEXT NOT NULL UNIQUE, nama_asli VARCHAR(255) NOT NULL,
 jenis_file VARCHAR(30) NOT NULL CHECK(jenis_file IN ('image/jpeg','image/png','image/webp')),
 ukuran_byte INTEGER NOT NULL CHECK(ukuran_byte BETWEEN 1 AND 2097152), lokasi_file TEXT NOT NULL UNIQUE,
 diunggah_oleh INTEGER REFERENCES pengguna(id) ON DELETE SET NULL, diunggah_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE buku (
 id SERIAL PRIMARY KEY, judul VARCHAR(200) NOT NULL, isbn VARCHAR(13) NOT NULL UNIQUE,
 penulis VARCHAR(150) NOT NULL, penerbit VARCHAR(120) NOT NULL, tahun_terbit INTEGER NOT NULL CHECK(tahun_terbit BETWEEN 1450 AND 2100),
 id_kategori INTEGER NOT NULL REFERENCES kategori_buku(id) ON DELETE RESTRICT,
 stok_total INTEGER NOT NULL DEFAULT 0 CHECK(stok_total>=0), stok_tersedia INTEGER NOT NULL DEFAULT 0 CHECK(stok_tersedia BETWEEN 0 AND stok_total),
 batas_hari_pinjam INTEGER NOT NULL DEFAULT 14 CHECK(batas_hari_pinjam BETWEEN 1 AND 60),
 denda_per_hari INTEGER NOT NULL DEFAULT 1000 CHECK(denda_per_hari>=0),
 id_gambar_sampul INTEGER REFERENCES gambar(id) ON DELETE SET NULL, sinopsis TEXT, lokasi_rak VARCHAR(30),
 dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(), diubah_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX buku_kategori_idx ON buku(id_kategori);
CREATE TABLE eksemplar_buku (
 id SERIAL PRIMARY KEY, id_buku INTEGER NOT NULL REFERENCES buku(id) ON DELETE CASCADE,
 kode_eksemplar VARCHAR(60) NOT NULL UNIQUE,
 status VARCHAR(20) NOT NULL DEFAULT 'Tersedia' CHECK(status IN ('Tersedia','Dipinjam','Ditarik')),
 dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE SEQUENCE kode_peminjaman_seq;
CREATE TABLE peminjaman (
 id SERIAL PRIMARY KEY, kode_transaksi VARCHAR(30) NOT NULL UNIQUE DEFAULT
 ('TRX-'||TO_CHAR(NOW(),'YYMMDD')||'-'||LPAD(NEXTVAL('kode_peminjaman_seq')::TEXT,4,'0')),
 id_pengguna INTEGER NOT NULL REFERENCES pengguna(id) ON DELETE RESTRICT,
 id_buku INTEGER NOT NULL REFERENCES buku(id) ON DELETE RESTRICT,
 id_eksemplar INTEGER REFERENCES eksemplar_buku(id) ON DELETE RESTRICT,
 status VARCHAR(30) NOT NULL DEFAULT 'Menunggu Konfirmasi' CHECK(status IN
 ('Menunggu Konfirmasi','Ditolak','Dipinjam','Perpanjangan Diajukan','Perpanjangan Disetujui','Perpanjangan Ditolak','Selesai')),
 diajukan_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(), tanggal_pinjam DATE, tanggal_jatuh_tempo DATE, tanggal_kembali DATE,
 durasi_pinjam_hari INTEGER CHECK(durasi_pinjam_hari>0), tarif_denda_harian INTEGER CHECK(tarif_denda_harian>=0),
 jumlah_perpanjangan INTEGER NOT NULL DEFAULT 0 CHECK(jumlah_perpanjangan BETWEEN 0 AND 1), alasan_penolakan TEXT,
 diproses_oleh INTEGER REFERENCES pengguna(id) ON DELETE SET NULL, diubah_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK(tanggal_jatuh_tempo IS NULL OR tanggal_jatuh_tempo>=tanggal_pinjam),
 CHECK(tanggal_kembali IS NULL OR tanggal_kembali>=tanggal_pinjam),
 CHECK((status IN ('Menunggu Konfirmasi','Ditolak') AND tanggal_pinjam IS NULL) OR
 (status NOT IN ('Menunggu Konfirmasi','Ditolak') AND tanggal_pinjam IS NOT NULL AND tanggal_jatuh_tempo IS NOT NULL AND id_eksemplar IS NOT NULL AND durasi_pinjam_hari IS NOT NULL AND tarif_denda_harian IS NOT NULL))
);
CREATE UNIQUE INDEX peminjaman_eksemplar_aktif ON peminjaman(id_eksemplar) WHERE status NOT IN ('Selesai','Ditolak','Menunggu Konfirmasi');
CREATE UNIQUE INDEX peminjaman_buku_aktif ON peminjaman(id_pengguna,id_buku) WHERE status NOT IN ('Selesai','Ditolak');
CREATE INDEX peminjaman_pengguna_idx ON peminjaman(id_pengguna,status);
CREATE TABLE perpanjangan_peminjaman (
 id SERIAL PRIMARY KEY, id_peminjaman INTEGER NOT NULL REFERENCES peminjaman(id) ON DELETE RESTRICT,
 tanggal_lama DATE NOT NULL, tanggal_baru DATE, tambahan_hari INTEGER NOT NULL CHECK(tambahan_hari>0),
 status VARCHAR(20) NOT NULL DEFAULT 'Diajukan' CHECK(status IN ('Diajukan','Disetujui','Ditolak')),
 alasan_penolakan TEXT, diajukan_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(), diproses_pada TIMESTAMPTZ,
 diproses_oleh INTEGER REFERENCES pengguna(id) ON DELETE SET NULL
);
CREATE UNIQUE INDEX perpanjangan_menunggu_unique ON perpanjangan_peminjaman(id_peminjaman) WHERE status='Diajukan';
CREATE TABLE denda (
 id SERIAL PRIMARY KEY, id_peminjaman INTEGER NOT NULL UNIQUE REFERENCES peminjaman(id) ON DELETE RESTRICT,
 hari_terlambat INTEGER NOT NULL CHECK(hari_terlambat>0), tarif_per_hari INTEGER NOT NULL CHECK(tarif_per_hari>0),
 jumlah_denda INTEGER NOT NULL CHECK(jumlah_denda>0), status_pembayaran VARCHAR(20) NOT NULL DEFAULT 'Tertunggak' CHECK(status_pembayaran IN ('Tertunggak','Lunas')),
 dibayar_pada TIMESTAMPTZ, diterima_oleh INTEGER REFERENCES pengguna(id) ON DELETE SET NULL, dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK(jumlah_denda=hari_terlambat*tarif_per_hari), CHECK((status_pembayaran='Lunas')=(dibayar_pada IS NOT NULL))
);
CREATE TABLE penilaian_buku (
 id SERIAL PRIMARY KEY, id_peminjaman INTEGER NOT NULL REFERENCES peminjaman(id) ON DELETE RESTRICT,
 id_pengguna INTEGER NOT NULL REFERENCES pengguna(id) ON DELETE RESTRICT, id_buku INTEGER NOT NULL REFERENCES buku(id) ON DELETE RESTRICT,
 nilai_bintang SMALLINT NOT NULL CHECK(nilai_bintang BETWEEN 1 AND 5), komentar TEXT NOT NULL,
 dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(), diubah_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(id_pengguna,id_buku)
);
CREATE TABLE pengumuman (
 id SERIAL PRIMARY KEY, judul VARCHAR(200) NOT NULL, isi TEXT NOT NULL,
 kategori VARCHAR(20) NOT NULL CHECK(kategori IN ('Operasional','Layanan','Acara')), tanggal_rilis DATE NOT NULL DEFAULT CURRENT_DATE,
 status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK(status IN ('Draft','Published')), ditulis_oleh INTEGER REFERENCES pengguna(id) ON DELETE SET NULL,
 dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(), diubah_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE sesi_login (
 id SERIAL PRIMARY KEY, id_pengguna INTEGER NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
 token_hash VARCHAR(64) NOT NULL UNIQUE, berlaku_sampai TIMESTAMPTZ NOT NULL, dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX sesi_pengguna_idx ON sesi_login(id_pengguna);
CREATE TABLE percobaan_login (
 id SERIAL PRIMARY KEY, identitas_hash VARCHAR(64) NOT NULL, berhasil BOOLEAN NOT NULL,
 dicoba_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX percobaan_identitas_waktu_idx ON percobaan_login(identitas_hash,dicoba_pada);


CREATE TABLE notifikasi (
 id SERIAL PRIMARY KEY, id_pengguna INTEGER NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
 jenis VARCHAR(20) NOT NULL CHECK(jenis IN ('Peminjaman','Perpanjangan','Jatuh Tempo','Pengembalian','Denda','Reservasi')),
 judul VARCHAR(150) NOT NULL, pesan TEXT NOT NULL, tautan VARCHAR(200),
 kunci_unik VARCHAR(80), dibaca BOOLEAN NOT NULL DEFAULT FALSE, dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX notifikasi_kunci_unique ON notifikasi(id_pengguna,kunci_unik) WHERE kunci_unik IS NOT NULL;
CREATE INDEX notifikasi_pengguna_idx ON notifikasi(id_pengguna,dibaca,dibuat_pada DESC);

CREATE TABLE reservasi_buku (
 id SERIAL PRIMARY KEY, id_pengguna INTEGER NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
 id_buku INTEGER NOT NULL REFERENCES buku(id) ON DELETE CASCADE,
 status VARCHAR(20) NOT NULL DEFAULT 'Menunggu' CHECK(status IN ('Menunggu','Siap Diambil','Dipenuhi','Dibatalkan','Kedaluwarsa')),
 dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(), siap_pada TIMESTAMPTZ, batas_ambil DATE, diubah_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK(status<>'Siap Diambil' OR batas_ambil IS NOT NULL)
);
CREATE UNIQUE INDEX reservasi_aktif_unique ON reservasi_buku(id_pengguna,id_buku) WHERE status IN ('Menunggu','Siap Diambil');
CREATE INDEX reservasi_antrean_idx ON reservasi_buku(id_buku,status,dibuat_pada);

CREATE VIEW v_pengguna AS SELECT id,nama_lengkap AS full_name,email,kata_sandi_hash AS password_hash,peran AS role,
 nomor_identitas AS identity_number,nomor_telepon AS phone,program_studi AS study_program,aktif AS is_active,
 dibuat_pada AS created_at,diubah_pada AS updated_at FROM pengguna;
CREATE VIEW v_kategori AS SELECT id,nama_kategori AS name,kode_klasifikasi AS code,deskripsi AS description,dibuat_pada AS created_at FROM kategori_buku;
CREATE VIEW v_buku AS SELECT b.id,b.judul AS title,b.isbn,b.penulis AS author,b.penerbit AS publisher,b.tahun_terbit AS publish_year,
 b.id_kategori AS category_id,b.stok_tersedia AS stock,b.stok_total AS total_stock,b.batas_hari_pinjam AS max_loan_days,b.denda_per_hari AS fine_per_day,
 (SELECT lokasi_file FROM gambar WHERE id=b.id_gambar_sampul) AS cover_url,b.sinopsis AS description,b.lokasi_rak AS shelf_location,
 b.dibuat_pada AS created_at,b.diubah_pada AS updated_at FROM buku b;
CREATE VIEW v_peminjaman AS SELECT p.id,p.kode_transaksi AS code,p.id_pengguna AS user_id,p.id_buku AS book_id,p.status,
 p.diajukan_pada AS requested_at,p.tanggal_pinjam AS loan_date,p.tanggal_jatuh_tempo AS due_date,p.tanggal_kembali AS return_date,
 p.durasi_pinjam_hari AS loan_days,p.tarif_denda_harian AS daily_fine,p.jumlah_perpanjangan AS extension_count,p.alasan_penolakan AS reject_reason,
 COALESCE(d.jumlah_denda,CASE WHEN p.status NOT IN ('Selesai','Ditolak','Menunggu Konfirmasi') THEN
 GREATEST(CURRENT_DATE-p.tanggal_jatuh_tempo,0)*p.tarif_denda_harian ELSE 0 END,0)::int AS fine_amount,
 COALESCE(d.status_pembayaran,CASE WHEN p.status NOT IN ('Selesai','Ditolak','Menunggu Konfirmasi') AND
 CURRENT_DATE>p.tanggal_jatuh_tempo AND p.tarif_denda_harian>0 THEN 'Tertunggak' END) AS fine_status,
 d.dibayar_pada AS fine_paid_at,p.diproses_oleh AS handled_by,p.diubah_pada AS updated_at FROM peminjaman p LEFT JOIN denda d ON d.id_peminjaman=p.id;
CREATE VIEW v_penilaian AS SELECT id,id_peminjaman AS loan_id,id_pengguna AS user_id,id_buku AS book_id,nilai_bintang AS rating,
 komentar AS comment,dibuat_pada AS created_at FROM penilaian_buku;
CREATE VIEW v_pengumuman AS SELECT id,judul AS title,isi AS content,kategori AS category,tanggal_rilis AS release_date,status,
 ditulis_oleh AS author_id,dibuat_pada AS created_at,diubah_pada AS updated_at FROM pengumuman;
CREATE VIEW v_notifikasi AS SELECT id,id_pengguna AS user_id,jenis AS type,judul AS title,pesan AS message,tautan AS link,
 dibaca AS is_read,dibuat_pada AS created_at FROM notifikasi;
CREATE VIEW v_reservasi AS SELECT r.id,r.id_pengguna AS user_id,r.id_buku AS book_id,r.status,r.dibuat_pada AS created_at,
 r.siap_pada AS ready_at,r.batas_ambil AS pickup_deadline,r.diubah_pada AS updated_at,
 CASE WHEN r.status='Menunggu' THEN (SELECT COUNT(*)::int FROM reservasi_buku x WHERE x.id_buku=r.id_buku AND x.status='Menunggu'
  AND (x.dibuat_pada,x.id)<=(r.dibuat_pada,r.id)) END AS queue_position FROM reservasi_buku r;
COMMIT;

COMMENT ON TABLE gambar IS 'Metadata sampul; file disimpan di public/uploads/sampul-buku, bukan BYTEA.';
COMMENT ON COLUMN buku.stok_total IS 'Total eksemplar inventaris aktif, termasuk yang sedang dipinjam.';
COMMENT ON COLUMN buku.stok_tersedia IS 'Eksemplar yang dapat dipinjam sekarang.';
COMMENT ON COLUMN peminjaman.tarif_denda_harian IS 'Tarif saat persetujuan; tidak mengikuti perubahan tarif buku berikutnya.';
COMMENT ON COLUMN peminjaman.id_eksemplar IS 'Diisi saat persetujuan; pengajuan menunggu belum mengambil eksemplar.';
COMMENT ON TABLE denda IS 'Tagihan final saat pengembalian. Denda berjalan dihitung pada view v_peminjaman.';
COMMENT ON TABLE percobaan_login IS 'Pendukung pembatasan kegagalan masuk; tidak menjadi menu aplikasi.';
COMMENT ON TABLE notifikasi IS 'Log notifikasi mahasiswa. kunci_unik mencegah pengingat H-1 tercatat ganda.';
COMMENT ON TABLE reservasi_buku IS 'Antrean reservasi saat stok habis. Siap Diambil menahan satu eksemplar sampai batas_ambil.';
