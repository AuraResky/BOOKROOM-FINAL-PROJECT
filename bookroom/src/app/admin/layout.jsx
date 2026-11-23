import { requireRole } from '@/lib/auth';
import StaffShell from '@/components/staff/StaffShell';

export default async function AdminLayout({ children }) {
  const user = await requireRole('admin');
  const items = [
    { href: '/admin', label: 'Dashboard Statistik', icon: 'chart' },
    { href: '/admin/pengguna', label: 'Manajemen Pengguna', icon: 'users' },
    { href: '/admin/kategori', label: 'Kategori Buku', icon: 'tag' },
    { href: '/admin/buku', label: 'Koleksi Buku', icon: 'books' },
    { href: '/admin/pengumuman', label: 'Pengumuman', icon: 'megaphone' },
    { href: '/admin/sirkulasi?tab=verifikasi', label: 'Meja Sirkulasi', icon: 'repeat' },
    { href: '/admin/reservasi', label: 'Antrean Reservasi', icon: 'clock' },
    { href: '/admin/log', label: 'Log Transaksi', icon: 'log' },
  ];
  return <StaffShell user={user} items={items}>{children}</StaffShell>;
}
