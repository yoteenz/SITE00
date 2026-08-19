export type Site00DesktopPresentationMode = 'none' | 'native' | 'scaled';

/**
 * Resolve how desktop preview should render for Origin/public composer routes.
 *
 * - Wide viewport + Desktop → native full-viewport (laptop default)
 * - Narrow viewport + Desktop → scaled 1440×900 artboard (phone previewing desktop)
 * - forceArtboard → always scaled (legacy `/origin/desktop`, `/foo/desktop`)
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
