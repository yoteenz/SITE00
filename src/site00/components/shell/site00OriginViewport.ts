/** Shared Origin breakpoint — wide viewports use the 1440px desktop artboard. */
export const SITE00_ORIGIN_DESKTOP_BREAKPOINT_PX = 768;

export const SITE00_ORIGIN_MOBILE_LAYOUT_QUERY = 'site00MobileLayout';

export function isSite00OriginWideViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(`(min-width: ${SITE00_ORIGIN_DESKTOP_BREAKPOINT_PX}px)`).matches;
}

export function site00OriginMobileLayoutPreviewActive(search: string): boolean {
  try {
    return new URLSearchParams(search).get(SITE00_ORIGIN_MOBILE_LAYOUT_QUERY) === '1';
  } catch {
    return false;
  }
}

export function subscribeSite00OriginWideViewport(onChange: () => void): () => void {
  const mq = window.matchMedia(`(min-width: ${SITE00_ORIGIN_DESKTOP_BREAKPOINT_PX}px)`);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

export function getSite00OriginWideViewportSnapshot(): boolean {
  return isSite00OriginWideViewport();
}
