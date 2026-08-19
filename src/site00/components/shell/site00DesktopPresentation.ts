export type Site00DesktopPresentationMode = 'none' | 'native' | 'scaled';

/**
 * Resolve how desktop preview should render for Origin/public composer routes.
 *
 * Locked architecture — see `desktop-environment-presentation.ts` and CORE.md.
 * Do not use min(scaleW, scaleH) or bottom-anchor on environment pages (side letterboxing / UI drift).
 *
 * - Desktop toggle → **native full viewport on all devices** (phone + laptop stay in sync)
 * - forceArtboard → scaled 1440×900 preview (legacy `/origin/desktop`, `/foo/desktop` only)
 */
export function resolveSite00DesktopPresentationMode(
  isPreviewDesktop: boolean,
  _isWideViewport: boolean,
  forceArtboard: boolean,
): Site00DesktopPresentationMode {
  if (!isPreviewDesktop) return 'none';
  if (forceArtboard) return 'scaled';
  return 'native';
}
