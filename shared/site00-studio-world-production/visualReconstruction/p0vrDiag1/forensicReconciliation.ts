/**
 * P0.VR.DIAG.1R3 — Recompute scoring from stored evidence (no re-extraction).
 */

import { buildFullPageRegionCoverageMap, computeForensicCoverageScore, evaluateForensicCoverageGate } from './fullPageRegionCoverage.js';
import { combineCoverageAndDepthGates, evaluateForensicMeasurementDepthGate } from './forensicMeasurementDepthGate.js';
import {
  computeTopLevelDepthAggregation,
  reconcileBundleDimensions,
  runForensicConsistencyCheck,
} from './forensicDepthQualification.js';
import type { PageRegionLayoutProfile } from './pageRegionLayoutProfiles.js';
import type {
  AuthorityRelativeForensicsReport,
  ForensicReconciliationReceipt,
  TopLevelDepthAggregation,
} from './types.js';

import { P0_VR_DIAG_1R3_BUILD } from './constants.js';

export function reconcileForensicReportScoring(input: {
  report: AuthorityRelativeForensicsReport;
  profile: PageRegionLayoutProfile;
}): {
  report: AuthorityRelativeForensicsReport;
  aggregation: TopLevelDepthAggregation;
  receipt: ForensicReconciliationReceipt;
} {
  const oldDepthPct = input.report.coverageMap.coverageScore.measurementDepthPct;

  const regionForensics = input.report.regionForensics.map(reconcileBundleDimensions);
  let mathErrorsCorrected = 0;
  for (let i = 0; i < input.report.regionForensics.length; i++) {
    const before = input.report.regionForensics[i]!.dimensions;
    const after = regionForensics[i]!.dimensions;
    for (let j = 0; j < before.length; j++) {
      if (before[j]!.delta !== after[j]!.delta) mathErrorsCorrected += 1;
    }
  }

  const aggregation = computeTopLevelDepthAggregation({ profile: input.profile, regionForensics });
  const consistency = runForensicConsistencyCheck({ aggregation, regionForensics });

  const coverageScore = computeForensicCoverageScore({
    profile: input.profile,
    regionForensics,
    regionMatches: input.report.regionMatches,
  });

  coverageScore.measurementDepthPct = aggregation.depthPct;
  coverageScore.majorWithSufficientDepth = aggregation.sufficientRegionCount;

  const coverageGateRaw = evaluateForensicCoverageGate(coverageScore);
  const measurementDepthGate = evaluateForensicMeasurementDepthGate({
    profile: input.profile,
    regionForensics,
    aggregation,
  });

  let coverageGate = combineCoverageAndDepthGates(coverageGateRaw, measurementDepthGate);
  if (!consistency.consistent) {
    coverageGate = {
      ...coverageGate,
      status: 'BLOCK',
      blockApproveDirection: true,
      reason: consistency.message ?? 'FORENSIC_STATE_INCONSISTENT',
    };
  }

  const depthStatusesChanged = regionForensics.filter(
    (b, i) => b.measurementDepth?.status !== input.report.regionForensics[i]?.measurementDepth?.status,
  ).length;

  const coverageMap = buildFullPageRegionCoverageMap({
    pageId: input.report.coverageMap.pageId,
    viewport: input.report.coverageMap.viewport,
    authorityVersionId: input.report.coverageMap.authorityVersionId,
    captureId: input.report.coverageMap.captureId,
    profile: input.profile,
    regionMatches: input.report.regionMatches,
    regionForensics,
    currentScope: input.report.coverageMap.captureScope,
    authorityScope: input.report.coverageMap.authorityCaptureScope,
    scopeMismatch: input.report.coverageMap.scopeMismatch,
    coverageScore,
    coverageGate,
  });

  const report: AuthorityRelativeForensicsReport = {
    ...input.report,
    regionForensics,
    coverageMap,
    coverageGate,
    measurementDepthGate,
    topLevelDepthAggregation: aggregation,
    forensicConsistencyStatus: consistency.status,
  };

  const receipt: ForensicReconciliationReceipt = {
    forensicsVersion: P0_VR_DIAG_1R3_BUILD,
    regionsChecked: regionForensics.length,
    dimensionsChecked: regionForensics.reduce((n, b) => n + b.dimensions.length, 0),
    mathErrorsCorrected,
    depthStatusesChanged,
    oldDepthPct,
    newDepthPct: aggregation.depthPct,
    consistencyStatus: consistency.status,
    createdAt: new Date().toISOString(),
  };

  return { report, aggregation, receipt };
}
