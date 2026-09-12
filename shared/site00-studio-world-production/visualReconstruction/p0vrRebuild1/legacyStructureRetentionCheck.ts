/**
 * P0.VR.REBUILD.1 — Detect legacy current-page stack dominating twin.
 */

import { NDX_LEGACY_OVERVIEW_STACK } from './compositionDivergenceScore.js';
import type { LegacyStructureRetentionCheck, ReconstructionStrategy } from './types.js';

export function runLegacyStructureRetentionCheck(input: {
  strategy: ReconstructionStrategy;
  twinSurface: 'LEGACY_OVERVIEW' | 'AUTHORITY_FIRST';
}): LegacyStructureRetentionCheck {
  if (input.strategy === 'REBUILD_FROM_AUTHORITY' && input.twinSurface === 'AUTHORITY_FIRST') {
    return {
      legacyStackDetected: false,
      legacyDominates: false,
      retainedLegacyRegionIds: [],
      status: 'PASS',
    };
  }

  const retained = input.twinSurface === 'LEGACY_OVERVIEW' ? [...NDX_LEGACY_OVERVIEW_STACK] : [];
  const legacyDominates = retained.length >= 3;

  return {
    legacyStackDetected: retained.length > 0,
    legacyDominates,
    retainedLegacyRegionIds: retained,
    status: legacyDominates ? 'LEGACY_COMPOSITION_RETAINED' : 'FAILED_AUTHORITY_RECONSTRUCTION',
  };
}
