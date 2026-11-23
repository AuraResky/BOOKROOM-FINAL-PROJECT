import { one, query } from '@/lib/db';
import { json, requireApiRole, handle } from '@/lib/api';

export const dynamic = 'force-dynamic';

const ACTIVE = `('Dipinjam','Perpanjangan Diajukan','Perpanjangan Disetujui','Perpanjangan Ditolak')`;

export const GET = handle(async () => {
  const { response } = await requireApiRole('admin');
  if (response) return response;

  const [summary, popular] = await Promise.all([
    one(`
      SELECT (SELECT COUNT(*) FROM buku)::int AS total_titles,
             (SELECT COALESCE(SUM(stok_total), 0) FROM buku)::int AS total_copies,
             (SELECT COALESCE(SUM(stok_tersedia), 0) FROM buku)::int AS copies_on_shelf,
             (SELECT COUNT(*) FROM pengguna WHERE peran = 'mahasiswa')::int AS total_students,
             (SELECT COUNT(*) FROM peminjaman WHERE status IN ${ACTIVE})::int AS active_loans,
             (SELECT COUNT(*) FROM peminjaman WHERE status = 'Menunggu Konfirmasi')::int AS pending_requests,
             (SELECT COUNT(*) FROM reservasi_buku WHERE status IN ('Menunggu','Siap Diambil'))::int AS active_reservations,
             (SELECT COALESCE(SUM(jumlah_denda), 0) FROM denda WHERE status_pembayaran = 'Lunas')::int AS fines_paid,
             (SELECT COALESCE(SUM(fine_amount), 0) FROM v_peminjaman WHERE fine_status = 'Tertunggak')::int AS fines_outstanding`),
    query(`
      SELECT b.id, b.judul AS title, b.penulis AS author, COUNT(p.id)::int AS loan_count
        FROM buku b JOIN peminjaman p ON p.id_buku = b.id
       WHERE p.status NOT IN ('Menunggu Konfirmasi','Ditolak')
       GROUP BY b.id, b.judul, b.penulis
       ORDER BY loan_count DESC, b.judul LIMIT 5`),
  ]);

  return json({ ok: true, generated_at: new Date().toISOString(), data: { ...summary, popular_books: popular } });
});
