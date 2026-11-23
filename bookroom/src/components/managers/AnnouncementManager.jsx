'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createAnnouncementAction, updateAnnouncementAction, deleteAnnouncementAction } from '@/app/actions/announcements';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import { TextInput, TextArea, Select, Alert, Spinner } from '@/components/ui/Form';
import { toast } from '@/components/ui/Toast';
import { StatusBadge, Badge, Mono } from '@/components/ui/Badges';
import { IconPlus, IconEdit, IconTrash } from '@/components/ui/Icons';
import { formatDate } from '@/lib/format';

const CATS = ['Operasional', 'Layanan', 'Acara'];
const TONE = { Operasional: 'navy', Layanan: 'green', Acara: 'gold' };

// Form isi, kategori dan status pengumuman
function AnnouncementForm({ item, today, onDone }) {
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  // Mengirim formulir dan menampilkan hasil proses
  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const local = {};
    const title = String(fd.get('title')).trim();
    const content = String(fd.get('content')).trim();
    if (!title) local.title = 'Judul pengumuman wajib diisi.';
    else if (title.length < 8) local.title = 'Judul minimal 8 karakter.';
    if (!content) local.content = 'Konten pengumuman wajib diisi.';
    else if (content.length < 30) local.content = 'Konten minimal 30 karakter.';
    if (!fd.get('category')) local.category = 'Pilih kategori.';
    if (!fd.get('release_date')) local.release_date = 'Tanggal rilis wajib diisi.';
    setErrors(local);
    setMessage('');
    if (Object.keys(local).length) return;
    startTransition(async () => {
      const res = item ? await updateAnnouncementAction(item.id, fd) : await createAnnouncementAction(fd);
      if (res.ok) { toast(res); onDone(); }
      else { setErrors(res.errors || {}); setMessage(res.message); }
    });
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4">
      {message && <Alert>{message}</Alert>}
      <TextInput label="Judul pengumuman" name="title" defaultValue={item?.title} error={errors.title} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Select label="Kategori" name="category" defaultValue={item?.category || ''} placeholder="Pilih kategori"
          options={CATS.map((c) => ({ value: c, label: c }))} error={errors.category} />
        <TextInput label="Tanggal rilis" name="release_date" type="date" defaultValue={item?.release_date || today} inputClassName="font-mono" error={errors.release_date} />
        <Select label="Status publikasi" name="status" defaultValue={item?.status || 'Draft'}
          options={[{ value: 'Draft', label: 'Draft' }, { value: 'Published', label: 'Published' }]} error={errors.status} />
      </div>
      <TextArea label="Konten berita" name="content" rows={9} defaultValue={item?.content} error={errors.content}
        hint="Baris baru dipertahankan saat ditampilkan." />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="btn-ghost">Batal</button>
        <button type="submit" disabled={pending} className="btn-primary">{pending && <Spinner />} Simpan</button>
      </div>
    </form>
  );
}

export default function AnnouncementManager({ items, today }) {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [filter, setFilter] = useState('');
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const shown = useMemo(() => items.filter((a) => !filter || a.status === filter), [items, filter]);

  // Menjalankan penghapusan setelah dikonfirmasi
  function confirmDelete() {
    startTransition(async () => {
      const res = await deleteAnnouncementAction(deleting.id);
      if (res.ok) { toast(res); setDeleting(null); router.refresh(); } else setDeleteError(res.message);
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-lg border border-line bg-cream-50 p-1 text-sm font-semibold">
          {[['', 'Semua'], ['Published', 'Published'], ['Draft', 'Draft']].map(([v, l]) => (
            <button key={l} type="button" onClick={() => setFilter(v)}
              className={`rounded-full px-3.5 py-1.5 ${filter === v ? 'bg-coral text-white shadow-retro-sm' : 'text-ink-muted hover:text-navy'}`}>{l}</button>
          ))}
        </div>
        <button type="button" onClick={() => setEditing('new')} className="btn-primary"><IconPlus className="h-4 w-4" /> Buat Pengumuman</button>
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="table-head">
            <tr><th className="px-5 py-3">Judul</th><th className="px-3 py-3">Kategori</th><th className="px-3 py-3">Rilis</th><th className="px-3 py-3">Status</th><th className="px-5 py-3 text-right">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.map((a) => (
              <tr key={a.id} className="hover:bg-canvas/40">
                <td className="max-w-md px-5 py-3.5">
                  <p className="font-semibold text-navy">{a.title}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{a.content.replace(/\s+/g, ' ').slice(0, 110)}…</p>
                  <p className="mt-1 text-xs text-ink-soft">oleh {a.author_name || '—'}</p>
                </td>
                <td className="px-3 py-3.5"><Badge tone={TONE[a.category]}>{a.category}</Badge></td>
                <td className="px-3 py-3.5"><Mono>{formatDate(a.release_date, { short: true })}</Mono></td>
                <td className="px-3 py-3.5"><StatusBadge status={a.status} /></td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-1.5">
                    <button type="button" onClick={() => setEditing(a)} className="btn-outline btn-sm"><IconEdit className="h-3.5 w-3.5" /> Ubah</button>
                    <button type="button" onClick={() => { setDeleteError(''); setDeleting(a); }} className="btn-sm btn border border-line bg-cream-50 text-danger hover:border-danger" aria-label={`Hapus ${a.title}`}>
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!shown.length && <tr><td colSpan={5} className="px-5 py-12 text-center text-ink-muted">Belum ada pengumuman.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} width="max-w-3xl"
        title={editing === 'new' ? 'Buat Pengumuman' : 'Ubah Pengumuman'}
        description="Pengumuman berstatus Published tampil di Beranda dan halaman Pengumuman.">
        {editing && <AnnouncementForm item={editing === 'new' ? null : editing} today={today} onDone={() => { setEditing(null); router.refresh(); }} />}
      </Modal>
      <ConfirmModal open={!!deleting} onClose={() => setDeleting(null)} onConfirm={confirmDelete} pending={pending} error={deleteError}
        title="Hapus pengumuman?" message={deleting ? `“${deleting.title}” akan dihapus permanen.` : ''} />
    </>
  );
}
