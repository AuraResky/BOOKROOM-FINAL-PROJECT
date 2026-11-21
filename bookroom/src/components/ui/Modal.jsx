'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconX, IconAlert } from './Icons';
import { Spinner } from './Form';

// Dialog utama
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  width = 'max-w-2xl',
}) {
  // Tombol Escape dan penguncian gulir halaman
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-navy-900/55 px-4 py-10 backdrop-blur-[2px]"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${width} formal-dialog animate-fadein overflow-hidden rounded-xl border border-line bg-white shadow-xl`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="relative flex items-start justify-between gap-4 border-b-[1.5px] border-line bg-cream-100 px-6 py-4">
          <div>
            <h2 className="display text-2xl">{title}</h2>

            {description && (
              <p className="mt-0.5 text-sm text-ink-muted">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-soft hover:bg-canvas hover:text-navy"
            aria-label="Tutup"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

// Dialog konfirmasi tindakan
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Hapus',
  pending,
  error,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      width="max-w-md"
    >
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
          <IconAlert className="h-5 w-5" />
        </span>

        <p className="text-sm leading-relaxed text-ink">
          {message}
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="btn-ghost"
        >
          Batal
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className="btn-danger"
        >
          {pending && <Spinner />} {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}