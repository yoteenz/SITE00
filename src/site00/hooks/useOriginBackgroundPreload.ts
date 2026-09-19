import { useEffect } from 'react';
import type { HomeMode } from '../state/types';
import { originBackgroundPreloadUrls } from '../config/origin-panel-state';
import type { OriginViewportAssetKind } from '../config/origin-background-assets';
import { preloadSite00LoaderBackground } from '../components/loader/site00LoaderPreload';

/** Preload current + alternate Origin background for the active viewport (no flash on expand/close). */
export function useOriginBackgroundPreload(homeMode: HomeMode, viewport: OriginViewportAssetKind): void {
  useEffect(() => {
    const [primary, secondary] = originBackgroundPreloadUrls(homeMode, viewport);
    void preloadSite00LoaderBackground(primary);
    void preloadSite00LoaderBackground(secondary);
  }, [homeMode, viewport]);
}
