// Kartu ringkasan pengumuman perpustakaan
import InteractiveSurface from '@/components/ui/InteractiveSurface';
import { formatDate } from '@/lib/format';
import { IconArrowRight, IconCalendar } from '@/components/ui/Icons';

export const ANN_TONE = {
  Operasional: { pill: 'bg-cream-100 text-navy', bar: 'bg-navy' },
  Layanan: { pill: 'bg-cream-100 text-navy', bar: 'bg-navy' },
  Acara: { pill: 'bg-cream-100 text-navy', bar: 'bg-navy' },
};

export default function AnnouncementCard({ item }) {
  const excerpt = item.content.replace(/\s+/g, ' ').slice(0, 140);
  const tone = ANN_TONE[item.category] || ANN_TONE.Layanan;
  return (
    <InteractiveSurface tilt={1.2} href={`/pengumuman/${item.id}`}
      className="interactive-announcement group relative flex flex-col overflow-hidden rounded-xl border border-line bg-cream-50 p-5 pt-6 shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-coral hover:shadow-lift">
      <span className={`absolute inset-x-0 top-0 h-px ${tone.bar}`} />
      <div className="flex items-center justify-between gap-2">
        <span className={`pill ${tone.pill}`}>{item.category}</span>
        <span className="flex items-center gap-1 font-mono text-xs text-ink-soft"><IconCalendar className="h-3.5 w-3.5" />{formatDate(item.release_date, { short: true })}</span>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug text-navy">{item.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{excerpt}{item.content.length > 140 ? '…' : ''}</p>
      <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-md border border-line px-3.5 py-1.5 text-xs font-bold text-navy transition group-hover:bg-navy group-hover:text-cream">
        Baca selengkapnya <IconArrowRight className="h-3.5 w-3.5" />
      </span>
    </InteractiveSurface>
  );
}
