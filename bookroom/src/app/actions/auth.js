
'use server';

import { redirect } from 'next/navigation';
import { one, isUniqueViolation } from '@/lib/db';
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
  homePathFor,
} from '@/lib/auth';
import {
  str,
  validateEmail,
  validatePassword,
  hasErrors,
  fail,
} from '@/lib/validation';

// Memproses login melalui email atau nomor identitas
async function login(formData) {
  const email = str(formData, 'email').toLowerCase();
  const password = String(formData.get('password') ?? '');

  // Validasi isian login
  const errors = {
    email: email ? null : 'Email atau nomor identitas wajib diisi.',
    password: password ? null : 'Kata sandi wajib diisi.',
  };

  if (hasErrors(errors)) {
    return fail('Periksa kembali isian Anda.', errors);
  }

  // Memastikan kunci keamanan aplikasi tersedia
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    return fail(
      'Layanan akun belum dapat digunakan. Hubungi pengelola.'
    );
  }

  // Mencari akun berdasarkan email atau NIM/NIP
  const user = await one(
    `SELECT id, role, password_hash, is_active
     FROM v_pengguna
     WHERE LOWER(email)=$1 OR LOWER(identity_number)=$1`,
    [email]
  );

  if (!user || !verifyPassword(password, user.password_hash)) {
    return fail('Email/identitas atau kata sandi tidak sesuai.', {
      password: 'Email atau kata sandi tidak sesuai.',
    });
  }

  // Menolak akun yang dinonaktifkan
  if (!user.is_active) {
    return fail(
      'Akun Anda dinonaktifkan. Hubungi bagian layanan perpustakaan.'
    );
  }

  // Membuat sesi dan mengarahkan sesuai peran
  await createSession(user);
  redirect(homePathFor(user.role));
}

// Memproses pendaftaran mahasiswa
async function register(formData) {
  const fullName = str(formData, 'full_name');
  const email = str(formData, 'email').toLowerCase();
  const nim = str(formData, 'nim').toUpperCase();
  const studyProgram = str(formData, 'study_program');
  const password = String(formData.get('password') ?? '');

  // Validasi nama, email kampus, NIM, dan password
  const errors = {
    full_name: !fullName
      ? 'Nama lengkap wajib diisi.'
      : fullName.length < 3
        ? 'Nama lengkap minimal 3 karakter.'
        : fullName.length > 120
          ? 'Nama lengkap maksimal 120 karakter.'
          : null,

    email: validateEmail(email, { campus: true }),

    nim: !nim
      ? 'NIM wajib diisi.'
      : !/^[A-Z][0-9]{9}$/.test(nim)
        ? 'NIM harus 1 huruf kapital diikuti 9 angka, contoh A123456789.'
        : null,

    study_program:
      !studyProgram ? 'Program studi wajib diisi.' : null,

    password: validatePassword(password),
  };

  if (hasErrors(errors)) {
    return fail('Periksa kembali isian Anda.', errors);
  }

  try {
    // Menyimpan akun dengan peran mahasiswa
    const user = await one(
      `INSERT INTO v_pengguna (
         full_name,
         email,
         password_hash,
         role,
         identity_number,
         study_program
       )
       VALUES($1,$2,$3,'mahasiswa',$4,$5)
       RETURNING id, role`,
      [fullName, email, hashPassword(password), nim, studyProgram]
    );

    // Membuat sesi setelah pendaftaran berhasil
    await createSession(user);
  } catch (err) {
    // Menangani email atau NIM yang sudah terdaftar
    if (isUniqueViolation(err)) {
      const field = String(err.constraint || '').includes('identity')
        ? 'nim'
        : 'email';

      return fail('Data sudah terdaftar.', {
        [field]:
          field === 'nim'
            ? 'NIM'
            : 'email',
      });
    }

    throw err;
  }

  redirect('/mahasiswa');
}

// Menghapus sesi dan kembali ke halaman login
export async function logoutAction() {
  await destroySession();
  redirect('/login');
}

// Menangani error layanan akun tanpa mengganggu redirect
async function accountRequest(operation) {
  try {
    return await operation();
  } catch (error) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    console.error(
      'Layanan akun gagal:',
      error.code || error.name
    );

    return fail(
      'Tidak dapat terhubung ke layanan saat ini. Silakan coba beberapa saat lagi.'
    );
  }
}

// Server action untuk login
export async function loginAction(formData) {
  return accountRequest(() => login(formData));
}

// Server action untuk registrasi
export async function registerAction(formData) {
  return accountRequest(() => register(formData));
}
