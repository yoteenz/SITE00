/**
 * SITE 00 — locked desktop environment presentation (approved Aug 2026).
 *
 * **Do not change UI artboard anchoring to fix background crop.** Tune focal via
 * `desktopPosition` / ENTER focal tokens only — bg layer is outside UI transform.
 *
 * Architecture:
 * - Desktop toggle (phone): scaled 1440×900 artboard, width-fit edge-to-edge
 * - Desktop toggle (laptop/tablet): native full viewport
 * - Mobile toggle (laptop/tablet): scaled 390×844 phone preview (not stretched mobile layout)
 * - Legacy `/foo/desktop` routes: scaled 1440×900 artboard preview only
 * - Viewport: 100dvh, overflow hidden on environment pages
 * - Bottom chrome: flex-pinned (Origin) or portaled (Enter status strip)
 *
 * Code: `Site00DesktopPresentationShell`, `Site00EnvironmentViewportBackground`,
 * `site00-desktop-artboard.css`, `site00DesktopPresentation.ts`
 */

/** ENTER 00 desktop background focal — higher Y% shifts image up inside locked cover (ENTER asset). */
export const SITE00_ENTER_DESKTOP_FOCAL = {
  /** Default laptop / standard desktop */
  default: 'center 75%',
  /** Shorter viewports (max-height 799px) */
  short: 'center 75%',
  /** Taller viewports (min-height 900px) */
  tall: 'center 75%',
  /** Ultrawide (min-aspect-ratio 21/9) */
  ultrawide: 'center 75%',
} as const;

/** Immersive loader cover focal — static bg pre-aligns to animation; animation stays center center. */
export const SITE00_LOADER_MEDIA_FOCAL = {
  /** Animation layer — locked to MP4 framing; do not tune. */
  animation: {
    mobile: 'center center',
    desktop: 'center center',
  },
  /**
   * Static background — lower Y% shifts image down on this asset so the still
   * matches where the animation will sit when playback starts (opposite of Enter).
   */
  background: {
    mobile: 'center 45%',
    desktop: 'center center',
  },
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
