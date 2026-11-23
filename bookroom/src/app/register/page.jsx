// form dan halaman registrasi
import { redirect } from 'next/navigation';
import { getCurrentUser, homePathFor } from '@/lib/auth';
import { campusDomain } from '@/lib/validation';
import AuthShell from '@/components/auth/AuthShell';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = { title: 'Daftar Mahasiswa' };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user.role));
  return (
    <AuthShell title="Daftar Akun Mahasiswa" subtitle="Aktifkan keanggotaan perpustakaan dengan email kampus Anda.">
      <RegisterForm campusDomain={campusDomain()} />
    </AuthShell>
  );
}
