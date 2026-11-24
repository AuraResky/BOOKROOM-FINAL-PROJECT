'use client';

// Tombol membuat atau membatalkan reservasi

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { reserveBookAction, cancelReservationAction } from '@/app/actions/student';
import { Alert, Spinner } from '@/components/ui/Form';
import { toast } from '@/components/ui/Toast';
import { IconClock, IconX } from '@/components/ui/Icons';

/** Tombol masuk antrean reservasi saat stok buku habis. */
export function ReserveButton({ bookId, disabledReason, queueLength = 0 }) {
  const [result, setResult] = useState(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const disabled = Boolean(disabledReason) || pending || result?.ok;

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          startTransition(async () => {
            const res = await reserveBookAction(bookId);
            setResult(res);
            if (res.ok) router.refresh();
          })
        }
        className="btn-gold w-full py-3 text-[15px] sm:w-auto sm:px-8"
        title={disabledReason || 'Masuk antrean reservasi buku ini'}
      >
        {pending ? <Spinner /> : <IconClock className="h-[18px] w-[18px]" />}
        Reservasi / Antre
      </button>
      {!result && !disabledReason && (
        <p className="text-sm text-ink-muted">
          Stok sedang habis. {queueLength > 0 ? `${queueLength} mahasiswa sudah mengantre. ` : ''}
          Saat Buku kembali, buku ditahan untuk pemesan terdepan selama 2 hari.
        </p>
      )}
      {disabledReason && !result && <Alert tone="amber">{disabledReason}</Alert>}
      {result && <Alert tone={result.ok ? 'green' : 'red'}>{result.message}</Alert>}
    </div>
  );
}

/** Tombol kecil pembatalan reservasi milik mahasiswa. */
export function CancelReservationButton({ reservationId }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm('Batalkan reservasi ini? Posisi antrean Anda akan hilang.')) return;
        startTransition(async () => {
          const res = await cancelReservationAction(reservationId);
          toast(res);
          if (res.ok) router.refresh();
        });
      }}
      className="btn-ghost btn-sm whitespace-nowrap text-danger"
    >
      {pending ? <Spinner className="h-3.5 w-3.5" /> : <IconX className="h-3.5 w-3.5" />}
      Batalkan
    </button>
  );
}
