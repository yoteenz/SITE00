import { SITE00_ENTER_DESKTOP_FOCAL } from './desktop-environment-presentation';

/** Resolve Enter 00 desktop background-position for the current viewport. Higher Y% shifts up. */
export function resolveSite00EnterDesktopFocal(): string {
  if (typeof window === 'undefined') return SITE00_ENTER_DESKTOP_FOCAL.default;
  if (window.matchMedia('(min-aspect-ratio: 21/9)').matches) return SITE00_ENTER_DESKTOP_FOCAL.ultrawide;
  if (window.matchMedia('(max-height: 799px)').matches) return SITE00_ENTER_DESKTOP_FOCAL.short;
  if (window.matchMedia('(min-height: 900px)').matches) return SITE00_ENTER_DESKTOP_FOCAL.tall;
  return SITE00_ENTER_DESKTOP_FOCAL.default;
}
