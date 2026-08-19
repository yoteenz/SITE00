import { SITE00_ENVIRONMENTS, type EnvironmentId } from '../../config/environments';
import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';

type Site00EnvironmentViewportBackgroundProps = {
  environmentId: EnvironmentId;
};

/** Viewport cover layer outside artboard transform — bg focal only, UI stays in scaled stage. */
export function Site00EnvironmentViewportBackground({ environmentId }: Site00EnvironmentViewportBackgroundProps) {
  const config = SITE00_ENVIRONMENTS[environmentId];
  const desktopAsset = config.desktopAssetPath
    ? resolveSite00PublicAsset(config.desktopAssetPath)
    : undefined;

  if (!desktopAsset) {
    return null;
  }

  return (
    <div
      className={`site00-environment-viewport-bg site00-env-layer ${config.fallbackClass} ${config.lightingClass} site00-env-layer--has-desktop-asset`.trim()}
      aria-hidden="true"
      data-environment={environmentId}
      style={{
        ['--site00-env-desktop-position' as string]: config.desktopPosition,
        ['--site00-env-desktop-image' as string]: `url("${desktopAsset.replace(/"/g, '\\"')}")`,
      }}
    />
  );
}
