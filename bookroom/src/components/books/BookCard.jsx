// Kartu ringkasan buku untuk daftar dan katalog
import InteractiveSurface from '@/components/ui/InteractiveSurface';
import BookCover from './BookCover';
import { Stars, Mono } from '@/components/ui/Badges';
import { IconArrowRight, IconBook } from '@/components/ui/Icons';

export default function BookCard({ book, rank, showLoans = false, layout = 'grid' }) {
  return (
    <InteractiveSurface href={`/buku/${book.id}`} tilt={1.5} className={`reference-book-card interactive-book-card group ${layout === 'list' ? 'is-list' : ''}`}>
      <div className="reference-book-cover"><BookCover isbn={book.isbn} src={book.cover_url} title={book.title} author={book.author} size="md" /></div>
      <div className="reference-book-information">
        {rank && <span className="font-mono text-xs text-ink-muted">Pilihan {rank}</span>}
        <h3>{book.title}</h3><p className="book-author">{book.author}</p>
        {layout === 'list' && <p><Mono>{book.isbn} · {book.publish_year}</Mono></p>}
        <p className="reference-book-category"><IconBook className="h-4 w-4" />{book.category_name}</p>
        {showLoans ? <small className="text-ink-muted">Dipinjam <span className="font-mono">{book.loan_count}</span> kali</small> : <span className={`reference-availability ${book.stock > 0 ? 'available' : 'borrowed'}`}>{book.stock > 0 ? 'Tersedia' : 'Dipinjam'}</span>}
        <div className="reference-book-rating"><Stars value={book.avg_rating} size="h-3 w-3" showValue /></div>
        <span className="book-detail-link">Lihat detail <IconArrowRight className="h-4 w-4" /></span>
      </div>
    </InteractiveSurface>
  );
}
