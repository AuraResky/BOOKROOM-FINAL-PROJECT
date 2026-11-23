'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogoMark, IconLogout, IconRepeat, IconBooks, IconMegaphone, IconChart, IconUsers, IconTag, IconLog, IconBook, IconMenu, IconX, IconClock } from '@/components/ui/Icons';
import { logoutAction } from '@/app/actions/auth';

const ICONS = { repeat: IconRepeat, books: IconBooks, megaphone: IconMegaphone, chart: IconChart, users: IconUsers, tag: IconTag, log: IconLog, book: IconBook, clock: IconClock };
const STORAGE_KEY = 'bookverse:sidebar-collapsed';

function Tooltip({ show, children }) {
  if (!show) return null;
  return <span role="tooltip" className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-white/20 bg-navy-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100 lg:block">{children}</span>;
}

export default function Sidebar({ items, user, roleLabel, initials }) {
  const pathname = usePathname();
  const params=useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { try { setCollapsed(localStorage.getItem(STORAGE_KEY) === '1'); } catch {} }, []);
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const close = (event) => { if (event.key === 'Escape') setMobileOpen(false); };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', close);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', close); };
  }, [mobileOpen]);
  // Membuka atau menutup panel.
  function toggle() {
    if (window.matchMedia('(max-width: 1023px)').matches) { setMobileOpen(false); return; }
    setCollapsed((value) => { const next = !value; try { localStorage.setItem(STORAGE_KEY, next ? '1' : '0'); } catch {} return next; });
  }
  const isActive=(href)=>{const [base,search]=href.split('?');if(search)return pathname===base&&(base!=='/pegawai'||params.get('tab')===new URLSearchParams(search).get('tab'));return (base==='/pegawai'?pathname===base&&!params.get('tab'):base.split('/').length<=2?pathname===base:pathname.startsWith(base));};
  const hidden = collapsed ? 'lg:hidden' : '';
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-white px-4 lg:hidden">
        <button type="button" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-navy" aria-label="Buka navigasi" aria-expanded={mobileOpen} aria-controls="staff-sidebar"><IconMenu className="h-5 w-5" /></button>
        <span className="text-lg font-semibold text-navy">BookRoom</span><span className="ml-auto text-xs text-ink-muted">{roleLabel}</span>
      </div>
      {mobileOpen && <button type="button" className="fixed inset-0 z-40 bg-navy-900/50 lg:hidden" aria-label="Tutup navigasi" onClick={() => setMobileOpen(false)} />}
      <aside id="staff-sidebar" className={`fixed inset-y-0 left-0 z-50 flex w-[240px] shrink-0 flex-col border-r border-navy-600 bg-navy text-white transition-[width,transform] duration-200 lg:sticky lg:top-0 lg:h-screen lg:w-[var(--sidebar-width)] lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ '--sidebar-width': collapsed ? '72px' : '240px' }}>
        <button type="button" onClick={toggle} className="group relative flex h-[76px] shrink-0 items-center gap-3 border-b border-white/15 px-5 text-left hover:bg-white/5" aria-label={collapsed ? 'Buka sidebar' : 'Ciutkan sidebar'} aria-expanded={!collapsed} aria-controls="staff-menu-links" title={collapsed ? 'Buka sidebar' : 'Ciutkan sidebar'}>
          <LogoMark dark className="h-8 w-8 shrink-0 text-gold-light" />
          <span className={`min-w-0 ${hidden}`}><span className="block font-display text-2xl font-medium tracking-tight">BookRoom</span><span className="mt-1 block text-xs text-slate-200">{roleLabel}</span></span>
          <Tooltip show={collapsed}>Buka sidebar</Tooltip>
        </button>
        <button type="button" onClick={() => setMobileOpen(false)} className="absolute right-3 top-6 text-white lg:hidden" aria-label="Tutup navigasi"><IconX className="h-5 w-5" /></button>
        <nav id="staff-menu-links" className="flex-1 space-y-1 overflow-y-auto overflow-x-visible px-3 py-5" aria-label={`Navigasi ${roleLabel}`}>
          {items.map((item) => {
            const Icon = ICONS[item.icon] || IconBook;
            const active = isActive(item.href);
            return <Link key={item.href} href={item.href} aria-label={item.label} title={collapsed ? item.label : undefined} aria-current={active ? 'page' : undefined} onClick={() => setMobileOpen(false)} className={`group relative flex min-h-11 items-center gap-3 rounded-md border-l-2 px-3 text-sm font-medium transition ${active ? 'border-gold bg-white/10 text-white' : 'border-transparent text-slate-200 hover:bg-white/5 hover:text-white'}`}>
              <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-gold-light' : ''}`} />
              <span className={`min-w-0 truncate ${hidden}`}>{item.label}</span>
              {item.badge > 0 && <span className={`ml-auto rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-gold-light ${hidden}`}>{item.badge}</span>}
              <Tooltip show={collapsed}>{item.label}</Tooltip>
            </Link>;
          })}
        </nav>
        <div className="border-t border-white/15 p-3">
          <div className="flex items-center gap-3 px-1 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-xs font-semibold">{initials}</span>
            <span className={`min-w-0 ${hidden}`}><span className="block truncate text-sm font-medium">{user.full_name}</span><span className="mt-1 block truncate font-mono text-xs text-slate-200">{user.identity_number}</span></span>
          </div>
          <form action={logoutAction}><button type="submit" className="group relative flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-slate-200 hover:bg-white/10 hover:text-white" title={collapsed ? 'Keluar' : undefined} aria-label="Keluar"><IconLogout className="h-5 w-5 shrink-0" /><span className={hidden}>Keluar</span><Tooltip show={collapsed}>Keluar</Tooltip></button></form>
        </div>
      </aside>
    </>
  );
}
