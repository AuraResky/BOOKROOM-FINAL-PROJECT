// Tampilan saat halaman atau data tidak ditemukan
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden px-6 text-center">
      
      
      
      
      <div className="card relative flex max-w-md flex-col items-center gap-3 px-8 py-8">
        
        <p className="display text-6xl text-coral">404</p>
        <h1 className="display text-3xl">Halaman tidak ditemukan</h1>
        <p className="text-sm text-ink-muted">Halaman atau koleksi yang Anda cari tidak tersedia atau telah dipindahkan ke rak lain.</p>
        <Link href="/" className="btn-primary mt-2">Kembali ke Beranda</Link>
      </div>
    </div>
  );
}
