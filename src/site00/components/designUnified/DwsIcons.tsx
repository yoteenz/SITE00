import type { ReactNode } from 'react';

/**
 * Live-SVG icon vocabulary following the approved ICON PACK (24 grid, 1.5 stroke, red accent dot).
 * Navigation, action, status and review icons are live; the pipeline-stage "objects" are simplified live
 * stand-ins until the 3D renders are registered (slots ICON3D.PIPELINE.*).
 */
const P: Record<string, ReactNode> = {
  /* navigation */
  hub: <path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z" />,
  work: (
    <>
      <path d="m12 3 9 4.500-9 4.500-9-4.500z" />
      <path d="m3 12 9 4.500 9-4.500M3 16.500 12 21l9-4.500" />
    </>
  ),
  library: (
    <>
      <path d="M12 3 20 7.500v9L12 21l-8-4.500v-9z" />
      <path d="m4 7.500 8 4.500 8-4.500M12 12v9" />
    </>
  ),
  activity: (
    <>
      <path d="M3 12h4l2.500-6 4 12 2.500-6h5" />
    </>
  ),
  exit: <path d="M14 4h6v16h-6M4 12h11M11 8l4 4-4 4" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  chevronR: <path d="m9 6 6 6-6 6" />,
  chevronL: <path d="m15 6-6 6 6 6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.500" />
      <path d="m16 16 4.500 4.500" />
    </>
  ),
  filter: <path d="M4 7h16M7 12h10M10 17h4" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  arrow: <path d="M4 12h15M13 6l6 6-6 6" />,
  settings: (
    <>
      <path d="M12 3 20 7.500v9L12 21l-8-4.500v-9z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.500-6 8-6s8 2 8 6" />
    </>
  ),
  /* actions */
  plus: <path d="M12 5v14M5 12h14" />,
  open: <path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" />,
  edit: <path d="m4 20 1-5L16 4l4 4L9 19zM13 7l4 4" />,
  duplicate: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="1" />
      <path d="M4 16V4h12" />
    </>
  ),
  trash: <path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13M10 11v6M14 11v6" />,
  import: <path d="M12 4v11M7 11l5 5 5-5M4 20h16" />,
  export: <path d="M12 16V5M7 9l5-5 5 5M4 20h16" />,
  share: (
    <>
      <circle cx="6" cy="12" r="2.500" />
      <circle cx="17" cy="6" r="2.500" />
      <circle cx="17" cy="18" r="2.500" />
      <path d="m8.200 10.800 6.600-3.600M8.200 13.200l6.600 3.600" />
    </>
  ),
  download: <path d="M12 4v12M7 12l5 5 5-5M4 20h16" />,
  link: <path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1" />,
  play: <path d="M7 4v16l13-8z" />,
  /* review */
  review: (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <circle cx="12" cy="13" r="3" />
      <path d="m14.500 15.500 3 3" />
    </>
  ),
  approve: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.500 3 3 5-6" />
    </>
  ),
  choose: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </>
  ),
  comment: <path d="M4 5h16v11H10l-5 4v-4H4z" />,
  annotate: <path d="m4 20 1-5L16 4l4 4L9 19zM12 6l4 4" />,
  request: <path d="m21 3-9 18-3-8-8-3zM9 13l12-10" />,
  revision: <path d="M20 12a8 8 0 1 1-3-6.200M20 4v5h-5" />,
  compare: (
    <>
      <rect x="3" y="5" width="7" height="14" rx="1" />
      <rect x="14" y="5" width="7" height="14" rx="1" />
    </>
  ),
  history: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="1" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  check: <path d="m5 12.500 4.500 4.500L19 7" />,
  /* status */
  active: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.500" fill="currentColor" />
    </>
  ),
  warning: <path d="M12 4 21 20H3zM12 10v5M12 17.500v.5" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.500v.5" />
    </>
  ),
  /* object / system */
  layers: (
    <>
      <path d="m12 4 9 4.500-9 4.500-9-4.500z" />
      <path d="m3 12.500 9 4.500 9-4.500M3 16.500l9 4.500 9-4.500" />
    </>
  ),
  cube: (
    <>
      <path d="M12 3 20 7.500v9L12 21l-8-4.500v-9z" />
      <path d="m4 7.500 8 4.500 8-4.500M12 12v9" />
    </>
  ),
  frame: (
    <>
      <rect x="3" y="5" width="18" height="12" rx="1" />
      <path d="M9 21h6M12 17v4" />
    </>
  ),
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="1" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  tablet: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1.500" />
      <path d="M11 18h2" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2.500" width="10" height="19" rx="1.500" />
      <path d="M11 18.500h2" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6" height="6" />
      <rect x="14" y="4" width="6" height="6" />
      <rect x="4" y="14" width="6" height="6" />
      <rect x="14" y="14" width="6" height="6" />
    </>
  ),
  layout: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <path d="M3 9h18M9 9v11" />
    </>
  ),
  sliders: <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4" />,
  wave: <path d="M3 9c3-4 5-4 8 0s5 4 8 0M3 16c3-4 5-4 8 0s5 4 8 0" />,
  hexagon: <path d="M12 3 20 7.500v9L12 21l-8-4.500v-9z" />,
  sphere: (
    <>
      <circle cx="12" cy="12" r="8.500" />
      <ellipse cx="12" cy="12" rx="3.500" ry="8.500" />
      <path d="M3.500 12h17" />
    </>
  ),
  plate: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="m5 16 4-4 3 3 3-4 4 5" />
    </>
  ),
  doc: <path d="M6 3h9l4 4v14H6zM9 12h7M9 16h7" />,
  heart: <path d="M12 20S4 15 4 9.500A4.500 4.500 0 0 1 12 7a4.500 4.500 0 0 1 8 2.500C20 15 12 20 12 20z" />,
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  lattice: (
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="12" cy="18" r="2" />
      <path d="M6 8v4l6 4M18 8v4l-6 4M8 6h8" />
    </>
  ),
  route: (
    <>
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="6" r="2" />
      <path d="M7 18h6a3 3 0 0 0 0-6h-2a3 3 0 0 1 0-6h6" />
    </>
  ),
  dot: <circle cx="12" cy="12" r="2.500" fill="currentColor" />,
  /* pipeline stand-ins (3D renders are slots) */
  panels: (
    <>
      <rect x="3" y="5" width="8" height="14" />
      <rect x="13" y="5" width="8" height="14" fill="currentColor" fillOpacity="0.85" />
    </>
  ),
  head: (
    <>
      <circle cx="12" cy="9" r="4" />
      <path d="M5 21c0-4.500 3-7 7-7s7 2.500 7 7" />
    </>
  ),
  slabs: (
    <>
      <path d="m3 9 9-4 9 4-9 4zM3 13l9 4 9-4M3 17l9 4 9-4" />
    </>
  ),
  rings: (
    <>
      <ellipse cx="12" cy="12" rx="9" ry="4" />
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(120 12 12)" />
    </>
  ),
  orb: (
    <>
      <circle cx="12" cy="12" r="8.500" />
      <circle cx="12" cy="12" r="3.500" fill="currentColor" />
    </>
  ),
};

export type DwsIconName = keyof typeof P | (string & {});

export function DwsIcon({ name, size = 20, className = '', accent = false }: { name: DwsIconName; size?: number; className?: string; accent?: boolean }) {
  return (
    <svg
      className={`dws-ic ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {P[name] ?? P.dot}
      {accent ? <circle cx="20" cy="4" r="1.800" fill="#e8192c" stroke="none" /> : null}
    </svg>
  );
}

/** Pipeline stage "object": a live SVG stand-in inside a soft sphere plate. Image slot: ICON3D.PIPELINE.<NAME>. */
export function DwsStageObject({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="dws-stageobj" data-asset-slot={`ICON3D.PIPELINE.${label}`} aria-hidden="true">
      <DwsIcon name={icon} size={34} />
    </span>
  );
}
