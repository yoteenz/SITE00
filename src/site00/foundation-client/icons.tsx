/** Digital Foundation stroke icon set (DF-A05). Black stroke; red only through `currentColor` on alerts. */
import type { SVGProps } from 'react';

export type DfIconName =
  | 'globe'
  | 'envelope'
  | 'layers'
  | 'shield'
  | 'document'
  | 'phone'
  | 'swap'
  | 'plus'
  | 'cube'
  | 'dollar'
  | 'clock'
  | 'card'
  | 'receipt'
  | 'building'
  | 'gear'
  | 'arrow'
  | 'lock'
  | 'check'
  | 'chevron'
  | 'cloud'
  | 'laptop'
  | 'users'
  | 'route'
  | 'signature'
  | 'dns'
  | 'alert'
  | 'bolt'
  | 'search'
  | 'minus'
  | 'close';

const PATHS: Record<DfIconName, JSX.Element> = {
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9M12 3c-2.6 2.6-3.9 5.6-3.9 9s1.3 6.4 3.9 9M4.6 7.5h14.8M4.6 16.5h14.8" />
    </>
  ),
  envelope: (
    <>
      <rect x="3" y="5.5" width="18" height="13" />
      <path d="m3 6 9 7 9-7" />
    </>
  ),
  layers: <path d="m12 3 9 4.5-9 4.5-9-4.5L12 3Zm-9 9 9 4.5 9-4.5M3 16.5 12 21l9-4.5" />,
  shield: <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6L12 3Z" />,
  document: (
    <>
      <path d="M6 3h12v18H6z" />
      <path d="M9 7.5h6M9 11h6M9 14.5h6M9 18h3" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="1.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  swap: <path d="M4 8h15m-4-4 4 4-4 4M20 16H5m4-4-4 4 4 4" />,
  plus: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  cube: <path d="m12 2.8 8 4.6v9.2l-8 4.6-8-4.6V7.4l8-4.6Zm0 9.2 8-4.6M12 12v9.2M12 12 4 7.4" />,
  dollar: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 8.6c-.6-.9-1.7-1.4-3-1.4-1.8 0-3 .9-3 2.3 0 3.2 6 1.7 6 4.9 0 1.4-1.3 2.4-3 2.4-1.4 0-2.6-.6-3.2-1.6M12 5.5v13" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.4 2" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5.5" width="18" height="13" />
      <path d="M3 9.5h18" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3h12v18H6z" />
      <path d="M9 7h6M9 10.5h6M9 14h4M9 17.5h6" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V5h9v16M13 9h7v12M2.5 21h19" />
      <path d="M7 8.5h3M7 12h3M7 15.5h3M16 12.5h1.5M16 16h1.5" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3 5.5 5.5" />
      <circle cx="12" cy="12" r="6.2" />
    </>
  ),
  arrow: <path d="M3 12h17m-5-5 5 5-5 5" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  cloud: <path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.2 4.7 4.7 0 0 0 7 18.5Z" />,
  laptop: (
    <>
      <rect x="4.5" y="5" width="15" height="10.5" />
      <path d="M2.5 19h19l-2-3.5h-15z" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3 20c.6-3.4 3-5.2 6-5.2s5.4 1.8 6 5.2M15.5 5.6a3.2 3.2 0 0 1 0 6M17.5 14.9c2 .6 3.2 2.3 3.5 5.1" />
    </>
  ),
  route: <path d="M5 4v6a4 4 0 0 0 4 4h10m-4-4 4 4-4 4M5 4 2.5 6.5M5 4l2.5 2.5" />,
  signature: <path d="M3 17.5c2.2 0 3.6-9.5 6-9.5 1.8 0-.6 8.5 1.4 8.5 1.6 0 2.4-4 3.8-4 1 0 .6 3 2 3 1 0 1.6-1 2.3-1.6M3 21h18" />,
  dns: (
    <>
      <rect x="3.5" y="4" width="17" height="6" />
      <rect x="3.5" y="14" width="17" height="6" />
      <path d="M7 7h.01M7 17h.01M12 10v4" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 9.5v5M12 17.2v.3" />
    </>
  ),
  bolt: <path d="M13 2.5 5 13.5h6L10 21.5l8-11h-6l1-8Z" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
};

export function DfIcon({ name, ...rest }: { name: DfIconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={0.625}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
