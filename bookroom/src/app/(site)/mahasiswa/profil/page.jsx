// form dan halaman profil mahasiswa
import { requireRole } from '@/lib/auth';
import { getStudentStanding } from '@/lib/queries';
import { formatDate, formatRupiah, initials } from '@/lib/format';
import { logoutAction } from '@/app/actions/auth';
import ProfileForm from '@/components/student/ProfileForm';
import { Badge, Mono } from '@/components/ui/Badges';
import { IconLogout } from '@/components/ui/Icons';

export const metadata = { title: 'Profil Mahasiswa' };

export default async function ProfilePage() {
  const user = await requireRole('mahasiswa');
  const standing = await getStudentStanding(user.id);
  const blocked = standing.outstanding_fine > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <aside className="card relative h-fit">
          <div className="relative h-24 rounded-t-xl border-b border-navy bg-navy">
            
          </div>
          <div className="relative -mt-11 px-6 pb-6 text-center">
            <span className="relative z-10 mx-auto flex h-[88px] w-[88px] items-center justify-center rounded-full border-[3px] border-navy bg-coral font-display text-3xl font-bold text-white ring-4 ring-cream-50">
              {initials(user.full_name)}
            </span>
            <h1 className="display mt-3 text-2xl">{user.full_name}</h1>
            <p className="text-xs text-ink-muted">{user.study_program}</p>
            <Mono className="mt-1 block text-ink-soft">NIM {user.identity_number}</Mono>
            <div className="mt-4 flex justify-center">
              {blocked ? <Badge tone="red">Peminjaman diblokir</Badge> : <Badge tone="green">Anggota aktif</Badge>}
            </div>
            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-left text-sm">
              <div className="flex justify-between"><dt className="text-ink-muted">Bergabung</dt><dd className="font-mono text-xs font-semibold text-navy">{formatDate(user.created_at, { short: true })}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">Pinjaman aktif</dt><dd className="font-mono font-semibold text-navy">{standing.active_count}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">Total selesai</dt><dd className="font-mono font-semibold text-navy">{standing.finished_count}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">Denda tertunggak</dt><dd className={`font-mono font-semibold ${blocked ? 'text-danger' : 'text-navy'}`}>{formatRupiah(standing.outstanding_fine)}</dd></div>
            </dl>
            <form action={logoutAction} className="mt-5">
              <button type="submit" className="btn-outline w-full text-danger hover:border-danger hover:text-danger">
                <IconLogout className="h-4 w-4" /> Keluar
              </button>
            </form>
          </div>
        </aside>
        <section className="card p-6">
          <h2 className="display text-3xl">Profil Mahasiswa</h2>
          <p className="mb-6 text-sm text-ink-muted">Perbarui data kontak dan kata sandi akun perpustakaan Anda.</p>
          <ProfileForm user={user} />
        </section>
      </div>
    </div>
  );
}
