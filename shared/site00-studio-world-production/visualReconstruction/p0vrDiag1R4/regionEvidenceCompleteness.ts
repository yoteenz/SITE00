/**
 * P0.VR.DIAG.1R4 — Type-aware critical dimension completeness.
 */

import { getRegionMeasurementProfile } from '../p0vrDiag1/regionMeasurementProfiles.js';
import type { RegionDepthComputation, RegionMeasurementDepthStatus, VisualRegionType } from '../p0vrDiag1/types.js';
import type { RegionEvidenceCompleteness } from './types.js';

export function computeRegionEvidenceCompleteness(input: {
  regionId: string;
  regionType: VisualRegionType;
  depthComputation?: RegionDepthComputation | null;
}): RegionEvidenceCompleteness {
  const profile = getRegionMeasurementProfile(input.regionType);
  const criticalExpected = profile.required.filter((r) => r.importance === 'CRITICAL').length;
  const highExpected = profile.required.filter((r) => r.importance === 'HIGH').length;
  const comp = input.depthComputation;

  const criticalResolved = comp?.criticalResolved ?? 0;
  const highResolved = comp?.highResolved ?? 0;
  const optionalResolved =
    comp?.qualifiedDimensions.filter((q) => q.importance === 'LOW' || q.importance === 'MEDIUM').length ?? 0;

  const denom = Math.max(1, criticalExpected + highExpected);
  const completenessPct = Math.round(((criticalResolved + highResolved) / denom) * 100);

  const blockingMissing: string[] = [];
  if (comp) {
    for (const r of comp.reasons) {
      if (r.startsWith('MISSING')) blockingMissing.push(r);
    }
  }

  const status = comp?.depthStatus ?? ('UNMEASURED' as RegionMeasurementDepthStatus);

  return {
    regionId: input.regionId,
    criticalExpected,
    criticalResolved,
    highExpected,
    highResolved,
    optionalResolved,
    completenessPct,
    status,
    blockingMissing,
  };
}
