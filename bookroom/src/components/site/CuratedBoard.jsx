import Link from 'next/link';
import BookCover from '@/components/books/BookCover';
import { IconCheck, IconBook } from '@/components/ui/Icons';

export default function CuratedBoard({ books = [] }) {
  return (
    <div className="curated-board" aria-label="Top 3 buku populer BookRoom">
      <p className="curated-board-label"><span /> TOP 3 BUKU POPULER</p>
      <svg className="curated-board-thread" viewBox="0 0 540 390" fill="none" aria-hidden="true"><path d="M65 92C140 18 214 100 289 61S405 10 475 114" /><circle cx="65" cy="92" r="4" /><circle cx="475" cy="114" r="4" /></svg>
      {books.slice(0, 3).map((book, index) => (
        <div key={book.id} className={`curated-float curated-float-${index + 1}`}>
          <Link href={`/buku/${book.id}`} className={`curated-polaroid curated-polaroid-${index + 1}`} aria-label={`Lihat detail ${book.title}`}>
            <span className="curated-pin" aria-hidden="true" />
            <BookCover isbn={book.isbn} src={book.cover_url} title={book.title} author={book.author} priority />
            <span className={`curated-status ${book.stock > 0 ? 'available' : 'borrowed'}`}>{book.stock > 0 ? <IconCheck className="h-3.5 w-3.5" /> : <IconBook className="h-3.5 w-3.5" />}{book.stock > 0 ? 'Tersedia' : 'Dipinjam'}</span>
            <span className="curated-open">Lihat detail</span>
          </Link>
        </div>
      ))}
      {!books.length && <p className="curated-empty">Koleksi populer akan tampil setelah buku ditambahkan.</p>}
    </div>
  );
}