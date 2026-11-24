// halaman mahasiswa pinjaman saya
import Link from 'next/link';

import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';

import {
  getStudentStanding,
  MAX_ACTIVE_LOANS,
} from '@/lib/queries';

import {
  formatDate,
  formatRupiah,
} from '@/lib/format';

import BookCover from '@/components/books/BookCover';
import NotificationPanel from '@/components/student/NotificationPanel';
import { CancelReservationButton } from '@/components/student/ReservationButtons';
import { generateDueReminders, getNotifications, countUnread } from '@/lib/notifications';

import {
  ExtensionButton,
  ReviewForm,
} from '@/components/student/StudentActions';

import {
  StatusBadge,
  Stars,
  Mono,
} from '@/components/ui/Badges';

import {
  IconBook,
  IconClock,
  IconCheck,
  IconWallet,
  IconSearch,
} from '@/components/ui/Icons';

export const metadata = {
  title: 'Pinjaman Saya',
};

const ACTIVE = `(
  'Dipinjam',
  'Perpanjangan Diajukan',
  'Perpanjangan Disetujui',
  'Perpanjangan Ditolak'
)`;

function DueLabel({ days }) {
  if (days < 0) {
    return (
      <span className="font-semibold text-danger">
        Terlambat {Math.abs(days)} hari
      </span>
    );
  }

  if (days === 0) {
    return (
      <span className="font-semibold text-amber-700">
        Jatuh tempo hari ini
      </span>
    );
  }

  if (days === 1) {
    return (
      <span className="font-semibold text-amber-700">
        Jatuh tempo besok
      </span>
    );
  }

  return (
    <span className="text-ink-muted">
      Sisa {days} hari
    </span>
  );
}

function extensionReason(loan) {
  if (loan.status === 'Perpanjangan Diajukan') {
    return 'Menunggu validasi pegawai.';
  }

  if (loan.status === 'Perpanjangan Ditolak') {
    return `Perpanjangan ditolak. ${
      loan.reject_reason || 'Kembalikan sesuai jatuh tempo.'
    }`;
  }

  if (
    loan.status === 'Perpanjangan Disetujui' ||
    loan.extension_count > 0
  ) {
    return 'Perpanjangan sudah digunakan.';
  }

  if (loan.days_left < 0) {
    return 'Sudah melewati jatuh tempo.';
  }

  return null;
}

