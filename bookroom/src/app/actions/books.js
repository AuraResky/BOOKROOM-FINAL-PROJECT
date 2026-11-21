'use server';

import { revalidatePath } from 'next/cache';
import {
  transaction,
  isUniqueViolation,
  isForeignKeyViolation,
} from '@/lib/db';
import { requireRole } from '@/lib/auth';
import {
  str,
  normalizeIsbn,
  validateIsbn,
  intField,
  hasErrors,
  fail,
  success,
} from '@/lib/validation';
import {
  saveCover,
  removeCover,
  UploadError,
} from '@/lib/uploads';
import {
  synchronizeCopies,
  LibraryError,
  validId,
} from '@/lib/library-service';

// Memvalidasi dan menyiapkan data buku
function parseBook(formData) {
  const isbn = normalizeIsbn(formData.get('isbn'));

  const year = intField(str(formData, 'publish_year'), {
    label: 'Tahun terbit',
    min: 1450,
    max: new Date().getFullYear() + 1,
  });

  const stock = intField(str(formData, 'stock'), {
    label: 'Jumlah stok',
    min: 0,
    max: 1000,
  });

  const days = intField(str(formData, 'max_loan_days'), {
    label: 'Durasi pinjam',
    min: 1,
    max: 60,
  });

  const fine = intField(str(formData, 'fine_per_day'), {
    label: 'Tarif denda',
    min: 0,
    max: 100000,
  });

  const category = intField(str(formData, 'category_id'), {
    label: 'Kategori',
    min: 1,
  });

  const values = {
    title: str(formData, 'title'),
    isbn,
    author: str(formData, 'author'),
    publisher: str(formData, 'publisher'),
    publish_year: year.value,
    category_id: category.value,
    stock: stock.value,
    max_loan_days: days.value,
    fine_per_day: fine.value,
    shelf_location: str(formData, 'shelf_location'),
    description: str(formData, 'description'),
  };

  const errors = {
    title: !values.title
      ? 'Judul wajib diisi.'
      : values.title.length > 200
        ? 'Judul maksimal 200 karakter.'
        : null,

    isbn: validateIsbn(isbn),
    author: !values.author ? 'Pengarang wajib diisi.' : null,
    publisher: !values.publisher ? 'Penerbit wajib diisi.' : null,
    publish_year: year.error,
    category_id: category.error ? 'Pilih kategori buku.' : null,
    stock: stock.error,
    max_loan_days: days.error,
    fine_per_day: fine.error,
  };

  return { values, errors };
}

