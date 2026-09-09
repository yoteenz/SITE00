/**
 * Reference Reconstruction System Inspector state builder.
 */

import { auditExecutionStyleConflicts } from './designExecutionConstraintEngine.js';
import { evaluateCaptureReadiness, defaultSkinsMobileDataState } from './deterministicCapture.js';
import { fidelityFalsePassGuard } from './referenceVerificationEngine.js';
import { evaluateVisualImplementationDelta } from '../p0vr6/visualImplementationNoOpGuard.js';
import {
  buildSkinsMobileAuthorityBoundaryMap,
  detectHostShellOverreach,
  skinsWorkspaceNotClassifiedAsHost,
} from './authorityBoundary.js';
import { buildReferenceLiveVisualInventory } from './referenceAssetMismatch.js';
import { buildCropGeometryInspectorSnapshot } from './founderCropIntelligence/cropPreviewAlignment.js';
import { buildSkinsMobileMultiAssetReconstructionJob, getJobProgressSummary } from './multiAssetReconstructionJob.js';
import { evaluatePartialVisualImplementationGuard } from './partialVisualImplementationGuard.js';
import { buildSkinsMobileReferenceBlueprint } from './skinsMobileBlueprint.js';
import type { BoundaryOverlayRegion, ReferenceReconstructionInspectorState } from './types.js';

export function buildBoundaryOverlayRegions(authorityId: string): BoundaryOverlayRegion[] {
  const boundary = buildSkinsMobileAuthorityBoundaryMap(authorityId);
  const all = [
    ...boundary.hostShellRegions,
    ...boundary.workspaceAuthorityRegions,
    ...boundary.sharedFunctionalRegions,
    ...boundary.assetRegions,
    ...boundary.ignoredContextRegions,
  ];
  return all.map((r) => ({
    regionId: r.regionId,
    label: r.label,
    boundaryClass: r.boundaryClass,
    bbox: r.bbox,
  }));
}

export function buildReferenceReconstructionInspectorState(input?: {
  testsPass?: boolean;
  visualQaExecuted?: boolean;
  majorDriftRemaining?: number;
  beforeAfterDelta?: number;
  cssSources?: string[];
  resolvedMismatches?: number;
}): ReferenceReconstructionInspectorState | null {
  const blueprint = buildSkinsMobileReferenceBlueprint();
  if (!blueprint) return null;

  const boundary = buildSkinsMobileAuthorityBoundaryMap(blueprint.authorityId);
  const overreach = detectHostShellOverreach(boundary);
  const inventory = buildReferenceLiveVisualInventory({
    authorityId: blueprint.authorityId,
    viewport: 'MOBILE',
    liveColorSwatchBrands: ['FRONTAL_SLAYER', 'AIO', 'ASTRAL_WORLD', 'STUDIO_WORLD'],
  });
  const multiAssetJob = buildSkinsMobileMultiAssetReconstructionJob({
    liveColorSwatchBrands: ['FRONTAL_SLAYER', 'AIO', 'ASTRAL_WORLD', 'STUDIO_WORLD'],
  });
  const jobProgress = multiAssetJob ? getJobProgressSummary(multiAssetJob) : null;

  const styleConflicts = auditExecutionStyleConflicts({
    cssSources: input?.cssSources ?? [],
    authorityGeometry: blueprint.geometrySpecs,
  });

  const capture = evaluateCaptureReadiness({
    fontsReady: true,
    layoutStable: true,
    animationsFrozen: true,
    scrollY: 0,
    expectedScrollY: 0,
    dataState: blueprint.dataState,
    expectedDataState: defaultSkinsMobileDataState(),
    imagesLoaded: blueprint.assetRequirements.some((a) => a.bound),
    hydrationComplete: true,
  });

  const falsePass = fidelityFalsePassGuard({
    testsPass: input?.testsPass ?? true,
    visualQaExecuted: input?.visualQaExecuted ?? false,
    majorDriftRemaining: input?.majorDriftRemaining ?? inventory.assetMismatchCount,
  });

  const noOp = evaluateVisualImplementationDelta({
    before: { label: 'before', deltaRatio: input?.beforeAfterDelta ?? 0 },
    after: { label: 'after', deltaRatio: input?.beforeAfterDelta ?? 0 },
  });

  const partialOp = evaluatePartialVisualImplementationGuard({
    totalSignificantMismatches: inventory.assetMismatchCount,
    resolvedMismatches: input?.resolvedMismatches ?? 1,
    claimsConvergenceComplete: false,
  });

  const unboundAssets = blueprint.assetRequirements.filter((a) => a.required && !a.bound).length;
  const failureCodes = [
    ...capture.blockers as ReferenceReconstructionInspectorState['failureCodes'],
    ...(falsePass.failureCode ? [falsePass.failureCode] : []),
    ...(overreach.failureCode ? [overreach.failureCode] : []),
    ...(partialOp.failureCode && input?.resolvedMismatches === 1 ? [partialOp.failureCode] : []),
  ];

  if (!skinsWorkspaceNotClassifiedAsHost(boundary)) {
    failureCodes.push('REFERENCE_AUTHORITY_REGION_UNDERCLASSIFIED');
  }

  return {
    authorityId: blueprint.authorityId,
    viewport: blueprint.viewport,
    contentCanvas: {
      width: blueprint.viewportCalibration.referenceViewportWidth,
      height: blueprint.viewportCalibration.referenceViewportHeight,
    },
    devicePixelRatio: blueprint.viewportCalibration.devicePixelRatio,
    regionCount: blueprint.regionTree.length,
    layoutInferenceStatus: blueprint.uncertainties.length ? 'UNCERTAIN' : 'COMPLETE',
    blueprintStatus: blueprint.status,
    assetRequirementCount: blueprint.assetRequirements.length,
    styleConflictCount: styleConflicts.length,
    captureReadyStatus: capture.ready ? 'READY' : 'BLOCKED',
    captureBlockers: capture.blockers,
    convergenceIteration: 0,
    majorDriftCount: unboundAssets,
    minorDriftCount: 0,
    microDriftCount: 0,
    noOpGuard: noOp.materialVisualDelta ? 'PASS' : input?.beforeAfterDelta === 0 ? 'FAIL' : 'NOT_RUN',
    falsePassGuard: falsePass.pass ? 'PASS' : 'FAIL',
    partialOpGuard: partialOp.pass ? 'PASS' : 'FAIL',
    verificationStatus: blueprint.status === 'READY' && unboundAssets === 0 ? 'HIGH_MATCH' : 'BLOCKED',
    failureCodes: [...new Set(failureCodes)],
    hostShellCoveragePercent: overreach.hostCoveragePercent,
    authorityRebuildCoveragePercent: Math.round(boundary.authorityRebuildCoverage * 100),
    boundaryReviewRequired: blueprint.boundaryReviewRequired ?? false,
    boundaryOverlayRegions: buildBoundaryOverlayRegions(blueprint.authorityId),
    assetMismatchCount: inventory.assetMismatchCount,
    multiAssetJobId: multiAssetJob?.jobId ?? null,
    cropApprovalSummary: jobProgress?.crops ?? '0 / 5 APPROVED',
    generationApprovalSummary: jobProgress?.generation ?? 'BLOCKED',
    cropGeometry: buildCropGeometryInspectorSnapshot(),
  };
}
