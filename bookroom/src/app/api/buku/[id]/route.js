// detail pustaka + ulasan + info antrean reservasi (publik).
import { getBook, getBookReviews } from '@/lib/queries';
import { one } from '@/lib/db';
import { json, apiError, handle } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const GET = handle(async (_request, { params }) => {
  const { id } = await params;
  if (!/^\d+$/.test(String(id))) return apiError(400, 'ID buku harus berupa angka.');
  const book = await getBook(id);
  if (!book) return apiError(404, 'Buku tidak ditemukan.');

  const [reviews, queue] = await Promise.all([
    getBookReviews(book.id),
    one(`SELECT COUNT(*) FILTER (WHERE status='Menunggu')::int AS waiting,
                COUNT(*) FILTER (WHERE status='Siap Diambil')::int AS on_hold
           FROM v_reservasi WHERE book_id=$1`, [book.id]),
  ]);

  return json({
    ok: true,
    data: {
      id: book.id,
      title: book.title,
      isbn: book.isbn,
      author: book.author,
      publisher: book.publisher,
      publish_year: book.publish_year,
      category: { name: book.category_name, code: book.category_code },
      stock: book.stock,
      on_loan: book.on_loan,
      max_loan_days: book.max_loan_days,
      fine_per_day: book.fine_per_day,
      description: book.description,
      cover_url: book.cover_url,
      avg_rating: book.avg_rating,
      review_count: book.review_count,
      reservation_queue: queue,
      reviews: reviews.map((r) => ({ id: r.id, rating: r.rating, comment: r.comment, reviewer: r.full_name, created_at: r.created_at })),
    },
  });
});
