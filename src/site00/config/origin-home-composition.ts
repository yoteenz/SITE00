/**
 * SITE 00 Origin homepage — desktop composition (approved environment @ 1440px).
 * Hero anchors over the left arch; panels sit on the plaza below the central figure.
 *
 * Layout CSS: `site00-desktop-artboard.css` (artboard shell only — no native @media duplicate).
 * Wide `/origin` and `/origin/desktop` both render via `Site00OriginRouteShell`.
 */

export const SITE00_ORIGIN_DESKTOP_COMPOSITION = {
  /** Hero block — % from left edge of stage (environment-aligned, not viewport padding). */
  heroLeftPercent: 11,
  heroTopPx: 16,
  heroMaxWidthPx: 360,
  /** Fine nudge after anchor (px; negative = left). */
  heroOffsetXPx: -25,
  /** Collapsed IDNTY/BLDR plaza anchor — % from top of home stage. */
  cardsTopPercent: 58,
  cardsTopOffsetPx: 120,
  cardsMaxWidthPx: 520,
  cardScale: 0.45,
  /** Horizontal gap between collapsed IDNTY/BLDR cards (px). Prior 16 + 20. */
  cardsRowGapPx: 36,
  /** Collapsed IDNTY/BLDR icon render size on desktop (px). Prior 44.1 × 1.1 (+10%) = 48.51. */
  panelIconSizePx: 48.51,
  /** Collapsed panel icon nudge down inside IDNTY/BLDR cards (artboard px). Prior 10px + 6px. */
  panelIconOffsetYPx: 16,
  /** @deprecated Use panelIconSizePx — kept for reference: 48.51/80 ≈ 0.606 */
  panelIconScale: 0.606,
  /** Expanded IDNTY/BLDR panel — centered over plaza (same anchor as collapsed cards). */
  expandedMaxWidthPx: 680,
  /** Expanded panel visual scale (1 = full; 0.875 = prior 0.7 × 1.25). Desktop only via CSS. */
  expandedPanelScale: 0.875,
  /** Framework pillar PNG size on expanded panels (32px base × 1.2). */
  frameworkIconSizePx: 38.4,
  /** "YOU ARE AT 00.00 ORIGIN POINT" — independent desktop anchor (px from stage top). */
  coordinateAnchorTopPx: 300,
  /** Horizontal alignment — matches hero column. */
  coordinateAnchorLeftPercent: 11,
  coordinateAnchorOffsetXPx: -25,
} as const;

/** @deprecated Use SITE00_ORIGIN_DESKTOP_COMPOSITION */
export const SITE00_ORIGIN_DESKTOP_CARDS = SITE00_ORIGIN_DESKTOP_COMPOSITION;
