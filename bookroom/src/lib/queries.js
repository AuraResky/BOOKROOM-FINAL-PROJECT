import { query, one } from './db';

// Batas jumlah pinjaman aktif mahasiswa
export const MAX_ACTIVE_LOANS = 3;

// Kolom data buku, kategori, dan rating
const BOOK_COLUMNS = `
  b.id, b.title, b.isbn, b.author, b.publisher, b.publish_year,
  b.stock, b.max_loan_days, b.fine_per_day, b.cover_url,
  b.description, b.category_id,
  c.name AS category_name, c.code AS category_code,
  COALESCE(r.avg_rating, 0)::float AS avg_rating,
  COALESCE(r.review_count, 0)::int AS review_count`;

// Menggabungkan rata-rata rating dan jumlah ulasan
const RATING_JOIN = `
  LEFT JOIN (
    SELECT
      book_id,
      ROUND(AVG(rating)::numeric, 1) AS avg_rating,
      COUNT(*) AS review_count
    FROM v_penilaian
    GROUP BY book_id
  ) r ON r.book_id = b.id`;

// Mengambil buku terpopuler berdasarkan jumlah peminjaman
export function getPopularBooks(limit = 5) {
  return query(
    `SELECT ${BOOK_COLUMNS},
      (
        SELECT COUNT(*)::int
        FROM v_peminjaman l
        WHERE l.book_id = b.id
          AND l.status NOT IN ('Menunggu Konfirmasi', 'Ditolak')
      ) AS loan_count
    FROM v_buku b
    JOIN v_kategori c ON c.id = b.category_id
    ${RATING_JOIN}
    ORDER BY loan_count DESC, avg_rating DESC, b.title
    LIMIT $1`,
    [limit]
  );
}

// Pilihan pengurutan query katalog
const SORTS = {
  terbaru: 'b.publish_year DESC, b.title',
  terlama: 'b.publish_year ASC, b.title',
  rating: 'avg_rating DESC, review_count DESC, b.title',
  judul: 'b.title ASC',
  populer: 'loan_count DESC, avg_rating DESC, b.title',
};

// Label pilihan pengurutan pada tampilan
export const SORT_OPTIONS = [
  { value: 'terbaru', label: 'Tahun terbit terbaru' },
  { value: 'terlama', label: 'Tahun terbit terlama' },
  { value: 'rating', label: 'Rating tertinggi' },
  { value: 'populer', label: 'Paling sering dipinjam' },
  { value: 'judul', label: 'Judul A–Z' },
];

// Mengambil katalog dengan pencarian, filter, dan pagination
export async function getCatalog({
  q = '',
  category = '',
  availability = '',
  sort = 'terbaru',
  page = 1,
  perPage = 12,
}) {
  const where = [];
  const params = [];

  // Pencarian judul, penulis, atau ISBN
  if (q) {
    params.push(`%${q.toLowerCase()}%`);

    where.push(
      `(LOWER(b.title) LIKE $${params.length}
        OR LOWER(b.author) LIKE $${params.length}
        OR b.isbn LIKE $${params.length})`
    );
  }

  // Filter kategori buku
  if (category) {
    params.push(category.toUpperCase());
    where.push(`UPPER(c.code) = $${params.length}`);
  }

  // Filter ketersediaan stok
  if (availability === 'tersedia') {
    where.push('b.stock > 0');
  }

  if (availability === 'dipinjam') {
    where.push('b.stock = 0');
  }

  const whereSql = where.length
    ? `WHERE ${where.join(' AND ')}`
    : '';

  const orderSql = SORTS[sort] || SORTS.terbaru;

  // Menghitung total buku sesuai filter
  const totalRow = await one(
    `SELECT COUNT(*)::int AS total
     FROM v_buku b
     JOIN v_kategori c ON c.id = b.category_id
     ${whereSql}`,
    params
  );

  // Menentukan posisi awal data halaman
  const offset = (Math.max(1, page) - 1) * perPage;

  // Mengambil buku pada halaman yang dipilih
  const rows = await query(
    `SELECT ${BOOK_COLUMNS},
      (
        SELECT COUNT(*)::int
        FROM v_peminjaman l
        WHERE l.book_id = b.id
          AND l.status NOT IN ('Menunggu Konfirmasi', 'Ditolak')
      ) AS loan_count
    FROM v_buku b
    JOIN v_kategori c ON c.id = b.category_id
    ${RATING_JOIN}
    ${whereSql}
    ORDER BY ${orderSql}
    LIMIT ${perPage} OFFSET ${offset}`,
    params
  );

  return {
    rows,
    total: totalRow.total,
    pages: Math.max(1, Math.ceil(totalRow.total / perPage)),
  };
}

