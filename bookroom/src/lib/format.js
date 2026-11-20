const TZ = process.env.APP_TIMEZONE || process.env.NEXT_PUBLIC_APP_TIMEZONE || 'Asia/Makassar';
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function formatRupiah(n) {
  return 'Rp' + Number(n || 0).toLocaleString('id-ID');
}

export function formatDate(value, { short = false } = {}) {
  if (!value) return '—';
  let y, m, d;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    [y, m, d] = value.split('-').map(Number);
  } else {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
      .format(new Date(value)).split('-').map(Number);
    [y, m, d] = parts;
  }
  return `${d} ${(short ? BULAN_PENDEK : BULAN)[m - 1]} ${y}`;
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  const time = new Intl.DateTimeFormat('id-ID', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(date);
  return `${formatDate(date, { short: true })}, ${time}`;
}

export function timeAgo(value) {
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  if (diff < 60) return 'baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} hari lalu`;
  return formatDate(value, { short: true });
}

export function initials(name = '') {
  const parts = name.replace(/^(dr|prof|ir)\.?\s+/i, '').split(/[\s,]+/).filter((p) => p && !/\./.test(p));
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'BV';
}

export const ACTIVE_STATUSES = ['Dipinjam', 'Perpanjangan Diajukan', 'Perpanjangan Disetujui', 'Perpanjangan Ditolak'];

export const ROLE_LABEL = { admin: 'Admin', pegawai: 'Pegawai Perpustakaan', mahasiswa: 'Mahasiswa' };
