import { isSite00CloudPreviewBuild, isSite00PreviewTunnelHost } from './site00PreviewHost';
import { purgeSite00ImmersiveLoaderDom } from './site00PurgeImmersiveLoaderDom';

const SITE00_IMMERSIVE_SESSION_KEY = 'site00-immersive-complete';
/** @deprecated Migrated to SITE00_IMMERSIVE_SESSION_KEY */
const LEGACY_ASSTS_SESSION_KEY = 'site00-assts-immersive-complete';

export function isSite00ImmersiveSessionComplete(): boolean {
  try {
    return (
      sessionStorage.getItem(SITE00_IMMERSIVE_SESSION_KEY) === '1' ||
      sessionStorage.getItem(LEGACY_ASSTS_SESSION_KEY) === '1'
    );
  } catch {
    return false;
  }
}

/** Full cinematic loader on cold start / hard refresh — not on ordinary in-session navigation. */
export function shouldShowSite00ImmersiveLoader(): boolean {
  if (typeof window === 'undefined') return true;
  if (isSite00PreviewTunnelHost()) return false;
  if (isSite00CloudPreviewBuild()) return false;

  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type === 'reload') return true;
  } catch {
    /* ignore */
  }

  return !isSite00ImmersiveSessionComplete();
}

/** @deprecated Use shouldShowSite00ImmersiveLoader */
export const shouldShowAsstsImmersiveLoader = shouldShowSite00ImmersiveLoader;

export function markSite00ImmersiveComplete(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SITE00_IMMERSIVE_SESSION_KEY, '1');
    sessionStorage.setItem(LEGACY_ASSTS_SESSION_KEY, '1');
  } catch {
    /* ignore */
  }
  purgeSite00ImmersiveLoaderDom('immersive-session-complete');
}

/** @deprecated Use markSite00ImmersiveComplete */
export const markAsstsImmersiveComplete = markSite00ImmersiveComplete;
