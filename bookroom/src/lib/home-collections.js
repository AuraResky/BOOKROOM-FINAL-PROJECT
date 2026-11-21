import { query } from './db';

// Mengambil buku tiap kategori dalam satu query
export function getHomeCategoryBooks(limit = 6) {
  return query(
    `WITH ranked_books AS (
      SELECT
        b.id,
        b.title,
        b.author,
        b.isbn,
        b.cover_url,
        b.stock,
        b.publish_year,
        b.category_id,
        c.name AS category_name,
        c.code AS category_code,
        COALESCE(r.avg_rating, 0)::float AS avg_rating,
        COALESCE(r.review_count, 0)::int AS review_count,

        ROW_NUMBER() OVER (
          PARTITION BY b.category_id
          ORDER BY b.publish_year DESC, b.id DESC
        ) AS category_rank

      FROM v_buku b
      JOIN v_kategori c ON c.id = b.category_id

      LEFT JOIN (
        SELECT
          book_id,
          ROUND(AVG(rating)::numeric, 1) AS avg_rating,
          COUNT(*) AS review_count
        FROM v_penilaian
        GROUP BY book_id
      ) r ON r.book_id = b.id
    )

    SELECT *
    FROM ranked_books
    WHERE category_rank <= $1
    ORDER BY category_code, category_rank`,
    [
      Math.max(
        1,
        Math.min(12, Math.trunc(Number(limit) || 6))
      ),
    ]
  );
}

// Memilih tiga buku untuk ilustrasi hero
export function selectHeroBooks(books) {
  // Menghapus duplikasi berdasarkan ID buku
  const unique = [
    ...new Map(
      books.map((book) => [String(book.id), book])
    ).values(),
  ];

  // Mengutamakan judul buku pada referensi hero
  const pick = (pattern) =>
    unique.find((book) => pattern.test(book.title));

  const middle = pick(/clean code/i);
  const left = pick(/laut bercerita/i);
  const right = pick(/hukum tata negara/i);

  const reserved = new Set(
    [left, middle, right]
      .filter(Boolean)
      .map((book) => String(book.id))
  );

  // Menyiapkan buku pengganti untuk posisi yang kosong
  const remaining = unique.filter(
    (book) => !reserved.has(String(book.id))
  );

  return [
    left || remaining.shift(),
    middle || remaining.shift(),
    right || remaining.shift(),
  ].filter(Boolean);
}