/**
 * P0.VR.REBUILD.1 — Authority major regions present in twin composition.
 */

import type { AuthorityCompositionBlueprint, AuthorityCompositionCoverage } from './types.js';

export function evaluateAuthorityCompositionCoverage(input: {
  blueprint: AuthorityCompositionBlueprint;
  twinRegionOrder: string[];
  strategy: string;
}): AuthorityCompositionCoverage {
  const authorityMajor = input.blueprint.regionOrder;
  const twinMajor = input.twinRegionOrder;
  const missingRegions = authorityMajor.filter((id) => !twinMajor.includes(id));
  const extraLegacyRegions = twinMajor.filter((id) => id.startsWith('legacy-'));
  const matchedRegions = authorityMajor.filter((id) => twinMajor.includes(id)).length;
  const orderMatch =
    authorityMajor.length === twinMajor.length && authorityMajor.every((id, i) => twinMajor[i] === id);

  const flags: string[] = [];
  if (missingRegions.some((id) => id.includes('hero') || id.includes('media'))) {
    flags.push('AUTHORITY_REGION_MISSING');
  }
  if (extraLegacyRegions.length) flags.push('LEGACY_COMPOSITION_RETAINED');
  if (!orderMatch) flags.push('COMPOSITION_ORDER_MISMATCH');

  let status: AuthorityCompositionCoverage['status'] = 'PASS';
  if (flags.includes('AUTHORITY_REGION_MISSING') || flags.includes('LEGACY_COMPOSITION_RETAINED')) {
    status = 'FAIL';
  } else if (flags.includes('COMPOSITION_ORDER_MISMATCH')) {
    status = 'WARN';
  }

  if (input.strategy !== 'REBUILD_FROM_AUTHORITY') {
    status = 'FAIL';
    flags.push('LEGACY_COMPOSITION_RETAINED');
  }

  return {
    authorityMajorRegions: authorityMajor.length,
    twinMajorRegions: twinMajor.length,
    matchedRegions,
    missingRegions,
    extraLegacyRegions,
    orderMatch,
    hierarchyMatch: matchedRegions >= Math.floor(authorityMajor.length * 0.7),
    status,
    flags,
  };
}
