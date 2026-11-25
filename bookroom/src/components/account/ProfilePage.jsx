import { formatDate, formatRupiah, initials, ROLE_LABEL } from '@/lib/format';
import ProfileForm from './ProfileForm';
import { Badge, Mono } from '@/components/ui/Badges';

export default function ProfilePage({ user, standing }) {
  const blocked = standing?.outstanding_fine > 0;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="grid gap-6 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
        <aside className="card relative h-fit">
          <div className="relative h-24 rounded-t-xl border-b border-navy bg-navy" />
          <div className="relative -mt-11 px-6 pb-6 text-center">
            <span className="relative z-10 mx-auto flex h-[88px] w-[88px] items-center justify-center rounded-full border-[3px] border-navy bg-coral font-display text-3xl font-bold text-white ring-4 ring-cream-50">
              {initials(user.full_name)}
            </span>
            <h1 className="display mt-3 break-words text-2xl">{user.full_name}</h1>
            <p className="break-words text-xs text-ink-muted">{standing ? user.study_program : ROLE_LABEL[user.role]}</p>
            <Mono className="mt-1 block text-ink-soft">{standing ? 'NIM' : 'NIP / Identitas'} {user.identity_number}</Mono>
            <div className="mt-4 flex justify-center">
              {blocked ? <Badge tone="red">Peminjaman diblokir</Badge> : <Badge tone="green">{standing ? 'Anggota aktif' : 'Akun aktif'}</Badge>}
            </div>
            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-left text-sm">
              <div className="flex justify-between"><dt className="text-ink-muted">Bergabung</dt><dd className="font-mono text-xs font-semibold text-navy">{formatDate(user.created_at, { short: true })}</dd></div>
              {standing && (<>
                <div className="flex justify-between"><dt className="text-ink-muted">Pinjaman aktif</dt><dd className="font-mono font-semibold text-navy">{standing.active_count}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-muted">Total selesai</dt><dd className="font-mono font-semibold text-navy">{standing.finished_count}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-muted">Denda tertunggak</dt><dd className={`font-mono font-semibold ${blocked ? 'text-danger' : 'text-navy'}`}>{formatRupiah(standing.outstanding_fine)}</dd></div>
              </>)}
            </dl>
          </div>
        </aside>
        <section className="card min-w-0 p-4 sm:p-6">
          <h2 className="display text-3xl">Profil {ROLE_LABEL[user.role]}</h2>
          <p className="mb-6 text-sm text-ink-muted">Perbarui informasi pribadi dan kata sandi akun perpustakaan Anda.</p>
          <ProfileForm user={user} />
        </section>
      </div>
    </div>
  );
}
