// Kontrol persetujuan, pengembalian dan denda
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  approveLoanAction, rejectLoanAction, approveExtensionAction, rejectExtensionAction, returnBookAction, payFineAction,
} from '@/app/actions/circulation';
import Modal from '@/components/ui/Modal';
import { Spinner, TextArea } from '@/components/ui/Form';
import { toast } from '@/components/ui/Toast';
import { IconCheck, IconX, IconInbox, IconWallet } from '@/components/ui/Icons';
import { formatRupiah } from '@/lib/format';

function useRun() {
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const router = useRouter();

  // Menjalankan aksi dengan pemeriksaan akun mahasiswa
  async function run(operation, after) {
    if (busy.current) return;

    busy.current = true;
    setPending(true);

    try {
      const result = await operation();

      toast(result);

      if (result?.ok) {
        after?.();
        router.refresh();
      }

      return result;
    } catch {
      toast({
        ok: false,
        message: 'Permintaan belum dapat diproses. Silakan coba lagi.',
      });
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return {
    pending,
    run,
    toast: null,
    show: toast,
  };
}

function ReasonModal({ open, onClose, title, description, required, onSubmit, pending, confirmLabel }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  function submit(e) {
    e.preventDefault();
    const t = reason.trim();
    if (required && !t) return setError('Alasan penolakan wajib diisi.');
    if (required && t.length < 10) return setError('Alasan penolakan minimal 10 karakter.');
    setError('');
    onSubmit(t, setError);
  }
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} width="max-w-lg">
      <form noValidate onSubmit={submit} className="space-y-4">
        <TextArea label={required ? 'Alasan penolakan *' : 'Catatan (opsional)'} name="reason" rows={4} value={reason}
          onChange={(e) => setReason(e.target.value)} error={error}
          placeholder="Contoh: Buku sedang direservasi untuk kebutuhan perkuliahan." />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">Batal</button>
          <button type="submit" disabled={pending} className="btn-danger">{pending && <Spinner />} {confirmLabel}</button>
        </div>
      </form>
    </Modal>
  );
}

export function VerifyActions({ loanId, code, title, stock }) {
  const { pending, run, toast } = useRun();
  const [open, setOpen] = useState(false);
  return (
    <>
      {toast}
      <div className="flex flex-col items-stretch gap-2 @[860px]:flex-row @[860px]:items-center @[860px]:justify-end">
        <button type="button" disabled={pending || stock < 1} title={stock < 1 ? 'Stok habis' : 'Setujui peminjaman'}
          onClick={() => run(() => approveLoanAction(loanId))} className="btn-success btn-sm">
          {pending ? <Spinner className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />} Setujui
        </button>
        <button type="button" disabled={pending} onClick={() => setOpen(true)} className="btn-sm btn border border-navy bg-cream-50 text-danger hover:bg-danger hover:text-white">
          <IconX className="h-3.5 w-3.5" /> Tolak
        </button>
      </div>
      <ReasonModal open={open} onClose={() => setOpen(false)} required pending={pending} confirmLabel="Tolak Pengajuan"
        title={`Tolak pengajuan ${code}`} description={`“${title}” — alasan ditampilkan pada riwayat mahasiswa.`}
        onSubmit={(reason) => run(() => rejectLoanAction(loanId, reason), () => setOpen(false))} />
    </>
  );
}

export function ExtensionActions({ loanId, code, title, days }) {
  const { pending, run, toast } = useRun();
  const [open, setOpen] = useState(false);
  return (
    <>
      {toast}
      <div className="flex flex-col items-stretch gap-2 @[860px]:flex-row @[860px]:items-center @[860px]:justify-end">
        <button type="button" disabled={pending} onClick={() => run(() => approveExtensionAction(loanId))} className="btn-success btn-sm">
          {pending ? <Spinner className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />} Setujui +{days} hari
        </button>
        <button type="button" disabled={pending} onClick={() => setOpen(true)} className="btn-sm btn border border-navy bg-cream-50 text-danger hover:bg-danger hover:text-white">
          <IconX className="h-3.5 w-3.5" /> Tolak
        </button>
      </div>
      <ReasonModal open={open} onClose={() => setOpen(false)} required pending={pending} confirmLabel="Tolak Perpanjangan"
        title={`Tolak perpanjangan ${code}`} description={`“${title}” — jatuh tempo tetap seperti semula.`}
        onSubmit={(reason) => run(() => rejectExtensionAction(loanId, reason), () => setOpen(false))} />
    </>
  );
}

export function ReturnAction({ loanId, code, title, lateDays, estFine }) {
  const { pending, run, toast } = useRun();
  const [open, setOpen] = useState(false);
  return (
    <>
      {toast}
      <button type="button" onClick={() => setOpen(true)} className="btn-primary btn-sm w-full whitespace-nowrap @[860px]:w-auto">
        <IconInbox className="h-3.5 w-3.5" /> Konfirmasi Kembali
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Pengembalian ${code}`} description={`“${title}”`} width="max-w-md">
        <div className={`rounded-xl border px-4 py-3 text-sm ${lateDays > 0 ? 'border-danger/30 bg-danger/5' : 'border-ok/30 bg-ok/5'}`}>
          {lateDays > 0 ? (
            <>Buku terlambat <b className="font-mono">{lateDays} hari</b>. Sistem akan mencatat denda <b className="font-mono">{formatRupiah(estFine)}</b> berstatus <b>Tertunggak</b>.</>
          ) : (
            <>Buku dikembalikan tepat waktu. Tidak ada denda.</>
          )}
        </div>
        <p className="mt-3 text-xs text-ink-muted">Denda final dihitung ulang di server berdasarkan tanggal hari ini. Stok buku bertambah 1 secara otomatis.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Batal</button>
          <button type="button" disabled={pending} onClick={() => run(() => returnBookAction(loanId), () => setOpen(false))} className="btn-primary">
            {pending && <Spinner />} Buku Fisik Diterima
          </button>
        </div>
      </Modal>
    </>
  );
}

export function PayFineAction({ loanId, code, amount, name }) {
  const { pending, run, toast } = useRun();
  const [open, setOpen] = useState(false);
  return (
    <>
      {toast}
      <button type="button" onClick={() => setOpen(true)} className="btn-success btn-sm w-full whitespace-nowrap @[860px]:w-auto">
        <IconWallet className="h-3.5 w-3.5" /> Tandai Lunas
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Konfirmasi Pelunasan Denda" width="max-w-md">
        <p className="text-sm text-ink">
          Terima pembayaran denda <b className="font-mono">{formatRupiah(amount)}</b> dari <b>{name}</b> untuk transaksi <span className="font-mono">{code}</span>?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Batal</button>
          <button type="button" disabled={pending} onClick={() => run(() => payFineAction(loanId), () => setOpen(false))} className="btn-success">
            {pending && <Spinner />} Ubah ke Lunas
          </button>
        </div>
      </Modal>
    </>
  );
}
