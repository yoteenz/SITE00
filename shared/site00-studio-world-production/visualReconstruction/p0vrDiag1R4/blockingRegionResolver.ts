/**
 * P0.VR.DIAG.1R4 — Resolve blocking major regions from live R3 depth output.
 */

import { isRegionDepthSufficient } from '../p0vrDiag1/forensicDepthQualification.js';
import type { PageRegionLayoutProfile } from '../p0vrDiag1/pageRegionLayoutProfiles.js';
import type { AuthorityRelativeForensicsReport, RegionMeasurementDepthStatus } from '../p0vrDiag1/types.js';
import { listFounderRegionOverrides, isRegionExcludedByFounder } from './regionFounderOverride.js';
import type { BlockingRegion } from './types.js';

const BLOCKING_STATUSES: RegionMeasurementDepthStatus[] = ['SHALLOW', 'UNMEASURED', 'BLOCKED'];

export function resolveBlockingRegions(input: {
  report: AuthorityRelativeForensicsReport;
  profile: PageRegionLayoutProfile;
  reportId?: string;
}): BlockingRegion[] {
  const excluded = new Set(
    listFounderRegionOverrides(input.reportId ?? input.report.reportId)
      .filter((o) => o.action === 'EXCLUDE_FROM_RECONSTRUCTION')
      .map((o) => o.regionId),
  );

  const majorIds = new Set(
    input.profile.regions.filter((r) => r.significance === 'MAJOR').map((r) => r.regionId),
  );

  const blocking: BlockingRegion[] = [];

  for (const bundle of input.report.regionForensics) {
    if (!majorIds.has(bundle.regionId)) continue;
    if (bundle.status !== 'MATCHED') continue;
    if (excluded.has(bundle.regionId) || isRegionExcludedByFounder(bundle.regionId)) continue;
    if (isRegionDepthSufficient(bundle)) continue;

    const status = bundle.depthComputation?.depthStatus ?? bundle.measurementDepth?.status ?? 'UNMEASURED';
    if (!BLOCKING_STATUSES.includes(status)) continue;

    blocking.push({
      regionId: bundle.regionId,
      regionName: bundle.regionName,
      regionType: bundle.regionType,
      depthStatus: status,
      reasons: bundle.depthComputation?.reasons ?? bundle.measurementDepth?.depthReasons ?? [],
    });
  }

  return blocking.sort((a, b) => a.regionName.localeCompare(b.regionName));
}
