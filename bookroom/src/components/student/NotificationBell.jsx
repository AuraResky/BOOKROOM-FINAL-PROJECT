'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconBell } from '@/components/ui/Icons';
import { timeAgo } from '@/lib/format';

// Lonceng notifikasi navbar mahasiswa

export default function NotificationBell({ initialUnread = 0 }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const box = useRef(null);

  useEffect(() => setUnread(initialUnread), [initialUnread]);

  useEffect(() => {
    if (!open) return;
    function onClick(e) { if (box.current && !box.current.contains(e.target)) setOpen(false); }
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, [open]);

  // Ambil data
  async function load() {
    setItems(null);
    setError('');
    try {
      const res = await fetch('/api/notifikasi?limit=8', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setItems(data.data);
      setUnread(data.unread);
    } catch (e) {
      setError(e.message || 'Notifikasi belum dapat dimuat.');
    }
  }

  // Tandai semua dibaca
  function markAll() {
    startTransition(async () => {
      setError('');
      try {
        const res = await fetch('/api/notifikasi', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setUnread(data.unread);
        setItems((list) => list?.map((n) => ({ ...n, is_read: true })) ?? list);
        router.refresh();
      } catch (e) {
        setError(e.message || 'Notifikasi belum dapat ditandai dibaca.');
      }
    });
  }

  // Buka atau tutup panel
  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && !pending) load();
  }

  return (
    <div className="relative" ref={box}>
      <button
        type="button"
        onClick={toggle}
        aria-label={unread ? `Notifikasi, ${unread} belum dibaca` : 'Notifikasi'}
        aria-expanded={open}
        className="relative grid h-10 w-10 place-items-center rounded-full text-white transition hover:bg-white/10"
      >
        <IconBell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 font-mono text-[10px] font-bold text-navy-900">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-3 top-16 z-50 overflow-hidden rounded-xl border border-[#e2ded5] bg-white text-[#153454] shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-80">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-bold text-navy">Notifikasi</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                disabled={pending || items === null}
                className="text-xs font-semibold text-navy underline-offset-4 hover:underline disabled:opacity-50"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {error && <p className="px-4 py-6 text-center text-sm text-danger">{error}</p>}
            {!error && items === null && <p className="px-4 py-6 text-center text-sm text-ink-muted">Memuat…</p>}
            {!error && items?.length === 0 && <p className="px-4 py-6 text-center text-sm text-ink-muted">Belum ada notifikasi.</p>}
            {items?.length > 0 && (
              <ul className="divide-y divide-line">
                {items.map((n) => (
                  <li key={n.id} className={n.is_read ? '' : 'bg-sun-soft/60'}>
                    <Link
                      href={n.link || '/mahasiswa'}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 hover:bg-canvas"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-snug text-navy">{n.title}</p>
                        {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" aria-label="Belum dibaca" />}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-ink-muted">{n.message}</p>
                      <p className="mt-1 font-mono text-[11px] text-ink-soft">{n.type} · {timeAgo(n.created_at)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            href="/mahasiswa#notifikasi"
            onClick={() => setOpen(false)}
            className="block border-t border-line px-4 py-2.5 text-center text-xs font-semibold text-navy hover:bg-canvas"
          >
            Lihat semua di dashboard
          </Link>
        </div>
      )}
    </div>
  );
}