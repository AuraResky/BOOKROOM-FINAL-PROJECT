'use client';

// Koleksi buku yang dikelompokkan menurut kategori

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import BookCover from '@/components/books/BookCover';
import { Stars } from '@/components/ui/Badges';
import { IconArrowLeft, IconArrowRight, IconBook } from '@/components/ui/Icons';

export default function CategoryCollections({ groups = [] }) {
  const available = groups.filter((group) => group.books.length);
  const [selectedId, setSelectedId] = useState(null);
  const selected = available.find((group) => group.id === selectedId) || available[0];
  const [scroll, setScroll] = useState({ left: false, right: false });
  const row = useRef(null);
  const tabs = useRef([]);
  const id = useId().replace(/:/g, '');

  function measure() {
    const element = row.current;
    if (!element) return;
    const next = { left: element.scrollLeft > 2, right: element.scrollWidth - element.clientWidth - element.scrollLeft > 2 };
    setScroll((previous) => previous.left === next.left && previous.right === next.right ? previous : next);
  }
  useEffect(() => {
    const element = row.current;
    if (!element) return;
    element.scrollLeft = 0;
    const frame = requestAnimationFrame(measure);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(element);
    window.addEventListener('resize', measure);
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, [selected?.id]);

  function slide(direction) {
    const element = row.current;
    if (!element) return;
    element.scrollBy({ left: direction * Math.max(220, element.clientWidth * .8), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  function keyboard(event, index) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % available.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + available.length) % available.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = available.length - 1;
    else return;
    event.preventDefault();
    setSelectedId(available[next].id);
    tabs.current[next]?.focus();
  }
  return (
    <section className="category-collections" aria-labelledby={`category-heading-${id}`}>
      <div className="category-collections-heading"><div><p className="eyebrow">TEMUKAN BIDANG PILIHANMU</p><h2 id={`category-heading-${id}`}>Koleksi Berdasarkan Kategori</h2><p>Pilih bidang bacaan untuk menjelajahi koleksi yang sesuai kebutuhan Anda.</p></div><Link href="/katalog?semua=1">Semua koleksi <IconArrowRight className="h-4 w-4" /></Link></div>
      {!selected ? <div className="category-empty"><IconBook className="h-7 w-7" /><p>Belum ada koleksi untuk ditampilkan.</p></div> : <>
        <div className="category-tabs" role="tablist" aria-label="Kategori koleksi">{available.map((group, index) => <button key={group.id} type="button" role="tab" id={`category-tab-${id}-${group.id}`} aria-controls={`category-panel-${id}`} aria-selected={group.id === selected.id} tabIndex={group.id === selected.id ? 0 : -1} ref={(element) => { tabs.current[index] = element; }} onClick={() => setSelectedId(group.id)} onKeyDown={(event) => keyboard(event, index)} className={`category-index-tab ${group.id === selected.id ? 'is-active' : ''}`}><span className="category-tab-code">{group.code}</span><strong>{group.name}</strong><small>{group.book_count} judul</small></button>)}</div>
        <div className="category-shelf-panel" role="tabpanel" id={`category-panel-${id}`} aria-labelledby={`category-tab-${id}-${selected.id}`} tabIndex={0}>
          <div className="category-shelf-header"><div><h3>{selected.name}</h3><p>{selected.description || 'Pilihan referensi dan bacaan dari koleksi perpustakaan.'}</p></div><div className="category-shelf-actions"><Link href={`/katalog?kategori=${encodeURIComponent(selected.code)}`}>Lihat kategori <IconArrowRight className="h-4 w-4" /></Link><button type="button" onClick={() => slide(-1)} disabled={!scroll.left} aria-label="Geser buku ke kiri"><IconArrowLeft className="h-4 w-4" /></button><button type="button" onClick={() => slide(1)} disabled={!scroll.right} aria-label="Geser buku ke kanan"><IconArrowRight className="h-4 w-4" /></button></div></div>
          <div className="category-book-row" ref={row} onScroll={measure} key={selected.id}>{selected.books.map((book) => <Link href={`/buku/${book.id}`} key={book.id} className="category-shelf-book group"><div className="category-cover-frame"><span className="category-book-index" aria-hidden="true">{selected.code}</span><BookCover isbn={book.isbn} src={book.cover_url} title={book.title} author={book.author} /><span className="category-cover-action">Lihat detail</span></div><h4>{book.title}</h4><p>{book.author}</p><div className="category-book-bottom"><span className={book.stock > 0 ? 'is-available' : 'is-borrowed'}>{book.stock > 0 ? 'Tersedia' : 'Dipinjam'}</span><Stars value={book.avg_rating} size="h-3 w-3" showValue /></div></Link>)}</div>
        </div>
      </>}
    </section>
  );
}
