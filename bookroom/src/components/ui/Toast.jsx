'use client';

import { useEffect, useState } from 'react';
import { IconCheck, IconAlert } from './Icons';

// Nama event notifikasi global
const EVENT = 'roombook:toast';

// Mengirim notifikasi berhasil atau gagal
export function toast(res) {
  if (typeof window === 'undefined' || !res?.message) return;

  window.dispatchEvent(
    new CustomEvent(EVENT, {
      detail: {
        ok: !!res.ok,
        message: res.message,
      },
    })
  );
}

// Menampilkan notifikasi di sudut halaman
export function Toaster() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const onToast = (e) => {
      const id = Date.now() + Math.random();

      // Menampilkan maksimal tiga notifikasi
      setItems((list) => [
        ...list.slice(-2),
        { ...e.detail, id },
      ]);

      // Menghapus notifikasi setelah 4,5 detik
      setTimeout(() => {
        setItems((list) => list.filter((t) => t.id !== id));
      }, 4500);
    };

    window.addEventListener(EVENT, onToast);

    return () => {
      window.removeEventListener(EVENT, onToast);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[120] flex flex-col items-end gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex max-w-sm animate-fadein items-start gap-3 rounded-lg border bg-cream-50 px-4 py-3 text-sm font-medium shadow-lift ${
            t.ok ? 'border-ok/40' : 'border-danger/40'
          }`}
        >
          <span
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${
              t.ok ? 'bg-ok' : 'bg-danger'
            }`}
          >
            {t.ok ? (
              <IconCheck className="h-3.5 w-3.5" />
            ) : (
              <IconAlert className="h-3.5 w-3.5" />
            )}
          </span>

          <span className="text-ink">{t.message}</span>
        </div>
      ))}
    </div>
  );
}