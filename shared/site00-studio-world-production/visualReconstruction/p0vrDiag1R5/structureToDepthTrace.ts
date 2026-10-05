/**
 * P0.VR.DIAG.1R5A — Prove anchor → measurement → qualified dimension → depth.
 */

import { mergeRecoveredDimensions } from '../p0vrDiag1R4/mergeRecoveredDimensions.js';
import { computeRegionDepthComputation, reconcileBundleDimensions } from '../p0vrDiag1/forensicDepthQualification.js';
import type { RegionDimensionEvidence, RegionForensicsBundle, RegionMeasurementDepthStatus } from '../p0vrDiag1/types.js';
import type { InternalStructureStatus } from './types.js';

export type StructureToDepthTrace = {
  regionId: string;
  regionName: string;
  internalStructureStatus: InternalStructureStatus;
  structureFound: boolean;
  resolvedAnchors: string[];
  generatedMeasurements: string[];
  qualifiedDimensions: string[];
  disqualifiedDimensions: string[];
  newlyQualifiedDimensions: string[];
  depthBefore: RegionMeasurementDepthStatus;
  depthAfter: RegionMeasurementDepthStatus;
  validCountBefore: number;
  validCountAfter: number;
  depthChanged: boolean;
  status: 'IMPROVED' | 'UNCHANGED' | 'FAILED';
  blockingReason: string | null;
};

export function buildStructureToDepthTrace(input: {
  regionId: string;
  regionName: string;
  internalStructureStatus: InternalStructureStatus;
  resolvedAnchorLabels: string[];
  structureEvidence: RegionDimensionEvidence[];
  bundleBefore: RegionForensicsBundle;
}): StructureToDepthTrace {
  const beforeDepth =
    input.bundleBefore.depthComputation?.depthStatus ?? input.bundleBefore.measurementDepth?.status ?? 'UNMEASURED';
  const beforeValid =
    input.bundleBefore.depthComputation?.qualifiedDimensions.filter((q) => q.countsTowardDepth).length ??
    input.bundleBefore.measurementDepth?.validDimensionCount ??
    0;

  const beforeQualified = new Set(
    input.bundleBefore.depthComputation?.qualifiedDimensions.filter((q) => q.countsTowardDepth).map((q) => q.dimension) ??
      [],
  );

  const { merged } = mergeRecoveredDimensions(input.bundleBefore.dimensions, input.structureEvidence);
  const afterBundle = reconcileBundleDimensions({ ...input.bundleBefore, dimensions: merged });
  const afterDepth =
    afterBundle.depthComputation?.depthStatus ?? afterBundle.measurementDepth?.status ?? beforeDepth;
  const afterValid =
    afterBundle.depthComputation?.qualifiedDimensions.filter((q) => q.countsTowardDepth).length ??
    afterBundle.measurementDepth?.validDimensionCount ??
    beforeValid;

  const qualified =
    afterBundle.depthComputation?.qualifiedDimensions.filter((q) => q.countsTowardDepth).map((q) => q.dimension) ?? [];
  const disqualified =
    afterBundle.depthComputation?.disqualifiedDimensions.map((q) => `${q.dimension} (${q.reason})`) ?? [];

  const newlyQualified = qualified.filter((d) => !beforeQualified.has(d));

  const depthChanged = afterDepth !== beforeDepth || afterValid !== beforeValid;
  let status: StructureToDepthTrace['status'] = 'UNCHANGED';
  if (afterValid > beforeValid || (beforeDepth !== 'SUFFICIENT' && afterDepth === 'SUFFICIENT')) status = 'IMPROVED';
  if (input.structureEvidence.length === 0 && !input.resolvedAnchorLabels.length) status = 'FAILED';

  const blockingReason =
    status === 'UNCHANGED' || status === 'FAILED'
      ? afterBundle.depthComputation?.reasons.join(' · ') ??
        (disqualified.length ? disqualified.slice(0, 3).join(' · ') : 'No new qualified comparable dimensions')
      : null;

  return {
    regionId: input.regionId,
    regionName: input.regionName,
    internalStructureStatus: input.internalStructureStatus,
    structureFound: input.resolvedAnchorLabels.length > 0,
    resolvedAnchors: input.resolvedAnchorLabels,
    generatedMeasurements: input.structureEvidence.map((e) => e.dimension),
    qualifiedDimensions: qualified,
    disqualifiedDimensions: disqualified,
    newlyQualifiedDimensions: newlyQualified,
    depthBefore: beforeDepth,
    depthAfter: afterDepth,
    validCountBefore: beforeValid,
    validCountAfter: afterValid,
    depthChanged,
    status,
    blockingReason,
  };
}

/** Lightweight preview without mutating bundle (for tests). */
export function previewQualificationForEvidence(
  bundle: RegionForensicsBundle,
  structureEvidence: RegionDimensionEvidence[],
): ReturnType<typeof computeRegionDepthComputation> {
  const { merged } = mergeRecoveredDimensions(bundle.dimensions, structureEvidence);
  return computeRegionDepthComputation({ ...bundle, dimensions: merged });
}
