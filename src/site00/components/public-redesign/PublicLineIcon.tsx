import type { ReactNode } from 'react';
import type { IdentityOptionIconId } from '../../config/idnty-public-redesign';

/**
 * Simple live-SVG line icons for the public redesign working surfaces.
 * 32×32 grid, 1.4 stroke. Complex bespoke icons are Grok's later job; these are structural.
 */
const PATHS: Record<IdentityOptionIconId, ReactNode> = {
  launch: (
    <>
      <path d="M16 4 26 9.5v11L16 26 6 20.5v-11z" />
      <path d="M6 9.5 16 15l10-5.5M16 15v11" />
    </>
  ),
  globe: (
    <>
      <circle cx="16" cy="16" r="11" />
      <ellipse cx="16" cy="16" rx="4.5" ry="11" />
      <path d="M5 16h22M7 10h18M7 22h18" />
    </>
  ),
  cart: (
    <>
      <path d="M4 6h4l3 14h13l3-10H9.5" />
      <circle cx="12.5" cy="25" r="1.6" />
      <circle cx="22" cy="25" r="1.6" />
    </>
  ),
  bars: <path d="M7 25V19M13 25V13M19 25V16M25 25V8" />,
  image: (
    <>
      <rect x="5" y="7" width="22" height="18" rx="1.5" />
      <circle cx="12" cy="13.5" r="2" />
      <path d="m6 23 7-6 5 4 4-3 5 5" />
    </>
  ),
  calendar: (
    <>
      <rect x="5" y="7" width="22" height="19" rx="1.5" />
      <path d="M5 13h22M11 4v5M21 4v5" />
      <path d="M10 18h2M15 18h2M20 18h2M10 22h2M15 22h2" />
    </>
  ),
  people: (
    <>
      <circle cx="16" cy="11" r="3.2" />
      <circle cx="8.5" cy="13" r="2.6" />
      <circle cx="23.5" cy="13" r="2.6" />
      <path d="M9.5 25c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M3 23c0-2.8 2.2-4.6 5.2-4.6M29 23c0-2.8-2.2-4.6-5.2-4.6" />
    </>
  ),
  cube: (
    <>
      <path d="M16 4 27 10v12l-11 6-11-6V10z" />
      <path d="m5 10 11 6 11-6M16 16v12" />
    </>
  ),
  refresh: (
    <>
      <path d="M26 14a10 10 0 0 0-18-4M6 18a10 10 0 0 0 18 4" />
      <path d="M8 4v6h6M24 28v-6h-6" />
    </>
  ),
  dots: (
    <>
      <circle cx="16" cy="16" r="11" />
      <circle cx="10.5" cy="16" r="1" fill="currentColor" />
      <circle cx="16" cy="16" r="1" fill="currentColor" />
      <circle cx="21.5" cy="16" r="1" fill="currentColor" />
    </>
  ),
  palette: (
    <>
      <circle cx="12.5" cy="16" r="7.5" />
      <circle cx="19.5" cy="16" r="7.5" />
    </>
  ),
  type: (
    <text x="16" y="23" textAnchor="middle" fontSize="19" fontWeight="500" fill="currentColor" stroke="none">
      Aa
    </text>
  ),
  chat: (
    <>
      <path d="M6 7h20a1.5 1.5 0 0 1 1.5 1.5V19A1.5 1.5 0 0 1 26 20.5H14L8 26v-5.5H6A1.5 1.5 0 0 1 4.5 19V8.5A1.5 1.5 0 0 1 6 7z" />
    </>
  ),
  monitor: (
    <>
      <rect x="4" y="6" width="24" height="16" rx="1.5" />
      <path d="M12 27h8M16 22v5" />
    </>
  ),
  social: (
    <>
      <rect x="5" y="5" width="22" height="22" rx="6" />
      <circle cx="16" cy="16" r="5" />
      <circle cx="22.3" cy="9.7" r="1" fill="currentColor" />
    </>
  ),
  docs: (
    <>
      <path d="M9 4h12l5 5v17H9z" />
      <path d="M13 12h8M13 16h10M13 20h10" />
    </>
  ),
  book: (
    <>
      <path d="M4 7c4-1.5 8-1.5 12 1 4-2.5 8-2.5 12-1v17c-4-1.5-8-1.5-12 1-4-2.5-8-2.5-12-1z" />
      <path d="M16 8v17" />
    </>
  ),
  layers: (
    <>
      <path d="m16 5 12 6-12 6-12-6z" />
      <path d="m4 16 12 6 12-6M4 21l12 6 12-6" />
    </>
  ),
  target: (
    <>
      <circle cx="16" cy="16" r="10" />
      <circle cx="16" cy="16" r="5" />
      <circle cx="16" cy="16" r="1.2" fill="currentColor" />
      <path d="M16 2v5M16 25v5M2 16h5M25 16h5" />
    </>
  ),
  bolt: <path d="M18 3 8 18h7l-2 11 11-16h-7z" />,
  wave: <path d="M4 12c3-4 5-4 8 0s5 4 8 0 5-4 8 0M4 20c3-4 5-4 8 0s5 4 8 0 5-4 8 0" />,
  'coin-1': (
    <>
      <ellipse cx="16" cy="9" rx="8" ry="3" />
      <path d="M8 9v7c0 1.7 3.6 3 8 3s8-1.3 8-3V9M8 16v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" />
    </>
  ),
  'coin-2': (
    <>
      <ellipse cx="12" cy="10" rx="6" ry="2.4" />
      <path d="M6 10v6c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4v-6" />
      <ellipse cx="21" cy="17" rx="6" ry="2.4" />
      <path d="M15 17v6c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4v-6" />
    </>
  ),
  'coin-3': (
    <>
      <ellipse cx="11" cy="9" rx="5.5" ry="2.2" />
      <path d="M5.5 9v5c0 1.2 2.5 2.2 5.5 2.2s5.500-1 5.500-2.200V9" />
      <ellipse cx="22" cy="14" rx="5.5" ry="2.2" />
      <path d="M16.500 14v5c0 1.200 2.500 2.200 5.500 2.200s5.500-1 5.500-2.200v-5M5 20v4c0 1.200 2.500 2.200 5.500 2.200s5.500-1 5.500-2.200v-4" />
    </>
  ),
  'coin-4': (
    <>
      <ellipse cx="10" cy="20" rx="6" ry="2.4" />
      <path d="M4 20v4c0 1.300 2.700 2.400 6 2.400s6-1.100 6-2.400v-4" />
      <ellipse cx="21" cy="12" rx="6" ry="2.4" />
      <path d="M15 12v10c0 1.300 2.700 2.400 6 2.400s6-1.100 6-2.400V12" />
      <path d="M15 17c0 1.200 2.700 2.400 6 2.400s6-1.200 6-2.400" />
    </>
  ),
  'coin-5': (
    <>
      <ellipse cx="16" cy="8" rx="8" ry="3" />
      <path d="M8 8v18c0 1.700 3.600 3 8 3s8-1.300 8-3V8" />
      <path d="M8 14c0 1.700 3.600 3 8 3s8-1.300 8-3M8 20c0 1.700 3.600 3 8 3s8-1.300 8-3" />
    </>
  ),
  question: (
    <>
      <circle cx="16" cy="16" r="11" />
      <path d="M12.500 12.500a3.600 3.600 0 1 1 5 3.300c-1.100.600-1.500 1.200-1.500 2.400M16 22.200v.1" />
    </>
  ),
  scatter: (
    <>
      <path d="m10 6 5 3v6l-5 3-5-3V9zM22 14l5 3v6l-5 3-5-3v-6z" />
      <path d="M8 24l2 2M24 8l2 1" />
    </>
  ),
  cohesive: (
    <>
      <path d="m16 5 10 5-10 5-10-5z" />
      <path d="m6 15 10 5 10-5M6 20l10 5 10-5" />
    </>
  ),
  missing: (
    <>
      <path d="M5 11 14 6l9 5v10l-9 5-9-5z" strokeDasharray="2 2.200" />
      <path d="m5 11 9 5 9-5M14 16v10" />
    </>
  ),
  diamond: (
    <>
      <path d="m16 4 12 12-12 12L4 16z" />
      <path d="m16 9 7 7-7 7-7-7z" />
      <path d="m16 14 2 2-2 2-2-2z" fill="currentColor" />
    </>
  ),
  messaging: (
    <>
      <path d="M6 7h20a1.500 1.500 0 0 1 1.500 1.500V19A1.500 1.500 0 0 1 26 20.500H14L8 26v-5.500H6A1.500 1.500 0 0 1 4.500 19V8.500A1.500 1.500 0 0 1 6 7z" />
    </>
  ),
  strategy: (
    <>
      <path d="m16 4 12 12-12 12L4 16z" />
      <path d="m16 9 7 7-7 7-7-7z" />
      <path d="m16 13.500 2.500 2.500-2.500 2.500-2.500-2.500z" />
    </>
  ),
  visual: (
    <>
      <path d="M16 4 27 10v12l-11 6-11-6V10z" />
      <path d="m5 10 11 6 11-6M16 16v12" />
    </>
  ),
  voice: (
    <>
      <circle cx="16" cy="16" r="11" />
      <circle cx="16" cy="16" r="6.500" />
      <circle cx="16" cy="16" r="2" />
    </>
  ),
  values: (
    <>
      <path d="M16 5 28 26H4z" />
      <path d="M16 5v21M16 15 4 26" />
    </>
  ),
  experience: (
    <>
      <path d="m16 4 11 6.500v11L16 28 5 21.500v-11z" />
      <circle cx="16" cy="16" r="4.500" />
      <circle cx="16" cy="16" r="1.300" />
    </>
  ),
};

type PublicLineIconProps = {
  id: IdentityOptionIconId;
  size?: number;
  className?: string;
};

export function PublicLineIcon({ id, size = 28, className }: PublicLineIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[id]}
    </svg>
  );
}
