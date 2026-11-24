// Halaman: api dan halaman detail buku
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { one } from '@/lib/db';
import { getBook, getBookReviews, getRelatedBooks, getStudentStanding, MAX_ACTIVE_LOANS } from '@/lib/queries';
import { formatRupiah, formatDate, initials } from '@/lib/format';
import BookCover from '@/components/books/BookCover';
import BookCard from '@/components/books/BookCard';
import LoanRequestButton from '@/components/student/LoanRequestButton';
import { ReserveButton, CancelReservationButton } from '@/components/student/ReservationButtons';
import { Stars, StockBadge, Mono, StatusBadge } from '@/components/ui/Badges';
import { IconArrowLeft } from '@/components/ui/Icons';
import { CategoryPill, AvailabilityPill } from '@/components/site/Pills';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const book = await getBook(id);
  return { title: book ? book.title : 'Buku tidak ditemukan' };
}

export default async function BookDetailPage({ params }) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) notFound();

  const user = await getCurrentUser();
  const isStudent = user?.role === 'mahasiswa';
  const [reviews, related, standing, openLoan, queue, myReservation] = await Promise.all([
    getBookReviews(book.id),
    getRelatedBooks(book.id, book.category_id),
    isStudent ? getStudentStanding(user.id) : null,
    isStudent
      ? one(`SELECT code, status FROM v_peminjaman WHERE user_id = $1 AND book_id = $2 AND status NOT IN ('Selesai','Ditolak') LIMIT 1`, [user.id, book.id])
      : null,
    // Antrean reservasi: buku "Siap Diambil" milik orang lain mengurangi stok yang bisa diajukan
    one(`SELECT COUNT(*) FILTER (WHERE status = 'Menunggu')::int AS waiting,
                COUNT(*) FILTER (WHERE status = 'Siap Diambil' AND pickup_deadline >= CURRENT_DATE AND user_id <> $2)::int AS held_others
           FROM v_reservasi WHERE book_id = $1`, [book.id, user?.id ?? 0]),
    isStudent
      ? one(`SELECT id, status, queue_position, pickup_deadline FROM v_reservasi
              WHERE user_id = $1 AND book_id = $2 AND status IN ('Menunggu','Siap Diambil') LIMIT 1`, [user.id, book.id])
      : null,
  ]);
  const available = Math.max(0, book.stock - queue.held_others);
  const reserveMode = isStudent && available < 1 && !openLoan;

  let disabledReason = null;
  let reserveDisabled = null;
  if (isStudent) {
    const fineBlock = standing.outstanding_fine > 0
      ? `Peminjaman diblokir: Anda memiliki denda Tertunggak sebesar ${formatRupiah(standing.outstanding_fine)}.`
      : null;
    if (fineBlock) disabledReason = fineBlock;
    else if (openLoan) disabledReason = `Anda sudah memiliki transaksi ${openLoan.code} untuk buku ini (${openLoan.status}).`;
    else if (available < 1) disabledReason = 'Stok buku sedang habis. Silakan masuk antrean reservasi.';
    else if (standing.active_count + standing.pending_count >= MAX_ACTIVE_LOANS) disabledReason = `Batas ${MAX_ACTIVE_LOANS} pinjaman/pengajuan aktif telah tercapai.`;
    reserveDisabled = fineBlock;
  }

  const meta = [
    ['ISBN', <Mono key="i">{book.isbn}</Mono>],
    ['Pengarang', book.author],
    ['Penerbit', book.publisher],
    ['Tahun Terbit', <Mono key="y">{book.publish_year}</Mono>],
    ['Kategori', <span key="c">{book.category_name} <Mono className="text-ink-soft">· {book.category_code}</Mono></span>],
    ['Stok Buku', <StockBadge key="s" stock={book.stock} />],
    ['Maks. Lama Pinjam', `${book.max_loan_days} hari`],
    ['Tarif Denda', `${formatRupiah(book.fine_per_day)} / hari`],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <Link href="/katalog" className="btn-outline btn-sm">
        <IconArrowLeft className="h-4 w-4" /> Kembali ke katalog
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[320px_1fr]">
        <div className="relative">
          <div className="sticky top-24 overflow-hidden rounded-xl border border-navy bg-navy p-8 shadow-lift">
            
            
            
            <div className="group relative mx-auto w-full max-w-[230px] transition duration-500 hover:-translate-y-0.5 ">
              <BookCover isbn={book.isbn} src={book.cover_url} title={book.title} author={book.author} size="lg" priority />
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap gap-2"><CategoryPill name={book.category_name} code={book.category_code} /><AvailabilityPill stock={book.stock} /></div>
          <h1 className="display mt-3 text-4xl leading-[1.05] sm:text-5xl">{book.title}</h1>
          <p className="mt-2 text-base text-ink-muted">oleh <span className="font-semibold text-ink">{book.author}</span></p>
          <div className="mt-3"><Stars value={book.avg_rating} showValue count={book.review_count} /></div>

          {book.description && <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink">{book.description}</p>}

          <dl className="card mt-6 grid gap-x-8 gap-y-4 bg-cream-100 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {meta.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs font-bold uppercase tracking-wider text-ink-soft">{k}</dt>
                <dd className="mt-1 text-sm font-semibold text-navy">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6">
            {isStudent && myReservation && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/50 bg-sun-soft px-5 py-4">
                <div className="text-sm">
                  {myReservation.status === 'Siap Diambil' ? (
                    <>
                      <p className="font-bold text-navy">Reservasi Anda siap dipinjam</p>
                      <p className="mt-1 text-ink-muted">Satu buku ditahan untuk Anda. Ajukan pinjam paling lambat <Mono>{formatDate(myReservation.pickup_deadline)}</Mono>.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-navy">Anda berada di antrean reservasi #{myReservation.queue_position}</p>
                      <p className="mt-1 text-ink-muted">Notifikasi dikirim saat buku kembali dan siap diambil.</p>
                    </>
                  )}
                </div>
                <CancelReservationButton reservationId={myReservation.id} />
              </div>
            )}
            {isStudent ? (
              reserveMode && !myReservation ? (
                <ReserveButton bookId={book.id} disabledReason={reserveDisabled} queueLength={queue.waiting} />
              ) : reserveMode ? null : (
                <>
                  {openLoan && <p className="mb-3 text-sm text-ink-muted">Status pengajuan Anda: <StatusBadge status={openLoan.status} /></p>}
                  <LoanRequestButton bookId={book.id} disabledReason={disabledReason} />
                </>
              )
            ) : !user ? (
              <p className="text-sm text-ink-muted">
                Peminjaman tersedia untuk anggota mahasiswa.{' '}
                <Link href="/login" className="font-semibold text-navy underline-offset-4 hover:underline">Masuk</Link> atau{' '}
                <Link href="/register" className="font-semibold text-navy underline-offset-4 hover:underline">daftar</Link> untuk mengajukan pinjam{book.stock < 1 ? ' atau reservasi' : ''}.
                {book.stock < 1 && queue.waiting > 0 && <span className="mt-1 block">Antrean reservasi saat ini: <Mono>{queue.waiting}</Mono> mahasiswa.</span>}
              </p>
            ) : null}
          </div>

          <section className="mt-12">
            <h2 className="display flex items-start text-3xl">Ulasan Pembaca <span className="ml-2 mt-1 font-mono text-base text-ink-soft">({reviews.length})</span></h2>
            {reviews.length ? (
              <ul className="mt-5 space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="card p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-navy bg-coral text-xs font-bold text-white">{initials(r.full_name)}</span>
                        <div>
                          <p className="text-sm font-bold text-navy">{r.full_name}</p>
                          <p className="text-xs text-ink-muted">{r.study_program} · <Mono>{formatDate(r.created_at, { short: true })}</Mono></p>
                        </div>
                      </div>
                      <Stars value={r.rating} />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink">{r.comment}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="card mt-5 p-6 text-sm text-ink-muted">Belum ada ulasan. Mahasiswa dapat memberi ulasan setelah transaksi peminjaman buku ini selesai.</p>
            )}
          </section>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="display flex items-start text-3xl">Buku Lain di {book.category_name}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {related.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </section>
      )}
    </div>
  );
}
