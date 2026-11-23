import { query } from '@/lib/db';
import { apiError, requireApiRole, handle } from '@/lib/api';

export const dynamic = 'force-dynamic';

const STATUSES = ['Menunggu Konfirmasi', 'Dipinjam', 'Perpanjangan Diajukan', 'Perpanjangan Disetujui', 'Perpanjangan Ditolak', 'Selesai', 'Ditolak'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// Titik koma: pemisah daftar bawaan Excel berlocale Indonesia, sehingga kolom langsung terpisah
const SEP = ';';

// Menyiapkan isi kolom CSV agar aman dibuka di Excel
function cell(value) {
  if (value === null || value === undefined) return '';
  let s = value instanceof Date ? value.toISOString() : String(value);
  // Cegah CSV/formula injection saat dibuka di Excel.
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[";\n\r,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Menyusun kolom dan baris laporan menjadi CSV
function toCsv(headers, rows) {
  const lines = [headers.map(([, label]) => cell(label)).join(SEP)];
  for (const row of rows) lines.push(headers.map(([key]) => cell(row[key])).join(SEP));
  return '﻿' + lines.join('\r\n') + '\r\n';
}

// Memeriksa format tanggal filter laporan
function validDate(s) {
  return DATE_RE.test(s) && !Number.isNaN(Date.parse(s));
}

const REPORTS = {
  transaksi: {
    title: 'transaksi-peminjaman',
    headers: [
      ['code', 'Kode Transaksi'], ['status', 'Status'], ['identity_number', 'NIM'], ['full_name', 'Nama Mahasiswa'],
      ['title', 'Judul Buku'], ['isbn', 'ISBN'], ['category', 'Kategori'], ['requested_at', 'Diajukan'],
      ['loan_date', 'Tanggal Pinjam'], ['due_date', 'Jatuh Tempo'], ['return_date', 'Tanggal Kembali'],
      ['extension_count', 'Perpanjangan'], ['late_days', 'Hari Terlambat'], ['fine_amount', 'Denda (Rp)'],
      ['fine_status', 'Status Denda'], ['reject_reason', 'Alasan Penolakan'], ['handler', 'Petugas'],
    ],
    build({ status, fine, q, from, to }) {
      const where = [];
      const params = [];
      if (status) { params.push(status); where.push(`l.status = $${params.length}`); }
      if (fine) { params.push(fine); where.push(`l.fine_status = $${params.length}`); }
      if (q) {
        params.push(`%${q.toLowerCase()}%`);
        where.push(`(LOWER(l.code) LIKE $${params.length} OR LOWER(u.full_name) LIKE $${params.length} OR u.identity_number LIKE $${params.length} OR LOWER(b.title) LIKE $${params.length})`);
      }
      if (from) { params.push(from); where.push(`l.requested_at::date >= $${params.length}`); }
      if (to) { params.push(to); where.push(`l.requested_at::date <= $${params.length}`); }
      return {
        sql: `SELECT l.code, l.status, u.identity_number, u.full_name, b.title, b.isbn, c.name AS category,
                     TO_CHAR(l.requested_at, 'YYYY-MM-DD HH24:MI') AS requested_at,
                     l.loan_date, l.due_date, l.return_date, l.extension_count,
                     CASE WHEN l.due_date IS NULL THEN 0 ELSE GREATEST(COALESCE(l.return_date, CURRENT_DATE) - l.due_date, 0) END AS late_days,
                     l.fine_amount, l.fine_status, l.reject_reason, h.full_name AS handler
                FROM v_peminjaman l
                JOIN v_buku b ON b.id = l.book_id
                JOIN v_kategori c ON c.id = b.category_id
                JOIN v_pengguna u ON u.id = l.user_id
                LEFT JOIN v_pengguna h ON h.id = l.handled_by
               ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY l.requested_at DESC, l.id DESC`,
        params,
      };
    },
  },
  denda: {
    title: 'rekap-denda',
    headers: [
      ['code', 'Kode Transaksi'], ['identity_number', 'NIM'], ['full_name', 'Nama Mahasiswa'], ['title', 'Judul Buku'],
      ['due_date', 'Jatuh Tempo'], ['return_date', 'Tanggal Kembali'], ['late_days', 'Hari Terlambat'],
      ['daily_rate', 'Tarif/Hari (Rp)'], ['amount', 'Jumlah Denda (Rp)'], ['status', 'Status'],
      ['recorded_at', 'Dicatat'], ['paid_at', 'Dibayar'], ['receiver', 'Diterima Oleh'],
    ],
    build({ fine, q, from, to }) {
      const where = [];
      const params = [];
      if (fine) { params.push(fine); where.push(`d.status_pembayaran = $${params.length}`); }
      if (q) {
        params.push(`%${q.toLowerCase()}%`);
        where.push(`(LOWER(p.kode_transaksi) LIKE $${params.length} OR LOWER(u.nama_lengkap) LIKE $${params.length} OR u.nomor_identitas LIKE $${params.length} OR LOWER(b.judul) LIKE $${params.length})`);
      }
      if (from) { params.push(from); where.push(`d.dibuat_pada::date >= $${params.length}`); }
      if (to) { params.push(to); where.push(`d.dibuat_pada::date <= $${params.length}`); }
      return {
        sql: `SELECT p.kode_transaksi AS code, u.nomor_identitas AS identity_number, u.nama_lengkap AS full_name, b.judul AS title,
                     p.tanggal_jatuh_tempo AS due_date, p.tanggal_kembali AS return_date, d.hari_terlambat AS late_days,
                     d.tarif_per_hari AS daily_rate, d.jumlah_denda AS amount, d.status_pembayaran AS status,
                     TO_CHAR(d.dibuat_pada, 'YYYY-MM-DD HH24:MI') AS recorded_at,
                     TO_CHAR(d.dibayar_pada, 'YYYY-MM-DD HH24:MI') AS paid_at, r.nama_lengkap AS receiver
                FROM denda d
                JOIN peminjaman p ON p.id = d.id_peminjaman
                JOIN pengguna u ON u.id = p.id_pengguna
                JOIN buku b ON b.id = p.id_buku
                LEFT JOIN pengguna r ON r.id = d.diterima_oleh
               ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY d.dibuat_pada DESC`,
        params,
      };
    },
  },
  rekap: {
    title: 'rekap-bulanan',
    headers: [
      ['month', 'Bulan'], ['requests', 'Pengajuan'], ['approved', 'Disetujui'], ['rejected', 'Ditolak'],
      ['returned', 'Dikembalikan'], ['fines_recorded', 'Denda Tercatat (Rp)'], ['fines_paid', 'Denda Lunas (Rp)'],
      ['fines_outstanding', 'Denda Tertunggak (Rp)'],
    ],
    build({ from, to }) {
      const params = [from || null, to || null];
      return {
        sql: `WITH bulan AS (
                SELECT GENERATE_SERIES(
                  DATE_TRUNC('month', COALESCE($1::date, (SELECT MIN(diajukan_pada)::date FROM peminjaman), CURRENT_DATE)),
                  DATE_TRUNC('month', COALESCE($2::date, CURRENT_DATE)), INTERVAL '1 month')::date AS m)
              SELECT TO_CHAR(m, 'YYYY-MM') AS month,
                     (SELECT COUNT(*) FROM peminjaman p WHERE DATE_TRUNC('month', p.diajukan_pada)::date = m)::int AS requests,
                     (SELECT COUNT(*) FROM peminjaman p WHERE DATE_TRUNC('month', p.tanggal_pinjam)::date = m)::int AS approved,
                     (SELECT COUNT(*) FROM peminjaman p WHERE p.status = 'Ditolak' AND DATE_TRUNC('month', p.diajukan_pada)::date = m)::int AS rejected,
                     (SELECT COUNT(*) FROM peminjaman p WHERE DATE_TRUNC('month', p.tanggal_kembali)::date = m)::int AS returned,
                     (SELECT COALESCE(SUM(jumlah_denda), 0) FROM denda d WHERE DATE_TRUNC('month', d.dibuat_pada)::date = m)::int AS fines_recorded,
                     (SELECT COALESCE(SUM(jumlah_denda), 0) FROM denda d WHERE d.status_pembayaran = 'Lunas' AND DATE_TRUNC('month', d.dibayar_pada)::date = m)::int AS fines_paid,
                     (SELECT COALESCE(SUM(jumlah_denda), 0) FROM denda d WHERE d.status_pembayaran = 'Tertunggak' AND DATE_TRUNC('month', d.dibuat_pada)::date = m)::int AS fines_outstanding
                FROM bulan ORDER BY m`,
        params,
      };
    },
  },
};

export const GET = handle(async (request) => {
  const { response } = await requireApiRole('admin');
  if (response) return response;

  const sp = request.nextUrl.searchParams;
  const jenis = sp.get('jenis') || 'transaksi';
  const report = REPORTS[jenis];
  if (!report) return apiError(422, 'Jenis laporan harus transaksi, denda, atau rekap.', { jenis: 'Jenis tidak dikenal.' });

  const filters = {
    status: STATUSES.includes(sp.get('status')) ? sp.get('status') : '',
    fine: ['Tertunggak', 'Lunas'].includes(sp.get('denda')) ? sp.get('denda') : '',
    q: String(sp.get('q') || '').trim().slice(0, 60),
    from: sp.get('dari') || '',
    to: sp.get('sampai') || '',
  };
  const errors = {};
  if (filters.from && !validDate(filters.from)) errors.dari = 'Format tanggal harus YYYY-MM-DD.';
  if (filters.to && !validDate(filters.to)) errors.sampai = 'Format tanggal harus YYYY-MM-DD.';
  if (!errors.dari && !errors.sampai && filters.from && filters.to && filters.from > filters.to) errors.sampai = 'Tanggal akhir harus setelah tanggal awal.';
  if (Object.keys(errors).length) return apiError(422, 'Periksa kembali filter tanggal.', errors);

  const { sql, params } = report.build(filters);
  const rows = await query(sql, params);
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(toCsv(report.headers, rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="bookroom-${report.title}-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
});
