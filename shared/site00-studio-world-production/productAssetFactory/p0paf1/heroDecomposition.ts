/**
 * P0.PAF.1 — Master hero forensic decomposition.
 */

import type { EditRegion, ProductHeroDecomposition, ProductMasterHero } from './types.js';

const decompositionStore = new Map<string, ProductHeroDecomposition>();

export function deriveHeroDecomposition(hero: ProductMasterHero): ProductHeroDecomposition {
  const decomposition: ProductHeroDecomposition = {
    decompositionId: `decomp-${hero.masterHeroId}`,
    masterHeroId: hero.masterHeroId,
    subjectBounds: { x: 0.15, y: 0.05, width: 0.7, height: 0.9 },
    hairBounds: { x: 0.2, y: 0.05, width: 0.6, height: 0.45 },
    mannequinBounds: { x: 0.25, y: 0.35, width: 0.5, height: 0.55 },
    background: hero.backgroundMode === 'TRANSPARENT_CUTOUT' ? 'transparent' : 'studio-neutral',
    camera: `${hero.cameraAngle} — locked distance`,
    crop: hero.crop,
    lighting: 'soft studio key + fill — locked family',
    shadow: 'subtle ground shadow — locked behavior',
    hairLength: 'derived-from-hero',
    visibleTexture: 'derived-from-hero',
    visibleColor: 'derived-from-hero',
    parting: 'derived-from-hero',
    silhouette: 'wig-product-silhouette-locked',
    occlusionZones: ['lace-front', 'ear-region'],
    safeEditingRegions: deriveSafeRegions(hero),
    derivedAt: new Date().toISOString(),
  };
  decompositionStore.set(hero.masterHeroId, decomposition);
  return decomposition;
}

export function getHeroDecomposition(masterHeroId: string): ProductHeroDecomposition | null {
  return decompositionStore.get(masterHeroId) ?? null;
}

function deriveSafeRegions(hero: ProductMasterHero): EditRegion[] {
  const regions: EditRegion[] = ['HAIR'];
  if (hero.backgroundMode === 'REMOVE_BACKGROUND' || hero.backgroundMode === 'TRANSPARENT_CUTOUT') {
    regions.push('BACKGROUND');
  }
  return regions;
}

export function clearDecompositionStoreForTest(): void {
  decompositionStore.clear();
}
