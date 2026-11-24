'use client';

// Kontrol pencarian, kategori dan urutan katalog

import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { IconSearch, IconX, IconTag, IconLayers, IconSort, IconChevron, IconPlus, IconGrid, IconList } from '@/components/ui/Icons';
import { Spinner } from '@/components/ui/Form';

function PillSelect({ icon: Icon, label, value, onChange, options }) {
  return (
    <label className="relative flex h-12 min-w-[170px] items-center gap-2 rounded-lg border border-line bg-white pl-4 pr-9 shadow-none transition focus-within:ring-4 focus-within:ring-coral/20 hover:-translate-y-0.5">
      <Icon className="h-[18px] w-[18px] shrink-0 text-navy" />
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none bg-transparent text-sm font-bold text-navy focus:outline-none">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <IconChevron className="pointer-events-none absolute right-3 h-4 w-4 text-navy" />
    </label>
  );
}

export default function CatalogFilters({ categories, sortOptions, canManage }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [pending, startTransition] = useTransition();

  function push(next) {
    const sp = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => (v ? sp.set(k, v) : sp.delete(k)));
    if (!('page' in next)) sp.delete('page');
    startTransition(() => router.push(`${pathname}?${sp.toString()}`, { scroll: false }));
  }

  return (
    <div className="reference-catalog-toolbar flex flex-wrap items-center gap-3">
      <form noValidate onSubmit={(e) => { e.preventDefault(); push({ q: q.trim() }); }}
        className="flex h-12 min-w-[260px] flex-[2] items-center gap-3 rounded-lg border border-line bg-white px-4 shadow-none focus-within:ring-4 focus-within:ring-coral/20">
        {pending ? <Spinner className="h-5 w-5 text-coral" /> : <IconSearch className="h-5 w-5 text-navy" />}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari judul, penulis, atau ISBN…" aria-label="Cari buku"
          className="min-w-0 flex-1 bg-transparent text-[15px] placeholder:text-ink-soft focus:outline-none" />
        {q && (
          <button type="button" onClick={() => { setQ(''); push({ q: '' }); }} aria-label="Hapus pencarian" className="text-ink-soft hover:text-coral">
            <IconX className="h-4 w-4" />
          </button>
        )}
      </form>
      <PillSelect icon={IconLayers} label="Ketersediaan" value={params.get('status') || ''} onChange={(v) => push({ status: v })}
        options={[{ value: '', label: 'Ketersediaan' }, { value: 'tersedia', label: 'Tersedia' }, { value: 'dipinjam', label: 'Sedang dipinjam' }]} />
      <PillSelect icon={IconSort} label="Urutkan" value={params.get('sort') || ''} onChange={(v) => push({ sort: v })}
        options={[{ value: '', label: 'Urutkan' }, ...sortOptions]} />
      {canManage && (
        <Link href="/pegawai/buku" className="btn-primary h-12 px-6 text-[15px]"><IconPlus className="h-5 w-5" /> Tambah Buku</Link>
      )}
    </div>
  );
}

export function ViewToggle({ view }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const set = (v) => {
    const sp = new URLSearchParams(params.toString());
    v === 'grid' ? sp.delete('view') : sp.set('view', v);
    router.push(`${pathname}?${sp}`, { scroll: false });
  };
  return (
    <div className="flex overflow-hidden rounded-lg border border-navy">
      {[['grid', IconGrid, 'Tampilan kisi'], ['list', IconList, 'Tampilan daftar']].map(([v, I, l]) => (
        <button key={v} type="button" onClick={() => set(v)} aria-label={l} aria-pressed={view === v}
          className={`flex h-11 w-14 items-center justify-center transition ${view === v ? 'bg-coral text-white' : 'bg-cream-50 text-navy hover:bg-cream-200'}`}>
          <I className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}
