/**
 * P0.VR.DIAG.1R2 — Measurement depth gate (separate from region coverage).
 */

import { DEPTH_GATE_PASS_RATIO } from './constants.js';
import { isRegionDepthSufficient } from './forensicDepthQualification.js';
import type { TopLevelDepthAggregation } from './types.js';
import type { PageRegionLayoutProfile } from './pageRegionLayoutProfiles.js';
import type {
  ForensicMeasurementDepthGate,
  ForensicCoverageGateStatus,
  RegionForensicsBundle,
} from './types.js';

const CRITICAL_REGION_TYPES = new Set(['HEADER', 'NAVIGATION', 'HERO', 'MEDIA', 'PERSISTENT_NAV', 'CONTENT']);

export function evaluateForensicMeasurementDepthGate(input: {
  profile: PageRegionLayoutProfile;
  regionForensics: RegionForensicsBundle[];
  aggregation?: TopLevelDepthAggregation | null;
}): ForensicMeasurementDepthGate {
  const majorDefs = input.profile.regions.filter((r) => r.significance === 'MAJOR');
  const majorTotal = majorDefs.length;

  const shallowMajorRegions: string[] = [];
  let majorSufficient = input.aggregation?.sufficientRegionCount ?? 0;

  if (!input.aggregation) {
    majorSufficient = 0;
    for (const def of majorDefs) {
      const bundle = input.regionForensics.find((b) => b.regionId === def.regionId);
      if (!bundle || bundle.status !== 'MATCHED') continue;
      if (isRegionDepthSufficient(bundle)) {
        majorSufficient += 1;
      } else {
        shallowMajorRegions.push(def.regionName);
      }
    }
  } else {
    for (const summary of input.aggregation.regionSummaries) {
      if (summary.depthStatus === 'SHALLOW' || summary.depthStatus === 'UNMEASURED') {
        shallowMajorRegions.push(summary.regionName);
      }
    }
  }

  const ratio = majorTotal ? majorSufficient / majorTotal : 1;

  let status: ForensicCoverageGateStatus = 'PASS';
  let reason = `${majorSufficient}/${majorTotal} major regions have sufficient measurement depth.`;
  let blockApproveDirection = false;
  let founderMayProceedWithWarning = false;

  const criticalShallow = input.regionForensics.filter(
    (b) =>
      b.status === 'MATCHED' &&
      CRITICAL_REGION_TYPES.has(b.regionType) &&
      !isRegionDepthSufficient(b),
  );

  if (ratio < DEPTH_GATE_PASS_RATIO || criticalShallow.some((b) => (b.depthComputation?.depthStatus ?? b.measurementDepth?.status) === 'UNMEASURED')) {
    status = 'BLOCK';
    blockApproveDirection = true;
    const shallowNames = shallowMajorRegions.slice(0, 3).join(', ');
    reason = `Insufficient multi-dimension measurement depth (${majorSufficient}/${majorTotal} major regions SUFFICIENT${shallowNames ? `; shallow: ${shallowNames}` : ''}).`;
  } else if (shallowMajorRegions.length > 0) {
    status = 'WARNING';
    founderMayProceedWithWarning = true;
    reason = `${shallowMajorRegions.length} major region(s) lack full depth: ${shallowMajorRegions.slice(0, 3).join(' · ')}.`;
  }

  return {
    status,
    reason,
    blockApproveDirection,
    founderMayProceedWithWarning,
    majorSufficient,
    majorTotal,
    shallowMajorRegions,
  };
}

export function combineCoverageAndDepthGates(
  coverage: { status: ForensicCoverageGateStatus; reason: string; blockApproveDirection: boolean; founderMayProceedWithWarning: boolean },
  depth: ForensicMeasurementDepthGate,
  options?: { regionCoverageComplete?: boolean },
): { status: ForensicCoverageGateStatus; reason: string; blockApproveDirection: boolean; founderMayProceedWithWarning: boolean } {
  if (coverage.status === 'BLOCK') {
    return {
      status: 'BLOCK',
      reason: coverage.reason,
      blockApproveDirection: true,
      founderMayProceedWithWarning: false,
    };
  }
  if (depth.status === 'BLOCK') {
    if (options?.regionCoverageComplete) {
      return {
        status: 'WARNING',
        reason: `Forensic depth is incomplete. ${depth.reason}`,
        blockApproveDirection: false,
        founderMayProceedWithWarning: true,
      };
    }
    return {
      status: 'BLOCK',
      reason: depth.reason,
      blockApproveDirection: true,
      founderMayProceedWithWarning: false,
    };
  }
  if (coverage.status === 'WARNING' || depth.status === 'WARNING') {
    return {
      status: 'WARNING',
      reason: depth.status === 'WARNING' ? depth.reason : coverage.reason,
      blockApproveDirection: false,
      founderMayProceedWithWarning: true,
    };
  }
  return coverage;
}
