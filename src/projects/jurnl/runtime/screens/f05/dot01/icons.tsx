/** Line icons for DOT 01 action strips and rows (live SVG: the authorities' engraved icon art is not in the package). */
import type { ReactNode } from 'react';

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const ICONS: Record<string, ReactNode> = {
  book: <><path {...P} d="M3 5.5C5.5 4.5 8.5 4.5 12 6c3.5-1.5 6.5-1.5 9-.5v13c-2.5-1-5.5-1-9 .5-3.5-1.5-6.5-1.5-9-.5z" /><path {...P} d="M12 6v13.5" /></>,
  coins: <><ellipse {...P} cx="9" cy="7" rx="5.5" ry="2.2" /><path {...P} d="M3.5 7v3.5c0 1.2 2.5 2.2 5.5 2.2s5.5-1 5.5-2.2V7" /><ellipse {...P} cx="15" cy="13.5" rx="5.5" ry="2.2" /><path {...P} d="M9.5 13.5V17c0 1.2 2.5 2.2 5.5 2.2s5.5-1 5.5-2.2v-3.5" /></>,
  column: <><path {...P} d="M4 5h16M6 5c0 1.6-1 2.4-2 2.6M18 5c0 1.6 1 2.4 2 2.6M8 8v10M12 8v10M16 8v10M5 18h14M4 20.5h16" /></>,
  card: <><rect {...P} x="2.5" y="5" width="19" height="14" rx="2.5" /><path {...P} d="M2.5 9.5h19M6 15h4" /></>,
  receipt: <><path {...P} d="M6 2.5h12v19l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4z" /><path {...P} d="M9 7.5h6M9 11h6M9 14.5h4" /></>,
  plus: <><path {...P} d="M12 5v14M5 12h14" /></>,
  frame: <><path {...P} d="M3 8V4h4M17 4h4v4M21 16v4h-4M7 20H3v-4" /></>,
  minus: <><path {...P} d="M5 12h14" /></>,
  chart: <><path {...P} d="M4 20V10M9.5 20V6M15 20v-8M20.5 20V3" /></>,
  info: <><circle {...P} cx="12" cy="12" r="9" /><path {...P} d="M12 10.5v6M12 7.2v.3" /></>,
  bank: <><path {...P} d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" /></>,
  arrows: <><path {...P} d="M4 8h14m-4-4 4 4-4 4M20 16H6m4-4-4 4 4 4" /></>,
  edit: <><path {...P} d="M4 20h4l11-11-4-4L4 16z" /><path {...P} d="m13.5 6.5 4 4" /></>,
  tag: <><path {...P} d="M3 12.5V4h8.5L21 13.5 12.5 22z" /><circle {...P} cx="7.5" cy="8.5" r="1.3" /></>,
  archive: <><rect {...P} x="3" y="4" width="18" height="4.5" rx="1" /><path {...P} d="M5 8.5V20h14V8.5M9.5 12.5h5" /></>,
  scale: <><path {...P} d="M12 4v16M6 20h12M4 8h16M6.5 8l-3 6.5h6zM17.5 8l-3 6.5h6z" /></>,
  camera: <><path {...P} d="M3 8.5h4l2-3h6l2 3h4V19H3z" /><circle {...P} cx="12" cy="13.5" r="3.6" /></>,
  upload: <><path {...P} d="M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4" /></>,
  search: <><circle {...P} cx="10.5" cy="10.5" r="6.5" /><path {...P} d="M15.5 15.5 21 21" /></>,
  check: <><path {...P} d="m4.5 12.5 5 5L20 7" /></>,
  warn: <><path {...P} d="M12 3.5 22 20.5H2z" /><path {...P} d="M12 10v5M12 17.6v.3" /></>,
  lock: <><rect {...P} x="5" y="10.5" width="14" height="10" rx="2" /><path {...P} d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>,
  grip: <><path {...P} d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" strokeWidth={3.2} /></>,
  up: <><path {...P} d="m6 14 6-6 6 6" /></>,
  down: <><path {...P} d="m6 10 6 6 6-6" /></>,
  wallet: <><path {...P} d="M3 7.5h16.5V20H3z" /><path {...P} d="M3 7.5 15 4v3.5M15 13.5h4.5" /></>,
  reverse: <><path {...P} d="M20 8a8 8 0 0 0-14.5-2.5M4 4v4h4M4 16a8 8 0 0 0 14.5 2.5M20 20v-4h-4" /></>,
  duplicate: <><rect {...P} x="8" y="8" width="12" height="12" rx="2" /><path {...P} d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></>,
  trash: <><path {...P} d="M4 6.5h16M9 6.5V4h6v2.5M6.5 6.5 7.5 20h9l1-13.5" /></>,
  calendar: <><rect {...P} x="3.5" y="5" width="17" height="15.5" rx="2" /><path {...P} d="M3.5 10h17M8 3v4M16 3v4" /></>,
  note: <><path {...P} d="M5 3.5h14v17H5zM8.5 8h7M8.5 12h7M8.5 16h4" /></>,
  merchant: <><path {...P} d="M3.5 9 5 4h14l1.5 5M4 9h16v11H4zM9.5 20v-6h5v6" /></>,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      {ICONS[name] ?? ICONS.info}
    </svg>
  );
}

export function Chevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 24" aria-hidden className={className}>
      <path d="M2 2l10 10L2 22" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
