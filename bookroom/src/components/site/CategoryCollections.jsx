'use client';

import { useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function CategoryCollections({ categories = [], totalBooks = 0 }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const activeCode = (params.get('kategori') || '').toUpperCase();
  const tabs = useRef([]);

  const available = categories.filter((c) => c.book_count > 0);
  const items = [
    { id: 'all', code: '', name: 'Semua Koleksi', book_count: totalBooks },
    ...available,
  ];

  function selectCategory(code) {
    const sp = new URLSearchParams(params.toString());
    if (code) {
      sp.set('kategori', code);
    } else {
      sp.delete('kategori');
    }
    sp.delete('page');
    const query = sp.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function keyboard(event, index) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % items.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else return;
    event.preventDefault();
    selectCategory(items[next].code);
    tabs.current[next]?.focus();
  }

  return (
    <section className="category-collections" aria-label="Pilih kategori buku">
      <div className="category-collections-heading">
        <div>
          <p className="eyebrow">JELAJAHI BERDASARKAN BIDANG</p>
          <h2>Pilih Kategori Buku</h2>
        </div>
      </div>

      <div className="category-tabs" role="tablist" aria-label="Kategori koleksi">
        {items.map((item, index) => {
          const isActive = item.code.toUpperCase() === activeCode;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              ref={(el) => {
                tabs.current[index] = el;
              }}
              onClick={() => selectCategory(item.code)}
              onKeyDown={(e) => keyboard(e, index)}
              className={`category-index-tab ${isActive ? 'is-active' : ''}`}
            >
              <span className="category-tab-code">{item.code || 'SEMUA'}</span>
              <strong>{item.name}</strong>
              <small>{item.book_count} judul</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}