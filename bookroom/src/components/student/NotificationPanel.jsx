// panel daftar dan penandaan notifikasi mahasiswa
'use client';


import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { markNotificationsReadAction } from '@/app/actions/student';
import { Spinner } from '@/components/ui/Form';
import { toast } from '@/components/ui/Toast';
import { timeAgo } from '@/lib/format';

const TONE = {
  'Jatuh Tempo': 'bg-amber-500',
  Denda: 'bg-danger',
  Reservasi: 'bg-gold',
  Peminjaman: 'bg-navy',
  Perpanjangan: 'bg-navy-600',
  Pengembalian: 'bg-ok',
};

//Daftar notifikasi di dashboard mahasiswa
export default function NotificationPanel({ items, unread }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function mark(ids = null) {
    startTransition(async () => {
      const res = await markNotificationsReadAction(ids);
      if (!ids) toast(res);
      router.refresh();
    });
  }

  return (
    <section id="notifikasi" className="w-full scroll-mt-24 overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="display text-2xl">Notifikasi</h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">
            Pengingat H-1 jatuh tempo, persetujuan transaksi, denda, dan reservasi.
          </p>
        </div>
        {unread > 0 && (
          <button type="button" disabled={pending} onClick={() => mark()} className="btn-outline btn-sm">
            {pending && <Spinner className="h-3.5 w-3.5" />} Tandai semua dibaca ({unread})
          </button>
        )}
      </div>
      {items.length ? (
        <ul className="divide-y divide-line">
          {items.map((n) => (
            <li key={n.id} className={`flex gap-3 px-5 py-3.5 ${n.is_read ? '' : 'bg-sun-soft/50'}`}>
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${TONE[n.type] || 'bg-navy'}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className={`text-sm text-navy ${n.is_read ? 'font-semibold' : 'font-bold'}`}>{n.title}</p>
                  <span className="font-mono text-[11px] text-ink-soft">{n.type} · {timeAgo(n.created_at)}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-ink-muted">{n.message}</p>
                <div className="mt-1 flex gap-3 text-xs">
                  {n.link && n.link !== '/mahasiswa' && <Link href={n.link} className="font-semibold text-navy underline-offset-4 hover:underline">Buka</Link>}
                  {!n.is_read && (
                    <button type="button" disabled={pending} onClick={() => mark([n.id])} className="font-semibold text-ink-muted underline-offset-4 hover:underline">
                      Tandai dibaca
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-8 text-center text-sm text-ink-muted">Belum ada notifikasi.</p>
      )}
    </section>
  );
}
