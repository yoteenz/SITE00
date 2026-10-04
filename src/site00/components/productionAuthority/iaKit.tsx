/**
 * Production line icons (stroke = currentColor). Shared by INBOX; the OPUS1 Activity kit (hero, lens bar,
 * stats, panels) and its stylesheet were retired by P0.STUDIOOS.PRODUCTION.ACTIVITY.ONE-VIEWPORT-CONVERGENCE.OPUS1.
 */
/* ── icons (stroke = currentColor) ─────────────────────────────────────────────────────────────────── */
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const ICONS = {
  mail: <><rect {...P} x="4" y="7" width="24" height="18" rx="2" /><path {...P} d="M4.5 8l11.5 9 11.5-9" /></>,
  alert: <><circle {...P} cx="16" cy="16" r="11" /><path {...P} d="M16 10v8M16 22v.5" /></>,
  check: <path {...P} d="M7 16.5l6 6L25 10" />,
  clock: <><circle {...P} cx="16" cy="16" r="11" /><path {...P} d="M16 10v6l4 3" /></>,
  calendar: <><rect {...P} x="5" y="7" width="22" height="20" rx="2" /><path {...P} d="M5 13h22M11 4v6M21 4v6" /></>,
  up: <path {...P} d="M16 26V7M8 15l8-8 8 8" />,
  pulse: <path {...P} d="M3 17h6l3-8 5 15 3-7h9" />,
  cube: <><path {...P} d="M16 4l10 5.5v11L16 26 6 20.5v-11z" /><path {...P} d="M6 9.5l10 5.5 10-5.5M16 15v11" /></>,
  layers: <><path {...P} d="M16 5l11 5.5-11 5.5L5 10.5z" /><path {...P} d="M5 15.5L16 21l11-5.5M5 20.5L16 26l11-5.5" /></>,
  link: <><path {...P} d="M13 19l6-6" /><path {...P} d="M10.5 15.5l-3 3a4.2 4.2 0 006 6l3-3M21.5 16.5l3-3a4.2 4.2 0 00-6-6l-3 3" /></>,
  chat: <path {...P} d="M5 7h22v14H14l-6 5v-5H5z" />,
  at: <><circle {...P} cx="16" cy="16" r="4.5" /><path {...P} d="M20.5 16v2a3.5 3.5 0 007 0v-2a11.5 11.5 0 10-4.5 9.1" /></>,
  user: <><circle {...P} cx="16" cy="11" r="5" /><path {...P} d="M6 27c1.2-5.2 5.2-8 10-8s8.8 2.8 10 8" /></>,
  lock: <><rect {...P} x="7" y="14" width="18" height="13" rx="2" /><path {...P} d="M11 14v-4a5 5 0 0110 0v4" /></>,
  flag: <path {...P} d="M8 28V5M8 6h15l-3 5 3 5H8" />,
  graph: <><circle {...P} cx="16" cy="7.5" r="3" /><circle {...P} cx="7.5" cy="24" r="3" /><circle {...P} cx="24.5" cy="24" r="3" /><path {...P} d="M14.6 10.2L9 21.3M17.4 10.2L23 21.3M10.5 24h11" /></>,
  film: <><rect {...P} x="4" y="7" width="24" height="18" rx="1" /><path {...P} d="M9 7v18M23 7v18M4 12h5M4 20h5M23 12h5M23 20h5" /></>,
  search: <><circle {...P} cx="14" cy="14" r="8" /><path {...P} d="M20 20l7 7" /></>,
  filter: <path {...P} d="M5 9h22M9 16h14M13 23h6" />,
  back: <path {...P} d="M20 6l-10 10 10 10" />,
  next: <path {...P} d="M12 6l10 10-10 10" />,
  more: <><circle cx="9" cy="16" r="1.6" fill="currentColor" /><circle cx="16" cy="16" r="1.6" fill="currentColor" /><circle cx="23" cy="16" r="1.6" fill="currentColor" /></>,
  system: <><circle {...P} cx="16" cy="16" r="4" /><path {...P} d="M16 4v4M16 24v4M4 16h4M24 16h4M7.5 7.5l2.8 2.8M21.7 21.7l2.8 2.8M7.5 24.5l2.8-2.8M21.7 10.3l2.8-2.8" /></>,
} as const;
export type IaIconName = keyof typeof ICONS;

export function IaIcon({ name, className = '' }: { name: IaIconName; className?: string }) {
  return (
    <svg className={`iax-ic ${className}`} viewBox="0 0 32 32" aria-hidden>
      {ICONS[name]}
    </svg>
  );
}
