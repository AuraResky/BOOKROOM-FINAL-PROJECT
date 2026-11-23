// halaman log transaksi
import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { query, one } from '@/lib/db';
import { formatDate, formatDateTime, formatRupiah } from '@/lib/format';
import { PageHeader } from '@/components/staff/StaffShell';
import { StatusBadge, Mono } from '@/components/ui/Badges';
import { IconSearch } from '@/components/ui/Icons';
import Pagination from '@/components/ui/Pagination';

export const metadata = { title: 'Log Transaksi' };

const STATUSES = ['Menunggu Konfirmasi', 'Dipinjam', 'Perpanjangan Diajukan', 'Perpanjangan Disetujui', 'Perpanjangan Ditolak', 'Selesai', 'Ditolak'];
const PER_PAGE = 20;

export default async function LogPage({ searchParams }) {
  await requireRole('admin');
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status) ? sp.status : '';
  const fine = ['Tertunggak', 'Lunas'].includes(sp.denda) ? sp.denda : '';
  const q = String(sp.q || '').trim().slice(0, 60);
  const page = Math.max(1, Number(sp.page) || 1);

  const where = [];
  const params = [];
  if (status) { params.push(status); where.push(`l.status = $${params.length}`); }
  if (fine) { params.push(fine); where.push(`l.fine_status = $${params.length}`); }
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where.push(`(LOWER(l.code) LIKE $${params.length} OR LOWER(u.full_name) LIKE $${params.length} OR u.identity_number LIKE $${params.length} OR LOWER(b.title) LIKE $${params.length})`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const from = `FROM v_peminjaman l JOIN v_buku b ON b.id = l.book_id JOIN v_pengguna u ON u.id = l.user_id LEFT JOIN v_pengguna h ON h.id = l.handled_by`;

  const [rows, total] = await Promise.all([
    query(
      `SELECT l.id, l.code, l.status, l.requested_at, l.loan_date, l.due_date, l.return_date, l.extension_count,
              l.fine_amount, l.fine_status, l.reject_reason, l.updated_at,
              b.title, b.isbn, u.full_name, u.identity_number, h.full_name AS handler
         ${from} ${whereSql}
        ORDER BY l.updated_at DESC, l.id DESC
        LIMIT ${PER_PAGE} OFFSET ${(page - 1) * PER_PAGE}`, params),
    one(`SELECT COUNT(*)::int AS n FROM v_peminjaman l JOIN v_buku b ON b.id = l.book_id JOIN v_pengguna u ON u.id = l.user_id ${whereSql}`, params),
  ]);
  const pages = Math.max(1, Math.ceil(total.n / PER_PAGE));
  const href = (p) => {
    const s = new URLSearchParams();
    if (status) s.set('status', status);
    if (fine) s.set('denda', fine);
    if (q) s.set('q', q);
    s.set('page', p);
    return `/admin/log?${s}`;
  };
  // Ekspor mengikuti filter aktif → Route Handler /api/admin/ekspor
  const exportHref = (jenis) => {
    const s = new URLSearchParams({ jenis });
    if (status && jenis === 'transaksi') s.set('status', status);
    if (fine) s.set('denda', fine);
    if (q) s.set('q', q);
    return `/api/admin/ekspor?${s}`;
  };

  return (
    <>
      <PageHeader eyebrow="Admin" title="Monitoring Log Transaksi"
        description="Seluruh riwayat peminjaman, perpanjangan, dan status denda di perpustakaan."
        actions={<>
          <a href={exportHref('transaksi')} className="btn-primary btn-sm" download>Ekspor hasil filter (CSV)</a>
          <a href={exportHref('denda')} className="btn-outline btn-sm" download>Ekspor denda (CSV)</a>
        </>} />

      <form className="card flex flex-wrap items-end gap-3 p-4">
        <label className="flex-1">
          <span className="label">Cari</span>
          <span className="flex items-center gap-2 rounded-lg border border-line px-3 focus-within:border-navy-600">
            <IconSearch className="h-4 w-4 text-ink-soft" />
            <input name="q" defaultValue={q} placeholder="Kode, nama, NIM, judul" className="w-full bg-transparent py-2.5 text-sm focus:outline-none" />
          </span>
        </label>
        <label>
          <span className="label">Status transaksi</span>
          <select name="status" defaultValue={status} className="input w-56">
            <option value="">Semua status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Status denda</span>
          <select name="denda" defaultValue={fine} className="input w-40">
            <option value="">Semua</option><option>Tertunggak</option><option>Lunas</option>
          </select>
        </label>
        <button type="submit" className="btn-primary">Terapkan</button>
        {(status || fine || q) && <Link href="/admin/log" className="btn-ghost">Reset</Link>}
      </form>

      <p className="mt-4 text-xs text-ink-muted"><span className="font-mono font-semibold text-navy">{total.n}</span> transaksi ditemukan</p>

      <div className="card mt-2 overflow-x-auto">
        <table className="w-full min-w-[1080px] text-sm">
          <thead className="table-head">
            <tr>
              <th className="px-5 py-3">Kode</th><th className="px-3 py-3">Mahasiswa</th><th className="px-3 py-3">Buku</th>
              <th className="px-3 py-3">Pinjam → Jatuh tempo</th><th className="px-3 py-3">Kembali</th><th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Denda</th><th className="px-5 py-3">Petugas · Pembaruan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id} className="align-top hover:bg-canvas/40">
                <td className="px-5 py-3"><Mono className="font-semibold text-navy">{r.code}</Mono></td>
                <td className="px-3 py-3"><p className="font-semibold">{r.full_name}</p><Mono className="text-ink-soft">{r.identity_number}</Mono></td>
                <td className="max-w-[220px] px-3 py-3"><p className="leading-snug text-navy">{r.title}</p><Mono className="text-ink-soft">{r.isbn}</Mono></td>
                <td className="px-3 py-3">
                  <Mono>{formatDate(r.loan_date, { short: true })}</Mono> → <Mono className="font-semibold">{formatDate(r.due_date, { short: true })}</Mono>
                  {r.extension_count > 0 && <p className="text-xs text-ink-soft">diperpanjang {r.extension_count}×</p>}
                </td>
                <td className="px-3 py-3"><Mono>{formatDate(r.return_date, { short: true })}</Mono></td>
                <td className="px-3 py-3">
                  <StatusBadge status={r.status} />
                  {r.reject_reason && <p className="mt-1 max-w-[200px] text-xs leading-snug text-ink-soft">{r.reject_reason}</p>}
                </td>
                <td className="px-3 py-3">
                  {r.fine_status ? (<><Mono className="font-semibold">{formatRupiah(r.fine_amount)}</Mono><div className="mt-1"><StatusBadge status={r.fine_status} /></div></>) : <span className="text-ink-soft">—</span>}
                </td>
                <td className="px-5 py-3"><p className="text-xs">{r.handler || '—'}</p><Mono className="text-ink-soft">{formatDateTime(r.updated_at)}</Mono></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={8} className="px-5 py-12 text-center text-ink-muted">Tidak ada transaksi.</td></tr>}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={pages} href={href} />
    </>
  );
}
