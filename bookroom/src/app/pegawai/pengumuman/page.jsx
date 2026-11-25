//halaman kelola pengumuman pegawai
import { requireRole } from '@/lib/auth';
import { query, one } from '@/lib/db';
import { PageHeader } from '@/components/staff/StaffShell';
import AnnouncementManager from '@/components/managers/AnnouncementManager';

export const metadata = { title: 'Manajemen Pengumuman' };

export default async function AnnouncementAdminPage() {
  const user = await requireRole('pegawai', 'admin');
  const [items, today] = await Promise.all([
    query(`SELECT a.id, a.title, a.content, a.category, a.release_date, a.status, u.full_name AS author_name
             FROM v_pengumuman a LEFT JOIN v_pengguna u ON u.id = a.author_id
            ORDER BY a.release_date DESC, a.id DESC`),
    one(`SELECT TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS d`),
  ]);
  return (
    <>
      <PageHeader eyebrow={user.role === 'admin' ? 'Admin' : 'Pegawai Perpustakaan'} title="Manajemen Pengumuman"/>
      <AnnouncementManager items={items} today={today.d} />
    </>
  );
}
