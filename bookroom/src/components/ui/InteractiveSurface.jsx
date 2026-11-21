'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

// Kartu atau tautan dengan efek interaktif
export default function InteractiveSurface({
  href,
  children,
  className = '',
  tilt = 2.2,
  style,
  ...props
}) {
  const ref = useRef(null);
  const frame = useRef(0);

  // Membersihkan frame animasi
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // Efek miring mengikuti mouse
  function move(event) {
    if (
      event.pointerType !== 'mouse' ||
      !window.matchMedia(
        '(hover: hover) and (prefers-reduced-motion: no-preference)'
      ).matches
    ) return;

    const element = ref.current;
    if (!element) return;

    const bounds = element.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(1, (event.clientX - bounds.left) / bounds.width)
    );
    const y = Math.max(
      0,
      Math.min(1, (event.clientY - bounds.top) / bounds.height)
    );

    cancelAnimationFrame(frame.current);

    frame.current = requestAnimationFrame(() => {
      element.style.setProperty('--pointer-x', `${x * 100}%`);
      element.style.setProperty('--pointer-y', `${y * 100}%`);
      element.style.setProperty('--tilt-x', `${(0.5 - y) * tilt}deg`);
      element.style.setProperty('--tilt-y', `${(x - 0.5) * tilt}deg`);
    });
  }

  // Mengembalikan posisi kartu
  function reset() {
    cancelAnimationFrame(frame.current);
    ref.current?.style.setProperty('--tilt-x', '0deg');
    ref.current?.style.setProperty('--tilt-y', '0deg');
  }

  // Properti bersama untuk kartu dan tautan
  const shared = {
    ...props,
    ref,
    style,
    className: `interactive-surface ${className}`,
    onPointerMove: move,
    onPointerLeave: reset,
    onPointerCancel: reset,
  };

  return href ? (
    <Link href={href} {...shared}>
      {children}
    </Link>
  ) : (
    <div {...shared}>{children}</div>
  );
}