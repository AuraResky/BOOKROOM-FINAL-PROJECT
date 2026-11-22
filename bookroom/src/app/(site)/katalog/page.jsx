// Halaman: koleksi kategori dan halaman katalog
import Link from 'next/link';
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getCatalog, getCategoriesWithCount, SORT_OPTIONS } from '@/lib/queries';
import CategoryCollections from '@/components/site/CategoryCollections';
import { getHomeCategoryBooks } from '@/lib/home-collections';
import BookCard from '@/components/books/BookCard';
import CatalogFilters, { ViewToggle } from '@/components/site/CatalogFilters';
import PageBanner from '@/components/art/PageBanner';
import Pagination from '@/components/ui/Pagination';
import { IconBooks } from '@/components/ui/Icons';

export const metadata = { title: 'Katalog Buku' };

export default async function CatalogPage({ searchParams }) {
  const sp = await searchParams;
  const q = String(sp.q || '').slice(0, 100);
  const category = String(sp.kategori || '');
  const availability = ['tersedia', 'dipinjam'].includes(sp.status) ? sp.status : '';
  const sort = String(sp.sort || 'terbaru');
  const view = sp.view === 'list' ? 'list' : 'grid';
  const page = Math.max(1, Number(sp.page) || 1);

  const categoryFirst = !q && !category && !availability && !sp.sort && !sp.view && !sp.page && !sp.semua;
  const [user, { rows, total, pages }, categories, categoryBooks] = await Promise.all([
    getCurrentUser(),
    categoryFirst ? Promise.resolve({ rows: [], total: 0, pages: 1 }) : getCatalog({ q, category, availability, sort, page }),
    getCategoriesWithCount(),
    categoryFirst ? getHomeCategoryBooks(6) : Promise.resolve([]),
  ]);
  const groups = categories.map((item) => ({ ...item, books: categoryBooks.filter((book) => book.category_id === item.id) }));
  const activeCat = categories.find((c) => c.code.toUpperCase() === category.toUpperCase());

  const pageHref = (p) => {
    const s = new URLSearchParams();
    if (sp.semua) s.set('semua', '1');
    if (q) s.set('q', q);
    if (category) s.set('kategori', category);
    if (availability) s.set('status', availability);
    if (sp.sort) s.set('sort', sort);
    if (view === 'list') s.set('view', 'list');
    s.set('page', p);
    return `/katalog?${s.toString()}`;
  };

  return (
    <>
      <PageBanner title="Katalog Buku" subtitle={activeCat ? `${activeCat.name} — ${activeCat.description || ''}` : 'Jelajahi koleksi dan temukan bacaan yang Anda butuhkan.'} />

      <div className="reference-catalog-shell mx-auto max-w-[1440px] px-4 sm:px-6">
        <Suspense>
          <CatalogFilters categories={categories} sortOptions={SORT_OPTIONS} canManage={user?.role === 'pegawai'} />
        </Suspense>

        {categoryFirst ? <CategoryCollections groups={groups} /> : <>
        <Link href="/katalog" className="mt-6 inline-flex text-sm font-semibold text-navy underline underline-offset-4">Jelajahi kategori</Link>
        <div className="reference-catalog-heading mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="display flex items-start text-3xl sm:text-4xl">{activeCat ? activeCat.name : q ? 'Hasil Pencarian' : 'Semua Buku'}</h2>
            <span className="h-8 w-px bg-navy/40" />
            <p className="text-sm font-semibold text-ink">
              Menampilkan <span className="font-mono">{total.toLocaleString('id-ID')}</span> buku
              {q && <> untuk “<span className="text-coral">{q}</span>”</>}
            </p>
          </div>
          <Suspense><ViewToggle view={view} /></Suspense>
        </div>

        {rows.length ? (
          <div className={`mt-6 grid gap-5 ${view === 'list' ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
            {rows.map((b) => <BookCard key={b.id} book={b} layout={view} />)}
          </div>
        ) : (
          <div className="card mt-6 flex flex-col items-center gap-3 px-6 py-16 text-center">
            <IconBooks className="h-10 w-10 text-coral" />
            <p className="display text-2xl">Buku tidak ditemukan</p>
            <p className="max-w-sm text-sm text-ink-muted">Coba kata kunci lain, ubah ketersediaan, atau pilih kategori berbeda.</p>
            <Link href="/katalog" className="btn-outline btn-sm">Reset filter</Link>
          </div>
        )}

        <Pagination page={page} pages={pages} href={pageHref} />
        </>}
      </div>
    </>
  );
}
