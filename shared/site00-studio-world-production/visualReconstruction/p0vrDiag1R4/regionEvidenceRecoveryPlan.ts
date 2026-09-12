/**
 * P0.VR.DIAG.1R4 — Recovery plan per blocking region.
 */

import { getRegionMeasurementProfile } from '../p0vrDiag1/regionMeasurementProfiles.js';
import type { RegionForensicsBundle } from '../p0vrDiag1/types.js';
import type { AuthorityRegionMeasurementPass, BlockingRegion, DomTargetRecovery, RegionEvidenceRecoveryMethod, RegionEvidenceRecoveryPlan } from './types.js';

function classifyRecoveryMethod(input: {
  dom: DomTargetRecovery;
  authority: AuthorityRegionMeasurementPass;
  missingCritical: string[];
  scopeMismatch: boolean;
}): RegionEvidenceRecoveryMethod {
  if (input.scopeMismatch && input.dom.status === 'OUT_OF_SCOPE') return 'SEGMENTED_CAPTURE_REQUIRED';
  if (input.dom.status === 'AMBIGUOUS') return 'MANUAL_REGION_CONFIRMATION';
  if (input.dom.status === 'UNRESOLVED') return 'DOM_TARGET_RECOVERY';
  if (input.missingCritical.length && input.authority.status !== 'COMPLETE') return 'AUTHORITY_REGION_REMEASURE';
  if (input.missingCritical.some((d) => d.includes('Gap') || d.includes('item'))) return 'CHILD_ANCHOR_EXTRACTION';
  if (input.missingCritical.length) return 'COMPUTED_STYLE_EXTRACTION';
  return 'DOM_TARGET_RECOVERY';
}

export function buildRegionEvidenceRecoveryPlan(input: {
  blocking: BlockingRegion;
  bundle: RegionForensicsBundle;
  domRecovery: DomTargetRecovery;
  authorityPass: AuthorityRegionMeasurementPass;
  scopeMismatch: boolean;
}): RegionEvidenceRecoveryPlan {
  const profile = getRegionMeasurementProfile(input.blocking.regionType);
  const comp = input.bundle.depthComputation;
  const qualified = comp?.qualifiedDimensions ?? [];

  const requiredCritical = profile.required.filter((r) => r.importance === 'CRITICAL').map((r) => r.dimension);
  const requiredHigh = profile.required.filter((r) => r.importance === 'HIGH').map((r) => r.dimension);

  const resolvedDims = new Set(qualified.filter((q) => q.countsTowardDepth).map((q) => q.dimension));
  const missingCritical = requiredCritical.filter((d) => !resolvedDims.has(d));
  const missingHigh = requiredHigh.filter((d) => !resolvedDims.has(d));

  const method = classifyRecoveryMethod({
    dom: input.domRecovery,
    authority: input.authorityPass,
    missingCritical,
    scopeMismatch: input.scopeMismatch,
  });

  let reason = `Depth ${input.blocking.depthStatus}; missing critical: ${missingCritical.join(', ') || 'none'}`;
  if (input.domRecovery.status === 'OUT_OF_SCOPE') reason = 'Region outside current capture scope';
  if (method === 'MANUAL_REGION_CONFIRMATION') reason = 'Multiple plausible DOM targets';

  return {
    regionId: input.blocking.regionId,
    regionType: input.blocking.regionType,
    currentDepthStatus: input.blocking.depthStatus,
    qualifiedDimensions: qualified,
    missingCriticalDimensions: missingCritical,
    missingHighDimensions: missingHigh,
    currentDomTargetStatus: input.domRecovery.status,
    authorityMeasurementStatus: input.authorityPass.status,
    recommendedRecoveryMethod: method,
    reason,
  };
}
