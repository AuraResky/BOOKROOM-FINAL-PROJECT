// Kerangka dashboard, judul halaman dan kartu statistik
import Sidebar from './Sidebar';
import { initials, ROLE_LABEL } from '@/lib/format';

export default function StaffShell({ user, items, children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar items={items} user={user} roleLabel={ROLE_LABEL[user.role]} initials={initials(user.full_name)} />
      <div className="min-w-0 flex-1 pt-16 lg:pt-0">
        <div className="mx-auto max-w-[1320px] px-4 py-7 sm:px-8">{children}</div>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-5 border-b border-line pb-6">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="display mt-2 text-3xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon, tone = 'navy' }) {
  const semantic = tone === 'red' ? 'text-danger bg-danger/5' : 'text-navy bg-cream-100';
  return (
    <div className="card flex min-w-0 flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-6 text-ink-muted">{label}</p>
        {Icon && <span className={`rounded-lg p-2 ${semantic}`}><Icon className="h-5 w-5 shrink-0" /></span>}
      </div>
      <p className="break-words font-mono text-2xl font-medium leading-tight text-navy">{value}</p>
      {hint && <p className="text-xs leading-5 text-ink-muted">{hint}</p>}
    </div>
  );
}
