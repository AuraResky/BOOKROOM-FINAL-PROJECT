import Link from 'next/link';
import { getCurrentUser, homePathFor } from '@/lib/auth';

export default async function NotFound() {
  const user = await getCurrentUser();
  const targetHref = homePathFor(user?.role);

  const buttonLabel =
    user?.role === 'admin'
      ? 'Kembali ke Dashboard Admin'
      : user?.role === 'pegawai'
        ? 'Kembali ke Dashboard Pegawai'
        : user?.role === 'mahasiswa'
          ? 'Kembali ke Dashboard Mahasiswa'
          : 'Kembali ke Beranda';

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
        <p className="text-5xl font-bold tracking-tight text-navy">404</p>
        <h1 className="mt-3 text-xl font-bold text-navy">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Halaman atau koleksi yang Anda cari tidak tersedia atau telah dipindahkan ke rak lain.
        </p>
        <div className="mt-6">
          <Link
            href={targetHref}
            className="inline-flex items-center justify-center rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy/90"
          >
            {buttonLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}