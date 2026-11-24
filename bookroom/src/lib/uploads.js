import { mkdir, writeFile, unlink } from 'node:fs/promises';
import sharp from 'sharp';
import path from 'node:path';
import crypto from 'node:crypto';

// Lokasi penyimpanan sampul buku
export const UPLOAD_DIRECTORY = path.join(
  process.cwd(),
  'public',
  'uploads',
  'sampul-buku'
);

// Error khusus unggahan gambar
export class UploadError extends Error {}

// Mengubah judul buku menjadi format nama file
function slugifyTitle(title) {
  return String(title || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

// Memvalidasi dan menyimpan sampul buku
export async function saveCover(file, bookTitle = '') {
  // Lewati jika tidak ada file
  if (
    !file ||
    typeof file.arrayBuffer !== 'function' ||
    !file.size
  ) {
    return null;
  }

  // Batas ukuran file
  if (file.size > 5 * 1024 * 1024) {
    throw new UploadError('Ukuran sampul maksimal 5 MB.');
  }

  const input = Buffer.from(await file.arrayBuffer());
  let bytes;

  try {
    // Membaca gambar dengan batas jumlah piksel
    const decoder = sharp(input, {
      limitInputPixels: 25000000,
      failOn: 'error',
    });

    const info = await decoder.metadata();

    // Format gambar yang diperbolehkan
    const types = {
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };

    // Memastikan isi gambar sesuai jenis file
    if (
      !types[info.format] ||
      types[info.format] !== file.type
    ) {
      throw new Error('type');
    }

    // Menyesuaikan orientasi, ukuran, dan mengubah ke WebP
  bytes = await decoder
      .rotate()
      .resize({
        width: 800,
        height: 1200,
        fit: 'cover',
        position: 'attention',
      })
      .webp({ quality: 90 })
      .toBuffer();
  } catch {
    throw new UploadError(
      'Berkas harus berupa gambar JPEG, PNG, atau WebP yang valid.'
    );
  }

  // Memeriksa ukuran gambar setelah diproses
  if (bytes.length > 2097152) {
    throw new UploadError(
      'Gambar terlalu besar. Gunakan sampul beresolusi lebih kecil.'
    );
  }

  // Membuat nama file berdasarkan judul buku + akhiran unik singkat
  const extension = 'webp';
  const mime = 'image/webp';
  const slug = slugifyTitle(bookTitle);
  const shortId = crypto.randomBytes(3).toString('hex');
  const baseName = slug ? `${slug}-${shortId}` : crypto.randomUUID();
  const name = `${baseName}.${extension}`;

  // Membuat folder dan menyimpan gambar
  await mkdir(UPLOAD_DIRECTORY, { recursive: true });

  await writeFile(
    path.join(UPLOAD_DIRECTORY, name),
    bytes,
    { flag: 'wx' }
  );

  // Mengembalikan informasi gambar yang disimpan
  return {
    name,
    original: path
      .basename(String(file.name || 'sampul'))
      .slice(0, 255),
    mime,
    size: bytes.length,
    url: '/uploads/sampul-buku/' + name,
  };
}

// Menghapus file sampul
export async function removeCover(file) {
  if (file?.name) {
    await unlink(
      path.join(UPLOAD_DIRECTORY, file.name)
    ).catch(() => {});
  }
}