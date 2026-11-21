'use server';

import { revalidatePath } from 'next/cache';
import { query, one, isUniqueViolation } from '@/lib/db';
import { requireRole, hashPassword } from '@/lib/auth';
import {
  str,
  validateEmail,
  validatePassword,
  hasErrors,
  fail,
  success,
} from '@/lib/validation';

// Peran pengguna yang tersedia
const ROLES = ['admin', 'pegawai', 'mahasiswa'];

// Membaca dan memvalidasi data pengguna
function parseUser(formData, { isEdit }) {
  const v = {
    full_name: str(formData, 'full_name'),
    email: str(formData, 'email').toLowerCase(),

    // Password hanya digunakan saat membuat akun
    password: isEdit
      ? ''
      : String(formData.get('password') ?? ''),

    role: str(formData, 'role'),

    // Mengubah huruf pada NIM menjadi kapital
    identity_number:
      str(formData, 'role') === 'mahasiswa'
        ? str(formData, 'identity_number').toUpperCase()
        : str(formData, 'identity_number'),

    study_program: str(formData, 'study_program'),
    phone: str(formData, 'phone'),

    is_active:
      formData.get('is_active') === 'on' ||
      formData.get('is_active') === 'true',
  };

  const errors = {
    full_name: !v.full_name
      ? 'Nama lengkap wajib diisi.'
      : null,

    email: validateEmail(v.email, {
      campus: v.role === 'mahasiswa',
    }),

    password: isEdit
      ? null
      : validatePassword(v.password),

    role: !ROLES.includes(v.role)
      ? 'Pilih peran pengguna.'
      : null,

    identity_number: !v.identity_number
      ? (
          v.role === 'mahasiswa'
            ? 'NIM wajib diisi.'
            : 'NIP/identitas wajib diisi.'
        )
      : v.role === 'mahasiswa'
        ? (
            /^[A-Z][0-9]{9}$/.test(v.identity_number)
              ? null
              : 'NIM harus 1 huruf kapital diikuti 9 angka, contoh A123456789.'
          )
        : (
            /^\d{8,20}$/.test(v.identity_number)
              ? null
              : 'NIP/identitas harus 8-20 digit angka.'
          ),

    study_program:
      v.role === 'mahasiswa' && !v.study_program
        ? 'Program studi wajib diisi untuk mahasiswa.'
        : null,

    phone:
      v.phone && !/^(\+62|0)8\d{7,12}$/.test(v.phone)
        ? 'Nomor HP tidak valid.'
        : null,
  };

  return { v, errors };
}

// Menangani email atau identitas yang sudah digunakan
function uniqueError(err) {
  if (!isUniqueViolation(err)) throw err;

  return String(err.constraint || '').includes('identity')
    ? fail('Identitas sudah terdaftar.', {
        identity_number: 'NIM/NIP sudah digunakan akun lain.',
      })
    : fail('Email sudah terdaftar.', {
        email: 'Email sudah digunakan akun lain.',
      });
}

// Menambahkan akun pengguna oleh admin
export async function createUserAction(formData) {
  await requireRole('admin');

  const { v, errors } = parseUser(formData, {
    isEdit: false,
  });

  if (hasErrors(errors)) {
    return fail('Periksa kembali data pengguna.', errors);
  }

  try {
    await query(
      `INSERT INTO v_pengguna (
        full_name,
        email,
        password_hash,
        role,
        identity_number,
        study_program,
        phone,
        is_active
      )
      VALUES ($1,$2,$3,$4,$5,NULLIF($6,''),NULLIF($7,''),$8)`,
      [
        v.full_name,
        v.email,
        hashPassword(v.password),
        v.role,
        v.identity_number,
        v.role === 'mahasiswa' ? v.study_program : '',
        v.phone,
        v.is_active,
      ]
    );
  } catch (err) {
    return uniqueError(err);
  }

  revalidatePath('/admin', 'layout');

  return success(`Akun ${v.full_name} berhasil dibuat.`);
}

// Memperbarui data pengguna tanpa mengganti password
export async function updateUserAction(id, formData) {
  const admin = await requireRole('admin');

  const { v, errors } = parseUser(formData, {
    isEdit: true,
  });

  // Melindungi peran dan status akun admin sendiri
  if (Number(id) === admin.id) {
    if (v.role !== 'admin') {
      errors.role =
        'Anda tidak dapat mengubah peran akun sendiri.';
    }

    if (!v.is_active) {
      errors.is_active =
        'Anda tidak dapat menonaktifkan akun sendiri.';
    }
  }

  if (hasErrors(errors)) {
    return fail('Periksa kembali data pengguna.', errors);
  }

  try {
    const row = await one(
      `UPDATE v_pengguna
       SET full_name=$1,
           email=$2,
           role=$3,
           identity_number=$4,
           study_program=NULLIF($5,''),
           phone=NULLIF($6,''),
           is_active=$7,
           updated_at=NOW()
       WHERE id=$8
       RETURNING id`,
      [
        v.full_name,
        v.email,
        v.role,
        v.identity_number,
        v.role === 'mahasiswa' ? v.study_program : '',
        v.phone,
        v.is_active,
        id,
      ]
    );

    if (!row) {
      return fail('Pengguna tidak ditemukan.');
    }
  } catch (error) {
    return uniqueError(error);
  }

  // Mengakhiri sesi pengguna lain setelah datanya diperbarui
  await query(
    `DELETE FROM sesi_login
     WHERE id_pengguna=$1 AND id_pengguna<>$2`,
    [id, admin.id]
  );

  revalidatePath('/admin', 'layout');

  return success(`Data ${v.full_name} diperbarui.`);
}

