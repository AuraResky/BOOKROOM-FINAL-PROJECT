// Kerangka halaman: root layout dan halaman tidak ditemukan
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import './reference-blue.css';
import './curated-home.css';
import './shelf-banner.css';
import { Toaster } from '@/components/ui/Toast';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });
const editorial = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

export const metadata = {
  title: { default: 'BookRoom — Perpustakaan Universitas Nusantara Raya', template: '%s · BookRoom' },
  description: 'Sistem Informasi Manajemen Perpustakaan BookRoom: katalog, sirkulasi, dan layanan anggota.',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${jakarta.variable} ${editorial.variable}`}>
      <body className="min-h-screen">{children}<Toaster /></body>
    </html>
  );
}
