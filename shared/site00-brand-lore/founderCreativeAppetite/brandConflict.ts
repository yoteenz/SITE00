/**
 * Brand intelligence overrides founder taste when they conflict.
 */

import type { BrandLoreProfile } from '../types.js';
import type { FounderCreativeAppetiteProfile } from './types.js';
import type { ToleranceBand } from './constants.js';

export type BrandFounderConflictResolution = {
  conflictDetected: boolean;
  brandBehavior: string;
  founderAppetite: string;
  resolution: 'BRAND_WINS' | 'WITHIN_BRAND_BOUNDARY' | 'NO_CONFLICT';
  guidance: string;
};

function bandRank(band: ToleranceBand | null | undefined): number {
  const map: Record<ToleranceBand, number> = {
    CONSERVATIVE: 0,
    CONTROLLED: 1,
    OPEN: 2,
    ADVENTUROUS: 3,
    HIGH_EXPERIMENTATION: 4,
  };
  return band != null ? map[band] : 1;
}

export function resolveBrandFounderCreativeConflict(params: {
  profile: BrandLoreProfile;
  appetite: FounderCreativeAppetiteProfile;
}): BrandFounderConflictResolution {
  const brandRestraint = params.profile.brandPersonality?.restraintBehavior?.value?.join(', ') ?? 'measured';
  const brandEdge = params.profile.brandPersonality?.edgeBehavior?.value ?? '';
  const founderDensity = params.appetite.densityTolerance.value;
  const founderVisual = params.appetite.visualExperimentationTolerance.value;

  const brandSuggestsQuiet =
    brandRestraint.toLowerCase().includes('restraint') ||
    brandRestraint.toLowerCase().includes('quiet') ||
    brandEdge.toLowerCase().includes('authority');

  const founderWantsMaximal =
    bandRank(founderDensity) >= 3 || bandRank(founderVisual) >= 4;

  if (brandSuggestsQuiet && founderWantsMaximal) {
    return {
      conflictDetected: true,
      brandBehavior: brandRestraint,
      founderAppetite: `${founderDensity ?? 'unknown'} density / ${founderVisual ?? 'unknown'} visual`,
      resolution: 'BRAND_WINS',
      guidance:
        'Explore toward the upper boundary of what brand quiet authority can tolerate — do not transform brand into chaotic maximalism because founder personally prefers it.',
    };
  }

  return {
    conflictDetected: false,
    brandBehavior: brandRestraint,
    founderAppetite: `${founderDensity ?? 'unknown'} density`,
    resolution: 'NO_CONFLICT',
    guidance: 'Creative appetite may inform exploration breadth within brand personality envelope.',
  };
}
