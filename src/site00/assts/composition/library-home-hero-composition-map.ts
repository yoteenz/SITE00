/**
 * ASSTS Library Home — HERO composition zone (Phase 01 lock).
 * compositionId: assts-library-mobile-hero-v1
 *
 * Canonical asset: Supabase live-preview/site00/52D76B9A-8808-4A00-A89D-28767F21E385.png (1535×1024).
 * Reference display canvas width: 711px (matches library home composition).
 * Status: LOCKED — create HERO REVISION to modify geometry.
 */

import { resolveSite00PublicAsset } from '../../components/loader/site00LoaderConfig';

export const ASSTS_LIBRARY_HERO_COMPOSITION_ID = 'assts-library-mobile-hero-v1' as const;

export type LibraryHeroCompositionStatus = 'DRAFT' | 'CALIBRATING' | 'LOCKED';

/** Semantic slot — bind approved hero asset here in production. */
export const ASSTS_LIBRARY_HERO_SLOT_KEY = 'assts.library.hero.mobile' as const;

/** Storage path under live-preview/site00/ (resolved at runtime via VITE_SUPABASE_URL). */
export const ASSTS_LIBRARY_HERO_ASSET_PATH = '52D76B9A-8808-4A00-A89D-28767F21E385.png' as const;

export function getAsstsLibraryHeroCanonicalUrl(): string {
  return resolveSite00PublicAsset(ASSTS_LIBRARY_HERO_ASSET_PATH);
}

export const ASSTS_LIBRARY_HERO_SOURCE = {
  width: 1535,
  height: 1024,
  aspectRatio: 1535 / 1024,
} as const;

export const ASSTS_LIBRARY_HERO_REFERENCE_WIDTH = 711 as const;

/** Full hero section height — top of page through stats attachment (reference px @ 711w). */
export const ASSTS_LIBRARY_HERO_DISPLAY_HEIGHT = 531 as const;

export type LibraryHeroNormalizedRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type LibraryHeroPixelRect = LibraryHeroNormalizedRect & {
  nx: number;
  ny: number;
  nw: number;
  nh: number;
};

function heroRect(x: number, y: number, w: number, h: number): LibraryHeroPixelRect {
  const refW = ASSTS_LIBRARY_HERO_REFERENCE_WIDTH;
  const refH = ASSTS_LIBRARY_HERO_DISPLAY_HEIGHT;
  return {
    x,
    y,
    w,
    h,
    nx: x / refW,
    ny: y / refH,
    nw: w / refW,
    nh: h / refH,
  };
}

/** Measured from approved 1535×1024 hero — symmetrical central corridor. */
export const ASSTS_LIBRARY_HERO_SOURCE_ZONES = {
  /** Largest central arch opening + vanishing corridor */
  mainArch: { x: 0.31, y: 0.1, w: 0.38, h: 0.88 },
  /** Central axis corridor — red wayfinding markers */
  centralProtected: { x: 0.42, y: 0.18, w: 0.16, h: 0.72 },
  leftAlcove: { x: 0.03, y: 0.34, w: 0.27, h: 0.48 },
  rightAlcove: { x: 0.7, y: 0.34, w: 0.27, h: 0.48 },
  vanishingPoint: { x: 0.5, y: 0.52 },
} as const;

/**
 * Hero composition map — LOCKED values.
 * Copy anchors align with approved library home reference (711×1536 parent canvas).
 */
export const ASSTS_LIBRARY_HERO_COMPOSITION = {
  id: ASSTS_LIBRARY_HERO_COMPOSITION_ID,
  zoneId: 'library.hero' as const,
  status: 'LOCKED' as LibraryHeroCompositionStatus,
  asset: {
    slotKey: ASSTS_LIBRARY_HERO_SLOT_KEY,
    path: ASSTS_LIBRARY_HERO_ASSET_PATH,
  },
  source: ASSTS_LIBRARY_HERO_SOURCE,
  display: {
    referenceWidth: ASSTS_LIBRARY_HERO_REFERENCE_WIDTH,
    height: ASSTS_LIBRARY_HERO_DISPLAY_HEIGHT,
    heightRatio: ASSTS_LIBRARY_HERO_DISPLAY_HEIGHT / ASSTS_LIBRARY_HERO_REFERENCE_WIDTH,
    objectFit: 'cover' as const,
    /** Calibrated — preserves central arch + vanishing point at 711×531 display box */
    objectPosition: '50% 48%',
  },
  anchors: {
    centerAxisX: 0.5,
    heroTop: 0,
    heroBottom: ASSTS_LIBRARY_HERO_DISPLAY_HEIGHT,
    /** Top edge of stats row in parent canvas — 2px overlap into hero */
    statsAnchorY: 529,
    statsOverlapPx: 2,
  },
  zones: {
    /** Full hero bounds in parent library canvas */
    bounds: heroRect(0, 0, ASSTS_LIBRARY_HERO_REFERENCE_WIDTH, ASSTS_LIBRARY_HERO_DISPLAY_HEIGHT),
    /** Upper-left header copy — eyebrow / title / subtitle */
    copySafe: heroRect(40, 78, 385, 106),
    headerCopy: {
      eyebrow: heroRect(40, 78, 160, 18),
      title: heroRect(40, 108, 385, 43),
      subtitle: heroRect(40, 162, 365, 22),
    },
    topRightControl: heroRect(617, 82, 59, 60),
    /** Architectural image focal band (within hero — arch sits below copy safe zone) */
    architectureBand: heroRect(0, 185, ASSTS_LIBRARY_HERO_REFERENCE_WIDTH, 346),
  },
  protected: ASSTS_LIBRARY_HERO_SOURCE_ZONES,
} as const;

export type LibraryHeroZoneId = keyof typeof ASSTS_LIBRARY_HERO_COMPOSITION.zones;

export function scaleLibraryHeroRect(r: LibraryHeroPixelRect, scale: number) {
  return {
    x: r.x * scale,
    y: r.y * scale,
    w: r.w * scale,
    h: r.h * scale,
  };
}

export function libraryHeroZoneStyleVars(
  zone: LibraryHeroPixelRect,
): Record<string, string> {
  return {
    '--hero-x': String(zone.x),
    '--hero-y': String(zone.y),
    '--hero-w': String(zone.w),
    '--hero-h': String(zone.h),
  };
}

/** Future section-lock registry (only hero locked in Phase 01). */
export const ASSTS_LIBRARY_HOME_SECTION_STATUS = {
  'library.hero': 'LOCKED',
  'library.stats': 'DRAFT',
  'library.status': 'DRAFT',
  'library.needsReview': 'DRAFT',
  'library.recentBatches': 'DRAFT',
  'library.browseLibrary': 'DRAFT',
  'library.navigation': 'DRAFT',
} as const;
