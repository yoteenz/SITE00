import type { HeroObjectId } from '../p0vrReplication4R2/types.js';

export type HeroOutlierPassFocus = 'PARENT_COLUMNS' | 'OVERLAYS_UTILITY' | 'H12_MICRO';

export const HERO_OUTLIER_PASS_FOCUS: Record<number, HeroOutlierPassFocus> = {
  1: 'PARENT_COLUMNS',
  2: 'OVERLAYS_UTILITY',
  3: 'H12_MICRO',
};

/** Objects eligible for correction on each pass (outlier-only; H07 never patched). */
export const HERO_OUTLIER_PASS_OBJECT_IDS: Record<number, readonly HeroObjectId[]> = {
  1: ['H14', 'H06', 'H09'],
  2: ['H01', 'H02', 'H03', 'H04', 'H05', 'H08', 'H10', 'H11'],
  3: ['H12', 'H13'],
};

export function passAllowsObject(passIndex: number, objectId: HeroObjectId): boolean {
  if (objectId === 'H07') return false;
  const allowed = HERO_OUTLIER_PASS_OBJECT_IDS[passIndex];
  if (!allowed) return false;
  return allowed.includes(objectId);
}
