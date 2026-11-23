'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createUserAction, updateUserAction, deleteUserAction } from '@/app/actions/admin';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import { TextInput, PasswordInput, Select, Alert, Spinner } from '@/components/ui/Form';
import { toast } from '@/components/ui/Toast';
import { Badge, StatusBadge, Mono } from '@/components/ui/Badges';
import { IconPlus, IconEdit, IconTrash, IconSearch } from '@/components/ui/Icons';
import { ROLE_LABEL, initials, formatDate } from '@/lib/format';

const ROLE_TONE = { admin: 'gold', pegawai: 'navy', mahasiswa: 'green' };

// Form data pengguna dengan aturan sesuai peran
function UserForm({ user, campusDomain, isSelf, onDone }) {
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [role, setRole] = useState(user?.role || 'mahasiswa');
  const [pending, startTransition] = useTransition();

  // Mengirim formulir dan menampilkan hasil proses
  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set('is_active', e.currentTarget.is_active.checked ? 'true' : 'false');
    const local = {};
    const email = String(fd.get('email')).trim().toLowerCase();
    const pw = String(fd.get('password') || '');
    if (!String(fd.get('full_name')).trim()) local.full_name = 'Nama lengkap wajib diisi.';
    if (!email) local.email = 'Email wajib diisi.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) local.email = 'Format email tidak valid.';
    else if (role === 'mahasiswa' && !email.endsWith('@' + campusDomain)) local.email = `Email mahasiswa harus berdomain @${campusDomain}.`;
    if (!user && !pw) local.password = 'Kata sandi wajib diisi.';
    else if (pw && pw.length < 8) local.password = 'Kata sandi minimal 8 karakter.';
    const identity = String(fd.get('identity_number') || '').trim();

    if (!identity) {
      local.identity_number = role === 'mahasiswa'
        ? 'NIM wajib diisi.'
        : 'NIP/identitas wajib diisi.';
    } else if (
      role === 'mahasiswa' &&
      !/^[A-Z][0-9]{9}$/.test(identity.toUpperCase())
    ) {
      local.identity_number =
        'NIM harus 1 huruf kapital diikuti 9 angka, contoh A123456789.';
    } else if (
      role !== 'mahasiswa' &&
      !/^\d{8,20}$/.test(identity)
    ) {
      local.identity_number = 'NIP/identitas harus 8–20 digit angka.';
    }
    if (role === 'mahasiswa' && !String(fd.get('study_program')).trim()) local.study_program = 'Program studi wajib diisi untuk mahasiswa.';
    setErrors(local);
    setMessage('');
    if (Object.keys(local).length) return;
    startTransition(async () => {
      const res = user ? await updateUserAction(user.id, fd) : await createUserAction(fd);
      if (res.ok) { toast(res); onDone(); }
      else { setErrors(res.errors || {}); setMessage(res.message); }
    });
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4">
      {message && <Alert>{message}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label="Nama lengkap" name="full_name" defaultValue={user?.full_name} error={errors.full_name} className="sm:col-span-2" />
        <Select label="Peran" name="role" value={role} onChange={(e) => setRole(e.target.value)} disabled={isSelf}
          options={['admin', 'pegawai', 'mahasiswa'].map((r) => ({ value: r, label: ROLE_LABEL[r] }))} error={errors.role} />
        {isSelf && <input type="hidden" name="role" value={role} />}
        <TextInput
          label={role === 'mahasiswa' ? 'NIM' : 'NIP / Identitas'}
          name="identity_number"
          defaultValue={user?.identity_number}
          type="text"
          inputMode={role === 'mahasiswa' ? 'text' : 'numeric'}
          autoCapitalize={role === 'mahasiswa' ? 'characters' : 'none'}
          spellCheck={false}
          maxLength={role === 'mahasiswa' ? 10 : 20}
          placeholder={role === 'mahasiswa' ? 'A123456789' : 'NIP / Identitas'}
          hint={role === 'mahasiswa' ? '1 huruf kapital diikuti 9 angka.' : undefined}
          inputClassName="font-mono"
          error={errors.identity_number}
          onChange={(event) => {
            if (role === 'mahasiswa') {
              event.currentTarget.value = event.currentTarget.value.toUpperCase();
            }
          }}
        />
        <TextInput label="Email (unik)" name="email" type="email" defaultValue={user?.email} error={errors.email}
          hint={role === 'mahasiswa' ? `Wajib berdomain @${campusDomain}` : undefined} />
        {!user && (
          <PasswordInput
            label="Kata sandi awal"
            name="password"
            autoComplete="new-password"
            error={errors.password}
          />
        )}
        {role === 'mahasiswa' && (
          <TextInput label="Program studi" name="study_program" defaultValue={user?.study_program || ''} error={errors.study_program} />
        )}
        <TextInput label="Nomor HP" name="phone" defaultValue={user?.phone || ''} inputClassName="font-mono" error={errors.phone} />
      </div>
      <label className={`flex items-center gap-3 rounded-lg border border-line px-4 py-3 ${isSelf ? 'opacity-60' : ''}`}>
        <input type="checkbox" name="is_active" defaultChecked={user ? user.is_active : true} disabled={isSelf} className="h-4 w-4 accent-navy" />
        <span className="text-sm"><span className="font-semibold text-navy">Akun aktif</span><span className="block text-xs text-ink-muted">Akun nonaktif tidak dapat masuk ke sistem.</span></span>
      </label>
      {errors.is_active && <p className="field-error">{errors.is_active}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="btn-ghost">Batal</button>
        <button type="submit" disabled={pending} className="btn-primary">{pending && <Spinner />} {user ? 'Simpan Perubahan' : 'Buat Akun'}</button>
      </div>
    </form>
  );
}

export default function UserManager({ users, currentUserId, role, campusDomain }) {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [q, setQ] = useState('');
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const shown = useMemo(() => {
    const s = q.toLowerCase();
    return users.filter((u) => !s || u.full_name.toLowerCase().includes(s) || u.email.includes(s) || u.identity_number.toLowerCase().includes(s));
  }, [users, q]);

  // Menjalankan penghapusan setelah dikonfirmasi
  function confirmDelete() {
    startTransition(async () => {
      const res = await deleteUserAction(deleting.id);
      if (res.ok) { toast(res); setDeleting(null); router.refresh(); } else setDeleteError(res.message);
    });
  }

  const tabs = [['', 'Semua'], ['admin', 'Admin'], ['pegawai', 'Pegawai'], ['mahasiswa', 'Mahasiswa']];

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-line bg-cream-50 p-1 text-sm font-semibold">
          {tabs.map(([v, l]) => (
            <button key={l} type="button" onClick={() => router.push(v ? `${pathname}?peran=${v}` : pathname)}
              className={`rounded-full px-3.5 py-1.5 ${role === v ? 'bg-coral text-white shadow-retro-sm' : 'text-ink-muted hover:text-navy'}`}>{l}</button>
          ))}
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-cream-50 px-3">
          <IconSearch className="h-4 w-4 text-ink-soft" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, email, NIM/NIP" className="w-full bg-transparent py-2.5 text-sm focus:outline-none" />
        </div>
        <button type="button" onClick={() => setEditing('new')} className="btn-primary"><IconPlus className="h-4 w-4" /> Tambah Pengguna</button>
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="table-head">
            <tr><th className="px-5 py-3">Pengguna</th><th className="px-3 py-3">Peran</th><th className="px-3 py-3">NIM / NIP</th><th className="px-3 py-3">Transaksi</th><th className="px-3 py-3">Status</th><th className="px-5 py-3 text-right">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.map((u) => {
              const self = u.id === currentUserId;
              const blockReason = self ? 'Tidak dapat menghapus akun sendiri' : u.open_loans > 0 ? 'Memiliki transaksi aktif' : null;
              return (
                <tr key={u.id} className="hover:bg-canvas/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/5 text-xs font-bold text-navy">{initials(u.full_name)}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-navy">{u.full_name} {self && <span className="text-xs font-bold uppercase text-gold-dark">(Anda)</span>}</p>
                        <p className="text-xs text-ink-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><Badge tone={ROLE_TONE[u.role]} dot={false}>{ROLE_LABEL[u.role]}</Badge>
                    {u.study_program && <p className="mt-1 text-xs text-ink-soft">{u.study_program}</p>}</td>
                  <td className="px-3 py-3"><Mono>{u.identity_number}</Mono><p className="text-xs text-ink-soft">sejak {formatDate(u.created_at, { short: true })}</p></td>
                  <td className="px-3 py-3 text-xs">
                    {u.role === 'mahasiswa' ? (
                      <>
                        <span className="font-mono font-semibold text-navy">{u.open_loans}</span> <span className="text-ink-muted">aktif</span> · <span className="font-mono">{u.total_loans}</span> <span className="text-ink-muted">total</span>
                        {u.fines > 0 && <p className="mt-0.5 font-semibold text-danger">Denda tertunggak</p>}
                      </>
                    ) : <span className="text-ink-soft">—</span>}
                  </td>
                  <td className="px-3 py-3"><StatusBadge status={u.is_active ? 'Aktif' : 'Nonaktif'} /></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button type="button" onClick={() => setEditing(u)} className="btn-outline btn-sm"><IconEdit className="h-3.5 w-3.5" /> Ubah</button>
                      <button type="button" disabled={!!blockReason} title={blockReason || 'Hapus pengguna'} onClick={() => { setDeleteError(''); setDeleting(u); }}
                        className="btn-sm btn border border-line bg-cream-50 text-danger hover:border-danger" aria-label={`Hapus ${u.full_name}`}>
                        <IconTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!shown.length && <tr><td colSpan={6} className="px-5 py-12 text-center text-ink-muted">Tidak ada pengguna.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} width="max-w-2xl"
        title={editing === 'new' ? 'Tambah Pengguna' : 'Ubah Pengguna'}>
        {editing && (
          <UserForm user={editing === 'new' ? null : editing} campusDomain={campusDomain}
            isSelf={editing !== 'new' && editing.id === currentUserId}
            onDone={() => { setEditing(null); router.refresh(); }} />
        )}
      </Modal>
      <ConfirmModal open={!!deleting} onClose={() => setDeleting(null)} onConfirm={confirmDelete} pending={pending} error={deleteError}
        title="Hapus pengguna?" message={deleting ? `Akun ${deleting.full_name} (${deleting.email}) akan dihapus permanen.` : ''} />
    </>
  );
}
