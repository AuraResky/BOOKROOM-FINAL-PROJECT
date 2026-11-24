// Layout pegawai
import { requireRole } from '@/lib/auth';
import StaffShell from '@/components/staff/StaffShell';

export default async function PegawaiLayout({ children }) {
  const user = await requireRole('pegawai');

  const items = [
    { href: '/pegawai', label: 'Dashboard', icon: 'chart' },
    { href: '/pegawai/reservasi', label: 'Reservasi', icon: 'clock' },
    { href: '/pegawai/buku', label: 'Koleksi Buku', icon: 'books' },
    { href: '/pegawai?tab=verifikasi', label: 'Layanan Pinjam', icon: 'repeat' },
    { href: '/pegawai/pengumuman', label: 'Pengumuman', icon: 'megaphone' },
  ];

  return <StaffShell user={user} items={items}>{children}</StaffShell>;
}