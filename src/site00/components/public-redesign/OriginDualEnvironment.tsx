import { useEffect } from 'react';
import { PUBLIC_REDESIGN_ASSET_URLS } from '../../authority/publicRedesignAssetSlots';
import { resolveOriginBackgroundByViewport } from '../../config/origin-background-assets';
import { AssetSlot } from './AssetSlot';

type OriginDualEnvironmentProps = {
  expanded: boolean;
};

function preloadUrl(url: string | undefined) {
  if (!url || typeof document === 'undefined') return;
  const key = `origin-preload:${url}`;
  if (document.querySelector(`link[data-origin-preload="${key}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  link.setAttribute('data-origin-preload', key);
  document.head.appendChild(link);
}

/**
 * Origin collapsed + expanded plates stay mounted; opacity crossfade tracks panel lifecycle
 * so closing a panel never swaps a single slot mid-transition (founder background glitch fix).
 */
export function OriginDualEnvironment({ expanded }: OriginDualEnvironmentProps) {
  const collapsedUrl = PUBLIC_REDESIGN_ASSET_URLS['ENV.ORIGIN.COLLAPSED'];
  const expandedUrl = PUBLIC_REDESIGN_ASSET_URLS['ENV.ORIGIN.EXPANDED'];
  const legacyFallback = resolveOriginBackgroundByViewport('mobile', 'CLEAN');

  useEffect(() => {
    preloadUrl(collapsedUrl);
    preloadUrl(expandedUrl);
    if (!collapsedUrl) preloadUrl(legacyFallback);
    if (!expandedUrl) preloadUrl(legacyFallback);
  }, [collapsedUrl, expandedUrl, legacyFallback]);

  const collapsedFallbackStyle =
    collapsedUrl || !legacyFallback
      ? undefined
      : { backgroundImage: `url("${legacyFallback.replace(/"/g, '\\"')}")`, backgroundSize: 'cover', backgroundPosition: 'center' as const };

  const expandedFallbackStyle =
    expandedUrl || !legacyFallback
      ? undefined
      : { backgroundImage: `url("${legacyFallback.replace(/"/g, '\\"')}")`, backgroundSize: 'cover', backgroundPosition: 'center' as const };

  return (
    <div className="s00pr-env s00pr-env--daylight s00pr-env--full s00pr-origin-env" aria-hidden="true" data-environment="ORIGIN.DUAL">
      <div
        className={`s00pr-origin-env-layer ${expanded ? 's00pr-origin-env-layer--inactive' : 's00pr-origin-env-layer--active'}`.trim()}
        data-origin-env="collapsed"
      >
        <AssetSlot slotId="ENV.ORIGIN.COLLAPSED" className="s00pr-env__plate" style={collapsedFallbackStyle} />
      </div>
      <div
        className={`s00pr-origin-env-layer ${expanded ? 's00pr-origin-env-layer--active' : 's00pr-origin-env-layer--inactive'}`.trim()}
        data-origin-env="expanded"
      >
        <AssetSlot slotId="ENV.ORIGIN.EXPANDED" className="s00pr-env__plate" style={expandedFallbackStyle} />
      </div>
      <div className="s00pr-env__wash" />
    </div>
  );
}
