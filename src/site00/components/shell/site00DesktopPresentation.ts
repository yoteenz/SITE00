export type Site00DesktopPresentationMode = 'none' | 'native' | 'scaled';

/**
 * Resolve how desktop preview should render for Origin/public composer routes.
 *
 * Locked architecture — see `desktop-environment-presentation.ts` and CORE.md.
 * Do not use min(scaleW, scaleH) or bottom-anchor on environment pages (side letterboxing / UI drift).
 *
 * - Wide viewport + Desktop → native full viewport (laptop / tablet)
 * - Narrow viewport + Desktop → scaled 1440×900 artboard, width-fit edge-to-edge (phone)
 * - forceArtboard → scaled 1440×900 preview (legacy `/origin/desktop`, `/foo/desktop` only)
 */
export function resolveSite00DesktopPresentationMode(
  isPreviewDesktop: boolean,
  isWideViewport: boolean,
  forceArtboard: boolean,
): Site00DesktopPresentationMode {
  if (!isPreviewDesktop) return 'none';
  if (forceArtboard) return 'scaled';
  return isWideViewport ? 'native' : 'scaled';
}
