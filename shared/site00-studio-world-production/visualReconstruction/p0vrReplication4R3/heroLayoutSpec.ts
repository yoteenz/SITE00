import type { HeroObjectId } from '../p0vrReplication4R2/types.js';

/** Post-convergence rendered layout (hero-root space, px) — kept in sync with surgical CSS. */
export type HeroLayoutRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  lineCount?: number;
};

export const HERO_RENDERED_LAYOUT: Record<HeroObjectId, HeroLayoutRect> = {
  H01: { x: 24, y: 10, width: 80, height: 14, lineCount: 1 },
  H02: { x: 24, y: 28, width: 140, height: 76, lineCount: 4 },
  H03: { x: 24, y: 110, width: 120, height: 2 },
  H04: { x: 24, y: 122, width: 148, height: 44, lineCount: 4 },
  H05: { x: 24, y: 178, width: 132, height: 32, lineCount: 1 },
  H06: { x: 139, y: 0, width: 148, height: 220 },
  H07: { x: 0, y: 0, width: 0, height: 0, lineCount: 0 },
  H08: { x: 194, y: 168, width: 120, height: 44 },
  H09: { x: 287, y: 0, width: 88, height: 220 },
  H10: { x: 322, y: 14, width: 18, height: 18 },
  H11: { x: 318, y: 36, width: 28, height: 16, lineCount: 1 },
  H12: { x: 311, y: 158, width: 64, height: 56 },
  H13: { x: 0, y: 0, width: 375, height: 220 },
  H14: { x: 0, y: 0, width: 375, height: 220 },
};

export function buildHeroCssPatchFromLayout(): Record<string, string> {
  /** Baseline vars after 4R4R1 Playwright snapshot (8 outliers → factual nudges). */
  return {
    '--fb-hero-h': '220px',
    '--hero-h06-pos': '58% 26%',
    '--hero-h06-size': '265% auto',
    '--hero-h06-left': '37%',
    '--hero-h06-right-inset': '23%',
    '--hero-h12-pos': '91% 43%',
    '--hero-h12-size': '320% auto',
    '--hero-h12-width': '64px',
    '--hero-h12-height': '56px',
    '--hero-h12-bottom-offset': '5px',
    '--hero-ndx-fill': '#b7f75f',
    '--hero-left-pad-top': '10px',
    '--hero-h08-left': '51.6%',
    '--hero-h08-bottom': '7px',
    '--hero-h08-font-size': '46px',
    '--hero-h09-width': '88px',
    '--hero-h02-mb': '4px',
    '--hero-h03-mt': '4px',
    '--hero-h03-mb': '6px',
    '--hero-h04-mt': '4px',
    '--hero-h05-mt': '10px',
    '--hero-h10-mb': '4px',
  };
}
