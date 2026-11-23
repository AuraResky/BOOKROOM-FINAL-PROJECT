// halaman informasi layanan
import { one } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { MAX_ACTIVE_LOANS } from '@/lib/queries';
import { campusDomain } from '@/lib/validation';
import { formatRupiah } from '@/lib/format';
import PageBanner from '@/components/art/PageBanner';
import ServiceContent from '@/components/site/ServiceContent';
import { BooksCalendar, IdCardArt, LaptopSearch, BookCheck, FormPencil, HandOff } from '@/components/art/ServiceArt';

export const metadata = { title: 'Informasi Layanan' };

export default async function ServicesPage() {
  const [user, rules] = await Promise.all([
    getCurrentUser(),
    one(`SELECT MIN(max_loan_days)::int AS min_days, MAX(max_loan_days)::int AS max_days,
                MIN(fine_per_day)::int AS min_fine, MAX(fine_per_day)::int AS max_fine,
                COUNT(*)::int AS titles FROM v_buku`),
  ]);
  const domain = campusDomain();
  const days = rules.min_days === rules.max_days ? `${rules.max_days} hari` : `${rules.min_days}–${rules.max_days} hari`;
  const fines = rules.min_fine === rules.max_fine ? formatRupiah(rules.max_fine) : `${formatRupiah(rules.min_fine)}–${formatRupiah(rules.max_fine)}`;

  const services = [
    { title: 'Peminjaman Buku', art: BooksCalendar, href: '#cara-meminjam',
      text: `Pinjam hingga ${MAX_ACTIVE_LOANS} buku sekaligus dengan masa pinjam ${days} sesuai ketentuan tiap judul.` },
    { title: 'Keanggotaan', art: IdCardArt, href: user ? '/mahasiswa/profil' : '/register',
      text: `Daftar dengan email kampus @${domain} untuk mengajukan pinjam, perpanjangan, dan ulasan.` },
  ];
  const steps = [
    { n: 1, title: 'Cari buku', art: LaptopSearch, tone: 'bg-coral', text: 'Temukan buku melalui Katalog Buku berdasarkan judul, penulis, ISBN, atau kategori.' },
    { n: 2, title: 'Periksa ketersediaan', art: BookCheck, tone: 'bg-teal', text: 'Pastikan berlabel Tersedia dan Anda tidak memiliki denda Tertunggak.' },
    { n: 3, title: 'Ajukan peminjaman', art: FormPencil, tone: 'bg-plum', text: 'Klik “Ajukan Pinjam”; status menjadi Menunggu Konfirmasi pegawai.' },
    { n: 4, title: 'Ambil buku', art: HandOff, tone: 'bg-gold', text: 'Setelah disetujui (cek notifikasi), ambil buku di meja sirkulasi dengan KTM.' },
  ];
  const hours = [
    { day: 'Senin - Jumat', time: '07.30 - 21.00', tone: 'text-teal-dark' },
    { day: 'Sabtu', time: '08.00 - 16.00', tone: 'text-plum' },
    { day: 'Minggu & libur nasional', time: null, tone: 'text-coral' },
  ];
  const faqs = [
    ['Berapa lama masa peminjaman?', `Masa pinjam mengikuti ketentuan tiap judul, saat ini ${days}. Jatuh tempo dihitung sejak pegawai menyetujui pengajuan dan tercantum di Dashboard Mahasiswa.`],
    ['Bagaimana cara memperpanjang pinjaman?', 'Buka Dashboard → Peminjaman Aktif → “Ajukan Perpanjangan”. Perpanjangan hanya sekali per transaksi, diajukan sebelum jatuh tempo, dan menambah masa pinjam sesuai durasi buku setelah divalidasi pegawai.'],
    ['Berapa denda keterlambatan?', `Denda dihitung otomatis saat pengembalian: jumlah hari terlambat × tarif harian buku (${fines}/hari). Denda berstatus Tertunggak sampai dilunasi di meja sirkulasi.`],
    ['Mengapa tombol “Ajukan Pinjam” tidak aktif?', `Tombol dinonaktifkan bila Anda memiliki denda Tertunggak, stok buku habis, sudah mengajukan buku yang sama, atau telah mencapai ${MAX_ACTIVE_LOANS} pinjaman/pengajuan aktif.`],
    ['Apakah saya akan diingatkan sebelum jatuh tempo?', 'Ya. Sistem mengirim notifikasi H-1 sebelum jatuh tempo, serta kabar persetujuan, penolakan, denda baru, dan pelunasan melalui ikon lonceng.'],
    ['Siapa yang dapat mendaftar sebagai anggota?', `Mahasiswa aktif dengan email kampus @${domain}. Tamu tetap dapat menjelajahi katalog dan pengumuman tanpa akun.`],
  ];

  return (
    <>
      <PageBanner title="Informasi Layanan" subtitle="Panduan layanan perpustakaan untuk anggota dan pengunjung." />

      <ServiceContent services={services} steps={steps} hours={hours} faqs={faqs} days={days} fines={fines} maxLoans={MAX_ACTIVE_LOANS} />
    </>
  );
}
