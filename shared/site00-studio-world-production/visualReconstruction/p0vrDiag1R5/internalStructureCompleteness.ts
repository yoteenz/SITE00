/**
 * P0.VR.DIAG.1R5 — Structure completeness vs type expectations.
 */

import { authorityStructureForType } from './authorityRegionStructureExtractor.js';
import type { InternalStructureCompleteness, RegionInternalStructure } from './types.js';

export function computeInternalStructureCompleteness(structure: RegionInternalStructure): InternalStructureCompleteness {
  const expected = authorityStructureForType(structure.regionType);
  const resolvedTypes = new Set(structure.childAnchors.map((a) => a.anchorType));
  const resolvedAnchors = expected.filter((t) => resolvedTypes.has(t as RegionInternalStructure['childAnchors'][0]['anchorType']));
  const missingAnchors = expected.filter((t) => !resolvedTypes.has(t as RegionInternalStructure['childAnchors'][0]['anchorType']));
  const completenessPct = expected.length ? Math.round((resolvedAnchors.length / expected.length) * 100) : 0;

  return {
    regionId: structure.regionId,
    expectedAnchors: expected,
    resolvedAnchors,
    missingAnchors,
    completenessPct,
    status: structure.status,
  };
}
