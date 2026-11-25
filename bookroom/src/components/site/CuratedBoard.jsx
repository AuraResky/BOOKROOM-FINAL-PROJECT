import Link from 'next/link';
import BookCover from '@/components/books/BookCover';
import { IconCheck } from '@/components/ui/Icons';

export default function CuratedBoard({ books = [] }) {
  return (
    <div className="curated-board" role="group" aria-label="Pilihan buku acak">
      <svg className="curated-board-thread" viewBox="0 0 540 390" fill="none" aria-hidden="true"><path d="M65 92C140 18 214 100 289 61S405 10 475 114" /><circle cx="65" cy="92" r="4" /><circle cx="475" cy="114" r="4" /></svg>
      {books.slice(0, 3).map((book, index) => (
        <div key={book.id} className={`curated-float curated-float-${index + 1}`}>
          <Link href={`/buku/${book.id}`} className={`curated-polaroid curated-polaroid-${index + 1}`} aria-label={`Lihat detail ${book.title}`}>
            <span className="curated-pin" aria-hidden="true" />
            <BookCover isbn={book.isbn} src={book.cover_url} title={book.title} author={book.author} priority />
            <span className="curated-status available"><IconCheck className="h-3.5 w-3.5" />Tersedia</span>
            <span className="curated-open">Lihat detail</span>
          </Link>
        </div>
      ))}
      {!books.length && <p className="curated-empty">Saat ini belum ada buku yang tersedia untuk dipinjam.</p>}
    </div>
  );
}