// Menghapus pengguna yang tidak memiliki transaksi atau riwayat
export async function deleteUserAction(id) {
  const admin = await requireRole('admin');

  // Mencegah admin menghapus akun sendiri
  if (Number(id) === admin.id) {
    return fail('Anda tidak dapat menghapus akun sendiri.');
  }

  const user = await one(
    `SELECT
      u.full_name,

      (
        SELECT COUNT(*)::int
        FROM v_peminjaman l
        WHERE l.user_id=u.id
          AND l.status NOT IN ('Selesai','Ditolak')
      ) AS open_loans,

      (
        SELECT COUNT(*)::int
        FROM v_peminjaman l
        WHERE l.user_id=u.id
          AND l.fine_status='Tertunggak'
      ) AS fines,

      (
        SELECT COUNT(*)::int
        FROM v_peminjaman l
        WHERE l.user_id=u.id
      ) AS all_loans

    FROM v_pengguna u
    WHERE u.id=$1`,
    [id]
  );

  if (!user) {
    return fail('Pengguna tidak ditemukan.');
  }

  // Memastikan tidak ada transaksi aktif
  if (user.open_loans > 0) {
    return fail(
      `${user.full_name} masih memiliki ${user.open_loans} transaksi aktif sehingga tidak dapat dihapus.`
    );
  }

  // Memastikan tidak ada denda tertunggak
  if (user.fines > 0) {
    return fail(
      `${user.full_name} masih memiliki denda Tertunggak.`
    );
  }

  // Menjaga riwayat transaksi pengguna
  if (user.all_loans > 0) {
    return fail(
      `${user.full_name} memiliki riwayat transaksi. Nonaktifkan akun untuk menjaga jejak audit sirkulasi.`
    );
  }

  await query(
    'DELETE FROM v_pengguna WHERE id=$1',
    [id]
  );

  revalidatePath('/admin', 'layout');

  return success(`Akun ${user.full_name} dihapus.`);
}

// Membaca dan memvalidasi data kategori
function parseCategory(formData) {
  const v = {
    name: str(formData, 'name'),
    code: str(formData, 'code').toUpperCase(),
    description: str(formData, 'description'),
  };

  const errors = {
    name: !v.name
      ? 'Nama kategori wajib diisi.'
      : v.name.length > 80
        ? 'Nama maksimal 80 karakter.'
        : null,

    code: !v.code
      ? 'Kode klasifikasi wajib diisi.'
      : !/^[A-Z0-9.\-]{2,20}$/.test(v.code)
        ? 'Kode hanya huruf/angka/titik, 2–20 karakter.'
        : null,

    description:
      v.description.length > 300
        ? 'Deskripsi maksimal 300 karakter.'
        : null,
  };

  return { v, errors };
}

// Menangani nama atau kode kategori yang sudah digunakan
function categoryUnique(err) {
  if (!isUniqueViolation(err)) throw err;

  return String(err.constraint || '').includes('code')
    ? fail('Kode klasifikasi sudah digunakan.', {
        code: 'Kode klasifikasi sudah digunakan.',
      })
    : fail('Nama kategori sudah ada.', {
        name: 'Nama kategori sudah ada.',
      });
}

// Menambahkan kategori buku
export async function createCategoryAction(formData) {
  await requireRole('admin');

  const { v, errors } = parseCategory(formData);

  if (hasErrors(errors)) {
    return fail('Periksa kembali data kategori.', errors);
  }

  try {
    await query(
      `INSERT INTO v_kategori (name,code,description)
       VALUES ($1,$2,NULLIF($3,''))`,
      [v.name, v.code, v.description]
    );
  } catch (err) {
    return categoryUnique(err);
  }

  revalidatePath('/', 'layout');

  return success(`Kategori ${v.name} ditambahkan.`);
}

// Memperbarui kategori buku
export async function updateCategoryAction(id, formData) {
  await requireRole('admin');

  const { v, errors } = parseCategory(formData);

  if (hasErrors(errors)) {
    return fail('Periksa kembali data kategori.', errors);
  }

  try {
    const row = await one(
      `UPDATE v_kategori
       SET name=$1,
           code=$2,
           description=NULLIF($3,'')
       WHERE id=$4
       RETURNING id`,
      [v.name, v.code, v.description, id]
    );

    if (!row) {
      return fail('Kategori tidak ditemukan.');
    }
  } catch (err) {
    return categoryUnique(err);
  }

  revalidatePath('/', 'layout');

  return success(`Kategori ${v.name} diperbarui.`);
}

// Menghapus kategori yang belum digunakan buku
export async function deleteCategoryAction(id) {
  await requireRole('admin');

  const cat = await one(
    `SELECT c.name,COUNT(b.id)::int AS books
     FROM v_kategori c
     LEFT JOIN v_buku b ON b.category_id=c.id
     WHERE c.id=$1
     GROUP BY c.id,c.name`,
    [id]
  );

  if (!cat) {
    return fail('Kategori tidak ditemukan.');
  }

  // Mencegah penghapusan kategori yang masih dipakai
  if (cat.books > 0) {
    return fail(
      `Kategori ${cat.name} masih terhubung ke ${cat.books} buku sehingga tidak dapat dihapus.`
    );
  }

  await query(
    'DELETE FROM v_kategori WHERE id=$1',
    [id]
  );

  revalidatePath('/', 'layout');

  return success(`Kategori ${cat.name} dihapus.`);
}