/**
 * SITE 00 Screen 01 — Locations Directory composition map.
 * Reference canvas: 390×844 CSS px (iPhone-class viewport).
 * Normalized rects (0–1) relative to usable content area below header / above bottom nav.
 */

export const SITE00_LOCATIONS_REFERENCE_CANVAS = {
  width: 390,
  height: 844,
} as const;

export type LocationsCompositionRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  nx: number;
  ny: number;
  nw: number;
  nh: number;
  centerX: number;
  centerY: number;
};

export type LocationsTypographySpec = {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: string;
  textAlign: 'left' | 'center' | 'right';
  maxWidth?: string;
};

export type LocationsCompositionElementId =
  | 'header.logo'
  | 'header.menu'
  | 'directory.spine'
  | 'directory.spineNode'
  | 'directory.stack'
  | 'directory.card'
  | 'bottomNav';

function rect(x: number, y: number, width: number, height: number): LocationsCompositionRect {
  const { width: cw, height: ch } = SITE00_LOCATIONS_REFERENCE_CANVAS;
  return {
    x,
    y,
    width,
    height,
    nx: x / cw,
    ny: y / ch,
    nw: width / cw,
    nh: height / ch,
    centerX: (x + width / 2) / cw,
    centerY: (y + height / 2) / ch,
  };
}

/** Measurable geometry — tune against approved Screen 01 reference. */
export const SITE00_LOCATIONS_COMPOSITION = {
  environmentId: 'SITE00_LOCATIONS_DIRECTORY',
  version: '1.0.0',
  canvas: SITE00_LOCATIONS_REFERENCE_CANVAS,
  objectFit: 'cover' as const,
  objectPosition: 'center 42%',
  safeAreaTop: 'env(safe-area-inset-top, 0px)',
  safeAreaBottom: 'env(safe-area-inset-bottom, 0px)',
  regions: {
    'header.logo': rect(24, 54, 120, 28),
    'header.menu': rect(334, 50, 44, 44),
    'directory.spine': rect(28, 132, 2, 620),
    'directory.spineNode': rect(22, 128, 14, 14),
    'directory.stack': rect(44, 120, 310, 640),
    'directory.card': rect(44, 120, 310, 142),
    'bottomNav': rect(0, 776, 390, 68),
  },
  typography: {
    headerLogo: {
      fontFamily: 'var(--site00-font-heading)',
      fontSize: '0.8125rem',
      fontWeight: 600,
      lineHeight: 1.1,
      letterSpacing: '0.06em',
      textAlign: 'left',
    } satisfies LocationsTypographySpec,
    cardIndex: {
      fontFamily: 'var(--site00-font-mono)',
      fontSize: '0.625rem',
      fontWeight: 500,
      lineHeight: 1.1,
      letterSpacing: '0.04em',
      textAlign: 'left',
    } satisfies LocationsTypographySpec,
    cardTitle: {
      fontFamily: 'var(--site00-font-display)',
      fontSize: 'clamp(1.75rem, 8vw, 2.125rem)',
      fontWeight: 800,
      lineHeight: 0.95,
      letterSpacing: '0.02em',
      textAlign: 'left',
      maxWidth: '72%',
    } satisfies LocationsTypographySpec,
    cardDescription: {
      fontFamily: 'var(--site00-font-body)',
      fontSize: '0.6875rem',
      fontWeight: 400,
      lineHeight: 1.35,
      letterSpacing: '0.05em',
      textAlign: 'left',
      maxWidth: '68%',
    } satisfies LocationsTypographySpec,
    bottomNavLabel: {
      fontFamily: 'var(--site00-font-nav)',
      fontSize: '0.5625rem',
      fontWeight: 600,
      lineHeight: 1.1,
      letterSpacing: '0.08em',
      textAlign: 'center',
    } satisfies LocationsTypographySpec,
  },
  layout: {
    cardWidthPercent: 80,
    cardMinHeightPx: 132,
    cardMaxHeightPx: 150,
    cardPaddingX: 24,
    cardPaddingY: 22,
    cardRadiusPx: 20,
    cardGapPx: 16,
    spineOffsetLeftPx: 28,
    cardOffsetFromSpinePx: 16,
    contentBottomNavPaddingPx: 88,
  },
} as const;

export function isLocationsCompositionDebugEnabled(search: string): boolean {
  const params = new URLSearchParams(search);
  return params.get('compositionDebug') === '1' || params.get('composition') === '1';
}
