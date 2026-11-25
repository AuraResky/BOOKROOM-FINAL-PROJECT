import { requireRole } from '@/lib/auth';
import ProfilePage from '@/components/account/ProfilePage';

export const metadata = { title: 'Profil Admin' };

export default async function AdminProfilePage() {
  const user = await requireRole('admin');
  return <ProfilePage user={user} />;
}
