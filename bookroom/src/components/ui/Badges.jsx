import { IconStar } from './Icons';

const TONES = {
  green: 'bg-ok/10 text-emerald-700 ring-ok/30',
  amber: 'bg-warn/10 text-amber-700 ring-warn/30',
  red: 'bg-danger/10 text-red-700 ring-danger/30',
  navy: 'bg-navy/5 text-navy ring-navy/15',
  gold: 'bg-sun-soft text-[#8A6410] ring-gold/40',
  gray: 'bg-stone-100 text-stone-600 ring-stone-300',
};

const STATUS_TONE = {
  'Menunggu Konfirmasi': 'amber',
  'Perpanjangan Diajukan': 'amber',
  'Dipinjam': 'navy',
  'Perpanjangan Disetujui': 'green',
  'Perpanjangan Ditolak': 'red',
  Ditolak: 'red',
  Selesai: 'green',
  Tertunggak: 'red',
  Lunas: 'green',
  Published: 'green',
  Draft: 'gray',
  Aktif: 'green',
  Nonaktif: 'red',
  Tersedia: 'green',
  Habis: 'red',
  
  // Status reservasi
  Menunggu: 'amber',
  'Siap Diambil': 'green',
  Dipenuhi: 'navy',
  Dibatalkan: 'gray',
  Kedaluwarsa: 'red',
};

export function Badge({ children, tone = 'navy', dot = true, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${TONES[tone]} ${className}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }) {
  return <Badge tone={STATUS_TONE[status] || 'gray'} className={className}>{status}</Badge>;
}

export function StockBadge({ stock }) {
  return stock > 0
    ? <Badge tone="green">Tersedia · {stock}</Badge>
    : <Badge tone="red">Stok habis</Badge>;
}

export function Stars({ value = 0, size = 'h-4 w-4', showValue = false, count }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex text-gold" aria-label={`Rating ${value} dari 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <IconStar key={i} filled={i <= rounded} className={`${size} ${i <= rounded ? '' : 'text-gold/40'}`} />
        ))}
      </span>
      {showValue && (
        <span className="text-xs font-semibold text-ink-muted">
          {value ? Number(value).toFixed(1) : 'Belum ada'}{count != null && ` (${count})`}
        </span>
      )}
    </span>
  );
}

export function Mono({ children, className = '' }) {
  return <span className={`font-mono text-[12px] tracking-tight ${className}`}>{children}</span>;
}
