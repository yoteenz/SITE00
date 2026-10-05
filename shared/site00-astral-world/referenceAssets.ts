/**
 * P0.E.2 — Reference asset registry (ingested from founder-provided Supabase URLs).
 */

export const ASTRAL_REFERENCE_DESKTOP = {
  repoPath: 'docs/projects/astral-world/references/astral-world-desktop-reference.png',
  publicPath: '/astral-world/bg-desktop-cinematic.png',
  width: 1672,
  height: 941,
} as const;

export const ASTRAL_REFERENCE_MOBILE = {
  repoPath: 'docs/projects/astral-world/references/astral-world-mobile-reference.png',
  publicPath: '/astral-world/bg-mobile-cinematic.png',
  width: 941,
  height: 1672,
} as const;

/** Reference anatomy — desktop proportions at 1672px design width */
export const ASTRAL_DESKTOP_ANATOMY = {
  navWidthPx: 248,
  railWidthPx: 328,
  canvasMinPx: 1090,
  heroMinHeightPx: 320,
  destOrbSizePx: 88,
  cardRadiusPx: 12,
  borderGoldPx: 1,
} as const;

/** Reference anatomy — mobile at 941px design width */
export const ASTRAL_MOBILE_ANATOMY = {
  gutterPx: 16,
  bottomNavPx: 72,
  heroAspectRatio: 941 / 520,
  cardRadiusPx: 14,
} as const;

export type AstralCinematicVariant =
  | 'desktop-hero'
  | 'desktop-astrea'
  | 'desktop-suite'
  | 'desktop-mall'
  | 'desktop-coffee'
  | 'mobile-hero'
  | 'mobile-coffee'
  | 'mobile-mall';

/** Reference-derived color tokens (sampled from ingested PNGs) */
export const ASTRAL_REFERENCE_COLORS = {
  worldBackground: '#06080f',
  surfaceBackground: 'rgba(10, 14, 24, 0.92)',
  goldPrimary: '#c9a962',
  goldMuted: 'rgba(201, 169, 98, 0.35)',
  textPrimary: '#f5f0e6',
  textSecondary: 'rgba(245, 240, 230, 0.62)',
  borderGold: 'rgba(201, 169, 98, 0.28)',
  tarotSuiteAccent: '#5c3d7a',
  astralMallAccent: '#4a6fa5',
  coffeeShopAccent: '#8b5a3c',
  availableStatus: '#7ec89a',
  readingStatus: '#d4a056',
} as const;

export function isAstralDebugMode(search: string): boolean {
  return new URLSearchParams(search).get('debug') === '1';
}
