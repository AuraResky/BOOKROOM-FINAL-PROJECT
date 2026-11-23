'use client';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { registerAction } from '@/app/actions/auth';
import {
  TextInput,
  PasswordInput,
  Alert,
  Spinner,
} from '@/components/ui/Form';

export default function RegisterForm({ campusDomain }) {
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  // Memeriksa isian formulir sebelum dikirim
  function validate(fd) {
    const errors = {};
    const name = String(fd.get('full_name') || '').trim();
    const email = String(fd.get('email') || '').trim().toLowerCase();
    const nim = String(fd.get('nim') || '').trim().toUpperCase();
    const prodi = String(fd.get('study_program') || '').trim();
    const password = String(fd.get('password') || '');

    if (!name) {
      errors.full_name = 'Nama lengkap wajib diisi.';
    } else if (name.length < 3) {
      errors.full_name = 'Nama lengkap minimal 3 karakter.';
    } else if (name.length > 120) {
      errors.full_name = 'Nama lengkap maksimal 120 karakter.';
    }

    if (!nim) {
      errors.nim = 'NIM wajib diisi.';
    } else if (!/^[A-Z][0-9]{9}$/.test(nim)) {
      errors.nim =
        'NIM harus 1 huruf kapital diikuti 9 angka, contoh A123456789.';
    }

    if (!prodi) {
      errors.study_program = 'Program studi wajib diisi.';
    }

    if (!email) {
      errors.email = 'Email kampus wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      errors.email = 'Format email tidak valid.';
    } else if (!email.endsWith('@' + campusDomain)) {
      errors.email =
        `Gunakan email kampus dengan domain @${campusDomain}.`;
    }

    if (!password) {
      errors.password = 'Kata sandi wajib diisi.';
    } else if (password.length < 8) {
      errors.password = 'Kata sandi minimal 8 karakter.';
    } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      errors.password = 'Kata sandi harus memuat huruf dan angka.';
    }

    return errors;
  }
  // Mengirim formulir dan menampilkan hasil proses
  function onSubmit(event) {
    event.preventDefault();

    const fd = new FormData(event.currentTarget);

    fd.set(
      'nim',
      String(fd.get('nim') || '').trim().toUpperCase()
    );

    const local = validate(fd);
    setErrors(local);
    setMessage('');

    if (Object.keys(local).length) return;

    startTransition(async () => {
      const result = await registerAction(fd);

      if (result && !result.ok) {
        setErrors(result.errors || {});
        setMessage(result.message);
      }
    });
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="space-y-4"
    >
      {message && <Alert>{message}</Alert>}

      <TextInput
        label="Nama Lengkap"
        name="full_name"
        type="text"
        autoComplete="name"
        maxLength={120}
        placeholder="Sesuai KTM"
        error={errors.full_name}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="NIM"
          name="nim"
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={10}
          placeholder="A123456789"
          hint="1 huruf kapital diikuti 9 angka."
          inputClassName="font-mono"
          error={errors.nim}
          onChange={(event) => {
            event.currentTarget.value =
              event.currentTarget.value.toUpperCase();
          }}
        />

        <TextInput
          label="Program Studi"
          name="study_program"
          placeholder="S1 Teknik Informatika"
          error={errors.study_program}
        />
      </div>

      <TextInput
        label="Email Kampus"
        name="email"
        type="email"
        autoComplete="email"
        placeholder={`nama@${campusDomain}`}
        hint={`Hanya email berdomain @${campusDomain} yang dapat mendaftar.`}
        error={errors.email}
      />

      <PasswordInput
        autoComplete="new-password"
        placeholder="Minimal 8 karakter, huruf & angka"
        error={errors.password}
      />

      <button
        type="submit"
        className="btn-primary w-full py-3"
        disabled={pending}
      >
        {pending && <Spinner />}
        Daftar sebagai Mahasiswa
      </button>

      <p className="text-center text-sm text-ink-muted">
        Sudah punya akun?{' '}
        <Link
          href="/login"
          className="font-semibold text-navy hover:underline"
        >
          Masuk
        </Link>
        {' · '}
        <Link
          href="/"
          className="font-semibold text-navy hover:underline"
        >
          Lanjutkan sebagai Tamu
        </Link>
      </p>
    </form>
  );
}