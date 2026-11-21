import { query, one } from './db.js';

// Status pinjaman yang masih aktif
const ACTIVE = `(
  'Dipinjam',
  'Perpanjangan Diajukan',
  'Perpanjangan Disetujui',
  'Perpanjangan Ditolak'
)`;

// Jenis notifikasi yang tersedia
const TYPES = [
  'Peminjaman',
  'Perpanjangan',
  'Jatuh Tempo',
  'Pengembalian',
  'Denda',
  'Reservasi',
];

// Menyimpan notifikasi dan mencegah duplikasi berdasarkan kunci
export async function notify(
  db,
  userId,
  { jenis, judul, pesan, tautan = null, kunci = null }
) {
  if (!TYPES.includes(jenis)) {
    throw new Error(`Jenis notifikasi tidak dikenal: ${jenis}`);
  }

  // Menggunakan transaksi atau koneksi database biasa
  const run = db?.query ?? query;

  await run(
    `INSERT INTO notifikasi (
      id_pengguna,
      jenis,
      judul,
      pesan,
      tautan,
      kunci_unik
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id_pengguna, kunci_unik)
    WHERE kunci_unik IS NOT NULL
    DO NOTHING`,
    [
      userId,
      jenis,
      judul.slice(0, 150),
      pesan,
      tautan,
      kunci,
    ]
  );
}

// Membuat pengingat H-1 jatuh tempo dan keterlambatan
export async function generateDueReminders(userId) {
  await query(
    `INSERT INTO notifikasi (
      id_pengguna,
      jenis,
      judul,
      pesan,
      tautan,
      kunci_unik
    )
    SELECT
      p.id_pengguna,
      'Jatuh Tempo',
      'Pengingat: jatuh tempo besok',
      'Buku "' || b.judul || '" (' || p.kode_transaksi ||
      ') jatuh tempo besok, ' ||
      TO_CHAR(p.tanggal_jatuh_tempo, 'DD-MM-YYYY') ||
      '. Kembalikan atau ajukan perpanjangan agar tidak terkena denda.',
      '/mahasiswa',
      'h1-' || p.id || '-' || p.tanggal_jatuh_tempo
    FROM peminjaman p
    JOIN buku b ON b.id = p.id_buku
    WHERE p.id_pengguna = $1
      AND p.status IN ${ACTIVE}
      AND p.tanggal_jatuh_tempo = CURRENT_DATE + 1

    UNION ALL

    SELECT
      p.id_pengguna,
      'Denda',
      'Buku melewati jatuh tempo',
      'Buku "' || b.judul || '" (' || p.kode_transaksi ||
      ') sudah melewati jatuh tempo. Denda berjalan Rp' ||
      TO_CHAR(p.tarif_denda_harian, 'FM999G999G999') ||
      ' per hari sampai buku dikembalikan.',
      '/mahasiswa',
      'telat-' || p.id || '-' || p.tanggal_jatuh_tempo
    FROM peminjaman p
    JOIN buku b ON b.id = p.id_buku
    WHERE p.id_pengguna = $1
      AND p.status IN ${ACTIVE}
      AND p.tanggal_jatuh_tempo < CURRENT_DATE
      AND p.tarif_denda_harian > 0

    ON CONFLICT (id_pengguna, kunci_unik)
    WHERE kunci_unik IS NOT NULL
    DO NOTHING`,
    [userId]
  );
}

// Mengambil daftar notifikasi terbaru milik pengguna
export function getNotifications(
  userId,
  { limit = 20, unreadOnly = false } = {}
) {
  return query(
    `SELECT
      id,
      jenis AS type,
      title,
      message,
      link,
      is_read,
      created_at
    FROM v_notifikasi
    WHERE user_id = $1
      ${unreadOnly ? 'AND is_read = FALSE' : ''}
    ORDER BY created_at DESC, id DESC
    LIMIT $2`,
    [
      userId,
      Math.min(Math.max(Number(limit) || 20, 1), 100),
    ]
  );
}

// Menghitung notifikasi yang belum dibaca
export async function countUnread(userId) {
  const row = await one(
    `SELECT COUNT(*)::int AS n
     FROM notifikasi
     WHERE id_pengguna = $1
       AND dibaca = FALSE`,
    [userId]
  );

  return row.n;
}

// Menandai notifikasi tertentu atau seluruhnya sebagai dibaca
export async function markRead(userId, ids = null) {
  const clean = Array.isArray(ids)
    ? ids
        .map(Number)
        .filter((n) => Number.isSafeInteger(n) && n > 0)
    : null;

  const rows = clean
    ? await query(
        `UPDATE notifikasi
         SET dibaca = TRUE
         WHERE id_pengguna = $1
           AND id = ANY($2::int[])
           AND dibaca = FALSE
         RETURNING id`,
        [userId, clean]
      )
    : await query(
        `UPDATE notifikasi
         SET dibaca = TRUE
         WHERE id_pengguna = $1
           AND dibaca = FALSE
         RETURNING id`,
        [userId]
      );

  return rows.length;
}