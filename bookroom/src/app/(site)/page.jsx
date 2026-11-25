// Halaman: halaman beranda dan daftar buku pilihan
import Link from 'next/link';
import {
  getRandomBooks,
  getPopularBooks,
  getPublishedAnnouncements,
  getCategoriesWithCount,
} from '@/lib/queries';
import Hero from '@/components/site/Hero';
import BookCard from '@/components/books/BookCard';
import AnnouncementCard from '@/components/site/AnnouncementCard';
import { IconArrowRight } from '@/components/ui/Icons';

export default async function HomePage() {
  const [featured, popular, announcements, categories] = await Promise.all([
    getRandomBooks(),
    getPopularBooks(5),
    getPublishedAnnouncements(3),
    getCategoriesWithCount(),
  ]);
  return (
    <>
      <Hero books={featured} categories={categories.filter((category) => category.book_count > 0)} />
      <section className="home-content-section" aria-labelledby="home-popular-heading"><div className="home-content-heading"><div><p className="eyebrow">PALING SERING DIBACA</p><h2 id="home-popular-heading">Buku Terpopuler</h2></div><Link href="/katalog?sort=populer">Lihat semua <IconArrowRight className="h-4 w-4" /></Link></div><div className="home-popular-grid">{popular.map((book) => <BookCard key={book.id} book={book} showLoans />)}</div>{!popular.length && <p className="card p-5 text-sm text-ink-muted">Koleksi populer akan tampil setelah buku tersedia.</p>}</section>
      <section className="home-content-section" aria-labelledby="home-announcement-heading"><div className="home-content-heading"><div><p className="eyebrow">KABAR PERPUSTAKAAN</p><h2 id="home-announcement-heading">Pengumuman Terbaru</h2></div><Link href="/pengumuman">Semua pengumuman <IconArrowRight className="h-4 w-4" /></Link></div><div className="grid gap-5 md:grid-cols-3">{announcements.map((item) => <AnnouncementCard key={item.id} item={item} />)}</div>{!announcements.length && <p className="card p-5 text-sm text-ink-muted">Belum ada pengumuman terbaru.</p>}</section>
    </>
  );
}
