'use client';

import Link from 'next/link';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import {
  IconHome,
  IconBook,
  IconMegaphone,
  IconBell,
  IconMenu,
  IconX,
  IconUser,
} from '@/components/ui/Icons';
import styles from './Navbar.module.css';

const ICONS = {
  home: IconHome,
  book: IconBook,
  megaphone: IconMegaphone,
  bell: IconBell,
  user: IconUser,
};

export default function NavLinks({
  links,
  guest = false,
}) {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  const trigger = useRef(null);
  const container = useRef(null);
  const desktop = useRef(null);

  const mobileLinks = [
    ...links,
    ...(guest
      ? [
          { href: '/login', label: 'Masuk', icon: 'user' },
          { href: '/register', label: 'Daftar', icon: 'user' },
        ]
      : []),
  ];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useLayoutEffect(() => {
    const inner = container.current.parentElement;
    const brand = inner.firstElementChild;
    const actions = inner.lastElementChild;

    let frame = 0;
    let disposed = false;

    function measure() {
      const css = getComputedStyle(inner);

      const sideWidth = Math.max(
        brand.getBoundingClientRect().width,
        actions.getBoundingClientRect().width
      );
      const available =
        inner.clientWidth -
        parseFloat(css.paddingLeft) -
        parseFloat(css.paddingRight) -
        2 * sideWidth -
        2 * (parseFloat(css.columnGap) || 0);

      const smallScreen = window.matchMedia(
        '(max-width: 639px)'
      ).matches;

      setCompact(
        smallScreen || desktop.current.scrollWidth > available
      );
    }

    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }

    const observer = new ResizeObserver(schedule);

    [inner, brand, actions, desktop.current].forEach((element) => {
      observer.observe(element);
    });

    window.addEventListener('resize', schedule);

    document.fonts.ready.then(() => {
      if (!disposed) schedule();
    });

    measure();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, []);

  useEffect(() => {
    if (!compact) setOpen(false);
  }, [compact]);


  useEffect(() => {
    if (!open || !compact) return;

    const body = document.body;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previousBodyOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [open, compact]);

  useEffect(() => {
    if (!open) return;

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    }

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  function active(href) {
    return href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(href + '/');
  }

  // Tautan menu
  function renderLink(link, mobile = false) {
    const Icon = ICONS[link.icon] || IconBook;
    const isActive = active(link.href);

    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={() => setOpen(false)}
        aria-current={isActive ? 'page' : undefined}
        className={[
          styles.link,
          mobile ? styles.mobileLink : '',
          isActive ? styles.active : '',
        ].join(' ')}
      >
        <Icon className={styles.icon} />
        <span>{link.label}</span>
      </Link>
    );
  }

  return (
    <div
      ref={container}
      className={styles.navigation}
      data-compact={compact}
    >
      <nav
        ref={desktop}
        className={styles.desktop}
        aria-label="Navigasi utama"
        aria-hidden={compact || undefined}
      >
        {links.map((link) => renderLink(link))}
      </nav>

      <button
        ref={trigger}
        type="button"
        className={styles.toggle}
        aria-label={open ? 'Tutup menu' : 'Buka menu'}
        aria-expanded={open}
        aria-controls="bookroom-mobile-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? (
          <IconX className={styles.menuIcon} />
        ) : (
          <IconMenu className={styles.menuIcon} />
        )}
      </button>

      {open &&
        compact &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            <button
              type="button"
              className={styles.backdrop}
              aria-label="Tutup menu navigasi"
              onClick={() => setOpen(false)}
            />

            <nav
              id="bookroom-mobile-menu"
              className={styles.mobile}
              aria-label="Navigasi seluler"
            >
              {mobileLinks.map((link) => renderLink(link, true))}
            </nav>
          </>,
          document.body
        )}
    </div>
  );
}