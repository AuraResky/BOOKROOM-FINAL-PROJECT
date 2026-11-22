'use client';

// Susunan buku pilihan untuk bagian beranda

import { useState } from 'react';
import Link from 'next/link';
import BookCover from '@/components/books/BookCover';
import { IconArrowLeft, IconArrowRight, IconBook } from '@/components/ui/Icons';

export default function FeaturedBooks({ books = [] }) {
  const [index, setIndex] = useState(0);
  if (!books.length) return null;
  const selectedIndex = index % books.length;
  const selected = books[selectedIndex];
  const previous = () => setIndex((current) => (current - 1 + books.length) % books.length);
  const next = () => setIndex((current) => (current + 1) % books.length);
  return (
    <section className="featured-books" aria-label="Pilihan buku perpustakaan">
      <div className="featured-label"><span /> PILIHAN PUSTAKAWAN</div>
      <div className="featured-stage">
        <div className="featured-orbit featured-orbit-one" aria-hidden="true" />
        <div className="featured-orbit featured-orbit-two" aria-hidden="true" />
        <div className="featured-sheet featured-sheet-back" aria-hidden="true" />
        <div className="featured-sheet featured-sheet-front" aria-hidden="true" />
        <Link key={selected.id} href={`/buku/${selected.id}`} className="featured-main group" aria-label={`Lihat detail ${selected.title}`}>
          <BookCover isbn={selected.isbn} src={selected.cover_url} title={selected.title} author={selected.author} size="lg" priority />
          <span className="featured-open">Lihat detail <IconArrowRight className="h-4 w-4" /></span>
        </Link>
        <span className="featured-availability"><IconBook className="h-3.5 w-3.5" />{selected.stock > 0 ? 'Tersedia di perpustakaan' : 'Sedang dipinjam'}</span>
      </div>
      <div className="featured-information" aria-live="polite" aria-atomic="true">
        <h2>{selected.title}</h2>
        <p>{selected.author}</p>
      </div>
      <div className="featured-controls">
        <button type="button" onClick={previous} className="featured-control" aria-label="Buku pilihan sebelumnya"><IconArrowLeft className="h-4 w-4" /></button>
        <div className="featured-picks" role="group" aria-label="Pilih buku unggulan" onKeyDown={(event) => {
          if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
          if (event.key === 'ArrowLeft') { event.preventDefault(); previous(); }
        }}>
          {books.map((book, position) => <button key={book.id} type="button" onClick={() => setIndex(position)} aria-pressed={position === selectedIndex} aria-label={`Tampilkan ${book.title}`} className={`featured-pick ${position === selectedIndex ? 'is-active' : ''}`}><span className="font-mono">{String(position + 1).padStart(2, '0')}</span></button>)}
        </div>
        <button type="button" onClick={next} className="featured-control" aria-label="Buku pilihan berikutnya"><IconArrowRight className="h-4 w-4" /></button>
      </div>
    </section>
  );
}
