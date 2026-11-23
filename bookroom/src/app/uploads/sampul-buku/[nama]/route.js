import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { UPLOAD_DIRECTORY } from '@/lib/uploads';

// Menggunakan filesystem pada server Node.js
export const runtime = 'nodejs';

// Menampilkan gambar sampul yang sudah disimpan
export async function GET(request, { params }) {
  const { nama } = params;

  // Memeriksa format nama file
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(nama)) {
    return new Response('Gambar tidak ditemukan.', {
      status: 404,
    });
  }

  try {
    const bytes = await readFile(
      path.join(UPLOAD_DIRECTORY, nama)
    );

    const extension = nama.split('.').pop();

    return new Response(bytes, {
      headers: {
        'Content-Type':
          extension === 'jpg'
            ? 'image/jpeg'
            : `image/${extension}`,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Gambar tidak ditemukan.', {
      status: 404,
    });
  }
}