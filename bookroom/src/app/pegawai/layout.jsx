// Layout pegawai
import { requireRole } from '@/lib/auth';
import StaffShell from '@/components/staff/StaffShell';

export default async function PegawaiLayout({ children }) {
  const user = await requireRole('pegawai');

  const items = [
    { href: '/pegawai', label: 'Ringkasan Layanan', icon: 'chart' },
    { href: '/pegawai?tab=verifikasi', label: 'Peminjaman', icon: 'repeat' },
    { href: '/pegawai?tab=pengembalian', label: 'Pengembalian', icon: 'book' },
    { href: '/pegawai?tab=perpanjangan', label: 'Perpanjangan', icon: 'repeat' },
    { href: '/pegawai?tab=denda', label: 'Denda', icon: 'log' },
    { href: '/pegawai?tab=riwayat', label: 'Riwayat', icon: 'log' },
    { href: '/pegawai/reservasi', label: 'Reservasi', icon: 'clock' },
    { href: '/pegawai/buku', label: 'Koleksi Buku', icon: 'books' },
    { href: '/pegawai/pengumuman', label: 'Pengumuman', icon: 'megaphone' },
  ];

  return <StaffShell user={user} items={items}>{children}</StaffShell>;
}