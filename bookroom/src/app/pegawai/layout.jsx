//layout pegawai dan action sirkulasi
import { requireRole } from '@/lib/auth';
import { one } from '@/lib/db';
import StaffShell from '@/components/staff/StaffShell';

export default async function PegawaiLayout({ children }) {
  const user = await requireRole('pegawai','admin');
  const counts = await one(
    `SELECT COUNT(*) FILTER (WHERE status IN ('Menunggu Konfirmasi','Perpanjangan Diajukan'))::int AS queue FROM v_peminjaman`
  );
  const items = user.role==='admin' ? [
    {href:'/admin',label:'Ringkasan Admin',icon:'chart'},
    {href:'/admin/buku',label:'Koleksi Buku',icon:'books'},
    {href:'/admin/pengumuman',label:'Pengumuman',icon:'megaphone'},
    {href: '/admin/sirkulasi?tab=verifikasi',label:'Meja Sirkulasi',icon:'repeat'},
    {href:'/admin/reservasi',label:'Antrean Reservasi',icon:'clock'},
    {href:'/admin/pengguna',label:'Pengguna',icon:'users'},
    {href:'/admin/kategori',label:'Kategori',icon:'tag'},
  ] : [
    {href:'/pegawai',label:'Ringkasan Layanan',icon:'chart'},
    {href:'/pegawai?tab=verifikasi',label:'Peminjaman',icon:'repeat'},
    {href:'/pegawai?tab=pengembalian',label:'Pengembalian',icon:'book'},
    {href:'/pegawai?tab=perpanjangan',label:'Perpanjangan',icon:'repeat'},
    {href:'/pegawai?tab=denda',label:'Denda',icon:'log'},
    {href:'/pegawai?tab=riwayat',label:'Riwayat',icon:'log'},
    {href:'/pegawai/reservasi',label:'Reservasi',icon:'clock'},
    { href: '/pegawai/buku', label: 'Koleksi Buku', icon: 'books' },
    { href: '/pegawai/pengumuman', label: 'Pengumuman', icon: 'megaphone' },
  ];
  return <StaffShell user={user} items={items}>{children}</StaffShell>;
}
