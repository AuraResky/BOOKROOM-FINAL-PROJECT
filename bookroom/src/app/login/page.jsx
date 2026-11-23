// halaman login.
import { redirect } from 'next/navigation';
import { getCurrentUser, homePathFor } from '@/lib/auth';
import AuthShell from '@/components/auth/AuthShell';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = { title: 'Masuk' };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user.role));
  return (
    <AuthShell title="Masuk ke BookRoom" subtitle="Untuk Admin, Pegawai Perpustakaan, dan Mahasiswa.">
      <LoginForm />
    </AuthShell>
  );
}
