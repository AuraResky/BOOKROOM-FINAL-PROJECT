// kontrol sirkulasi dan dashboard pegawai
import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { query, one } from '@/lib/db';

import {
  formatDate,
  formatDateTime,
  formatRupiah,
  timeAgo,
} from '@/lib/format';

import {
  PageHeader,
  StatCard,
} from '@/components/staff/StaffShell';

import BookCover from '@/components/books/BookCover';

import {
  StatusBadge,
  Mono,
} from '@/components/ui/Badges';

import {
  VerifyActions,
  ExtensionActions,
  ReturnAction,
  PayFineAction,
} from '@/components/staff/CirculationActions';

import {
  IconClock,
  IconRepeat,
  IconBook,
  IconWallet,
  IconSearch,
  IconBooks,
  IconMegaphone,
  IconArrowRight,
} from '@/components/ui/Icons';

export const metadata = {
  title: 'Dashboard dan Layanan',
};

const ACTIVE = `(
  'Dipinjam',
  'Perpanjangan Diajukan',
  'Perpanjangan Disetujui',
  'Perpanjangan Ditolak'
)`;

const TABS = [
  {
    key: 'verifikasi',
    label: 'Verifikasi Peminjaman',
  },
  {
    key: 'perpanjangan',
    label: 'Validasi Perpanjangan',
  },
  {
    key: 'pengembalian',
    label: 'Pengembalian',
  },
  {
    key: 'riwayat',
    label: 'Riwayat Layanan',
  },
  {
    key: 'denda',
    label: 'Denda Tertunggak',
  },
];

const BASE = `
  SELECT
    l.id,
    l.code,
    l.status,
    l.requested_at,
    l.loan_date,
    l.due_date,
    l.return_date,
    l.extension_count,
    l.fine_amount,
    l.fine_status,
    l.loan_days,

    (CURRENT_DATE - l.due_date)::int AS late_days,
    (l.return_date - l.due_date)::int AS returned_late,

    GREATEST(CURRENT_DATE - l.due_date, 0) * l.daily_fine AS est_fine,

    b.id AS book_id,
    b.title,
    b.author,
    b.isbn,
    b.cover_url,
    b.stock,
    b.max_loan_days,

    u.full_name,
    u.identity_number,

    (
      SELECT COALESCE(SUM(x.fine_amount), 0)::int
      FROM v_peminjaman x
      WHERE x.user_id = u.id
        AND x.fine_status = 'Tertunggak'
    ) AS user_fines

  FROM v_peminjaman l
  JOIN v_buku b ON b.id = l.book_id
  JOIN v_pengguna u ON u.id = l.user_id
`;

function BookCell({ transaction }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 shrink-0">
        <BookCover
          isbn={transaction.isbn}
          src={transaction.cover_url}
          title={transaction.title}
          author={transaction.author}
          size="xs"
        />
      </div>

      <div className="min-w-0">
        <p className="font-semibold leading-snug text-navy">
          {transaction.title}
        </p>

        <Mono className="text-ink-soft">
          {transaction.isbn}
        </Mono>
      </div>
    </div>
  );
}

function MemberCell({ transaction }) {
  return (
    <div>
      <p className="font-semibold text-ink">
        {transaction.full_name}
      </p>

      <Mono className="text-ink-soft">
        {transaction.identity_number}
      </Mono>

      {transaction.user_fines > 0 && (
        <p className="mt-1 text-xs font-semibold text-danger">
          Denda tertunggak{' '}
          {formatRupiah(transaction.user_fines)}
        </p>
      )}
    </div>
  );
}

