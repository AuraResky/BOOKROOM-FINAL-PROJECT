import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { query, one } from '@/lib/db';
import { formatDate, formatDateTime } from '@/lib/format';
import { PageHeader, StatCard } from '@/components/staff/StaffShell';
import BookCover from '@/components/books/BookCover';
import { StatusBadge, Mono } from '@/components/ui/Badges';
import { IconClock, IconCheck, IconBooks } from '@/components/ui/Icons';

export const metadata = { title: 'Antrean Reservasi' };

const FILTERS = [
  ['aktif', 'Aktif'],
  ['Siap Diambil', 'Siap diambil'],
  ['Menunggu', 'Menunggu'],
  ['riwayat', 'Riwayat'],
];

export default async function ReservationQueuePage({ searchParams }) {
  const user = await requireRole('pegawai', 'admin');
  const sp = (await searchParams) || {};
  const filter = FILTERS.some(([k]) => k === sp.status) ? sp.status : 'aktif';
  const base = user.role === 'admin' ? '/admin/reservasi' : '/pegawai/reservasi';

  const where = {
    aktif: `r.status IN ('Menunggu','Siap Diambil')`,
    'Siap Diambil': `r.status = 'Siap Diambil'`,
    Menunggu: `r.status = 'Menunggu'`,
    riwayat: `r.status IN ('Dipenuhi','Dibatalkan','Kedaluwarsa')`,
  }[filter];

  const [rows, counts] = await Promise.all([
    query(`
      SELECT r.id, r.status, r.queue_position, r.pickup_deadline, r.created_at, r.updated_at,
             b.id AS book_id, b.title, b.author, b.isbn, b.cover_url, b.stock, b.total_stock,
             u.full_name, u.identity_number,
             (r.status = 'Siap Diambil' AND r.pickup_deadline < CURRENT_DATE) AS overdue_pickup
        FROM v_reservasi r
        JOIN v_buku b ON b.id = r.book_id
        JOIN v_pengguna u ON u.id = r.user_id
       WHERE ${where}
       ORDER BY b.title, (r.status = 'Siap Diambil') DESC, r.queue_position NULLS LAST, r.updated_at DESC
       LIMIT 200`),
    one(`
      SELECT COUNT(*) FILTER (WHERE status = 'Menunggu')::int AS waiting,
             COUNT(*) FILTER (WHERE status = 'Siap Diambil')::int AS ready,
             COUNT(DISTINCT book_id) FILTER (WHERE status IN ('Menunggu','Siap Diambil'))::int AS books
        FROM v_reservasi`),
  ]);

  return (
    <>
      <PageHeader
        eyebrow={user.role === 'admin' ? 'Admin' : 'Pegawai Perpustakaan'}
        title="Antrean Reservasi Buku"
        description="Mahasiswa dapat mengantre buku yang stoknya habis. Saat buku dikembalikan, sistem otomatis menahan satu stok buku untuk antrean terdepan selama 2 hari dan mengirim notifikasi."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Menunggu stok" value={counts.waiting} icon={IconClock} tone="amber" />
        <StatCard label="Siap diambil (ditahan)" value={counts.ready} icon={IconCheck} tone="green" />
        <StatCard label="Judul diantrekan" value={counts.books} icon={IconBooks} />
      </div>

      <nav className="mb-4 flex flex-wrap gap-2" aria-label="Filter reservasi">
        {FILTERS.map(([key, label]) => (
          <Link
            key={key}
            href={`${base}?status=${encodeURIComponent(key)}`}
            className={filter === key ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
            aria-current={filter === key ? 'page' : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="table-head">
            <tr>
              <th className="px-5 py-3">Buku</th>
              <th className="px-3 py-3">Mahasiswa</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Antrean / Batas Ambil</th>
              <th className="px-5 py-3">Dibuat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id} className="align-middle hover:bg-canvas/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 shrink-0">
                      <BookCover isbn={r.isbn} src={r.cover_url} title={r.title} author={r.author} size="xs" />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/buku/${r.book_id}`} className="font-semibold leading-snug text-navy hover:underline">{r.title}</Link>
                      <p className="text-xs text-ink-muted">Stok tersedia {r.stock}/{r.total_stock}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <p className="font-semibold">{r.full_name}</p>
                  <Mono className="text-ink-soft">{r.identity_number}</Mono>
                </td>
                <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-3 py-3">
                  {r.status === 'Menunggu' && <Mono className="font-semibold text-navy">#{r.queue_position}</Mono>}
                  {r.status === 'Siap Diambil' && (
                    <span className={r.overdue_pickup ? 'font-semibold text-danger' : ''}>
                      <Mono>{formatDate(r.pickup_deadline, { short: true })}</Mono>
                      {r.overdue_pickup && <span className="block text-xs">Lewat batas — kedaluwarsa otomatis pada transaksi berikutnya</span>}
                    </span>
                  )}
                  {!['Menunggu', 'Siap Diambil'].includes(r.status) && <span className="text-ink-soft">—</span>}
                </td>
                <td className="px-5 py-3"><Mono className="text-ink-soft">{formatDateTime(r.created_at)}</Mono></td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-ink-muted">Tidak ada reservasi pada filter ini.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
