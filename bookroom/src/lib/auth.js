import crypto from 'node:crypto';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { one, query } from './db';

// Nama cookie dan masa berlaku sesi: 7 hari
const COOKIE_NAME = 'bookroom_session';
const MAX_AGE = 60 * 60 * 24 * 7;

// Mengubah password menjadi hash
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');

  return `scrypt$${salt}$${crypto
    .scryptSync(password, salt, 64)
    .toString('hex')}`;
}

// Memeriksa kecocokan password dengan hash
export function verifyPassword(password, stored) {
  try {
    const [algorithm, salt, hash] = String(stored || '').split('$');

    if (
      algorithm !== 'scrypt' ||
      !salt ||
      !/^[0-9a-f]{128}$/.test(hash)
    ) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      crypto.scryptSync(password, salt, 64)
    );
  } catch {
    return false;
  }
}

// Membuat hash token sesi
const digest = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

// Menyimpan sesi ke database dan cookie
export async function createSession(user) {
  const token = crypto.randomBytes(32).toString('base64url');

  await query(
    `INSERT INTO sesi_login (
      id_pengguna,
      token_hash,
      berlaku_sampai
    )
    VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [user.id, digest(token)]
  );

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure:
      process.env.SESSION_COOKIE_SECURE === 'false'
        ? false
        : process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}

// Menghapus sesi saat logout
export async function destroySession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;

  if (token) {
    await query(
      'DELETE FROM sesi_login WHERE token_hash = $1',
      [digest(token)]
    );
  }

  (await cookies()).delete(COOKIE_NAME);
}

// Mengambil pengguna dari sesi yang masih aktif
export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;

  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return null;
  }

  return one(
    `SELECT
      u.id,
      u.full_name,
      u.email,
      u.role,
      u.identity_number,
      u.phone,
      u.study_program,
      u.is_active,
      u.created_at
    FROM v_pengguna u
    JOIN sesi_login s ON s.id_pengguna = u.id
    WHERE s.token_hash = $1
      AND s.berlaku_sampai > NOW()
      AND u.is_active = TRUE`,
    [digest(token)]
  );
});

// Menentukan halaman tujuan berdasarkan peran
export function homePathFor(role) {
  return role === 'admin'
    ? '/admin'
    : role === 'pegawai'
      ? '/pegawai'
      : role === 'mahasiswa'
        ? '/mahasiswa'
        : '/';
}

// Membatasi akses halaman berdasarkan peran
export async function requireRole(...roles) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!roles.includes(user.role)) {
    redirect(homePathFor(user.role));
  }

  return user;
}