// Menyimpan buku baru atau perubahan buku
async function saveBook(id, formData) {
  const staff = await requireRole('pegawai', 'admin');
  const { values: v, errors } = parseBook(formData);

  if (v.author.length > 150) {
    errors.author = 'Nama penulis maksimal 150 karakter.';
  }

  if (v.publisher.length > 120) {
    errors.publisher = 'Nama penerbit maksimal 120 karakter.';
  }

  if (v.shelf_location.length > 30) {
    errors.shelf_location = 'Lokasi rak maksimal 30 karakter.';
  }

  if (hasErrors(errors)) {
    return fail('Periksa kembali data buku.', errors);
  }

  const file = formData.get('cover_file');

  // Buku baru wajib memiliki sampul
  if (!id && !file?.size) {
    return fail('Pilih sampul buku.', {
      cover_file: 'Unggah gambar sampul buku.',
    });
  }

  let uploaded;

  try {
    // Memvalidasi gambar dan menyimpannya dengan nama acak
    uploaded = await saveCover(file);

    await transaction(async (tx) => {
      if (id) {
        const existing = await tx.one(
          'SELECT id FROM buku WHERE id=$1 FOR UPDATE',
          [validId(id)]
        );

        if (!existing) {
          throw new LibraryError('Buku tidak ditemukan.');
        }
      }

      // Menyimpan informasi gambar ke database
      let imageId = null;

      if (uploaded) {
        const img = await tx.one(
          `INSERT INTO gambar (
            nama_file,
            nama_asli,
            jenis_file,
            ukuran_byte,
            lokasi_file,
            diunggah_oleh
          )
          VALUES ($1,$2,$3,$4,$5,$6)
          RETURNING id`,
          [
            uploaded.name,
            uploaded.original,
            uploaded.mime,
            uploaded.size,
            uploaded.url,
            staff.id,
          ]
        );

        imageId = img.id;
      }

      const values = [
        v.title,
        v.isbn,
        v.author,
        v.publisher,
        v.publish_year,
        v.category_id,
        v.max_loan_days,
        v.fine_per_day,
        imageId,
        v.shelf_location || null,
        v.description || null,
      ];

      let book;

      if (id) {
        // Mempertahankan sampul lama jika tidak ada unggahan baru
        book = await tx.one(
          `UPDATE buku
           SET judul=$1,
               isbn=$2,
               penulis=$3,
               penerbit=$4,
               tahun_terbit=$5,
               id_kategori=$6,
               batas_hari_pinjam=$7,
               denda_per_hari=$8,
               id_gambar_sampul=COALESCE($9,id_gambar_sampul),
               lokasi_rak=$10,
               sinopsis=$11,
               diubah_pada=NOW()
           WHERE id=$12
           RETURNING id`,
          [...values, id]
        );
      } else {
        // Menghubungkan buku baru dengan sampul unggahan
        book = await tx.one(
          `INSERT INTO buku (
            judul,
            isbn,
            penulis,
            penerbit,
            tahun_terbit,
            id_kategori,
            batas_hari_pinjam,
            denda_per_hari,
            id_gambar_sampul,
            lokasi_rak,
            sinopsis
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
          RETURNING id`,
          values
        );
      }

      // Menyesuaikan jumlah eksemplar dengan stok
      await synchronizeCopies(tx, book.id, v.stock);
    });
  } catch (error) {
    // Menghapus file baru jika penyimpanan database gagal
    await removeCover(uploaded);

    if (error instanceof UploadError) {
      return fail(error.message, {
        cover_file: error.message,
      });
    }

    if (error instanceof LibraryError) {
      return fail(error.message, {
        stock: error.message,
      });
    }

    if (isUniqueViolation(error)) {
      return fail('ISBN sudah digunakan.', {
        isbn: 'ISBN sudah terdaftar.',
      });
    }

    if (isForeignKeyViolation(error)) {
      return fail('Kategori tidak ditemukan.', {
        category_id: 'Pilih kategori yang masih tersedia.',
      });
    }

    console.error('Simpan buku gagal:', error.code || error.name);

    return fail(
      'Data buku belum dapat disimpan. Silakan coba lagi.'
    );
  }

  revalidatePath('/', 'layout');

  return success(
    id ? 'Perubahan buku disimpan.' : 'Buku berhasil ditambahkan.'
  );
}

// Action menambah buku
export async function createBookAction(formData) {
  return saveBook(null, formData);
}

// Action mengubah buku
export async function updateBookAction(id, formData) {
  return saveBook(id, formData);
}

// Menghapus buku yang tidak memiliki riwayat peminjaman
export async function deleteBookAction(id) {
  await requireRole('pegawai', 'admin');

  try {
    await transaction(async (tx) => {
      const book = await tx.one(
        'SELECT id FROM buku WHERE id=$1 FOR UPDATE',
        [validId(id)]
      );

      if (!book) {
        throw new LibraryError('Buku tidak ditemukan.');
      }

      const history = await tx.one(
        `SELECT COUNT(*)::int AS total
         FROM peminjaman WHERE id_buku=$1`,
        [id]
      );

      if (history.total) {
        throw new LibraryError(
          'Buku memiliki pengajuan atau riwayat peminjaman dan tidak dapat dihapus.'
        );
      }

      await tx.query('DELETE FROM buku WHERE id=$1', [id]);
    });
  } catch (error) {
    if (error instanceof LibraryError) {
      return fail(error.message);
    }

    return fail(
      'Buku masih digunakan oleh data lain dan belum dapat dihapus.'
    );
  }

  revalidatePath('/', 'layout');

  return success('Buku berhasil dihapus.');
}