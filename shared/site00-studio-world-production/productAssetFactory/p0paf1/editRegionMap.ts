/**
 * P0.PAF.1 — Edit region authority map.
 */

import type { EditRegion, ProductEditRegionMap } from './types.js';

const editRegionStore = new Map<string, ProductEditRegionMap>();

const LOCKED_DEFAULT = { editable: false, lockedReason: 'Master hero authority — preserve product identity' };
const EDITABLE_HAIR = { editable: true, lockedReason: null };

export function buildDefaultEditRegionMap(masterHeroId: string): ProductEditRegionMap {
  const map: ProductEditRegionMap = {
    masterHeroId,
    regions: {
      HAIR: EDITABLE_HAIR,
      LACE: LOCKED_DEFAULT,
      HAIRLINE: LOCKED_DEFAULT,
      FACE: LOCKED_DEFAULT,
      BODY: LOCKED_DEFAULT,
      OUTFIT: LOCKED_DEFAULT,
      BACKGROUND: { editable: false, lockedReason: 'Locked unless background removal explicitly selected' },
      SHADOW: LOCKED_DEFAULT,
      ACCESSORIES: LOCKED_DEFAULT,
    },
  };
  editRegionStore.set(masterHeroId, map);
  return map;
}

export function getEditRegionMap(masterHeroId: string): ProductEditRegionMap | null {
  return editRegionStore.get(masterHeroId) ?? null;
}

export function editableRegionsForColorEdit(masterHeroId: string): EditRegion[] {
  const map = editRegionStore.get(masterHeroId);
  if (!map) return ['HAIR'];
  return (Object.keys(map.regions) as EditRegion[]).filter((r) => map.regions[r].editable);
}

export function lockedRegionsForColorEdit(masterHeroId: string): EditRegion[] {
  const map = editRegionStore.get(masterHeroId);
  if (!map) return ['FACE', 'BODY', 'LACE', 'HAIRLINE'];
  return (Object.keys(map.regions) as EditRegion[]).filter((r) => !map.regions[r].editable);
}

export function enableBackgroundEdit(masterHeroId: string): ProductEditRegionMap | null {
  const map = editRegionStore.get(masterHeroId);
  if (!map) return null;
  map.regions.BACKGROUND = { editable: true, lockedReason: null };
  editRegionStore.set(masterHeroId, map);
  return map;
}

export function clearEditRegionStoreForTest(): void {
  editRegionStore.clear();
}
