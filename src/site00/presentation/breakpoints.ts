/**
 * SITE 00 canonical viewport breakpoints.
 * Matches existing CSS media queries (767 / 768) across site00-*.css.
 */

export const SITE00_BREAKPOINTS = {
  /** Mobile presentation — max inclusive */
  mobileMaxPx: 767,
  /** Desktop presentation — min inclusive (tablet uses mobile shell through 1023 unless noted) */
  desktopMinPx: 768,
  /** Wide desktop — public ecosystem layouts */
  wideDesktopMinPx: 1024,
} as const;

export type Site00ViewportBand = 'mobile' | 'tablet' | 'desktop';

export function site00ViewportBand(widthPx: number): Site00ViewportBand {
  if (widthPx <= SITE00_BREAKPOINTS.mobileMaxPx) return 'mobile';
  if (widthPx < SITE00_BREAKPOINTS.wideDesktopMinPx) return 'tablet';
  return 'desktop';
}

/** Effective presentation bucket — tablet maps to mobile shell (approved compact treatment). */
export function site00ViewportPresentation(widthPx: number): 'mobile' | 'desktop' {
  return widthPx >= SITE00_BREAKPOINTS.desktopMinPx ? 'desktop' : 'mobile';
}

export function site00ViewportPresentationFromWindow(): 'mobile' | 'desktop' {
  if (typeof window === 'undefined') return 'mobile';
  return site00ViewportPresentation(window.innerWidth);
}

export function subscribeSite00ViewportPresentation(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const mq = window.matchMedia(`(min-width: ${SITE00_BREAKPOINTS.desktopMinPx}px)`);
  mq.addEventListener('change', onChange);
  window.addEventListener('resize', onChange);
  return () => {
    mq.removeEventListener('change', onChange);
    window.removeEventListener('resize', onChange);
  };
}
