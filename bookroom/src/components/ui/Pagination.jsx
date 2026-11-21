import Link from 'next/link';
import { IconArrowLeft, IconArrowRight } from './Icons';

// Menentukan nomor halaman dan tanda titik-titik
function pagesToShow(page, pages) {
  const set = new Set([1, pages, page, page - 1, page + 1]);

  if (page <= 3) {
    [2, 3, 4, 5].forEach((p) => set.add(p));
  }

  if (page >= pages - 2) {
    [pages - 1, pages - 2, pages - 3].forEach((p) => set.add(p));
  }

  const list = [...set]
    .filter((p) => p >= 1 && p <= pages)
    .sort((a, b) => a - b);

  const out = [];

  list.forEach((p, i) => {
    if (i && p - list[i - 1] > 1) out.push('…' + p);
    out.push(p);
  });

  return out;
}

// Navigasi perpindahan halaman
export default function Pagination({ page, pages, href }) {
  // Sembunyikan navigasi jika hanya satu halaman
  if (pages <= 1) return null;

  // Gaya tombol halaman
  const btn =
    'flex h-11 min-w-11 items-center justify-center rounded-lg border border-navy px-3 font-mono text-sm font-bold transition';

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Halaman"
    >
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          className={`${btn} gap-2 bg-cream-50 px-5 font-sans text-navy hover:-translate-y-0.5 hover:shadow-retro-sm`}
        >
          <IconArrowLeft className="h-4 w-4" />
          Sebelumnya
        </Link>
      ) : (
        <span
          className={`${btn} gap-2 px-5 font-sans text-ink-soft opacity-50`}
        >
          <IconArrowLeft className="h-4 w-4" />
          Sebelumnya
        </span>
      )}

      {pagesToShow(page, pages).map((p) =>
        typeof p === 'string' ? (
          <span key={p} className="px-1 font-bold text-ink-muted">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`${btn} ${
              p === page
                ? 'bg-coral text-white shadow-retro-sm'
                : 'bg-cream-50 text-navy hover:-translate-y-0.5 hover:shadow-retro-sm'
            }`}
          >
            {p.toLocaleString('id-ID')}
          </Link>
        )
      )}

      {page < pages ? (
        <Link
          href={href(page + 1)}
          className={`${btn} gap-2 bg-cream-50 px-5 font-sans text-navy hover:-translate-y-0.5 hover:shadow-retro-sm`}
        >
          Berikutnya
          <IconArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <span
          className={`${btn} gap-2 px-5 font-sans text-ink-soft opacity-50`}
        >
          Berikutnya
          <IconArrowRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}