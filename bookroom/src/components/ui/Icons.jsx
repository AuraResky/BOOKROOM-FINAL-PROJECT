// Ikon garis sederhana (stroke 1.8) — tanpa dependensi eksternal.
function Base({ children, className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round" className={className} aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export const IconSearch = (p) => <Base {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Base>;
export const IconBell = (p) => <Base {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></Base>;
export const IconEye = (p) => <Base {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></Base>;
export const IconEyeOff = (p) => <Base {...p}><path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 8 10 8a17.6 17.6 0 0 1-2.16 3.19" /><path d="M6.6 6.6A17.4 17.4 0 0 0 2 12s3.5 8 10 8a9.7 9.7 0 0 0 5.4-1.6" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><path d="m2 2 20 20" /></Base>;
export const IconBook = (p) => <Base {...p}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></Base>;
export const IconBooks = (p) => <Base {...p}><path d="M4 4h4v16H4z" /><path d="M9 4h4v16H9z" /><path d="m14.5 5 3.9-1 3.1 15.5-3.9 1z" /></Base>;
export const IconMegaphone = (p) => <Base {...p}><path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></Base>;
export const IconRepeat = (p) => <Base {...p}><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></Base>;
export const IconUsers = (p) => <Base {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Base>;
export const IconTag = (p) => <Base {...p}><path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z" /><circle cx="7.5" cy="7.5" r="1" /></Base>;
export const IconChart = (p) => <Base {...p}><path d="M3 3v18h18" /><path d="M7 16V11" /><path d="M12 16V7" /><path d="M17 16v-3" /></Base>;
export const IconLog = (p) => <Base {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h5" /></Base>;
export const IconLogout = (p) => <Base {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></Base>;
export const IconPlus = (p) => <Base {...p}><path d="M12 5v14M5 12h14" /></Base>;
export const IconEdit = (p) => <Base {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></Base>;
export const IconTrash = (p) => <Base {...p}><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></Base>;
export const IconX = (p) => <Base {...p}><path d="M18 6 6 18M6 6l12 12" /></Base>;
export const IconCheck = (p) => <Base {...p}><path d="M20 6 9 17l-5-5" /></Base>;
export const IconClock = (p) => <Base {...p}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></Base>;
export const IconAlert = (p) => <Base {...p}><path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z" /><path d="M12 9v4M12 17h.01" /></Base>;
export const IconWallet = (p) => <Base {...p}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></Base>;
export const IconArrowRight = (p) => <Base {...p}><path d="M5 12h14M12 5l7 7-7 7" /></Base>;
export const IconArrowLeft = (p) => <Base {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></Base>;
export const IconInbox = (p) => <Base {...p}><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></Base>;
export const IconCalendar = (p) => <Base {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></Base>;
export const IconMenu = (p) => <Base {...p}><path d="M4 6h16M4 12h16M4 18h16" /></Base>;
export const IconUser = (p) => <Base {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Base>;

export function IconStar({ filled = true, className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="m12 2.8 2.85 5.78 6.37.93-4.61 4.49 1.09 6.35L12 17.35l-5.7 3 1.09-6.35-4.61-4.49 6.37-.93z" />
    </svg>
  );
}

//Buku terbuka sebagai identitas utama.
export function LogoMark({ className = 'h-9 w-9', dark = false }) {
  return <svg viewBox="0 0 50 50" fill="none" className={className} aria-hidden="true"><rect x="10" y="9" width="13" height="35" rx="6.5" transform="rotate(17 16.5 26.5)" stroke={'#C69B3D'} strokeWidth="3.4" /><rect x="29" y="5" width="13" height="35" rx="6.5" stroke={dark ? '#F4F3EF' : '#1A365D'} strokeWidth="3.4" /></svg>;
}

export const IconHome = (p) => <Base {...p}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></Base>;
export const IconInfo = (p) => <Base {...p}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></Base>;
export const IconChevron = (p) => <Base {...p}><path d="m6 9 6 6 6-6" /></Base>;
export const IconGrid = (p) => <Base {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></Base>;
export const IconList = (p) => <Base {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></Base>;
export const IconLayers = (p) => <Base {...p}><path d="m12 2 10 5-10 5L2 7z" /><path d="m2 12 10 5 10-5" /><path d="m2 17 10 5 10-5" /></Base>;
export const IconSort = (p) => <Base {...p}><path d="M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4" /></Base>;
export const IconPhone = (p) => <Base {...p}><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z" /></Base>;
export const IconChat = (p) => <Base {...p}><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></Base>;
export const IconIdCard = (p) => <Base {...p}><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="8" cy="12" r="2.5" /><path d="M14 10h5M14 14h4" /></Base>;
export const IconLamp = (p) => <Base {...p}><path d="M8 2h8l3 8H5z" /><path d="M12 10v8M8 22h8" /></Base>;
