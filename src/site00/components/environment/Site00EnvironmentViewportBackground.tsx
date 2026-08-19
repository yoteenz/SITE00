import { SITE00_ENVIRONMENTS, type EnvironmentId } from '../../config/environments';
import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';

type Site00EnvironmentViewportBackgroundProps = {
  environmentId: EnvironmentId;
  rootClassName?: string;
  /** Which approved asset to render — defaults to desktop. */
  assetKind?: 'desktop' | 'mobile';
};

/** Viewport cover layer — focal and image set inline so CSS cascade cannot revert. */
export function Site00EnvironmentViewportBackground({
  environmentId,
  rootClassName = '',
  assetKind = 'desktop',
}: Site00EnvironmentViewportBackgroundProps) {
  const config = SITE00_ENVIRONMENTS[environmentId];
  const desktopAsset = config.desktopAssetPath
    ? resolveSite00PublicAsset(config.desktopAssetPath)
    : undefined;
  const mobileAsset = config.mobileAssetPath
    ? resolveSite00PublicAsset(config.mobileAssetPath)
    : undefined;

  const useMobile = assetKind === 'mobile' && Boolean(mobileAsset);
  const asset = useMobile ? mobileAsset : desktopAsset;
  const focal = useMobile ? config.mobilePosition : config.desktopPosition;

  if (!asset) {
    return null;
  }

  const assetUrl = asset.replace(/"/g, '\\"');
  const assetClass = useMobile ? 'site00-env-layer--has-mobile-asset' : 'site00-env-layer--has-desktop-asset';

  return (
    <div
      className={`site00-environment-viewport-bg site00-env-layer ${config.fallbackClass} ${config.lightingClass} ${assetClass} ${rootClassName}`.trim()}
      aria-hidden="true"
      data-environment={environmentId}
      style={{
        ...(useMobile
          ? { ['--site00-env-mobile-position' as string]: focal }
          : { ['--site00-env-desktop-position' as string]: focal }),
        ...(useMobile
          ? { ['--site00-env-mobile-image' as string]: `url("${assetUrl}")` }
          : { ['--site00-env-desktop-image' as string]: `url("${assetUrl}")` }),
        backgroundImage: `url("${assetUrl}")`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: focal,
      }}
    />
  );
}
