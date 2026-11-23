// validasi registrasi memakai NIM satu huruf dan sembilan angka.'use server';

import { redirect } from 'next/navigation';
import crypto from 'node:crypto';
import { one, query, isUniqueViolation } from '@/lib/db';
import { createSession, destroySession, hashPassword, verifyPassword, homePathFor } from '@/lib/auth';
import { str, validateEmail, validatePassword, hasErrors, fail } from '@/lib/validation';

// Validasi email/NIM dan kata sandi saat pengguna login
async function login(formData) {
  const email = str(formData, 'email').toLowerCase();
  const password = String(formData.get('password') ?? '');
  const errors = {
    email: email ? null : 'Email atau nomor identitas wajib diisi.',
    password: password ? null : 'Kata sandi wajib diisi.',
  };
  if (hasErrors(errors)) return fail('Periksa kembali isian Anda.', errors);

  const secret=process.env.SESSION_SECRET;
  if(!secret || secret.length<32)return fail('Layanan akun belum dapat digunakan. Hubungi pengelola.');
  const fingerprint=crypto.createHmac('sha256',secret).update(email).digest('hex');
  const attempts=await one("SELECT COUNT(*)::int AS total FROM percobaan_login WHERE identitas_hash=$1 AND berhasil=FALSE AND dicoba_pada>NOW()-INTERVAL '15 minutes'",[fingerprint]);
  if(attempts.total>=5)return fail('Terlalu banyak percobaan masuk. Silakan coba kembali dalam 15 menit.');
  const user = await one(
    `SELECT id, role, password_hash, is_active FROM v_pengguna WHERE LOWER(email) = $1 OR LOWER(identity_number) = $1`,
    [email]
  );
  if (!user || !verifyPassword(password, user.password_hash)) {
    await query('INSERT INTO percobaan_login(identitas_hash,berhasil) VALUES($1,FALSE)',[fingerprint]);
    return fail('Email/identitas atau kata sandi tidak sesuai.', { password: 'Email atau kata sandi tidak sesuai.' });
  }
  if (!user.is_active) {
    return fail('Akun Anda dinonaktifkan. Hubungi bagian layanan perpustakaan.');
  }
  await query('DELETE FROM percobaan_login WHERE identitas_hash=$1',[fingerprint]);
  await createSession(user);
  redirect(homePathFor(user.role));
}

// Menyimpan akun mahasiswa dari data registrasi
async function register(formData) {
  const fullName = str(formData, 'full_name');
  const email = str(formData, 'email').toLowerCase();
  const nim = str(formData, 'nim').toUpperCase();
  const studyProgram = str(formData, 'study_program');
  const password = String(formData.get('password') ?? '');

  const errors = {
    full_name: !fullName ? 'Nama lengkap wajib diisi.' : fullName.length < 3 ? 'Nama lengkap minimal 3 karakter.' : fullName.length>120?'Nama lengkap maksimal 120 karakter.':null,
    email: validateEmail(email, { campus: true }),
    nim: !nim ? 'NIM wajib diisi.' : !/^[A-Z][0-9]{9}$/.test(nim) ? 'NIM harus 1 huruf kapital diikuti 9 angka, contoh A123456789.' : null,
    study_program: !studyProgram ? 'Program studi wajib diisi.' : null,
    password: validatePassword(password),
  };
  if (hasErrors(errors)) return fail('Periksa kembali isian Anda.', errors);

  try {
    const user = await one(
      `INSERT INTO v_pengguna (full_name, email, password_hash, role, identity_number, study_program)
       VALUES ($1, $2, $3, 'mahasiswa', $4, $5) RETURNING id, role`,
      [fullName, email, hashPassword(password), nim, studyProgram]
    );
    await createSession(user);
  } catch (err) {
    if (isUniqueViolation(err)) {
      const field = String(err.constraint || '').includes('identity') ? 'nim' : 'email';
      return fail('Data sudah terdaftar.', {
        [field]: field === 'nim' ? 'NIM sudah terdaftar.' : 'Email sudah terdaftar.',
      });
    }
    throw err;
  }
  redirect('/mahasiswa');
}

// Menghapus sesi dan mengarahkan ke halaman login
export async function logoutAction() {
  await destroySession();
  redirect('/login');
}

// Menangani kesalahan proses akun
async function accountRequest(operation){try{return await operation();}catch(error){if(error.digest?.startsWith('NEXT_REDIRECT'))throw error;console.error('Layanan akun gagal:',error.code||error.name);return fail('Tidak dapat terhubung ke layanan saat ini. Silakan coba beberapa saat lagi.');}}
// Menjalankan proses login dari form.
export async function loginAction(formData){return accountRequest(()=>login(formData));}
// Menjalankan proses registrasi dari form
export async function registerAction(formData){return accountRequest(()=>register(formData));}
