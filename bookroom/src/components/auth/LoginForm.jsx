// Form masuk dan pesan validasi akun

'use client';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { loginAction } from '@/app/actions/auth';
import { TextInput, PasswordInput, Alert, Spinner } from '@/components/ui/Form';
import { IconArrowRight } from '@/components/ui/Icons';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function LoginForm() {
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  // Mengirim formulir dan menampilkan hasil proses.
  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '');
    const local = {};
    if (!email) local.email = 'Email atau nomor identitas wajib diisi.';

    if (!password) local.password = 'Kata sandi wajib diisi.';
    setErrors(local);
    setMessage('');
    if (Object.keys(local).length) return;

    startTransition(async () => {
      const res = await loginAction(fd);
      if (res && !res.ok) {
        setErrors(res.errors || {});
        setMessage(res.message);
      }
    });
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5">
      {message && <Alert>{message}</Alert>}
      <TextInput label="Email atau nomor identitas" name="email" autoComplete="username" placeholder="Email kampus atau NIM/NIP" error={errors.email} />
      <PasswordInput autoComplete="current-password" placeholder="Masukkan kata sandi" error={errors.password} />
      <button type="submit" className="btn-primary w-full py-3" disabled={pending}>
        {pending ? <Spinner /> : null} Masuk
      </button>

      <div className="relative py-1 text-center">
        <span className="absolute inset-x-0 top-1/2 h-px bg-line" />
        <span className="relative bg-cream-50 px-3 text-xs font-medium text-ink-soft">atau</span>
      </div>

      <Link href="/katalog" className="btn-outline w-full py-3">
        Lanjutkan sebagai Tamu (Guest) <IconArrowRight className="h-4 w-4" />
      </Link>

      <p className="text-center text-sm text-ink-muted">
        Mahasiswa baru?{' '}
        <Link href="/register" className="font-semibold text-navy underline-offset-4 hover:text-gold-dark hover:underline">
          Daftar akun mahasiswa
        </Link>
      </p>
    </form>
  );
}