export default async function StudentLoansPage({
  searchParams,
}) {
  const user = await requireRole('mahasiswa');
  const sp = (await searchParams) || {};

  const q = String(sp.q || '').trim().slice(0, 100);

  const params = q
    ? [user.id, `%${q.toLowerCase()}%`]
    : [user.id];

  const search = q
    ? `
      AND (
        LOWER(b.title) LIKE $2
        OR LOWER(b.author) LIKE $2
        OR LOWER(l.code) LIKE $2
        OR b.isbn LIKE $2
      )
    `
    : '';

  // Pengingat H-1 / terlambat dibuat otomatis saat dashboard dibuka (idempoten).
  await generateDueReminders(user.id);

  const [
    standing,
    active,
    pending,
    fines,
    history,
    reservations,
    notifications,
    unread,
  ] = await Promise.all([
    getStudentStanding(user.id),

    query(
      `SELECT
         l.id,
         l.code,
         l.status,
         l.due_date,
         l.extension_count,
         l.reject_reason,
         (l.due_date - CURRENT_DATE)::int AS days_left,
         GREATEST(CURRENT_DATE - l.due_date, 0)
           * l.daily_fine AS est_fine,
         b.id AS book_id,
         b.title,
         b.author,
         b.isbn,
         b.cover_url
       FROM v_peminjaman l
       JOIN v_buku b ON b.id = l.book_id
       WHERE l.user_id = $1
         AND l.status IN ${ACTIVE}
         ${search}
       ORDER BY l.due_date`,
      params
    ),

    query(
      `SELECT
         l.id,
         l.code,
         l.requested_at,
         b.id AS book_id,
         b.title,
         b.author,
         b.isbn,
         b.cover_url
       FROM v_peminjaman l
       JOIN v_buku b ON b.id = l.book_id
       WHERE l.user_id = $1
         AND l.status = 'Menunggu Konfirmasi'
         ${search}
       ORDER BY l.requested_at DESC`,
      params
    ),

    query(
      `SELECT
         l.id,
         l.code,
         l.fine_amount,
         l.return_date,
         GREATEST(
           COALESCE(l.return_date, CURRENT_DATE) - l.due_date,
           0
         )::int AS late_days,
         b.title
       FROM v_peminjaman l
       JOIN v_buku b ON b.id = l.book_id
       WHERE l.user_id = $1
         AND l.fine_status = 'Tertunggak'
         ${search}
       ORDER BY l.due_date`,
      params
    ),

    query(
      `SELECT
         l.id,
         l.code,
         l.status,
         l.requested_at,
         l.loan_date,
         l.return_date,
         l.reject_reason,
         l.fine_amount,
         l.fine_status,
         b.id AS book_id,
         b.title,
         b.author,
         b.isbn,
         b.cover_url,
         rv.id AS review_id,
         rv.rating AS my_rating,
         rv.comment AS my_comment
       FROM v_peminjaman l
       JOIN v_buku b ON b.id = l.book_id
       LEFT JOIN v_penilaian rv
         ON rv.user_id = l.user_id
         AND rv.book_id = l.book_id
       WHERE l.user_id = $1
         AND l.status IN ('Selesai', 'Ditolak')
         ${search}
       ORDER BY
         COALESCE(l.return_date, l.requested_at::date) DESC,
         l.id DESC`,
      params
    ),

    query(
      `SELECT
         r.id,
         r.status,
         r.queue_position,
         r.pickup_deadline,
         r.created_at,
         b.id AS book_id,
         b.title,
         b.author,
         b.isbn,
         b.cover_url
       FROM v_reservasi r
       JOIN v_buku b ON b.id = r.book_id
       WHERE r.user_id = $1
         AND (r.status IN ('Menunggu', 'Siap Diambil')
              OR r.updated_at > NOW() - INTERVAL '14 days')
       ORDER BY (r.status = 'Siap Diambil') DESC,
                (r.status = 'Menunggu') DESC,
                r.updated_at DESC
       LIMIT 10`,
      [user.id]
    ),

    getNotifications(user.id, { limit: 8 }),
    countUnread(user.id),
  ]);

  const blocked = standing.outstanding_fine > 0;

  const stats = [
    {
      label: 'Pinjaman aktif',
      value: `${standing.active_count}/${MAX_ACTIVE_LOANS}`,
      icon: IconBook,
    },
    {
      label: 'Menunggu konfirmasi',
      value: standing.pending_count,
      icon: IconClock,
    },
    {
      label: 'Transaksi selesai',
      value: standing.finished_count,
      icon: IconCheck,
    },
    {
      label: 'Denda tertunggak',
      value: formatRupiah(standing.outstanding_fine),
      icon: IconWallet,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6">
      <section className="w-full rounded-xl border border-navy bg-navy p-5 text-white sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-light">
              Pinjaman Saya
            </p>

            <h1 className="mt-2 break-words text-2xl font-bold leading-tight text-white sm:text-3xl">
              Selamat datang, {user.full_name}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-200">
              <Mono>NIM {user.identity_number}</Mono>
              {' · '}
              {user.study_program}
            </p>
          </div>

          <form
            action="/mahasiswa"
            method="get"
            role="search"
            className="flex w-full gap-2 rounded-lg bg-white p-2 text-navy lg:max-w-md"
          >
            <label
              htmlFor="my-loan-search"
              className="sr-only"
            >
              Cari di Pinjaman Saya
            </label>

            <div className="flex min-w-0 flex-1 items-center gap-2 pl-2">
              <IconSearch className="h-5 w-5 shrink-0 text-ink-muted" />

              <input
                id="my-loan-search"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Cari judul, penulis, atau kode…"
                className="w-full min-w-0 bg-transparent py-2 text-sm text-ink outline-none"
              />
            </div>

            <button
              type="submit"
              className="shrink-0 rounded-md bg-gold px-3 py-2 text-sm font-semibold text-navy"
            >
              Cari Buku
            </button>
          </form>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="min-w-0 rounded-lg border border-line bg-white p-4 text-navy"
            >
              <stat.icon className="h-5 w-5" />

              <p className="mt-2 break-words font-mono text-2xl font-medium">
                {stat.value}
              </p>

              <p className="mt-1 text-sm text-ink-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {q && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-ink-muted">
            Hasil pencarian “
            <strong className="text-navy">{q}</strong>
            ” pada pinjaman dan riwayat Anda.
          </p>

          <Link
            href="/mahasiswa"
            className="font-semibold text-navy underline underline-offset-4"
          >
            Hapus pencarian
          </Link>
        </div>
      )}

      <div className="mt-6 w-full space-y-6">
        <section className="w-full overflow-hidden rounded-xl border border-line bg-white">
          <div className="border-b border-line px-5 py-4">
            <h2 className="display text-2xl">
              Peminjaman Aktif
            </h2>

            <p className="mt-1 text-sm leading-6 text-ink-muted">
              Perpanjangan dapat diajukan sekali per transaksi
              sebelum jatuh tempo.
            </p>
          </div>

          {active.length > 0 ? (
            <ul className="divide-y divide-line">
              {active.map((loan) => (
                <li
                  key={loan.id}
                  className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-4 px-5 py-4 md:grid-cols-[56px_minmax(0,1fr)_auto]"
                >
                  <Link href={`/buku/${loan.book_id}`}>
                    <BookCover
                      isbn={loan.isbn}
                      src={loan.cover_url}
                      title={loan.title}
                      author={loan.author}
                      size="xs"
                    />
                  </Link>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Mono className="text-ink-muted">
                        {loan.code}
                      </Mono>

                      <StatusBadge status={loan.status} />
                    </div>

                    <p className="mt-2 break-words font-bold text-navy">
                      {loan.title}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-ink-muted">
                      Jatuh tempo{' '}
                      <Mono>
                        {formatDate(loan.due_date)}
                      </Mono>
                      {' · '}
                      <DueLabel days={loan.days_left} />
                    </p>

                    {loan.est_fine > 0 && (
                      <p className="mt-1 text-sm text-danger">
                        Denda berjalan:{' '}
                        {formatRupiah(loan.est_fine)}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 flex justify-end md:col-span-1">
                    <ExtensionButton
                      loanId={loan.id}
                      disabledReason={extensionReason(loan)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-ink-muted">
              {q
                ? 'Tidak ada pinjaman aktif yang sesuai pencarian.'
                : 'Tidak ada buku yang sedang dipinjam.'}
            </p>
          )}
        </section>

        <NotificationPanel items={notifications} unread={unread} />

        {blocked && (
          <section className="w-full rounded-xl border border-red-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold text-danger">
              Denda tertunggak{' '}
              {formatRupiah(standing.outstanding_fine)}
            </h2>

            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Lunasi seluruh denda di meja layanan sebelum
              mengajukan pinjaman baru.
            </p>

            {fines.length > 0 && (
              <ul className="mt-4 divide-y divide-line">
                {fines.map((fine) => (
                  <li
                    key={fine.id}
                    className="flex flex-wrap items-start justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <Mono>{fine.code}</Mono>

                      <p className="mt-1 break-words text-sm font-semibold text-navy">
                        {fine.title}
                      </p>

                      <p className="mt-1 text-sm text-ink-muted">
                        Terlambat {fine.late_days} hari
                        {!fine.return_date &&
                          ' · Denda masih berjalan'}
                      </p>
                    </div>

                    <span className="font-mono text-sm font-semibold text-danger">
                      {formatRupiah(fine.fine_amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {reservations.length > 0 && (
          <section className="w-full overflow-hidden rounded-xl border border-line bg-white">
            <div className="border-b border-line px-5 py-4">
              <h2 className="display text-2xl">
                Reservasi Saya
              </h2>

              <p className="mt-1 text-sm leading-6 text-ink-muted">
                Antrean buku yang stoknya sedang habis. Buku yang siap diambil ditahan selama 2 hari.
              </p>
            </div>

            <ul className="divide-y divide-line">
              {reservations.map((r) => {
                const activeReservation = r.status === 'Menunggu' || r.status === 'Siap Diambil';
                return (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <Link href={`/buku/${r.book_id}`} className="w-10 shrink-0">
                        <BookCover
                          isbn={r.isbn}
                          src={r.cover_url}
                          title={r.title}
                          author={r.author}
                          size="xs"
                        />
                      </Link>

                      <div className="min-w-0">
                        <p className="break-words font-semibold text-navy">
                          {r.title}
                        </p>

                        <p className="mt-1 text-sm text-ink-muted">
                          {r.status === 'Menunggu' && <>Posisi antrean <Mono className="font-semibold text-navy">#{r.queue_position}</Mono></>}
                          {r.status === 'Siap Diambil' && (
                            <span className="font-semibold text-emerald-700">
                              Siap dipinjam — ajukan sebelum{' '}
                              <Mono>{formatDate(r.pickup_deadline)}</Mono>
                            </span>
                          )}
                          {!activeReservation && <>Reservasi {r.status.toLowerCase()}</>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {r.status === 'Siap Diambil' && (
                        <Link href={`/buku/${r.book_id}`} className="btn-primary btn-sm">
                          Ajukan Pinjam
                        </Link>
                      )}
                      {activeReservation ? (
                        <CancelReservationButton reservationId={r.id} />
                      ) : (
                        <StatusBadge status={r.status} />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {pending.length > 0 && (
          <section className="w-full overflow-hidden rounded-xl border border-line bg-white">
            <div className="border-b border-line px-5 py-4">
              <h2 className="display text-2xl">
                Menunggu Konfirmasi
              </h2>
            </div>

            <ul className="divide-y divide-line">
              {pending.map((loan) => (
                <li
                  key={loan.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <Mono>{loan.code}</Mono>

                    <p className="mt-1 break-words font-semibold text-navy">
                      {loan.title}
                    </p>
                  </div>

                  <StatusBadge status="Menunggu Konfirmasi" />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="w-full overflow-hidden rounded-xl border border-line bg-white">
          <div className="border-b border-line px-5 py-4">
            <h2 className="display text-2xl">
              Riwayat Transaksi
            </h2>

            <p className="mt-1 text-sm leading-6 text-ink-muted">
              Penilaian yang sudah diberikan ditampilkan
              pada riwayat buku.
            </p>
          </div>

          {history.length > 0 ? (
            <ul className="divide-y divide-line">
              {history.map((loan) => (
                <li
                  key={loan.id}
                  className="flex gap-4 px-5 py-4"
                >
                  <Link
                    href={`/buku/${loan.book_id}`}
                    className="w-12 shrink-0"
                  >
                    <BookCover
                      isbn={loan.isbn}
                      src={loan.cover_url}
                      title={loan.title}
                      author={loan.author}
                      size="xs"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Mono className="text-ink-muted">
                        {loan.code}
                      </Mono>

                      <StatusBadge status={loan.status} />

                      {loan.fine_status && (
                        <StatusBadge
                          status={loan.fine_status}
                        />
                      )}
                    </div>

                    <p className="mt-2 break-words font-bold text-navy">
                      {loan.title}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-ink-muted">
                      {loan.status === 'Selesai' ? (
                        <>
                          Dipinjam{' '}
                          <Mono>
                            {formatDate(loan.loan_date, {
                              short: true,
                            })}
                          </Mono>
                          {' · '}
                          Dikembalikan{' '}
                          <Mono>
                            {formatDate(loan.return_date, {
                              short: true,
                            })}
                          </Mono>
                        </>
                      ) : (
                        <>
                          Diajukan{' '}
                          <Mono>
                            {formatDate(loan.requested_at, {
                              short: true,
                            })}
                          </Mono>
                          {' · '}
                          {loan.reject_reason}
                        </>
                      )}
                    </p>

                    {loan.status === 'Selesai' && (
                      <div className="mt-3">
                        {loan.review_id ? (
                          <div className="rounded-lg bg-canvas px-4 py-3">
                            <Stars
                              value={loan.my_rating}
                              size="h-4 w-4"
                            />

                            <p className="mt-2 break-words text-sm italic leading-6 text-ink-muted">
                              “{loan.my_comment}”
                            </p>
                          </div>
                        ) : (
                          <ReviewForm
                            loanId={loan.id}
                            bookTitle={loan.title}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-ink-muted">
              {q
                ? 'Tidak ada riwayat yang sesuai pencarian.'
                : 'Belum ada riwayat transaksi.'}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}