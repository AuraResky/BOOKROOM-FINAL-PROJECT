// Kerangka halaman: layout publik dan api pencarian
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { one } from '@/lib/db';
import TopNavbar, { Wordmark } from '@/components/site/TopNavbar';
import { generateDueReminders, countUnread } from '@/lib/notifications';

export default async function SiteLayout({ children }) {
  const user = await getCurrentUser();
  const isStudent = user?.role === 'mahasiswa';
  if (isStudent) await generateDueReminders(user.id);
  const [count, unread] = isStudent
    ? await Promise.all([
        one("SELECT COUNT(*)::int AS n FROM v_peminjaman WHERE user_id=$1 AND status NOT IN ('Selesai','Ditolak')", [user.id]),
        countUnread(user.id),
      ])
    : [{ n: 0 }, 0];
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <TopNavbar user={user} loanCount={count.n} unreadCount={unread} />
      <main className="flex-1">{children}</main>

      <footer className="relative mt-20">
        <div className="relative bg-navy text-cream">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <Wordmark />
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/70">
                UPT Perpustakaan Universitas Nusantara Raya. Gedung Pusat Sumber Belajar Lt. 1–3,
                Jl. Perintis Kemerdekaan Km. 10, Makassar.
              </p>
            </div>
            <div className="text-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sun">Jam Layanan</p>
              <p className="text-cream/75">Senin–Jumat · <span className="font-mono">07.30–21.00</span> WITA</p>
              <p className="text-cream/75">Sabtu · <span className="font-mono">08.00–16.00</span> WITA</p>
              <p className="text-cream/75">Minggu & libur nasional · Tutup</p>
            </div>
            <div className="text-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sun">Tautan</p>
              <ul className="space-y-1.5 text-cream/75">
                <li><Link href="/katalog" className="hover:text-sun">Katalog Buku</Link></li>
                <li><Link href="/layanan" className="hover:text-sun">Informasi Layanan</Link></li>
                <li><Link href="/pengumuman" className="hover:text-sun">Pengumuman</Link></li>
                {!user && <li><Link href="/login" className="hover:text-sun">Masuk Anggota</Link></li>}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
