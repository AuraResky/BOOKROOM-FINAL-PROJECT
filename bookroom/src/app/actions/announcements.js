'use server';

// Tahap 48: Action untuk menyimpan dan menghapus pengumuman.

import { revalidatePath } from 'next/cache';
import { query, one } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { str, hasErrors, fail, success } from '@/lib/validation';

const CATEGORIES = ['Operasional', 'Layanan', 'Acara'];
const STATUSES = ['Draft', 'Published'];

function parse(formData) {
  const v = {
    title: str(formData, 'title'),
    content: str(formData, 'content'),
    category: str(formData, 'category'),
    release_date: str(formData, 'release_date'),
    status: str(formData, 'status'),
  };
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(v.release_date) && !Number.isNaN(Date.parse(v.release_date));
  const errors = {
    title: !v.title ? 'Judul pengumuman wajib diisi.' : v.title.length < 8 ? 'Judul minimal 8 karakter.' : null,
    content: !v.content ? 'Konten pengumuman wajib diisi.' : v.content.length < 30 ? 'Konten minimal 30 karakter.' : null,
    category: !CATEGORIES.includes(v.category) ? 'Pilih kategori Operasional, Layanan, atau Acara.' : null,
    release_date: !v.release_date ? 'Tanggal rilis wajib diisi.' : !validDate ? 'Format tanggal rilis tidak valid.' : null,
    status: !STATUSES.includes(v.status) ? 'Pilih status publikasi.' : null,
  };
  return { v, errors };
}

function refresh() {
  revalidatePath('/pegawai/pengumuman');
  revalidatePath('/', 'layout');
}

export async function createAnnouncementAction(formData) {
  const user = await requireRole('pegawai', 'admin');
  const { v, errors } = parse(formData);
  if (hasErrors(errors)) return fail('Periksa kembali isian pengumuman.', errors);
  await query(
    `INSERT INTO v_pengumuman (title, content, category, release_date, status, author_id) VALUES ($1,$2,$3,$4,$5,$6)`,
    [v.title, v.content, v.category, v.release_date, v.status, user.id]
  );
  refresh();
  return success(`Pengumuman disimpan sebagai ${v.status}.`);
}

export async function updateAnnouncementAction(id, formData) {
  await requireRole('pegawai', 'admin');
  const { v, errors } = parse(formData);
  if (hasErrors(errors)) return fail('Periksa kembali isian pengumuman.', errors);
  const row = await one(
    `UPDATE v_pengumuman SET title=$1, content=$2, category=$3, release_date=$4, status=$5, updated_at=NOW()
      WHERE id=$6 RETURNING id`,
    [v.title, v.content, v.category, v.release_date, v.status, id]
  );
  if (!row) return fail('Pengumuman tidak ditemukan.');
  refresh();
  return success('Perubahan pengumuman tersimpan.');
}

export async function deleteAnnouncementAction(id) {
  await requireRole('pegawai', 'admin');
  const row = await one('DELETE FROM v_pengumuman WHERE id = $1 RETURNING title', [id]);
  if (!row) return fail('Pengumuman tidak ditemukan.');
  refresh();
  return success(`Pengumuman "${row.title}" dihapus.`);
}
