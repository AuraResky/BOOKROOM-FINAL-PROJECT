'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfileAction } from '@/app/actions/profile';
import { TextInput, PasswordInput, Alert, Spinner } from '@/components/ui/Form';

export default function ProfileForm({ user }) {
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const student = user.role === 'mahasiswa';

  // Mengirim formulir dan menampilkan hasil proses.
  function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const local = {};
    if (student && !String(fd.get('study_program')).trim()) local.study_program = 'Program studi wajib diisi.';
    const phone = String(fd.get('phone')).trim();
    if (phone && !/^(\+62|0)8\d{7,12}$/.test(phone)) local.phone = 'Nomor HP tidak valid (contoh: 081234567890).';
    const np = String(fd.get('new_password'));
    if (np && np.length < 8) local.new_password = 'Kata sandi minimal 8 karakter.';
    if (np && !String(fd.get('current_password'))) local.current_password = 'Masukkan kata sandi saat ini untuk mengganti kata sandi.';
    setErrors(local);
    setResult(null);
    if (Object.keys(local).length) return;
    startTransition(async () => {
      const res = await updateProfileAction(fd);
      setResult(res);
      setErrors(res.errors || {});
      if (res.ok) {
        form.querySelector('[name=current_password]').value = '';
        form.querySelector('[name=new_password]').value = '';
        router.refresh();
      }
    });
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5">
      {result && <Alert tone={result.ok ? 'green' : 'red'}>{result.message}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label="Nama Lengkap" name="full_name" defaultValue={user.full_name} maxLength={120} autoComplete="name" error={errors.full_name} />
        <TextInput label={student ? 'Email Kampus' : 'Email'} type="email" name="email" defaultValue={user.email} maxLength={150} autoComplete="email" error={errors.email} />
        <TextInput label={student ? 'NIM' : 'NIP / Identitas'} name="identity_number" defaultValue={user.identity_number}
          inputMode={student ? 'text' : 'numeric'} maxLength={30} inputClassName="font-mono" error={errors.identity_number} />
        {student && <TextInput label="Program Studi" name="study_program" defaultValue={user.study_program || ''} maxLength={100} error={errors.study_program} />}
        <TextInput label="Nomor HP" name="phone" defaultValue={user.phone || ''} inputMode="tel" placeholder="081234567890" inputClassName="font-mono" error={errors.phone} />
      </div>
      <div className="rounded-lg border border-line bg-canvas/50 p-4">
        <p className="text-sm font-bold text-navy">Keamanan Akun</p>
        <p className="text-xs text-ink-muted">Masukkan kata sandi saat ini jika mengubah email, NIM/NIP, atau kata sandi. Isi kata sandi baru hanya jika ingin menggantinya.</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <PasswordInput label="Kata Sandi Saat Ini" name="current_password" autoComplete="current-password" error={errors.current_password} />
          <PasswordInput label="Kata Sandi Baru" name="new_password" autoComplete="new-password" error={errors.new_password} />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="btn-primary">{pending && <Spinner />} Simpan Perubahan</button>
      </div>
    </form>
  );
}
