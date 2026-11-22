'use client';

// Kolom pencarian cepat dan saran buku

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconSearch, IconArrowRight } from '@/components/ui/Icons';


export default function QuickSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const [rect, setRect] = useState(null);
  const box = useRef(null);
  const panel = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setResults([]); setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/buku?q=${encodeURIComponent(term)}&limit=6&sort=populer`, { signal: controller.signal });
        const data = await res.json();
        setResults(res.ok ? data.data : []);
        setActive(-1);
        setOpen(true);
      } catch (e) {
        if (e.name !== 'AbortError') setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [q]);

  useEffect(() => {
    function onClick(e) {
      if (box.current?.contains(e.target) || panel.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Hero memakai overflow:hidden, jadi panel saran dirender di body dengan posisi fixed.
  useEffect(() => {
    if (!open) return;
    const place = () => box.current && setRect(box.current.getBoundingClientRect());
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => { window.removeEventListener('scroll', place, true); window.removeEventListener('resize', place); };
  }, [open]);

  function onKeyDown(e) {
    if (!open || !results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % results.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i <= 0 ? results.length - 1 : i - 1)); }
    else if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); router.push(results[active].url); }
  }

  const term = q.trim();
  return (
    <div className="relative" ref={box}>
      <form action="/katalog" role="search" className="curated-hero-search">
        <IconSearch className="h-5 w-5" />
        <input
          name="q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          onKeyDown={onKeyDown}
          maxLength={100}
          autoComplete="off"
          placeholder="Cari judul buku, penulis, atau ISBN…"
          aria-label="Cari katalog buku"
          aria-autocomplete="list"
          aria-expanded={open && term.length >= 2}
          aria-controls="quick-search-results"
        />
        <button type="submit">Cari Buku <IconArrowRight className="h-4 w-4" /></button>
      </form>

      {open && term.length >= 2 && rect && createPortal(
        <div
          ref={panel}
          id="quick-search-results"
          role="listbox"
          style={{ position: 'fixed', top: rect.bottom + 8, left: rect.left, width: rect.width }}
          className="z-50 max-h-[60vh] animate-fadein overflow-y-auto rounded-xl border border-line bg-white text-left shadow-lift"
        >
          {loading && !results.length && <p className="px-4 py-3 text-sm text-ink-muted">Mencari…</p>}
          {!loading && !results.length && <p className="px-4 py-3 text-sm text-ink-muted">Tidak ada buku yang cocok dengan “{term}”.</p>}
          {results.map((b, i) => (
            <Link
              key={b.id}
              href={b.url}
              role="option"
              aria-selected={i === active}
              className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm ${i === active ? 'bg-canvas' : 'hover:bg-canvas'}`}
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold text-navy">{b.title}</span>
                <span className="block truncate text-xs text-ink-muted">{b.author} · {b.category.name}</span>
              </span>
              <span className={`shrink-0 font-mono text-[11px] font-semibold ${b.stock > 0 ? 'text-emerald-700' : 'text-danger'}`}>
                {b.stock > 0 ? `Stok ${b.stock}` : 'Habis'}
              </span>
            </Link>
          ))}
          {results.length > 0 && (
            <Link href={`/katalog?q=${encodeURIComponent(term)}`} className="block border-t border-line px-4 py-2.5 text-center text-xs font-semibold text-navy hover:bg-canvas">
              Lihat semua hasil di katalog
            </Link>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
