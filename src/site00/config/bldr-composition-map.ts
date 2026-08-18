/**
 * SITE 00 Screen 02 — BLDR ENTRY composition map.
 * Reference canvas: 390×844 CSS px (iPhone-class viewport).
 */

export const SITE00_BLDR_REFERENCE_CANVAS = {
  width: 390,
  height: 844,
} as const;

export type BldrCompositionRect = {
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

export type BldrTypographySpec = {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: string;
  textAlign: 'left' | 'center' | 'right';
  maxWidth?: string;
};

export type BldrCompositionElementId =
  | 'header.logo'
  | 'header.menu'
  | 'intro.title'
  | 'intro.accent'
  | 'intro.subtitle'
  | 'card.site'
  | 'card.siteText'
  | 'card.siteAction'
  | 'interchange'
  | 'card.world'
  | 'card.worldText'
  | 'card.worldAction'
  | 'bottomNav';

function rect(x: number, y: number, width: number, height: number): BldrCompositionRect {
  const { width: cw, height: ch } = SITE00_BLDR_REFERENCE_CANVAS;
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

export const SITE00_BLDR_ENTRY_COMPOSITION = {
  environmentId: 'SITE00_BLDR_ENTRY',
  version: '1.0.0',
  canvas: SITE00_BLDR_REFERENCE_CANVAS,
  pageBackground: '#f4f4f2',
  safeAreaTop: 'env(safe-area-inset-top, 0px)',
  safeAreaBottom: 'env(safe-area-inset-bottom, 0px)',
  regions: {
    'header.logo': rect(24, 54, 120, 28),
    'header.menu': rect(334, 50, 44, 44),
    'intro.title': rect(32, 96, 326, 72),
    'intro.accent': rect(171, 176, 48, 2),
    'intro.subtitle': rect(32, 188, 326, 20),
    'card.site': rect(20, 224, 350, 360),
    'card.siteText': rect(44, 252, 200, 88),
    'card.siteAction': rect(298, 520, 44, 44),
    'interchange': rect(179, 572, 32, 32),
    'card.world': rect(20, 596, 350, 360),
    'card.worldText': rect(44, 624, 220, 100),
    'card.worldAction': rect(298, 892, 44, 44),
    'bottomNav': rect(0, 776, 390, 68),
  },
  typography: {
    pageTitle: {
      fontFamily: 'var(--site00-font-heading)',
      fontSize: 'clamp(1.375rem, 6.2vw, 1.625rem)',
      fontWeight: 750,
      lineHeight: 1.05,
      letterSpacing: '0.04em',
      textAlign: 'center',
    } satisfies BldrTypographySpec,
    pageSubtitle: {
      fontFamily: 'var(--site00-font-body)',
      fontSize: '0.6875rem',
      fontWeight: 450,
      lineHeight: 1.2,
      letterSpacing: '0.14em',
      textAlign: 'center',
    } satisfies BldrTypographySpec,
    cardTitle: {
      fontFamily: 'var(--site00-font-heading)',
      fontSize: 'clamp(1.5rem, 7vw, 1.875rem)',
      fontWeight: 800,
      lineHeight: 1,
      letterSpacing: '0.03em',
      textAlign: 'left',
    } satisfies BldrTypographySpec,
    cardDescription: {
      fontFamily: 'var(--site00-font-body)',
      fontSize: '0.6875rem',
      fontWeight: 550,
      lineHeight: 1.35,
      letterSpacing: '0.08em',
      textAlign: 'left',
    } satisfies BldrTypographySpec,
    cardPrice: {
      fontFamily: 'var(--site00-font-body)',
      fontSize: '0.6875rem',
      fontWeight: 550,
      lineHeight: 1.35,
      letterSpacing: '0.08em',
      textAlign: 'left',
    } satisfies BldrTypographySpec,
  },
  layout: {
    cardWidthPx: 350,
    cardMinHeightDvh: 42,
    cardRadiusPx: 18,
    cardHorizontalInsetPx: 20,
    cardGapPx: 12,
    contentBottomNavPaddingPx: 96,
    cardImageObjectFit: 'cover' as const,
    siteImageObjectPosition: 'center 42%',
    worldImageObjectPosition: 'center 38%',
  },
} as const;

export function isBldrCompositionDebugEnabled(search: string): boolean {
  const params = new URLSearchParams(search);
  return params.get('compositionDebug') === '1' || params.get('composition') === '1';
}
