'use server';

// Action mahasiswa; pembaruan profil tidak menerima perubahan nama
import { revalidatePath } from 'next/cache';
import { query,one } from '@/lib/db';
import { requireRole,hashPassword,verifyPassword } from '@/lib/auth';
import { fail,success,str,validatePassword,hasErrors } from '@/lib/validation';
import * as service from '@/lib/library-service';
import { markRead } from '@/lib/notifications';
// Pemeriksaan akun mahasiswa
async function run(operation,message){
 const user=await requireRole('mahasiswa');
 try{await operation(user.id);revalidatePath('/','layout');return success(message);}
 catch(error){if(error instanceof service.LibraryError)return fail(error.message);console.error('Layanan mahasiswa gagal:',error.code||error.name);return fail('Permintaan belum dapat diproses. Silakan coba lagi.');}
}
// Pengajuan pinjaman
export async function requestLoanAction(id){return run(user=>service.requestLoan(user,id),'Pengajuan terkirim. Menunggu konfirmasi pegawai.');}
// Pengajuan perpanjangan
export async function requestExtensionAction(id){return run(user=>service.requestExtension(user,id),'Perpanjangan berhasil diajukan.');}
// Reservasi buku
export async function reserveBookAction(id){
 const user=await requireRole('mahasiswa');
 try{const r=await service.reserveBook(user.id,id);revalidatePath('/','layout');return success(`Reservasi tercatat. Posisi antrean Anda: ${r.queue_position}.`,{queue_position:r.queue_position});}
 catch(error){if(error instanceof service.LibraryError)return fail(error.message);console.error('Reservasi gagal:',error.code||error.name);return fail('Reservasi belum dapat diproses. Silakan coba lagi.');}
}
// Batalkan reservasi
export async function cancelReservationAction(id){return run(user=>service.cancelReservation(user,id),'Reservasi dibatalkan.');}
// Tandai notifikasi dibaca
export async function markNotificationsReadAction(ids=null){
 const user=await requireRole('mahasiswa');
 const changed=await markRead(user.id,ids);
 revalidatePath('/','layout');
 return success(changed?`${changed} notifikasi ditandai dibaca.`:'Tidak ada notifikasi baru.');
}
// Simpan rating dan ulasan
export async function submitReviewAction(formData){return run(user=>service.saveReview(user,formData.get('loan_id'),Number(formData.get('rating')),formData.get('comment')),'Penilaian Anda berhasil disimpan.');}
// Simpan kontak dan password
export async function updateProfileAction(formData) {
  const user = await requireRole('mahasiswa');
  const phone = str(formData, 'phone');
  const studyProgram = str(formData, 'study_program');
  const currentPassword = String(formData.get('current_password') ?? '');
  const newPassword = String(formData.get('new_password') ?? '');

  const errors = {
    phone: phone && !/^(\+62|0)8\d{7,12}$/.test(phone) ? 'Nomor HP tidak valid (contoh: 081234567890).' : null,
    study_program: !studyProgram ? 'Program studi wajib diisi.' : null,
    new_password: newPassword ? validatePassword(newPassword) : null,
    current_password: newPassword && !currentPassword ? 'Masukkan kata sandi saat ini untuk mengganti kata sandi.' : null,
  };
  if (hasErrors(errors)) return fail('Periksa kembali isian Anda.', errors);

  if (newPassword) {
    const row = await one('SELECT password_hash FROM v_pengguna WHERE id = $1', [user.id]);
    if (!verifyPassword(currentPassword, row.password_hash)) {
      return fail('Kata sandi saat ini salah.', { current_password: 'Kata sandi saat ini salah.' });
    }
  }

  await query(
    `UPDATE v_pengguna SET phone = NULLIF($1, ''), study_program = $2,
            password_hash = COALESCE($3, password_hash), updated_at = NOW()
      WHERE id = $4`,
    [phone, studyProgram, newPassword ? hashPassword(newPassword) : null, user.id]
  );
  revalidatePath('/', 'layout');
  return success('Profil berhasil diperbarui.');
}