// Mengambil detail buku dan jumlah buku yang dipinjam
export function getBook(id) {
  if (!/^\d+$/.test(String(id))) return null;

  return one(
    `SELECT ${BOOK_COLUMNS},
      (
        SELECT COUNT(*)::int
        FROM v_peminjaman l
        WHERE l.book_id = b.id
          AND l.status IN (
            'Dipinjam',
            'Perpanjangan Diajukan',
            'Perpanjangan Disetujui',
            'Perpanjangan Ditolak'
          )
      ) AS on_loan
    FROM v_buku b
    JOIN v_kategori c ON c.id = b.category_id
    ${RATING_JOIN}
    WHERE b.id = $1`,
    [id]
  );
}

// Mengambil ulasan buku beserta nama penulis ulasan
export function getBookReviews(bookId) {
  return query(
    `SELECT
      rv.id,
      rv.rating,
      rv.comment,
      rv.created_at,
      u.full_name,
      u.study_program
    FROM v_penilaian rv
    JOIN v_pengguna u ON u.id = rv.user_id
    WHERE rv.book_id = $1
    ORDER BY rv.created_at DESC`,
    [bookId]
  );
}

// Mengambil rekomendasi buku dalam kategori yang sama
export function getRelatedBooks(bookId, categoryId, limit = 4) {
  return query(
    `SELECT ${BOOK_COLUMNS}
     FROM v_buku b
     JOIN v_kategori c ON c.id = b.category_id
     ${RATING_JOIN}
     WHERE b.category_id = $1
       AND b.id <> $2
     ORDER BY avg_rating DESC
     LIMIT $3`,
    [categoryId, bookId, limit]
  );
}

// Mengambil kategori beserta jumlah judul buku
export function getCategoriesWithCount() {
  return query(
    `SELECT
      c.id,
      c.name,
      c.code,
      c.description,
      c.created_at,
      COUNT(b.id)::int AS book_count
    FROM v_kategori c
    LEFT JOIN v_buku b ON b.category_id = c.id
    GROUP BY c.id, c.name, c.code, c.description, c.created_at
    ORDER BY c.code`
  );
}

// Mengambil pengumuman yang sudah masuk tanggal tayang
export function getPublishedAnnouncements(limit = 3) {
  return query(
    `SELECT
      a.id,
      a.title,
      a.content,
      a.category,
      a.release_date,
      u.full_name AS author_name
    FROM v_pengumuman a
    LEFT JOIN v_pengguna u ON u.id = a.author_id
    WHERE a.status = 'Published'
      AND a.release_date <= CURRENT_DATE
    ORDER BY a.release_date DESC, a.id DESC
    LIMIT $1`,
    [limit]
  );
}

// Mengambil ringkasan pinjaman dan denda mahasiswa
export function getStudentStanding(userId) {
  return one(
    `SELECT
      COALESCE(
        SUM(fine_amount)
        FILTER (WHERE fine_status = 'Tertunggak'),
        0
      )::int AS outstanding_fine,

      COUNT(*)
        FILTER (WHERE fine_status = 'Tertunggak')
        ::int AS outstanding_count,

      COUNT(*)
        FILTER (
          WHERE status IN (
            'Dipinjam',
            'Perpanjangan Diajukan',
            'Perpanjangan Disetujui',
            'Perpanjangan Ditolak'
          )
        )::int AS active_count,

      COUNT(*)
        FILTER (WHERE status = 'Menunggu Konfirmasi')
        ::int AS pending_count,

      COUNT(*)
        FILTER (WHERE status = 'Selesai')
        ::int AS finished_count

    FROM v_peminjaman
    WHERE user_id = $1`,
    [userId]
  );
}

// Mengambil statistik koleksi, pinjaman, dan anggota aktif
export function getHomeStats() {
  return one(`
    SELECT
      (
        SELECT COALESCE(SUM(stock), 0)
        FROM v_buku
      )::int
      +
      (
        SELECT COUNT(*)
        FROM v_peminjaman
        WHERE status IN (
          'Dipinjam',
          'Perpanjangan Diajukan',
          'Perpanjangan Disetujui',
          'Perpanjangan Ditolak'
        )
      )::int AS total_copies,

      (
        SELECT COUNT(*)
        FROM v_buku
      )::int AS titles,

      (
        SELECT COUNT(*)
        FROM v_peminjaman
        WHERE status IN (
          'Dipinjam',
          'Perpanjangan Diajukan',
          'Perpanjangan Disetujui',
          'Perpanjangan Ditolak'
        )
      )::int AS on_loan,

      (
        SELECT COUNT(*)
        FROM v_pengguna
        WHERE role = 'mahasiswa'
          AND is_active
      )::int AS active_members
  `);
}