// Logo, menu dan area akun pada navbar
import Link from 'next/link';

import {
  LogoMark,
  IconSearch,
} from '@/components/ui/Icons';

import { initials } from '@/lib/format';
import NavLinks from './NavLinks';
import ProfileMenu from './ProfileMenu';
import NotificationBell from '@/components/student/NotificationBell';
import styles from './Navbar.module.css';

export function Wordmark({ dark = true }) {
  return (
    <span
      className={styles.wordmark}
      style={{ color: dark ? '#FFFFFF' : '#1A365D' }}
    >
      <LogoMark
        dark={dark}
        className={styles.logo}
      />

      <span>BookRoom</span>
    </span>
  );
}

export default function TopNavbar({
  user,
  loanCount = 0,
  unreadCount = 0,
}) {
  const member = user?.role === 'mahasiswa';

  const links = [
    {
      href: '/',
      label: 'Beranda',
      icon: 'home',
    },
    {
      href: '/katalog',
      label: 'Katalog Buku',
      icon: 'book',
    },
    ...(member
      ? [
          {
            href: '/mahasiswa',
            label: 'Pinjaman Saya',
            icon: 'repeat',
            badge: loanCount,
          },
        ]
      : []),
    {
      href: '/pengumuman',
      label: 'Pengumuman',
      icon: 'megaphone',
    },
    {
      href: '/layanan',
      label: 'Layanan',
      icon: 'bell',
    },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link
          href="/"
          className={styles.brand}
          aria-label="BookRoom — Beranda"
        >
          <Wordmark />
        </Link>

        <NavLinks
          links={links}
          member={member}
          guest={!user}
        />

        <div className={styles.actions}>
          <form
            action="/katalog"
            className={styles.search}
            role="search"
          >
            <IconSearch className={styles.icon} />

            <input
              name="q"
              aria-label="Cari katalog buku"
              placeholder="Cari judul, penulis, atau ISBN…"
            />
          </form>

          {member && <NotificationBell initialUnread={unreadCount} />}

          {member ? (
            <ProfileMenu
              user={user}
              label={initials(user.full_name)}
            />
          ) : (
            <>
              <Link
                href="/login"
                className={styles.login}
              >
                Masuk
              </Link>

              <Link
                href="/register"
                className={styles.signup}
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}