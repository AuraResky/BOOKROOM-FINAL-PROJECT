// tombol perpanjangan dan penilaian transaksi mahasiswa
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { requestExtensionAction, submitReviewAction } from '@/app/actions/student';
import { Spinner } from '@/components/ui/Form';
import { IconRepeat, IconStar } from '@/components/ui/Icons';

export function ExtensionButton({ loanId, disabledReason }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState(null);
  const router = useRouter();
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={Boolean(disabledReason) || pending}
        title={disabledReason || 'Ajukan perpanjangan masa pinjam'}
        onClick={() => startTransition(async () => {
          const res = await requestExtensionAction(loanId);
          setMsg(res);
          if (res.ok) router.refresh();
        })}
        className="btn-outline btn-sm whitespace-nowrap"
      >
        {pending ? <Spinner className="h-3.5 w-3.5" /> : <IconRepeat className="h-3.5 w-3.5" />}
        Ajukan Perpanjangan
      </button>
      {disabledReason && <span className="max-w-[200px] text-right text-xs leading-tight text-ink-soft">{disabledReason}</span>}
      {msg && !msg.ok && <span className="max-w-[220px] text-right text-xs font-medium text-danger">{msg.message}</span>}
    </div>
  );
}

export function ReviewForm({ loanId, bookTitle, initialRating = 0, initialComment = '' }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (done) return <p className="text-xs font-semibold text-emerald-700">{done}</p>;
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-gold btn-sm">
        <IconStar className="h-3.5 w-3.5" /> Beri Ulasan
      </button>
    );
  }

  // Mengirim formulir dan menampilkan hasil proses
  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set('rating', String(rating));
    const comment = String(fd.get('comment') || '').trim();
    const local = {};
    if (rating < 1) local.rating = 'Pilih rating 1 sampai 5 bintang.';
    if (!comment) local.comment = 'Komentar ulasan wajib diisi.';
    else if (comment.length < 10) local.comment = 'Komentar minimal 10 karakter.';
    setErrors(local);
    if (Object.keys(local).length) return;
    startTransition(async () => {
      const res = await submitReviewAction(fd);
      if (res.ok) { setDone(res.message); router.refresh(); }
      else setErrors({ ...res.errors, form: res.message });
    });
  }

  return (
    <form noValidate onSubmit={onSubmit} className="mt-3 w-full animate-fadein rounded-xl border border-gold/40 bg-gold/[0.04] p-4">
      <input type="hidden" name="loan_id" value={loanId} />
      <p className="text-xs font-semibold text-navy">Ulasan untuk “{bookTitle}”</p>
      <div className="mt-2 flex items-center gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={`${i} bintang`}
            onMouseEnter={() => setHover(i)} onClick={() => setRating(i)}
            className="text-gold transition hover:scale-110">
            <IconStar filled={i <= (hover || rating)} className={`h-6 w-6 ${i <= (hover || rating) ? '' : 'text-gold/40'}`} />
          </button>
        ))}
        <span className="ml-2 font-mono text-xs text-ink-muted">{rating ? `${rating}/5` : ''}</span>
      </div>
      {errors.rating && <p className="field-error">{errors.rating}</p>}
      <textarea name="comment" defaultValue={initialComment} rows={3} placeholder="Bagikan pendapat Anda tentang buku ini (min. 10 karakter)"
        className={`input mt-3 ${errors.comment ? 'input-error' : ''}`} />
      {errors.comment && <p className="field-error">{errors.comment}</p>}
      {errors.form && !errors.comment && !errors.rating && <p className="field-error">{errors.form}</p>}
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost btn-sm">Batal</button>
        <button type="submit" disabled={pending} className="btn-primary btn-sm">{pending && <Spinner className="h-3.5 w-3.5" />} Kirim Ulasan</button>
      </div>
    </form>
  );
}
