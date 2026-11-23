// Halaman: detail pengumuman published
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { one } from '@/lib/db';
import { getPublishedAnnouncements } from '@/lib/queries';
import { formatDate } from '@/lib/format';
import { ANN_TONE } from '@/components/site/AnnouncementCard';
import { IconArrowLeft, IconCalendar } from '@/components/ui/Icons';

async function getAnnouncement(id) {
  if (!/^\d+$/.test(String(id))) return null;
  return one(
    `SELECT a.*, u.full_name AS author_name FROM v_pengumuman a LEFT JOIN v_pengguna u ON u.id = a.author_id
      WHERE a.id = $1 AND a.status = 'Published' AND a.release_date <= CURRENT_DATE`,
    [id]
  );
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const a = await getAnnouncement(id);
  return { title: a?.title || 'Pengumuman' };
}

export default async function AnnouncementDetail({ params }) {
  const { id } = await params;
  const item = await getAnnouncement(id);
  if (!item) notFound();
  const others = (await getPublishedAnnouncements(4)).filter((a) => a.id !== item.id).slice(0, 3);
  const tone = ANN_TONE[item.category] || ANN_TONE.Layanan;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
      <Link href="/pengumuman" className="btn-outline btn-sm">
        <IconArrowLeft className="h-4 w-4" /> Semua pengumuman
      </Link>
      <article className="card mt-6 overflow-hidden">
        <div className="relative overflow-hidden border-b-[1.5px] border-navy bg-navy px-8 py-10 text-cream">
          
          
          
          
          <div className="relative max-w-2xl">
            <span className={`pill border border-navy ${tone.pill}`}>{item.category}</span>
            <h1 className="display mt-4 text-3xl leading-tight !text-cream sm:text-4xl">{item.title}</h1>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-cream/75">
              <IconCalendar className="h-4 w-4" /> <span className="font-mono">{formatDate(item.release_date)}</span>
              {item.author_name && <span>· {item.author_name}</span>}
            </p>
          </div>
        </div>
        <div className="whitespace-pre-line px-8 py-8 text-[15px] leading-relaxed text-ink">{item.content}</div>
      </article>
      {others.length > 0 && (
        <aside className="mt-10">
          <h2 className="display text-2xl">Pengumuman lainnya</h2>
          <ul className="card mt-4 divide-y divide-line overflow-hidden">
            {others.map((o) => (
              <li key={o.id}>
                <Link href={`/pengumuman/${o.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-canvas/60">
                  <span className="text-sm font-semibold text-navy">{o.title}</span>
                  <span className="shrink-0 font-mono text-xs text-ink-soft">{formatDate(o.release_date, { short: true })}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
