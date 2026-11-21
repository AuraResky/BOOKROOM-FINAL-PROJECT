import { NextResponse } from 'next/server';
import { getCurrentUser } from './auth';

// Mengembalikan respons JSON
export function json(data, init = {}) {
  return NextResponse.json(data, init);
}

// Mengembalikan pesan error API
export function apiError(status, message, errors) {
  return NextResponse.json(
    {
      ok: false,
      message,
      ...(errors ? { errors } : {}),
    },
    { status }
  );
}

// Memeriksa login dan hak akses API
export async function requireApiRole(...roles) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      response: apiError(401, 'Silakan masuk terlebih dahulu.'),
    };
  }

  if (roles.length && !roles.includes(user.role)) {
    return {
      response: apiError(
        403,
        'Anda tidak memiliki akses ke sumber daya ini.'
      ),
    };
  }

  return { user };
}

// Memvalidasi parameter angka positif dengan batas maksimum
export function intParam(
  value,
  fallback,
  max = Number.MAX_SAFE_INTEGER
) {
  const n = Number(value);

  return Number.isInteger(n) && n > 0
    ? Math.min(n, max)
    : fallback;
}

// Menangani error API yang tidak terduga
export function handle(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(
        'API gagal:',
        error?.code || error?.name || error
      );

      return apiError(
        500,
        'Layanan sedang tidak dapat memproses permintaan.'
      );
    }
  };
}