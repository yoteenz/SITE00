import type { ReactElement } from 'react';

type IconName =
  | 'templates'
  | 'campaigns'
  | 'audiences'
  | 'assets'
  | 'analytics'
  | 'deliveries'
  | 'settings'
  | 'search'
  | 'bell'
  | 'filter'
  | 'expand'
  | 'collapse'
  | 'chevron'
  | 'chevron-down'
  | 'menu'
  | 'close'
  | 'lock';

const PATHS: Record<IconName, ReactElement> = {
  templates: (
    <>
      <rect x="3.5" y="3.5" width="13" height="13" rx="1" />
      <path d="M7 7.5h3M7 10h6M7 12.5h6" />
      <circle cx="12.6" cy="7.4" r="1" />
    </>
  ),
  campaigns: (
    <>
      <path d="M3 15.5l4.5-5 3 3 6.5-8" />
      <path d="M13 5.5h4v4" />
      <path d="M3 17.5h14" />
    </>
  ),
  audiences: (
    <>
      <circle cx="8" cy="7" r="2.6" />
      <path d="M3 16c0-2.8 2.2-4.6 5-4.6s5 1.8 5 4.6" />
      <circle cx="14" cy="7.6" r="2" />
      <path d="M14.4 11.6c1.8.3 3.1 1.8 3.1 3.9" />
    </>
  ),
  assets: (
    <>
      <rect x="3" y="4.5" width="14" height="11" rx="1" />
      <path d="M3 13l4-3.5 3 2.5 3-3 4 3.5" />
      <circle cx="13.2" cy="7.8" r="1.1" />
    </>
  ),
  analytics: (
    <>
      <path d="M4 16V11M8.5 16V7M13 16v-5M17 16V4" />
      <circle cx="17" cy="4" r="1" />
    </>
  ),
  deliveries: (
    <>
      <path d="M4 7.5c0-2 2.5-3.5 6-3.5s6 1.5 6 3.5-2.5 3.5-6 3.5" />
      <path d="M10 11c-3.5 0-6-1.5-6-3.5V12c0 2 2.5 3.5 6 3.5" />
      <path d="M12.5 13.5l2 2 3.5-4" />
    </>
  ),
  settings: (
    <>
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 2.8v2.4M10 14.8v2.4M2.8 10h2.4M14.8 10h2.4M4.9 4.9l1.7 1.7M13.4 13.4l1.7 1.7M4.9 15.1l1.7-1.7M13.4 6.6l1.7-1.7" />
    </>
  ),
  search: (
    <>
      <circle cx="8.6" cy="8.6" r="5" />
      <path d="M12.4 12.4L17 17" />
    </>
  ),
  bell: (
    <>
      <path d="M5 14.5V9a5 5 0 0110 0v5.5l1.5 1.5h-13z" />
      <path d="M8.3 17.5a1.8 1.8 0 003.4 0" />
    </>
  ),
  filter: <path d="M3 6h14M6 10h8M8.5 14h3" />,
  expand: <path d="M12 3.5h4.5V8M8 16.5H3.5V12M16.5 3.5L11 9M3.5 16.5L9 11" />,
  collapse: <path d="M11 4v5h5M9 16v-5H4M11 9l5.5-5.5M9 11l-5.5 5.5" />,
  chevron: <path d="M8 5l5 5-5 5" />,
  'chevron-down': <path d="M5.5 8l4.5 4.5L14.5 8" />,
  menu: <path d="M3 6h14M3 10h14M3 14h14" />,
  close: <path d="M5 5l10 10M15 5L5 15" />,
  lock: (
    <>
      <rect x="4.5" y="9" width="11" height="8" rx="1" />
      <path d="M7 9V6.5a3 3 0 016 0V9" />
    </>
  ),
};

export function CsIcon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

export type { IconName };
