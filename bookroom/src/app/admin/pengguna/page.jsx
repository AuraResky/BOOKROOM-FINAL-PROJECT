// manager dan halaman pengguna
import { requireRole } from '@/lib/auth';
import { query, one } from '@/lib/db';
import { campusDomain } from '@/lib/validation';
import { PageHeader, StatCard } from '@/components/staff/StaffShell';
import UserManager from '@/components/managers/UserManager';
import { IconUsers, IconBook, IconAlert } from '@/components/ui/Icons';

export const metadata = { title: 'Manajemen Pengguna' };

export default async function UsersPage({ searchParams }) {
  const admin = await requireRole('admin');
  const sp = await searchParams;
  const role = ['admin', 'pegawai', 'mahasiswa'].includes(sp.peran) ? sp.peran : '';

  const [users, summary] = await Promise.all([
    query(
      `SELECT u.id, u.full_name, u.email, u.role, u.identity_number, u.study_program, u.phone, u.is_active, u.created_at,
              COUNT(l.id) FILTER (WHERE l.status NOT IN ('Selesai','Ditolak'))::int AS open_loans,
              COUNT(l.id)::int AS total_loans,
              COUNT(l.id) FILTER (WHERE l.fine_status = 'Tertunggak')::int AS fines
         FROM v_pengguna u LEFT JOIN v_peminjaman l ON l.user_id = u.id
        WHERE ($1 = '' OR u.role = $1)
        GROUP BY u.id,u.full_name,u.email,u.role,u.identity_number,u.phone,u.study_program,u.is_active,u.created_at,u.updated_at,u.password_hash
        ORDER BY CASE u.role WHEN 'admin' THEN 1 WHEN 'pegawai' THEN 2 ELSE 3 END, u.full_name`,
      [role]
    ),
    one(`SELECT COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE role IN ('admin','pegawai'))::int AS staff,
                COUNT(*) FILTER (WHERE NOT is_active)::int AS inactive
           FROM v_pengguna`),
  ]);

  return (
    <>
      <PageHeader eyebrow="Admin" title="Manajemen Pengguna"/>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total akun" value={summary.total} icon={IconUsers} />
        <StatCard label="Admin & pegawai" value={summary.staff} icon={IconBook} tone="gold" />
        <StatCard label="Akun nonaktif" value={summary.inactive} icon={IconAlert} tone="red" />
      </div>
      <UserManager users={users} currentUserId={admin.id} role={role} campusDomain={campusDomain()} />
    </>
  );
}
