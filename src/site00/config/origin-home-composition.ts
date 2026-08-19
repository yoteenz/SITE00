/**
 * SITE 00 Origin — canonical desktop composition (approved environment @ 1440px).
 * Hero anchors over the left arch; panels sit on the plaza below the central figure.
 *
 * Layout CSS: `site00-desktop-artboard.css` (artboard shell only — no native @media duplicate).
 * Presentation shell: `desktop-environment-presentation.ts` (locked — do not letterbox or anchor UI for bg crop).
 * Wide `/origin` and `/origin/desktop` both render via `Site00OriginRouteShell`.
 */

export const SITE00_ORIGIN_DESKTOP_COMPOSITION = {
  /** Hero block — % from left edge of stage (environment-aligned, not viewport padding). */
  heroLeftPercent: 11,
  heroTopPx: 16,
  heroMaxWidthPx: 360,
  /** Fine nudge after anchor (px; negative = left). */
  heroOffsetXPx: -25,
  /** Collapsed IDNTY/BLDR/EVOLVE plaza anchor — % from top of home stage. */
  cardsTopPercent: 58,
  /** Plaza block nudge (artboard px; negative = up). Includes prompt + three panels. */
  cardsTopOffsetPx: 116,
  /** 3 × 160px cards + 2 × 36px gaps = 552px minimum; 680px matches expanded panel width. */
  cardsMaxWidthPx: 680,
  cardScale: 0.45,
  /** Horizontal gap between collapsed IDNTY/BLDR/EVOLVE cards (px). Prior 16 + 20. */
  cardsRowGapPx: 36,
  /** Collapsed IDNTY/BLDR icon render size on desktop (px). Prior 44.1 × 1.1 (+10%) = 48.51. */
  panelIconSizePx: 48.51,
  /** Collapsed panel icon nudge down inside IDNTY/BLDR cards (artboard px). Prior 16 − 4 (up). */
  panelIconOffsetYPx: 12,
  /** Desktop hero block anchor nudge (artboard px; applied to whole hero aside). */
  heroBlockOffsetYPx: 10,
  /** Per-line hero nudges (artboard px; negative = up) — independent of hero block anchor. */
  heroEyebrowOffsetYPx: 0,
  heroHeadlineOffsetYPx: 0,
  heroTaglineOffsetYPx: 0,
  heroDescription1OffsetYPx: 0,
  heroDescription2OffsetYPx: 0,
  heroDescription3OffsetYPx: 0,
  heroCoordinateOffsetYPx: 0,
  /** @deprecated Use panelIconSizePx — kept for reference: 48.51/80 ≈ 0.606 */
  panelIconScale: 0.606,
  /** Expanded IDNTY/BLDR panel — centered over plaza (same anchor as collapsed cards). */
  expandedMaxWidthPx: 680,
  /** Expanded panel visual scale — desktop artboard only (0.875 × 0.85). */
  expandedPanelScale: 0.74375,
  /** Framework pillar PNG size on expanded panels (32px base × 1.2). */
  frameworkIconSizePx: 38.4,
  /** Bottom status strip — desktop artboard panel chrome (56px baseline −60% min-height). */
  statusStripMinHeightPx: 22,
  statusStripCellPaddingYPx: 3,
  statusStripGuidancePaddingYPx: 3,
} as const;

/** @deprecated Use SITE00_ORIGIN_DESKTOP_COMPOSITION */
export const SITE00_ORIGIN_DESKTOP_CARDS = SITE00_ORIGIN_DESKTOP_COMPOSITION;
