// action pegawai untuk proses sirkulasi perpustakaan
'use server';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import * as service from '@/lib/library-service';
import { fail, success } from '@/lib/validation';

// Menjalankan aksi dengan pemeriksaan hak akses pegawai atau admin
async function run(operation, message) {
  const staff = await requireRole('pegawai', 'admin');

  try {
    await operation(staff.id);
    revalidatePath('/', 'layout');
    return success(message);
  } catch (error) {
    if (error instanceof service.LibraryError) {
      return fail(error.message);
    }
    console.error('Sirkulasi gagal:', error.code || error.name);
    return fail('Layanan belum dapat memproses permintaan. Silakan coba lagi.');
  }
}

export async function approveLoanAction(id) {
  return run(
    (staff) => service.approveLoan(staff, id),
    'Peminjaman disetujui.'
  );
}

export async function rejectLoanAction(id, reason) {
  return run(
    (staff) => service.rejectLoan(staff, id, reason),
    'Pengajuan ditolak dan alasan tersimpan.'
  );
}

export async function approveExtensionAction(id) {
  return run(
    (staff) => service.decideExtension(staff, id, true),
    'Perpanjangan disetujui. Jatuh tempo diperbarui.'
  );
}

export async function rejectExtensionAction(id, reason) {
  return run(
    (staff) => service.decideExtension(staff, id, false, reason),
    'Perpanjangan ditolak.'
  );
}

export async function returnBookAction(id) {
  return run(
    (staff) => service.returnLoan(staff, id),
    'Pengembalian dicatat. Denda keterlambatan dihitung otomatis.'
  );
}

export async function payFineAction(id) {
  return run(
    (staff) => service.payFine(staff, id),
    'Pelunasan denda berhasil dicatat.'
  );
}