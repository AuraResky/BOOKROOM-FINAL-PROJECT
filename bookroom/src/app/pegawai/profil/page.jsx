import { requireRole } from '@/lib/auth';
import ProfilePage from '@/components/account/ProfilePage';

export const metadata = { title: 'Profil Pegawai' };

export default async function PegawaiProfilePage() {
  const user = await requireRole('pegawai');
  return <ProfilePage user={user} />;
}