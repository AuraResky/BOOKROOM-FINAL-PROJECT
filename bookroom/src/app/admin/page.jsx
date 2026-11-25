import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { query, one } from '@/lib/db';
import { formatRupiah, formatDateTime } from '@/lib/format';
import { PageHeader, StatCard } from '@/components/staff/StaffShell';
import { StatusBadge, Mono } from '@/components/ui/Badges';
import { IconBooks, IconBook, IconUsers, IconRepeat, IconWallet, IconArrowRight } from '@/components/ui/Icons';

export const metadata = { title: 'Dashboard Admin' };

const ACTIVE = `('Dipinjam','Perpanjangan Diajukan','Perpanjangan Disetujui','Perpanjangan Ditolak')`;

export default async function AdminDashboard() {
  await requireRole('admin');

  const stats = await one(`
    WITH b AS (SELECT COUNT(*)::int AS titles, COALESCE(SUM(stock),0)::int AS on_shelf FROM v_buku),
         l AS (SELECT COUNT(*) FILTER (WHERE status IN ${ACTIVE})::int AS active_loans,
                      COUNT(*) FILTER (WHERE status = 'Menunggu Konfirmasi')::int AS pending,
                      COUNT(*) FILTER (WHERE status IN ${ACTIVE} AND due_date < CURRENT_DATE)::int AS overdue,
                      COALESCE(SUM(fine_amount) FILTER (WHERE fine_status = 'Lunas'),0)::int AS fine_paid,
                      COALESCE(SUM(fine_amount) FILTER (WHERE fine_status = 'Tertunggak'),0)::int AS fine_due
                 FROM v_peminjaman),
         u AS (SELECT COUNT(*) FILTER (WHERE role = 'mahasiswa')::int AS students,
                      COUNT(*) FILTER (WHERE role = 'mahasiswa' AND is_active)::int AS active_students,
                      COUNT(*) FILTER (WHERE role = 'pegawai')::int AS staff
                 FROM v_pengguna)
    SELECT b.titles, b.on_shelf + l.active_loans AS copies, b.on_shelf, l.*, u.*,
           (SELECT COUNT(*) FROM v_reservasi WHERE status IN ('Menunggu','Siap Diambil'))::int AS reservations
      FROM b, l, u`);

  const [byCategory, recent] = await Promise.all([
    query(`
      SELECT c.name, c.code, COUNT(DISTINCT b.id)::int AS titles,
             COUNT(l.id) FILTER (WHERE l.status NOT IN ('Menunggu Konfirmasi','Ditolak'))::int AS loans
        FROM v_kategori c LEFT JOIN v_buku b ON b.category_id = c.id LEFT JOIN v_peminjaman l ON l.book_id = b.id
       GROUP BY c.id,c.name,c.code ORDER BY loans DESC, c.name, c.code`),
    query(`
      SELECT l.code, l.status, l.updated_at, b.title, u.full_name
        FROM v_peminjaman l JOIN v_buku b ON b.id = l.book_id JOIN v_pengguna u ON u.id = l.user_id
       ORDER BY l.updated_at DESC, l.id DESC LIMIT 7`),
  ]);
  const maxCat = Math.max(1, ...byCategory.map((c) => c.loans));

  return (
    <>
      <PageHeader eyebrow="Admin" title="Dashboard Statistik"
        actions={<>
          <a href="/api/admin/ekspor?jenis=transaksi" className="btn-outline btn-sm" download>Unduh Riwayat Peminjaman (CSV)</a>
          <a href="/api/admin/ekspor?jenis=rekap" className="btn-primary btn-sm" download>Unduh Rekap Bulanan (CSV)</a>
        </>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total judul buku" value={stats.titles} icon={IconBooks} />
        <StatCard label="Total stok buku" value={stats.copies} hint={`${stats.on_shelf} di rak · ${stats.active_loans} dipinjam`} icon={IconBook} tone="gold" />
        <StatCard label="Mahasiswa terdaftar" value={stats.students} hint={`${stats.active_students} akun aktif`} icon={IconUsers} tone="green" />
        <StatCard label="Transaksi aktif" value={stats.active_loans} hint={`${stats.overdue} terlambat · ${stats.pending} menunggu`} icon={IconRepeat} tone="amber" />
        <StatCard label="Total denda lunas" value={formatRupiah(stats.fine_paid)} hint={`Tertunggak ${formatRupiah(stats.fine_due)}`} icon={IconWallet} tone="green" />
      </div>

      <section className="card mt-6 p-4 sm:p-6" aria-labelledby="category-circulation">
        <h2 id="category-circulation" className="display text-2xl">Sirkulasi per Kategori</h2>
        <p className="mt-1 text-sm text-ink-muted">Jumlah transaksi yang terealisasi per kategori.</p>

        {byCategory.length > 0 ? (
          <ul className="mt-5 grid gap-3 xl:grid-cols-2">
            {byCategory.map((category) => (
              <li key={category.code} className="min-w-0 rounded-xl border border-line px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-navy">
                    {category.name}
                    <Mono className="rounded bg-cream-200 px-1.5 py-0.5 text-ink-muted">{category.code}</Mono>
                  </span>
                  <span className="whitespace-nowrap text-xs text-ink-muted">
                    <strong className="font-semibold text-navy">{category.loans} pinjam</strong>
                    {' · '}{category.titles} judul
                  </span>
                </div>
                <div className="mt-2.5 h-2 rounded-full bg-cream-200" aria-hidden="true">
                  <div className="h-full rounded-full bg-navy" style={{ width: `${(category.loans / maxCat) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-sm text-ink-muted">Belum ada kategori buku.</p>
        )}
      </section>

      <nav className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Panel navigasi utama">
        {[
          ['/admin/pengguna', 'User Management', 'Kelola akun Admin, Pegawai, Mahasiswa.', IconUsers],
          ['/admin/kategori', 'Category Management', 'Master data kategori & kode klasifikasi.', IconBooks],
          ['/admin/log', 'Log Transaksi', 'Monitoring seluruh riwayat & ekspor laporan.', IconRepeat],
          ['/admin/reservasi', 'Antrean Reservasi', `${stats.reservations} reservasi aktif.`, IconBook],
        ].map(([href, label, text, Icon]) => (
          <Link key={href} href={href} className="card group flex items-start gap-3 p-5 transition hover:border-navy-600">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy text-white"><Icon className="h-5 w-5" /></span>
            <span className="min-w-0">
              <span className="flex items-center gap-1 font-semibold text-navy">{label} <IconArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
              <span className="mt-1 block text-xs leading-5 text-ink-muted">{text}</span>
            </span>
          </Link>
        ))}
      </nav>

      <section className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="display text-2xl">Aktivitas Transaksi Terbaru</h2>
          <Link href="/admin/log" className="btn-ghost btn-sm">Lihat log lengkap <IconArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <ul className="divide-y divide-line">
          {recent.map((r) => (
            <li key={r.code} className="flex flex-wrap items-center gap-3 px-6 py-3 text-sm">
              <Mono className="w-36 font-semibold text-navy">{r.code}</Mono>
              <span className="min-w-[200px] flex-1"><span className="font-semibold">{r.full_name}</span> <span className="text-ink-muted">· {r.title}</span></span>
              <StatusBadge status={r.status} />
              <Mono className="w-36 text-right text-ink-soft">{formatDateTime(r.updated_at)}</Mono>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
