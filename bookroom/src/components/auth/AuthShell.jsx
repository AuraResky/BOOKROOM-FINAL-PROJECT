// Kerangka tampilan untuk halaman akun
import Link from 'next/link';
import { Wordmark } from '@/components/site/TopNavbar';
import { IconBook, IconRepeat, IconClock } from '@/components/ui/Icons';

const benefits = [
  [IconBook, 'Katalog terintegrasi', 'Cari referensi dan periksa ketersediaan koleksi perpustakaan.'],
  [IconRepeat, 'Layanan peminjaman', 'Ajukan peminjaman dan perpanjangan melalui akun mahasiswa.'],
  [IconClock, 'Informasi yang jelas', 'Pantau jatuh tempo, riwayat transaksi, dan tanggungan denda.'],
];

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <aside className="hidden border-r border-navy-600 bg-navy p-10 text-white lg:flex lg:flex-col xl:p-14">
        <Link href="/" className="w-fit"><Wordmark /></Link>
        <div className="my-auto max-w-lg py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-light">Layanan anggota perpustakaan</p>
          <h2 className="mt-5 font-display text-4xl font-medium leading-tight tracking-tight">Referensi dan layanan akademik dalam satu akses.</h2>
          <p className="mt-5 text-sm leading-7 text-slate-100">Gunakan akun perpustakaan untuk mengelola aktivitas peminjaman dan mendukung kebutuhan belajar Anda.</p>
          <div className="mt-9 space-y-6 border-t border-white/15 pt-7">
            {benefits.map(([Icon, heading, description]) => (
              <div key={heading} className="flex gap-4">
                <Icon className="mt-1 h-5 w-5 shrink-0 text-gold-light" />
                <div><h3 className="text-sm font-semibold">{heading}</h3><p className="mt-1 text-sm leading-6 text-slate-200">{description}</p></div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/75">BookRoom · Perpustakaan</p>
      </aside>
      <main className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex rounded-lg bg-navy px-4 py-3 lg:hidden"><Wordmark /></Link>
          <h1 className="display text-3xl">{title}</h1>
          <p className="mt-3 text-sm leading-7 text-ink-muted">{subtitle}</p>
          <div className="card mt-6 p-6 sm:p-7">{children}</div>
        </div>
      </main>
    </div>
  );
}
