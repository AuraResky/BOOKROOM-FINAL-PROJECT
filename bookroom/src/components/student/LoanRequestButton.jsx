'use client';

// Tombol pengajuan pinjaman oleh mahasiswa

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { requestLoanAction } from '@/app/actions/student';
import { Alert, Spinner } from '@/components/ui/Form';
import { IconBook } from '@/components/ui/Icons';

export default function LoanRequestButton({ bookId, disabledReason }) {
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
            const res = await requestLoanAction(bookId);
            setResult(res);
            if (res.ok) router.refresh();
          })
        }
        className="btn-primary w-full py-3 text-[15px] sm:w-auto sm:px-8"
        title={disabledReason || 'Ajukan peminjaman buku ini'}
      >
        {pending ? <Spinner /> : <IconBook className="h-[18px] w-[18px]" />}
        Ajukan Pinjam
      </button>
      {disabledReason && !result && <Alert tone="amber">{disabledReason}</Alert>}
      {result && <Alert tone={result.ok ? 'green' : 'red'}>{result.message}</Alert>}
    </div>
  );
}
