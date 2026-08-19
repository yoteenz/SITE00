/**
 * SITE 00 — locked desktop environment presentation (approved Aug 2026).
 *
 * **Do not change UI artboard anchoring to fix background crop.** Tune focal via
 * `desktopPosition` / ENTER focal tokens only — bg layer is outside UI transform.
 *
 * Architecture:
 * - Laptop (≥768px + Desktop toggle): native full viewport — no scale, in-flow env cover
 * - Phone previewing desktop: scaled artboard — scaleW only, viewport bg on shell
 * - Viewport: 100dvh, overflow hidden on environment pages
 * - Bottom chrome: flex-pinned (Origin) or portaled (Enter status strip)
 *
 * Code: `Site00DesktopPresentationShell`, `Site00EnvironmentViewportBackground`,
 * `site00-desktop-artboard.css`, `site00DesktopPresentation.ts`
 */

/** ENTER 00 desktop background focal — lower Y% shifts image up inside locked cover. */
export const SITE00_ENTER_DESKTOP_FOCAL = {
  /** Default laptop / standard desktop */
  default: 'center 24%',
  /** Shorter viewports (max-height 799px) */
  short: 'center 20%',
  /** Taller viewports (min-height 900px) */
  tall: 'center 28%',
  /** Ultrawide (min-aspect-ratio 21/9) */
  ultrawide: 'center 26%',
} as const;

export const SITE00_DESKTOP_PRESENTATION_LOCKED = {
  artboardWidthPx: 1440,
  artboardMinHeightPx: 900,
  /** Scaled preview: always fill viewport width (no min(scaleW, scaleH) letterboxing). */
  scaledShellUsesScaleWOnly: true,
  /** Environment bg rendered on shell outside transform when scaled. */
  viewportBackgroundOutsideTransform: true,
  wideViewportBreakpointPx: 768,
} as const;
