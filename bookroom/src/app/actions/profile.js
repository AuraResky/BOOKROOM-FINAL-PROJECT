'use server';

import { revalidatePath } from 'next/cache';
import { requireRole, hashPassword, verifyPassword } from '@/lib/auth';
import { isUniqueViolation, transaction } from '@/lib/db';
import { fail, hasErrors, str, success, validateEmail, validatePassword } from '@/lib/validation';

export async function updateProfileAction(formData) {
  const user = await requireRole('mahasiswa', 'pegawai', 'admin');
  const student = user.role === 'mahasiswa';
  const fullName = str(formData, 'full_name');
  const email = str(formData, 'email').toLowerCase();
  const identityInput = str(formData, 'identity_number');
  const identity = student ? identityInput.toUpperCase() : identityInput;
  const phone = str(formData, 'phone');
  const studyProgram = student ? str(formData, 'study_program') : null;
  const currentPassword = String(formData.get('current_password') ?? '');
  const newPassword = String(formData.get('new_password') ?? '');

  const errors = {
    full_name: !fullName ? 'Nama lengkap wajib diisi.' : fullName.length > 120 ? 'Nama lengkap maksimal 120 karakter.' : null,
    email: email.length > 150 ? 'Email maksimal 150 karakter.' : null,
    phone: phone && !/^(\+62|0)8\d{7,12}$/.test(phone) ? 'Nomor HP tidak valid (contoh: 081234567890).' : null,
    study_program: student && (!studyProgram || studyProgram.length > 100) ? 'Isi program studi dengan maksimal 100 karakter.' : null,
    new_password: newPassword ? validatePassword(newPassword) : null,
  };
  if (hasErrors(errors)) return fail('Periksa kembali isian Anda.', errors);

  try {
    const result = await transaction(async (tx) => {
      const account = await tx.one(
        `SELECT email, identity_number, password_hash FROM v_pengguna
         WHERE id = $1 AND role = $2 AND is_active FOR UPDATE`,
        [user.id, user.role]
      );
      if (!account) return fail('Akun tidak dapat diperbarui.');

      const emailChanged = email !== account.email.toLowerCase();
      const identityChanged = identityInput !== account.identity_number && identity !== account.identity_number;
      const emailError = emailChanged ? validateEmail(email, { campus: student }) : null;
      const identityValid = student ? /^[A-Z][0-9]{9}$/.test(identity) : /^\d{8,20}$/.test(identity);
      if (emailError || (identityChanged && !identityValid)) {
        return fail('Periksa kembali isian Anda.', {
          email: emailError,
          identity_number: identityChanged && !identityValid
            ? student ? 'NIM harus berisi satu huruf dan sembilan angka.' : 'NIP/identitas harus berisi 8–20 angka.'
            : null,
        });
      }

      const needsPassword = emailChanged || identityChanged || Boolean(newPassword);
      if (needsPassword && (!currentPassword || !verifyPassword(currentPassword, account.password_hash))) {
        const message = currentPassword ? 'Kata sandi saat ini salah.' : 'Masukkan kata sandi saat ini untuk mengonfirmasi perubahan.';
        return fail(message, { current_password: message });
      }

      await tx.query(
        `UPDATE v_pengguna
            SET full_name = $1, email = $2, identity_number = $3, phone = NULLIF($4, ''),
                study_program = COALESCE($5, study_program),
                password_hash = COALESCE($6, password_hash), updated_at = NOW()
          WHERE id = $7`,
        [
          fullName,
          emailChanged ? email : account.email,
          identityChanged ? identity : account.identity_number,
          phone,
          studyProgram,
          newPassword ? hashPassword(newPassword) : null,
          user.id,
        ]
      );
      return success('Profil berhasil diperbarui.');
    });

    if (result.ok) revalidatePath('/', 'layout');
    return result;
  } catch (error) {
    if (isUniqueViolation(error)) {
      const field = error.constraint?.includes('identity') ? 'identity_number' : 'email';
      const label = field === 'email' ? 'Email' : 'NIM/NIP';
      return fail('Periksa kembali isian Anda.', { [field]: `${label} sudah digunakan akun lain.` });
    }
    console.error('Pembaruan profil gagal:', error.code || error.name);
    return fail('Profil belum dapat diperbarui. Silakan coba lagi.');
  }
}
