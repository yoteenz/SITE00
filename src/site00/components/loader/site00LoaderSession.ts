const SITE00_IMMERSIVE_SESSION_KEY = 'site00-immersive-complete';
/** @deprecated Migrated to SITE00_IMMERSIVE_SESSION_KEY */
const LEGACY_ASSTS_SESSION_KEY = 'site00-assts-immersive-complete';

function isImmersiveSessionComplete(): boolean {
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

  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type === 'reload') return true;
  } catch {
    /* ignore */
  }

  return !isImmersiveSessionComplete();
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
}

/** @deprecated Use markSite00ImmersiveComplete */
export const markAsstsImmersiveComplete = markSite00ImmersiveComplete;
