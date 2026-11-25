// Label kecil untuk informasi detail buku
import { IconCheck, IconBook } from '@/components/ui/Icons';

export function CategoryPill({ name, className = '' }) {
  return <span className={`pill bg-cream-100 text-ink-muted ${className}`}>{name}</span>;
}
export function AvailabilityPill({ stock, className = '' }) {
  return stock > 0 ? (
    <span className={`pill border-ok/15 bg-ok/5 text-emerald-800 ${className}`}><IconCheck className="h-3.5 w-3.5" /> Tersedia</span>
  ) : (
    <span className={`pill border-warn/15 bg-warn/5 text-amber-800 ${className}`}><IconBook className="h-3.5 w-3.5" /> Dipinjam</span>
  );
}
