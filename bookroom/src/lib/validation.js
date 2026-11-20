export const str = (fd, key) => String(fd.get(key) ?? '').trim();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function campusDomain() {
  return (process.env.CAMPUS_EMAIL_DOMAIN || 'unhas.ac.id')
    .trim()
    .toLowerCase();
}

export function validateEmail(email, { campus = false } = {}) {
  if (!email) return 'Email wajib diisi.';
  if (!EMAIL_RE.test(email)) return 'Format email tidak valid.';
  if (campus && !email.toLowerCase().endsWith('@' + campusDomain())) {
    return `Gunakan email kampus dengan domain @${campusDomain()}.`;
  }
  return null;
}

export function validatePassword(pw, { required = true } = {}) {
  if (!pw) return required ? 'Kata sandi wajib diisi.' : null;
  if (pw.length > 128) return 'Kata sandi maksimal 128 karakter.';
  if (pw.length < 8) return 'Kata sandi minimal 8 karakter.';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Kata sandi harus memuat huruf dan angka.';
  return null;
}

export function normalizeIsbn(raw) {
  return String(raw || '').replace(/[-\s]/g, '').toUpperCase();
}
export function validateIsbn(isbn) {
  if (!isbn) return 'ISBN wajib diisi.';
  if (/^\d{13}$/.test(isbn)) {
    const sum = [...isbn].reduce((acc, ch, i) => acc + Number(ch) * (i % 2 ? 3 : 1), 0);
    return sum % 10 === 0 ? null : 'Digit pemeriksa ISBN-13 tidak valid.';
  }
  if (/^\d{9}[\dX]$/.test(isbn)) {
    const sum = [...isbn].reduce((acc, ch, i) => acc + (ch === 'X' ? 10 : Number(ch)) * (10 - i), 0);
    return sum % 11 === 0 ? null : 'Digit pemeriksa ISBN-10 tidak valid.';
  }
  return 'ISBN harus 10 atau 13 digit angka.';
}

export function intField(value, { label, min, max, required = true }) {
  if (value === '' || value == null) return { error: required ? `${label} wajib diisi.` : null, value: null };
  if (!/^-?\d+$/.test(String(value))) return { error: `${label} harus berupa bilangan bulat.`, value: null };
  const n = Number(value);
  if (min != null && n < min) return { error: `${label} minimal ${min}.`, value: n };
  if (max != null && n > max) return { error: `${label} maksimal ${max}.`, value: n };
  return { error: null, value: n };
}

export function isValidUrl(u) {
  try {
    const url = new URL(u);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}

export function fail(message, errors = {}) {
  return { ok: false, message, errors };
}
export function success(message, extra = {}) {
  return { ok: true, message, ...extra };
}
