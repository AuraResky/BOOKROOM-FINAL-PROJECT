import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { query, one } from '@/lib/db';
import { formatRupiah, formatDateTime } from '@/lib/format';
import { PageHeader, StatCard } from '@/components/staff/StaffShell';
import { StatusBadge, Mono } from '@/components/ui/Badges';
import { IconBooks, IconBook, IconUsers, IconRepeat, IconWallet, IconArrowRight } from '@/components/ui/Icons';

export const metadata = { title: 'Dashboard Admin' };

const ACTIVE = `('Dipinjam','Perpanjangan Diajukan','Perpanjangan Disetujui','Perpanjangan Ditolak')`;
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

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

  const [monthly, byCategory, recent] = await Promise.all([
    query(`
      SELECT TO_CHAR(m, 'YYYY-MM') AS ym, EXTRACT(MONTH FROM m)::int AS mon,
             COUNT(l.id)::int AS total
        FROM GENERATE_SERIES(DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months', DATE_TRUNC('month', CURRENT_DATE), INTERVAL '1 month') m
        LEFT JOIN v_peminjaman l ON DATE_TRUNC('month', l.loan_date) = m
       GROUP BY m ORDER BY m`),
    query(`
      SELECT c.name, c.code, COUNT(DISTINCT b.id)::int AS titles,
             COUNT(l.id) FILTER (WHERE l.status NOT IN ('Menunggu Konfirmasi','Ditolak'))::int AS loans
        FROM v_kategori c LEFT JOIN v_buku b ON b.category_id = c.id LEFT JOIN v_peminjaman l ON l.book_id = b.id
       GROUP BY c.id,c.name,c.code ORDER BY loans DESC`),
    query(`
      SELECT l.code, l.status, l.updated_at, b.title, u.full_name
        FROM v_peminjaman l JOIN v_buku b ON b.id = l.book_id JOIN v_pengguna u ON u.id = l.user_id
       ORDER BY l.updated_at DESC, l.id DESC LIMIT 7`),
  ]);
  const maxMonth = Math.max(1, ...monthly.map((m) => m.total));
  const maxCat = Math.max(1, ...byCategory.map((c) => c.loans));

  return (
    <>
      <PageHeader eyebrow="Admin" title="Dashboard Statistik"
        description="Ringkasan agregat koleksi, keanggotaan, sirkulasi, dan denda perpustakaan."
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <section className="card p-6">
          <h2 className="display text-2xl">Peminjaman per Bulan</h2>
          <p className="text-xs text-ink-muted">Enam bulan terakhir, berdasarkan tanggal pinjam.</p>
          <div className="mt-6 flex h-52 items-end gap-4">
            {monthly.map((m, i) => (
              <div key={m.ym} className="flex flex-1 flex-col items-center gap-2">
                <span className="font-mono text-xs font-semibold text-navy">{m.total}</span>
                <div className="w-full max-w-[56px] rounded-t-2xl border border-b-0 border-navy transition-all hover:-translate-y-0.5"
                  style={{ height: `${Math.max(4, (m.total / maxMonth) * 150)}px`, background: '#1A365D' }} />
                <span className="text-xs font-semibold text-ink-muted">{BULAN[m.mon - 1]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="display text-2xl">Sirkulasi per Kategori</h2>
          <p className="text-xs text-ink-muted">Jumlah transaksi yang terealisasi per kategori.</p>
          <ul className="mt-5 space-y-3.5">
            {byCategory.map((c) => (
              <li key={c.code}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-semibold text-navy">{c.name} <Mono className="text-ink-soft">{c.code}</Mono></span>
                  <span className="font-mono text-xs text-ink-muted">{c.loans} pinjam · {c.titles} judul</span>
                </div>
                <div className="mt-1.5 h-3 rounded-full border border-line bg-cream-200">
                  <div className="h-full rounded-full bg-coral" style={{ width: `${(c.loans / maxCat) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

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
