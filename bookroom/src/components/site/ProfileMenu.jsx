'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconChevron, IconRepeat, IconUser, IconLogout } from '@/components/ui/Icons';
import { logoutAction } from '@/app/actions/auth';
import styles from './Navbar.module.css';

const itemClassName = 'flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-navy';

export default function ProfileMenu(props) {
  const pathname = usePathname();

  return <AccountDropdown key={pathname} pathname={pathname} {...props} />;
}

function AccountDropdown({ user, label, loanCount = 0, pathname }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event) {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('pointerdown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative inline-flex shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={styles.profile}
        aria-label="Menu akun"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
      >
        <span className={styles.avatar}>{label}</span>
        <IconChevron className={styles.chevron} />
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute top-full right-0 z-50 mt-2 w-60 max-w-[calc(100vw-4.5rem)] rounded-xl border border-cream-300 bg-white p-1.5 text-navy shadow-xl"
        >
          <div className="mb-1 grid gap-0.5 rounded-lg bg-canvas px-3 py-2.5">
            <strong className="truncate text-sm" title={user.full_name}>{user.full_name}</strong>
            {user.email && (
              <small className="truncate text-xs text-ink-muted" title={user.email}>{user.email}</small>
            )}
          </div>

          <Link
            href="/mahasiswa"
            aria-current={pathname === '/mahasiswa' ? 'page' : undefined}
            onClick={() => setOpen(false)}
            className={`${itemClassName} hover:bg-cream-200 aria-[current=page]:bg-cream-300`}
          >
            <IconRepeat className="size-[18px] shrink-0" />
            <span>Pinjaman Saya</span>
            {loanCount > 0 && (
              <span className={styles.badge} aria-label={`${loanCount} pinjaman aktif`}>
                {loanCount}
              </span>
            )}
          </Link>

          <Link
            href="/mahasiswa/profil"
            aria-current={pathname === '/mahasiswa/profil' ? 'page' : undefined}
            onClick={() => setOpen(false)}
            className={`${itemClassName} hover:bg-cream-200 aria-[current=page]:bg-cream-300`}
          >
            <IconUser className="size-[18px] shrink-0" />
            <span>Profil</span>
          </Link>

          <form action={logoutAction} className="mt-1 border-t border-cream-300 pt-1">
            <button type="submit" className={`${itemClassName} cursor-pointer text-danger hover:bg-red-50`}>
              <IconLogout className="size-[18px] shrink-0" />
              <span>Keluar akun</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
