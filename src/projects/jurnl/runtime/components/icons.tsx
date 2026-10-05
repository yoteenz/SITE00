/**
 * F01 ICON PACK (ICONS/F01_ICON_PACK_SHEET) as live SVG — linear refined (default) + editorial filled.
 * Status glyphs (error / info / success) are drawn WITHOUT their circular rings: JURNL places them inside
 * square-rounded tiles so no circle reads as a control.
 */

import type { SVGProps } from 'react';

export type JurnlIconName =
  | 'back'
  | 'close'
  | 'email'
  | 'lock'
  | 'eye'
  | 'eye-off'
  | 'check'
  | 'alert'
  | 'info'
  | 'apple'
  | 'google'
  | 'face-id'
  | 'fingerprint'
  | 'device'
  | 'laptop'
  | 'shield'
  | 'privacy'
  | 'account'
  | 'switch-account'
  | 'resend'
  | 'external'
  | 'offline'
  | 'chevron'
  | 'link'
  | 'chip'
  | 'document'
  | 'trash'
  | 'database'
  | 'gear'
  | 'plus'
  | 'download'
  | 'clock';

const STROKE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function paths(name: JurnlIconName, filled: boolean) {
  switch (name) {
    case 'back':
      return <path {...STROKE} strokeWidth={filled ? 2.4 : 1.5} d="M15 4.5 7.5 12l7.5 7.5" />;
    case 'chevron':
      return <path {...STROKE} d="m9 5 7 7-7 7" />;
    case 'close':
      return <path {...STROKE} strokeWidth={filled ? 2.6 : 1.5} d="M6 6l12 12M18 6 6 18" />;
    case 'email':
      return filled ? <path fill="currentColor" d="M3 6h18v12H3z M3 6l9 7 9-7" /> : <path {...STROKE} d="M3.5 6.5h17v11h-17zM3.5 6.5l8.5 6.5 8.5-6.5" />;
    case 'lock':
      return (
        <>
          <path {...STROKE} d="M7.5 10.5V8a4.5 4.5 0 0 1 9 0v2.5" />
          <rect x="5.5" y="10.5" width="13" height="10" rx="2" {...(filled ? { fill: 'currentColor' } : STROKE)} />
          <path {...STROKE} stroke={filled ? '#F9F6EF' : 'currentColor'} d="M12 14.5v2.5" />
        </>
      );
    case 'eye':
      return (
        <>
          <path {...STROKE} d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
          <path {...STROKE} d="M12 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 1 0 0-5.6z" />
        </>
      );
    case 'eye-off':
      return (
        <>
          <path {...STROKE} d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
          <path {...STROKE} d="M12 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 1 0 0-5.6zM4 20 20 4" />
        </>
      );
    case 'check':
      return <path {...STROKE} strokeWidth={filled ? 2.6 : 1.6} d="m5 12.5 4.5 4.5L19 7.5" />;
    case 'alert':
      return <path {...STROKE} strokeWidth={2} d="M12 6v8M12 17.6v.4" />;
    case 'info':
      return <path {...STROKE} strokeWidth={2} d="M12 10.5v7M12 6.6v.4" />;
    case 'apple':
      return (
        <path
          fill="currentColor"
          d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.9-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2-1.1 2.8-2.3.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.5-.9-2.5-3.8zM14.2 5.8c.6-.8 1.1-1.8 1-2.8-.9 0-2 .6-2.6 1.4-.6.6-1.1 1.7-1 2.7 1 .1 2-.5 2.6-1.3z"
        />
      );
    case 'google':
      return (
        <>
          <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" />
          <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" />
          <path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14z" />
          <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z" />
        </>
      );
    case 'face-id':
      return (
        <path
          {...STROKE}
          strokeWidth={filled ? 2 : 1.5}
          d="M3.5 8V5.5a2 2 0 0 1 2-2H8M16 3.5h2.5a2 2 0 0 1 2 2V8M20.5 16v2.5a2 2 0 0 1-2 2H16M8 20.5H5.5a2 2 0 0 1-2-2V16M8.5 9v1.5M15.5 9v1.5M12 9v4h-1M9 15.5c1.8 1.6 4.2 1.6 6 0"
        />
      );
    case 'fingerprint':
      return (
        <path
          {...STROKE}
          d="M6.5 18.5c1-1.5 1.5-3.6 1.5-6.5a4 4 0 0 1 8 0c0 1.1-.1 2.2-.3 3.2M12 12c0 3.8-.9 6.3-2.4 8M15.2 18.3c-.3.8-.7 1.5-1.2 2.2M4.5 15c.3-1 .5-2 .5-3a7 7 0 0 1 11.6-5.3M19 9.3c.3.8.5 1.7.5 2.7 0 .7 0 1.4-.1 2"
        />
      );
    case 'device':
      return (
        <>
          <rect x="7" y="2.5" width="10" height="19" rx="2" {...STROKE} />
          <path {...STROKE} d="M11 18.5h2" />
        </>
      );
    case 'laptop':
      return filled ? <path fill="currentColor" d="M4.5 5.5h15v10h-15zM2.5 17h19l-1 2h-17z" /> : <path {...STROKE} d="M4.5 5.5h15v10h-15zM2.5 17.5h19l-1 1.5h-17z" />;
    case 'shield':
      return <path {...(filled ? { fill: 'currentColor' } : STROKE)} d="M12 3 19.5 6v5.5c0 4.5-3.2 8.2-7.5 9.5-4.3-1.3-7.5-5-7.5-9.5V6z" />;
    case 'privacy':
      return (
        <>
          <path {...STROKE} d="M12 3 19.5 6v5.5c0 4.5-3.2 8.2-7.5 9.5-4.3-1.3-7.5-5-7.5-9.5V6z" />
          <path {...STROKE} d="M12 8.5a2 2 0 1 0 0 4 2 2 0 1 0 0-4zM8.5 16.5c.8-1.6 2-2.4 3.5-2.4s2.7.8 3.5 2.4" />
        </>
      );
    case 'account':
      return <path {...STROKE} d="M12 4a3.8 3.8 0 1 0 0 7.6A3.8 3.8 0 1 0 12 4zM4.5 20.5c.9-3.6 3.8-5.6 7.5-5.6s6.6 2 7.5 5.6" />;
    case 'switch-account':
      return <path {...STROKE} d="M9 5a3.2 3.2 0 1 0 0 6.4A3.2 3.2 0 1 0 9 5zM2.5 19.5c.7-3 3.2-4.8 6.5-4.8s5.8 1.8 6.5 4.8M16 5.2a3 3 0 0 1 0 6M17.5 14.9c2.2.5 3.6 2.1 4 4.6" />;
    case 'resend':
      return <path {...STROKE} d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4" />;
    case 'external':
      return <path {...STROKE} d="M10 4.5H5.5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V14M14 4.5h5.5V10M19.5 4.5 11 13" />;
    case 'offline':
      return <path {...STROKE} d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.8 16a5 5 0 0 1 6.4 0M12 19.5v.5M4 4l16 16" />;
    case 'link':
      return <path {...STROKE} d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />;
    case 'chip':
      return (
        <>
          <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" {...STROKE} />
          <path {...STROKE} d="M9.5 3v3.5M14.5 3v3.5M9.5 17.5V21M14.5 17.5V21M3 9.5h3.5M3 14.5h3.5M17.5 9.5H21M17.5 14.5H21M10 10h4v4h-4z" />
        </>
      );
    case 'document':
      return <path {...STROKE} d="M6 3.5h8l4 4v13H6zM14 3.5v4h4M9 12h6M9 15h6M9 18h4" />;
    case 'trash':
      return <path {...STROKE} d="M4.5 6.5h15M9.5 6.5V4h5v2.5M6.5 6.5l1 14h9l1-14M10 10v7M14 10v7" />;
    case 'database':
      return <path {...STROKE} d="M5 6c0-1.4 3.1-2.5 7-2.5s7 1.1 7 2.5-3.1 2.5-7 2.5S5 7.4 5 6zM5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" />;
    case 'gear':
      return (
        <path
          {...STROKE}
          d="M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6zM12 2.8l1.6 2.3 2.7-.6.6 2.7 2.4 1.4-1.2 2.4 1.2 2.4-2.4 1.4-.6 2.7-2.7-.6L12 21.2l-1.6-2.3-2.7.6-.6-2.7-2.4-1.4 1.2-2.4-1.2-2.4 2.4-1.4.6-2.7 2.7.6z"
        />
      );
    case 'plus':
      return <path {...STROKE} d="M12 5v14M5 12h14" />;
    case 'download':
      return <path {...STROKE} d="M12 4v11M7.5 10.5 12 15l4.5-4.5M4.5 19.5h15" />;
    case 'clock':
      return <path {...STROKE} d="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 1 0 0-17zM12 7.5V12l3 2" />;
    default:
      return null;
  }
}

export function JurnlIcon({ name, filled = false, size = 20, ...rest }: { name: JurnlIconName; filled?: boolean; size?: number } & Omit<SVGProps<SVGSVGElement>, 'name'>) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden focusable="false" data-jrn-icon={name} {...rest}>
      {paths(name, filled)}
    </svg>
  );
}
