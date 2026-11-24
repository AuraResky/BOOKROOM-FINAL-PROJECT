'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconChevron, IconUser, IconLogout } from '@/components/ui/Icons';
import { logoutAction } from '@/app/actions/auth';
import styles from './Navbar.module.css';

export default function ProfileMenu({ user, label }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={styles.profile}
        aria-label="Menu akun"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className={styles.avatar}>{label}</span>
        <IconChevron
          className={`${styles.chevron} transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 overflow-hidden rounded-xl border border-[#e2ded5] bg-white p-1.5 text-[#153454] shadow-xl"
        >
          {user?.full_name && (
            <div className="mb-1 border-b border-[#ece9e1] px-3 py-2.5 text-left">
              <p className="truncate text-xs font-bold text-[#153454]">
                {user.full_name}
              </p>
              {user.email && (
                <p className="mt-0.5 truncate text-[11px] font-normal text-slate-500">
                  {user.email}
                </p>
              )}
            </div>
          )}

          <Link
            href="/mahasiswa/profil"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#153454] transition hover:bg-[#f4f3ef]"
          >
            <IconUser className="h-4 w-4 shrink-0" />
            <span>Profil</span>
          </Link>

          <form action={logoutAction} className="w-full">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50"
            >
              <IconLogout className="h-4 w-4 shrink-0" />
              <span>Keluar</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}