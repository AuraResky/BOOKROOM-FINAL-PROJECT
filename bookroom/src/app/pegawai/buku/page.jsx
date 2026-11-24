import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import { PageHeader, StatCard } from '@/components/staff/StaffShell';
import BookManager from '@/components/managers/BookManager';
import { IconBooks, IconBook, IconAlert } from '@/components/ui/Icons';

export const metadata = { title: 'Koleksi Buku' };

export default async function BooksPage() {
  const user = await requireRole('pegawai', 'admin');
  const [books, categories] = await Promise.all([
    query(`
      SELECT b.*, c.name AS category_name, c.code AS category_code,
             COALESCE(r.avg_rating, 0)::float AS avg_rating,
             COUNT(l.id) FILTER (WHERE l.status IN ('Dipinjam','Perpanjangan Diajukan','Perpanjangan Disetujui','Perpanjangan Ditolak'))::int AS on_loan,
             COUNT(l.id) FILTER (WHERE l.status NOT IN ('Selesai','Ditolak'))::int AS open_loans
        FROM v_buku b
        JOIN v_kategori c ON c.id = b.category_id
        LEFT JOIN (SELECT book_id, AVG(rating) AS avg_rating FROM v_penilaian GROUP BY book_id) r ON r.book_id = b.id
        LEFT JOIN v_peminjaman l ON l.book_id = b.id
       GROUP BY b.id,b.title,b.isbn,b.author,b.publisher,b.publish_year,b.category_id,b.stock,b.total_stock,b.max_loan_days,b.fine_per_day,b.cover_url,b.description,b.created_at,b.updated_at,c.id,c.name,c.code,r.avg_rating
       ORDER BY b.title`),
    query('SELECT id, name, code FROM v_kategori ORDER BY code'),
  ]);
  const totalStock = books.reduce((s, b) => s + b.total_stock, 0);
  const onLoan = books.reduce((s, b) => s + b.on_loan, 0);
  const empty = books.filter((b) => b.stock === 0).length;

  return (
    <>
      <PageHeader eyebrow={user.role === 'admin' ? 'Admin' : 'Pegawai Perpustakaan'} title="Manajemen Koleksi Buku"
        description="Kelola metadata, stok, aturan pinjam, dan sampul. Buku yang sedang dipinjam tidak dapat dihapus." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Judul terdaftar" value={books.length} icon={IconBooks} />
        <StatCard label="Stok buku di rak / dipinjam" value={`${totalStock} / ${onLoan}`} icon={IconBook} tone="gold" />
        <StatCard label="Judul stok habis" value={empty} icon={IconAlert} tone="red" />
      </div>
      <BookManager books={books} categories={categories} />
    </>
  );
}
