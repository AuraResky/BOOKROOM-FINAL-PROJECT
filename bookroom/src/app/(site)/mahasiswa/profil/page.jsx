import { requireRole } from '@/lib/auth';
import { getStudentStanding } from '@/lib/queries';
import ProfilePage from '@/components/account/ProfilePage';

export const metadata = { title: 'Profil Mahasiswa' };

export default async function StudentProfilePage() {
  const user = await requireRole('mahasiswa');
  const standing = await getStudentStanding(user.id);

  return (
    <div className="px-4 pt-8 sm:px-6">
      <ProfilePage user={user} standing={standing} />
    </div>
  );
}
