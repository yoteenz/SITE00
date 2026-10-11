import type { SVGProps } from 'react';

export type BldrStudioIconName =
  | 'building'
  | 'layers'
  | 'pages'
  | 'website'
  | 'mobile'
  | 'shop'
  | 'booking'
  | 'blog'
  | 'member'
  | 'portal'
  | 'seo'
  | 'analytics'
  | 'standard'
  | 'expedited'
  | 'flexible'
  | 'clock'
  | 'investment'
  | 'cube'
  | 'inspect'
  | 'edit';

type Props = SVGProps<SVGSVGElement> & { name: BldrStudioIconName };

/** Shared monoline Builder icon family — stroke geometry, no emoji, no color fills. */
export function BldrStudioIcon({ name, ...rest }: Props) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'square' as const,
    strokeLinejoin: 'miter' as const,
    'aria-hidden': true as const,
    ...rest,
  };
  switch (name) {
    case 'building':
      return (
        <svg {...common}>
          <path d="M4 20V8l8-4 8 4v12" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );
    case 'layers':
      return (
        <svg {...common}>
          <path d="M4 8l8-4 8 4-8 4-8-4z" />
          <path d="M4 12l8 4 8-4" />
          <path d="M4 16l8 4 8-4" />
        </svg>
      );
    case 'pages':
      return (
        <svg {...common}>
          <path d="M7 4h8l4 4v12H7z" />
          <path d="M15 4v4h4" />
        </svg>
      );
    case 'website':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" />
          <path d="M3 9h18" />
        </svg>
      );
    case 'mobile':
      return (
        <svg {...common}>
          <rect x="8" y="3" width="8" height="18" />
          <path d="M11 18h2" />
        </svg>
      );
    case 'shop':
      return (
        <svg {...common}>
          <path d="M4 9h16l-1.5 11h-13z" />
          <path d="M8 9V6a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case 'booking':
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="15" />
          <path d="M4 10h16M8 3v4M16 3v4" />
        </svg>
      );
    case 'blog':
      return (
        <svg {...common}>
          <path d="M6 4h12v16H6z" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      );
    case 'member':
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="3" />
          <path d="M6 19c1.2-3 3.2-4.5 6-4.5S16.8 16 18 19" />
        </svg>
      );
    case 'portal':
      return (
        <svg {...common}>
          <path d="M5 20V6h6l2 2h6v12z" />
        </svg>
      );
    case 'seo':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="5" />
          <path d="M15 15l4 4" />
        </svg>
      );
    case 'analytics':
      return (
        <svg {...common}>
          <path d="M5 19V5M5 19h14" />
          <path d="M8 15l3-4 3 2 4-6" />
        </svg>
      );
    case 'standard':
      return (
        <svg {...common}>
          <path d="M12 4l7 4v8l-7 4-7-4V8z" />
        </svg>
      );
    case 'expedited':
      return (
        <svg {...common}>
          <path d="M4 14l8-8 3 3 5-5" />
          <path d="M14 4h6v6" />
        </svg>
      );
    case 'flexible':
      return (
        <svg {...common}>
          <path d="M5 8h10a4 4 0 0 1 0 8H8" />
          <path d="M8 12l-4 4 4 4" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v5l3 2" />
        </svg>
      );
    case 'investment':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7v10M9.5 9.5c.6-.8 1.4-1.2 2.5-1.2 1.6 0 2.6.8 2.6 2s-1 1.8-2.6 2-2.6.8-2.6 2 1 2 2.6 2c1.1 0 1.9-.4 2.5-1.2" />
        </svg>
      );
    case 'cube':
      return (
        <svg {...common}>
          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
          <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
        </svg>
      );
    case 'inspect':
      return (
        <svg {...common}>
          <path d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4" />
        </svg>
      );
    case 'edit':
      return (
        <svg {...common}>
          <path d="M5 19h4l10-10-4-4L5 15z" />
        </svg>
      );
    default:
      return null;
  }
}
