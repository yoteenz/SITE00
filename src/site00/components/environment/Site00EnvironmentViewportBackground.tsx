import { SITE00_ENVIRONMENTS, type EnvironmentId } from '../../config/environments';
import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';
import {
  resolveOriginPanelBackgroundPresentation,
  deriveOriginBackgroundVariant,
} from '../../config/origin-panel-state';
import { useSite00Optional } from '../../state/Site00Context';

type Site00EnvironmentViewportBackgroundProps = {
  environmentId: EnvironmentId;
  rootClassName?: string;
  /** Which approved asset to render — defaults to desktop. */
  assetKind?: 'desktop' | 'mobile';
  /** Override Origin variant (tests); defaults to homeMode-derived. */
  originBackgroundVariantOverride?: 'WITH_PANELS' | 'CLEAN';
};

function resolveStandardEnvironmentAsset(
  environmentId: EnvironmentId,
  assetKind: 'desktop' | 'mobile',
): { asset: string; focal: string; size: 'cover' | 'contain' } | null {
  const config = SITE00_ENVIRONMENTS[environmentId];
  const desktopAsset = config.desktopAssetPath
    ? resolveSite00PublicAsset(config.desktopAssetPath)
    : undefined;
  const mobileAsset = config.mobileAssetPath
    ? resolveSite00PublicAsset(config.mobileAssetPath)
    : undefined;

  const useMobile = assetKind === 'mobile' && Boolean(mobileAsset);
  const asset = useMobile ? mobileAsset : desktopAsset;
  if (!asset) return null;

  const focal = useMobile ? config.mobilePosition : config.desktopPosition;
  return { asset, focal, size: 'cover' as const };
}

/** Viewport cover layer — focal and image set inline so CSS cascade cannot revert. */
export function Site00EnvironmentViewportBackground({
  environmentId,
  rootClassName = '',
  assetKind = 'desktop',
  originBackgroundVariantOverride,
}: Site00EnvironmentViewportBackgroundProps) {
  const config = SITE00_ENVIRONMENTS[environmentId];
  const site00 = useSite00Optional();
  const homeMode = site00?.state.homeMode ?? 'origin';

  let asset: string | undefined;
  let focal: string;
  let size: 'cover' | 'contain' = 'cover';

  if (environmentId === 'ORIGIN_ENVIRONMENT') {
    const viewport = assetKind === 'mobile' ? 'mobile' : 'desktop';
    const effectiveHomeMode =
      originBackgroundVariantOverride != null
        ? originBackgroundVariantOverride === 'WITH_PANELS'
          ? 'origin'
          : 'idnty-expanded'
        : homeMode;
    const resolved = resolveOriginPanelBackgroundPresentation(effectiveHomeMode, viewport);
    asset = resolved.url;
    focal = resolved.position;
    size = resolved.size;
  } else {
    const standard = resolveStandardEnvironmentAsset(environmentId, assetKind);
    if (!standard) return null;
    asset = standard.asset;
    focal = standard.focal;
    size = standard.size;
  }

  if (!asset) {
    return null;
  }

  const assetUrl = asset.replace(/"/g, '\\"');
  const useMobile = assetKind === 'mobile';
  const assetClass = useMobile ? 'site00-env-layer--has-mobile-asset' : 'site00-env-layer--has-desktop-asset';
  const originVariant =
    environmentId === 'ORIGIN_ENVIRONMENT'
      ? originBackgroundVariantOverride ?? deriveOriginBackgroundVariant(homeMode)
      : undefined;

  return (
    <div
      className={`site00-environment-viewport-bg site00-env-layer ${config.fallbackClass} ${config.lightingClass} ${assetClass} ${rootClassName}`.trim()}
      aria-hidden="true"
      data-environment={environmentId}
      data-origin-background-variant={originVariant}
      style={{
        ...(useMobile
          ? { ['--site00-env-mobile-position' as string]: focal }
          : { ['--site00-env-desktop-position' as string]: focal }),
        ...(useMobile
          ? { ['--site00-env-mobile-image' as string]: `url("${assetUrl}")` }
          : { ['--site00-env-desktop-image' as string]: `url("${assetUrl}")` }),
        backgroundImage: `url("${assetUrl}")`,
        backgroundSize: size,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: focal,
      }}
    />
  );
}
