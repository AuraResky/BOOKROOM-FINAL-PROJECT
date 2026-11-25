'use server';

// Action mahasiswa
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { fail,success } from '@/lib/validation';
import * as service from '@/lib/library-service';
import { markRead } from '@/lib/notifications';
import { updateProfileAction as saveProfile } from './profile';
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
export async function cancelReservationAction(id) {
 return run((userId) => service.cancelReservation(userId, id), 'Reservasi dibatalkan.');
}
// Tandai notifikasi dibaca
export async function markNotificationsReadAction(ids=null){
 const user=await requireRole('mahasiswa');
 const changed=await markRead(user.id,ids);
 revalidatePath('/','layout');
 return success(changed?`${changed} notifikasi ditandai dibaca.`:'Tidak ada notifikasi baru.');
}
// Simpan rating dan ulasan
export async function submitReviewAction(formData){return run(user=>service.saveReview(user,formData.get('loan_id'),Number(formData.get('rating')),formData.get('comment')),'Penilaian Anda berhasil disimpan.');}

// Jalur impor lama untuk aksi profil mahasiswa.
export async function updateProfileAction(formData) {
 await requireRole('mahasiswa');
 return saveProfile(formData);
}
