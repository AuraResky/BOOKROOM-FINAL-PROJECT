// Kerangka halaman: layout publik dan api pencarian
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


      <footer className="mt-10 border-t border-gold/30 bg-navy">
        <div className="mx-auto max-w-7xl px-6 py-7">
<div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-center md:gap-12 md:text-left">
            <div>
              <Wordmark />
              <p className="mt-2 text-xs tracking-wide text-cream/60">
                Ruang membaca, tempat bertumbuh.
              </p>
            </div>
            <div className="max-w-md md:border-l-2 md:border-gold/60 md:pl-6">
              <p className="text-lg font-medium leading-7 text-cream">
                Satu halaman hari ini,
                <span className="block text-gold-light">
                  selangkah lebih jauh esok hari.
                </span>
              </p>
            </div>
          </div>
          <div className="mt-5 border-t border-white/10 pt-4 text-center text-xs text-cream/45">
            © {new Date().getFullYear()} BookRoom
          </div>
        </div>
      </footer>
    </div>
  );
}
