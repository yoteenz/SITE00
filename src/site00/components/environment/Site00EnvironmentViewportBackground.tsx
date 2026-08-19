import { SITE00_ENVIRONMENTS, type EnvironmentId } from '../../config/environments';
import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';

type Site00EnvironmentViewportBackgroundProps = {
  environmentId: EnvironmentId;
  rootClassName?: string;
};

/** Viewport cover layer — focal and image set inline so CSS cascade cannot revert. */
export function Site00EnvironmentViewportBackground({
  environmentId,
  rootClassName = '',
}: Site00EnvironmentViewportBackgroundProps) {
  const config = SITE00_ENVIRONMENTS[environmentId];
  const desktopAsset = config.desktopAssetPath
    ? resolveSite00PublicAsset(config.desktopAssetPath)
    : undefined;

  if (!desktopAsset) {
    return null;
  }

  const focal = config.desktopPosition;
  const assetUrl = desktopAsset.replace(/"/g, '\\"');

  return (
    <div
      className={`site00-environment-viewport-bg site00-env-layer ${config.fallbackClass} ${config.lightingClass} site00-env-layer--has-desktop-asset ${rootClassName}`.trim()}
      aria-hidden="true"
      data-environment={environmentId}
      style={{
        ['--site00-env-desktop-position' as string]: focal,
        ['--site00-env-desktop-image' as string]: `url("${assetUrl}")`,
        backgroundImage: `url("${assetUrl}")`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: focal,
      }}
    />
  );
}
