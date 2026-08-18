import {
  ASSTS_LIBRARY_HERO_COMPOSITION,
  type LibraryHeroCompositionStatus,
} from './library-home-hero-composition-map';

const LOCKED: LibraryHeroCompositionStatus = 'LOCKED';

export function getLibraryHeroCompositionStatus(): LibraryHeroCompositionStatus {
  return ASSTS_LIBRARY_HERO_COMPOSITION.status;
}

export function isLibraryHeroLocked(): boolean {
  return getLibraryHeroCompositionStatus() === LOCKED;
}

/** Dev-only — warn when code attempts to override locked hero geometry. */
export function warnIfLibraryHeroLocked(context: string): void {
  if (!import.meta.env.DEV || !isLibraryHeroLocked()) return;
  // eslint-disable-next-line no-console
  console.warn(
    `[COMPOSITION LOCK WARNING] library.hero is ${LOCKED}. Create a HERO REVISION to modify geometry. Context: ${context}`,
  );
}

export function isLibraryHeroRefMapEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('heroRefMap') === '1' || params.get('heroRefMap') === 'true';
}
