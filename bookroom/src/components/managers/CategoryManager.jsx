// Daftar dan form pengelolaan kategori buku.
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from '@/app/actions/admin';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import { TextInput, TextArea, Alert, Spinner } from '@/components/ui/Form';
import { toast } from '@/components/ui/Toast';
import { Mono } from '@/components/ui/Badges';
import { IconPlus, IconEdit, IconTrash, IconTag } from '@/components/ui/Icons';

// Form nama, kode dan deskripsi kategori
function CategoryForm({ item, onDone }) {
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  // Mengirim formulir dan menampilkan hasil proses
  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const local = {};
    const code = String(fd.get('code')).trim();
    if (!String(fd.get('name')).trim()) local.name = 'Nama kategori wajib diisi.';
    if (!code) local.code = 'Kode klasifikasi wajib diisi.';
    else if (!/^[A-Za-z0-9.\-]{2,20}$/.test(code)) local.code = 'Kode hanya huruf/angka/titik, 2–20 karakter.';
    setErrors(local);
    setMessage('');
    if (Object.keys(local).length) return;
    startTransition(async () => {
      const res = item ? await updateCategoryAction(item.id, fd) : await createCategoryAction(fd);
      if (res.ok) { toast(res); onDone(); } else { setErrors(res.errors || {}); setMessage(res.message); }
    });
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4">
      {message && <Alert>{message}</Alert>}
      <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
        <TextInput label="Nama kategori" name="name" defaultValue={item?.name} error={errors.name} />
        <TextInput label="Kode klasifikasi" name="code" defaultValue={item?.code} inputClassName="font-mono uppercase" placeholder="005" error={errors.code} />
      </div>
      <TextArea label="Deskripsi singkat" name="description" rows={3} defaultValue={item?.description || ''} error={errors.description} />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="btn-ghost">Batal</button>
        <button type="submit" disabled={pending} className="btn-primary">{pending && <Spinner />} Simpan</button>
      </div>
    </form>
  );
}

export default function CategoryManager({ items }) {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  // Menjalankan penghapusan setelah dikonfirmasi
  function confirmDelete() {
    startTransition(async () => {
      const res = await deleteCategoryAction(deleting.id);
      if (res.ok) { toast(res); setDeleting(null); router.refresh(); } else setDeleteError(res.message);
    });
  }

  return (
    <>
      <div className="flex justify-end">
        <button type="button" onClick={() => setEditing('new')} className="btn-primary"><IconPlus className="h-4 w-4" /> Tambah Kategori</button>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((c) => (
          <div key={c.id} className="card group flex flex-col p-5 transition hover:border-gold/50">
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-navy px-2 font-mono text-sm font-bold text-gold-light">{c.code}</span>
              <span className="rounded-full bg-canvas px-2.5 py-1 font-mono text-xs font-semibold text-ink-muted">{c.book_count} buku</span>
            </div>
            <h3 className="mt-3 font-bold text-navy">{c.name}</h3>
            <p className="mt-1 flex-1 text-sm text-ink-muted">{c.description || '—'}</p>
            <div className="mt-4 flex flex-col gap-2 border-t border-line pt-3 sm:flex-row">
              <button type="button" onClick={() => setEditing(c)} className="btn-outline btn-sm flex-1"><IconEdit className="h-3.5 w-3.5" /> Ubah</button>
              <button type="button" disabled={c.book_count > 0} title={c.book_count > 0 ? 'Masih terhubung ke buku' : 'Hapus kategori'}
                onClick={() => { setDeleteError(''); setDeleting(c); }} className="btn-sm btn border border-line bg-cream-50 text-danger hover:border-danger">
                <IconTrash className="h-3.5 w-3.5" /> Hapus
              </button>
            </div>
          </div>
        ))}
        {!items.length && (
          <div className="card col-span-full flex flex-col items-center gap-2 py-12 text-center text-ink-muted">
            <IconTag className="h-8 w-8 text-gold" /> Belum ada kategori.
          </div>
        )}
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} width="max-w-xl" title={editing === 'new' ? 'Tambah Kategori' : 'Ubah Kategori'}
        description="Kode klasifikasi bersifat unik (mis. nomor DDC).">
        {editing && <CategoryForm item={editing === 'new' ? null : editing} onDone={() => { setEditing(null); router.refresh(); }} />}
      </Modal>
      <ConfirmModal open={!!deleting} onClose={() => setDeleting(null)} onConfirm={confirmDelete} pending={pending} error={deleteError}
        title="Hapus kategori?" message={deleting ? <>Kategori <b>{deleting.name}</b> (<Mono>{deleting.code}</Mono>) akan dihapus.</> : ''} />
    </>
  );
}
