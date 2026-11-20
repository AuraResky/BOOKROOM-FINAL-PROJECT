BEGIN;

CREATE TABLE IF NOT EXISTS notifikasi (
 id SERIAL PRIMARY KEY, 
 id_pengguna INTEGER NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
 jenis VARCHAR(20) NOT NULL CHECK(jenis IN ('Peminjaman','Perpanjangan','Jatuh Tempo','Pengembalian','Denda','Reservasi')),
 judul VARCHAR(150) NOT NULL, 
 pesan TEXT NOT NULL, tautan VARCHAR(200),
 kunci_unik VARCHAR(80), 
 dibaca BOOLEAN NOT NULL DEFAULT FALSE, 
 dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS notifikasi_kunci_unique ON notifikasi(id_pengguna,kunci_unik) WHERE kunci_unik IS NOT NULL;
CREATE INDEX IF NOT EXISTS notifikasi_pengguna_idx ON notifikasi(id_pengguna,dibaca,dibuat_pada DESC);

CREATE TABLE IF NOT EXISTS reservasi_buku (
 id SERIAL PRIMARY KEY, 
 id_pengguna INTEGER NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
 id_buku INTEGER NOT NULL REFERENCES buku(id) ON DELETE CASCADE,
 status VARCHAR(20) NOT NULL DEFAULT 'Menunggu' CHECK(status IN ('Menunggu','Siap Diambil','Dipenuhi','Dibatalkan','Kedaluwarsa')),
 dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(), 
 siap_pada TIMESTAMPTZ, 
 batas_ambil DATE, 
 diubah_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK(status<>'Siap Diambil' OR batas_ambil IS NOT NULL)
);
CREATE UNIQUE INDEX IF NOT EXISTS reservasi_aktif_unique ON reservasi_buku(id_pengguna,id_buku) WHERE status IN ('Menunggu','Siap Diambil');
CREATE INDEX IF NOT EXISTS reservasi_antrean_idx ON reservasi_buku(id_buku,status,dibuat_pada);

CREATE OR REPLACE VIEW v_notifikasi AS SELECT id,id_pengguna AS user_id,jenis AS type,judul AS title,pesan AS message,tautan AS link,
 dibaca AS is_read,dibuat_pada AS created_at FROM notifikasi;
 
CREATE OR REPLACE VIEW v_reservasi AS SELECT r.id,r.id_pengguna AS user_id,r.id_buku AS book_id,r.status,r.dibuat_pada AS created_at,
 r.siap_pada AS ready_at,r.batas_ambil AS pickup_deadline,r.diubah_pada AS updated_at,
 CASE WHEN r.status='Menunggu' THEN (SELECT COUNT(*)::int FROM reservasi_buku x WHERE x.id_buku=r.id_buku AND x.status='Menunggu'
  AND (x.dibuat_pada,x.id)<=(r.dibuat_pada,r.id)) END AS queue_position FROM reservasi_buku r;

COMMIT;

COMMENT ON TABLE notifikasi IS 'Log notifikasi mahasiswa. kunci_unik mencegah pengingat H-1 tercatat ganda.';
COMMENT ON TABLE reservasi_buku IS 'Antrean reservasi saat stok habis. Siap Diambil menahan satu eksemplar sampai batas_ambil.';
