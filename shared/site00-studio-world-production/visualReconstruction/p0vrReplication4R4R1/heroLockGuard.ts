import type { HeroLockGuard } from './types.js';

export function buildHeroLockGuard(heroState: 'OPEN' | 'LOCKED'): HeroLockGuard {
  const locked = heroState === 'LOCKED';
  return {
    heroState,
    allowsHeroCssMutation: !locked,
    allowsHeroAssetMutation: !locked,
    allowsHeroLayoutMutation: !locked,
  };
}

export function assertHeroLockAllowsCssMutation(guard: HeroLockGuard): void {
  if (!guard.allowsHeroCssMutation) {
    throw new Error('HERO_LOCK_GUARD: hero CSS mutation blocked (HERO_STATE=LOCKED)');
  }
}
