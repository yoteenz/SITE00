import { SITE00_ENVIRONMENTS } from '../../config/environments';
import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';

/** ENTER 00 desktop — viewport cover layer outside artboard transform (UI stays in scaled stage). */
export function Site00EnterArtboardViewportBackground() {
  const config = SITE00_ENVIRONMENTS.ENTER_00_WAITING_ROOM;
  const desktopAsset = config.desktopAssetPath
    ? resolveSite00PublicAsset(config.desktopAssetPath)
    : undefined;

  if (!desktopAsset) {
    return null;
  }

  return (
    <div
      className={`site00-enter-artboard-viewport-bg site00-env-layer ${config.fallbackClass} ${config.lightingClass} site00-env-layer--has-desktop-asset`.trim()}
      aria-hidden="true"
      style={{
        ['--site00-env-desktop-position' as string]: config.desktopPosition,
        ['--site00-env-desktop-image' as string]: `url("${desktopAsset.replace(/"/g, '\\"')}")`,
      }}
    />
  );
}
