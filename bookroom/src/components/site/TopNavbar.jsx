// Logo, menu dan area akun pada navbar
import Link from 'next/link';

import { LogoMark } from '@/components/ui/Icons';

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
    {
      href: '/pengumuman',
      label: 'Pengumuman',
      icon: 'megaphone',
    },
    {
      href: '/layanan',
      label: 'Layanan',
      icon: 'phone',
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
          guest={!user}
        />

        <div className={styles.actions}>
          {member && <NotificationBell initialUnread={unreadCount} />}

          {member ? (
            <ProfileMenu
              user={user}
              label={initials(user.full_name)}
              loanCount={loanCount}
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