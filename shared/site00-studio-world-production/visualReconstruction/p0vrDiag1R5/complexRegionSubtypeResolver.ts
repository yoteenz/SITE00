/**
 * P0.VR.DIAG.1R5 — Classify milestone vs card rail vs composite.
 */

import type { PageRegionLayoutDefinition } from '../p0vrDiag1/pageRegionLayoutProfiles.js';
import type { ComplexRegionSubtype } from './types.js';

export function resolveComplexRegionSubtype(def: PageRegionLayoutDefinition): ComplexRegionSubtype {
  if (def.regionType === 'CARD_RAIL') return 'CARD_RAIL';
  if (def.regionName.toUpperCase().includes('MILESTONE') && !def.regionName.toUpperCase().includes('RAIL')) {
    return 'MILESTONE';
  }
  if (def.regionName.toUpperCase().includes('CARD RAIL') || def.selectorHint?.includes('carousel')) {
    return 'CARD_RAIL';
  }
  if (def.regionName.toUpperCase().includes('MILESTONE') && def.regionName.toUpperCase().includes('RAIL')) {
    return 'AMBIGUOUS';
  }
  if (def.childLandmarks?.includes('milestone') && def.childLandmarks?.includes('card')) {
    return 'COMPOSITE';
  }
  return def.regionType === 'LIST' ? 'MILESTONE' : 'AMBIGUOUS';
}
