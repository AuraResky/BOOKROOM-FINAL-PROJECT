import { requireRole } from '@/lib/auth';

export default async function MahasiswaLayout({ children }) {
  await requireRole('mahasiswa');
  return <>{children}</>;
}