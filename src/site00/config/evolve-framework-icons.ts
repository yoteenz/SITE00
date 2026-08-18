/**
 * EVOLVE geometric icon asset slots — replace files under /assets/evolve/ without component changes.
 */

export type EvolveIconId = 'master' | 'refine' | 'install' | 'transform';

const EVOLVE_ICON_FILES: Record<EvolveIconId, string> = {
  master: '/assets/evolve/evolve-master.svg',
  refine: '/assets/evolve/evolve-refine.svg',
  install: '/assets/evolve/evolve-install.svg',
  transform: '/assets/evolve/evolve-transform.svg',
};

export function site00EvolveIconUrl(id: EvolveIconId): string {
  return EVOLVE_ICON_FILES[id];
}