export default async function CirculationPage({
  searchParams,
}) {
  const user = await requireRole('pegawai', 'admin');
  const sp = (await searchParams) || {};

  const isAdmin = user.role === 'admin';
  const basePath = isAdmin ? '/admin/layanan-pinjam' : '/pegawai';

  const tab = TABS.some((item) => item.key === sp.tab)
    ? sp.tab
    : isAdmin
      ? 'verifikasi'
      : null;

  const q = String(sp.q || '').trim().slice(0, 60);

  const eyebrow =
    user.role === 'admin'
      ? 'Admin'
      : 'Pegawai Perpustakaan';

  const counts = await one(`
    SELECT
      COUNT(*) FILTER (
        WHERE status = 'Menunggu Konfirmasi'
      )::int AS verifikasi,

      COUNT(*) FILTER (
        WHERE status = 'Perpanjangan Diajukan'
      )::int AS perpanjangan,

      COUNT(*) FILTER (
        WHERE status IN ${ACTIVE}
      )::int AS pengembalian,

      COUNT(*) FILTER (
        WHERE status IN ${ACTIVE}
          AND due_date < CURRENT_DATE
      )::int AS overdue,

      COALESCE(
        SUM(fine_amount) FILTER (
          WHERE fine_status = 'Tertunggak'
        ),
        0
      )::int AS fine_total,

      COUNT(*) FILTER (
        WHERE fine_status = 'Tertunggak'
      )::int AS denda,

      (SELECT COUNT(*) FROM reservasi_buku
        WHERE status IN ('Menunggu','Siap Diambil'))::int AS reservasi

    FROM v_peminjaman
  `);

  // Tanpa parameter tab, tampilkan Dashboard saja.
  if (!tab) {
    const recent = await query(`
      SELECT
        l.code,
        l.status,
        l.updated_at,
        b.title
      FROM v_peminjaman l
      JOIN v_buku b ON b.id = l.book_id
      ORDER BY l.updated_at DESC, l.id DESC
      LIMIT 5
    `);

    return (
      <>
        <PageHeader
          eyebrow={eyebrow}
          title="Dashboard"
          description="Ringkasan aktivitas layanan perpustakaan."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Menunggu konfirmasi"
            value={counts.verifikasi}
            icon={IconClock}
          />

          <StatCard
            label="Pengajuan perpanjangan"
            value={counts.perpanjangan}
            icon={IconRepeat}
          />

          <StatCard
            label="Sedang dipinjam"
            value={counts.pengembalian}
            hint={`${counts.overdue} transaksi terlambat`}
            icon={IconBook}
          />

          <StatCard
            label="Denda tertunggak"
            value={formatRupiah(counts.fine_total)}
            icon={IconWallet}
          />
        </div>

        <section className="mt-7 grid gap-4 md:grid-cols-3" aria-label="Tautan pintas">
          {[
            { href: '/pegawai/buku', label: 'Book Management', text: 'Tambah, ubah, dan atur stok koleksi buku.', icon: IconBooks },
            { href: '/pegawai/pengumuman', label: 'Announcement Management', text: 'Kelola pengumuman Draft / Published.', icon: IconMegaphone },
            { href: '/pegawai/reservasi', label: 'Antrean Reservasi', text: `${counts.reservasi} reservasi aktif menunggu stok.`, icon: IconClock },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="card group flex items-start gap-4 p-5 transition hover:border-navy-600">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-navy text-white">
                <item.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 font-semibold text-navy">
                  {item.label}
                  <IconArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
                <span className="mt-1 block text-sm text-ink-muted">{item.text}</span>
              </span>
            </Link>
          ))}
        </section>

        <section className="card mt-7 overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="display text-xl">
              Aktivitas Terbaru
            </h2>
          </div>

          {recent.length > 0 ? (
            <ul className="divide-y divide-line">
              {recent.map((item) => (
                <li
                  key={item.code}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <Mono>{item.code}</Mono>

                    <p className="mt-1 break-words text-sm font-semibold text-navy">
                      {item.title}
                    </p>
                  </div>

                  <StatusBadge status={item.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-6 text-sm text-ink-muted">
              Belum ada aktivitas layanan.
            </p>
          )}
        </section>
      </>
    );
  }

  // Pengurutan khusus kolom tanggal (ASC / DESC)
  const defaultOrder = tab === 'riwayat' ? 'desc' : 'asc';
  const order =
    sp.order === 'asc' || sp.order === 'desc' ? sp.order : defaultOrder;
  const sqlDir = order === 'desc' ? 'DESC' : 'ASC';

  const dateColumnByTab = {
    verifikasi: 'l.requested_at',
    perpanjangan: 'l.due_date',
    pengembalian: 'l.due_date',
    riwayat: 'COALESCE(l.return_date, l.due_date, l.requested_at)',
    denda: 'l.return_date',
  };

  // Halaman transaksi dipilih melalui sidebar.
  const params = [];
  let search = '';

  if (q) {
    params.push(`%${q.toLowerCase()}%`);

    search = `
      AND (
        LOWER(u.full_name) LIKE $1
        OR u.identity_number LIKE $1
        OR LOWER(b.title) LIKE $1
        OR LOWER(l.code) LIKE $1
      )
    `;
  }

  const whereByTab = {
    verifikasi: `l.status = 'Menunggu Konfirmasi'`,
    perpanjangan: `l.status = 'Perpanjangan Diajukan'`,
    pengembalian: `l.status IN ${ACTIVE}`,
    riwayat: `TRUE`,
    denda: `l.fine_status = 'Tertunggak'`,
  };

  const sql = `
    ${BASE}
    WHERE ${whereByTab[tab]}
    ${search}
    ORDER BY ${dateColumnByTab[tab]} ${sqlDir} NULLS LAST, l.id ${sqlDir}
  `;

  const rows = await query(sql, params);
  const currentPage = TABS.find((item) => item.key === tab);

  const dateHeading =
    tab === 'verifikasi'
      ? 'Diajukan'
      : tab === 'denda'
        ? 'Pengembalian'
        : tab === 'riwayat'
          ? 'Tanggal'
          : 'Jatuh Tempo';

  function buildUrl(nextOrder) {
    const next = new URLSearchParams();
    next.set('tab', tab);
    if (q) next.set('q', q);
    next.set('order', nextOrder);
    return `${basePath}?${next.toString()}`;
  }

  const toggledOrder = order === 'asc' ? 'desc' : 'asc';

  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={currentPage.label}
      />

      <nav
        className="mb-4 flex flex-wrap gap-2"
        aria-label="Tab meja sirkulasi"
      >
        {TABS.map((item) => {
          const badge = item.key === 'riwayat' ? null : counts[item.key];
          return (
            <Link
              key={item.key}
              href={`${basePath}?tab=${item.key}`}
              aria-current={item.key === tab ? 'page' : undefined}
              className={item.key === tab ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
            >
              {item.label}
              {badge > 0 && (
                <span className="ml-1 rounded-full bg-gold px-1.5 font-mono text-[10px] font-bold text-navy-900">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {rows.length} transaksi · Diurutkan berdasarkan{' '}
          <span className="font-semibold text-navy">
            {tab === 'riwayat' ? 'tanggal' : `tanggal ${dateHeading.toLowerCase()}`} (
            {order === 'asc' ? 'Terlama / ASC' : 'Terbaru / DESC'})
          </span>
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol pengurutan tanggal ASC / DESC */}
          <div
            className="inline-flex overflow-hidden rounded-lg border border-line bg-white text-xs font-semibold"
            role="group"
            aria-label="Urutkan berdasarkan tanggal"
          >
            <Link
              href={buildUrl('asc')}
              className={
                order === 'asc'
                  ? 'bg-navy px-3 py-2.5 text-white'
                  : 'px-3 py-2.5 text-ink-muted hover:bg-canvas'
              }
              title={`Urutkan tanggal ${dateHeading.toLowerCase()} dari yang paling awal (ASC)`}
            >
              ↑ Terlama
            </Link>
            <Link
              href={buildUrl('desc')}
              className={
                order === 'desc'
                  ? 'bg-navy px-3 py-2.5 text-white'
                  : 'px-3 py-2.5 text-ink-muted hover:bg-canvas'
              }
              title={`Urutkan tanggal ${dateHeading.toLowerCase()} dari yang paling baru (DESC)`}
            >
              ↓ Terbaru
            </Link>
          </div>

          <form className="flex max-w-full items-center gap-2 rounded-lg border border-line bg-white px-3">
            <input type="hidden" name="tab" value={tab} />
            <input type="hidden" name="order" value={order} />

            <IconSearch className="h-4 w-4 shrink-0 text-ink-soft" />

            <input
              name="q"
              defaultValue={q}
              placeholder="Cari nama, NIM, judul, kode"
              aria-label="Cari transaksi"
              className="w-56 min-w-0 bg-transparent py-2.5 text-sm focus:outline-none"
            />
          </form>
        </div>
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="table-head">
            <tr>
              <th className="px-5 py-3">Transaksi</th>
              <th className="px-3 py-3">Buku</th>
              <th className="px-3 py-3">Mahasiswa</th>
              <th className="px-3 py-3">
                <Link
                  href={buildUrl(toggledOrder)}
                  className="inline-flex items-center gap-1.5 text-navy transition hover:opacity-80"
                  title={`Klik untuk urutkan ${toggledOrder === 'asc' ? 'Terlama (ASC)' : 'Terbaru (DESC)'}`}
                >
                  <span>{dateHeading}</span>
                  <span className="font-mono text-xs font-bold">
                    {order === 'asc' ? '↑' : '↓'}
                  </span>
                </Link>
              </th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-line">
            {rows.map((transaction) => (
              <tr
                key={transaction.id}
                className="align-middle hover:bg-canvas/40"
              >
                <td className="px-5 py-3.5">
                  <Mono className="font-semibold text-navy">
                    {transaction.code}
                  </Mono>

                  <div className="mt-1">
                    <StatusBadge
                      status={
                        tab === 'denda'
                          ? transaction.fine_status
                          : transaction.status
                      }
                    />
                  </div>
                </td>

                <td className="px-3 py-3.5">
                  <BookCell transaction={transaction} />
                </td>

                <td className="px-3 py-3.5">
                  <MemberCell transaction={transaction} />
                </td>

                <td className="px-3 py-3.5">
                  {tab === 'verifikasi' && (
                    <>
                      <Mono>
                        {formatDateTime(transaction.requested_at)}
                      </Mono>

                      <p className="mt-1 text-xs text-ink-muted">
                        {timeAgo(transaction.requested_at)}
                        {' · '}
                        Stok {transaction.stock}
                      </p>
                    </>
                  )}

                  {(tab === 'perpanjangan' ||
                    tab === 'pengembalian') && (
                    <>
                      <Mono className="font-semibold text-navy">
                        {formatDate(transaction.due_date, {
                          short: true,
                        })}
                      </Mono>

                      {transaction.late_days > 0 ? (
                        <p className="mt-1 text-xs font-semibold text-danger">
                          Terlambat {transaction.late_days} hari
                          {' · '}
                          {formatRupiah(transaction.est_fine)}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-ink-muted">
                          {transaction.late_days === 0
                            ? 'Jatuh tempo hari ini'
                            : `${-transaction.late_days} hari lagi`}
                        </p>
                      )}
                    </>
                  )}

                  {tab === 'riwayat' && (
                    <Mono>
                      {formatDate(
                        transaction.return_date ||
                          transaction.due_date ||
                          transaction.requested_at,
                        { short: true }
                      )}
                    </Mono>
                  )}

                  {tab === 'denda' && (
                    <>
                      <Mono>
                        {transaction.return_date
                          ? formatDate(transaction.return_date, {
                              short: true,
                            })
                          : 'Belum dikembalikan'}
                      </Mono>

                      <p className="mt-1 font-mono font-semibold text-danger">
                        {formatRupiah(transaction.fine_amount)}
                      </p>
                    </>
                  )}
                </td>

                <td className="px-5 py-3.5 text-right">
                  {tab === 'verifikasi' && (
                    <VerifyActions
                      loanId={transaction.id}
                      code={transaction.code}
                      title={transaction.title}
                      stock={transaction.stock}
                    />
                  )}

                  {tab === 'perpanjangan' && (
                    <ExtensionActions
                      loanId={transaction.id}
                      code={transaction.code}
                      title={transaction.title}
                      days={
                        transaction.loan_days ||
                        transaction.max_loan_days
                      }
                    />
                  )}

                  {tab === 'pengembalian' && (
                    <ReturnAction
                      loanId={transaction.id}
                      code={transaction.code}
                      title={transaction.title}
                      lateDays={Math.max(
                        0,
                        transaction.late_days
                      )}
                      estFine={transaction.est_fine}
                    />
                  )}

                  {tab === 'denda' &&
                    transaction.return_date && (
                      <PayFineAction
                        loanId={transaction.id}
                        code={transaction.code}
                        amount={transaction.fine_amount}
                        name={transaction.full_name}
                      />
                    )}

                  {tab === 'denda' &&
                    !transaction.return_date && (
                      <span className="text-sm text-ink-muted">
                        Kembalikan buku dahulu
                      </span>
                    )}

                  {tab === 'riwayat' && (
                    <span className="text-ink-muted">—</span>
                  )}
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-sm text-ink-muted"
                >
                  {q
                    ? 'Tidak ada transaksi yang cocok dengan pencarian.'
                    : 'Antrean kosong. Semua transaksi pada halaman ini sudah diproses.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {tab === 'pengembalian' && (
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          Denda dihitung otomatis berdasarkan jumlah hari
          keterlambatan dan tarif saat peminjaman disetujui.
        </p>
      )}
    </>
  );
}