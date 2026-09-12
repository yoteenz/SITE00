/**
 * P0.VR.DIAG.1R5 — Targeted internal structure recovery for one blocking region.
 */

import type { PageRegionLayoutDefinition } from '../p0vrDiag1/pageRegionLayoutProfiles.js';
import type { DomRegionMeasurement, RegionDimensionEvidence, VisualRegionBounds } from '../p0vrDiag1/types.js';
import { extractAuthorityRegionStructure } from './authorityRegionStructureExtractor.js';
import { extractCurrentRegionStructure } from './currentRegionStructureExtractor.js';
import {
  buildInternalStructureMeasurements,
  internalMeasurementsToDimensionEvidence,
} from './internalStructureMeasurements.js';
import { computeInternalStructureCompleteness } from './internalStructureCompleteness.js';
import { deriveEvidenceRecoveryFailure } from './evidenceRecoveryFailure.js';
import { buildStructureHierarchyPreview } from './structureHierarchyPreview.js';
import type { InternalStructureRecoveryTrace, RegionInternalStructure } from './types.js';
import type { RegionForensicsBundle, RegionInternalStructureSummary } from '../p0vrDiag1/types.js';
import { buildStructureToDepthTrace } from './structureToDepthTrace.js';

export function runRegionInternalStructureRecovery(input: {
  def: PageRegionLayoutDefinition;
  dom: DomRegionMeasurement | null | undefined;
  relatedDom: DomRegionMeasurement[];
  authority: VisualRegionBounds;
  validDimensionsBefore: number;
  captureScopeInsufficient?: boolean;
  bundleBefore?: RegionForensicsBundle;
}): {
  currentStructure: RegionInternalStructure;
  authorityStructure: RegionInternalStructure;
  dimensionEvidence: RegionDimensionEvidence[];
  summary: RegionInternalStructureSummary;
  trace: InternalStructureRecoveryTrace;
  depthTrace: ReturnType<typeof buildStructureToDepthTrace> | null;
} {
  const currentStructure = extractCurrentRegionStructure({
    def: input.def,
    dom: input.dom,
    relatedDom: input.relatedDom,
  });
  const authorityStructure = extractAuthorityRegionStructure({
    def: input.def,
    authority: input.authority,
  });

  const measurements = buildInternalStructureMeasurements(authorityStructure, currentStructure);
  const dimensionEvidence = internalMeasurementsToDimensionEvidence(
    input.def.regionId,
    measurements,
    input.def.regionType,
  );

  const completeness = computeInternalStructureCompleteness(currentStructure);
  const hierarchy = buildStructureHierarchyPreview(currentStructure);

  const summary: RegionInternalStructureSummary = {
    status: currentStructure.status,
    subtype: currentStructure.subtype,
    completenessPct: completeness.completenessPct,
    anchorHierarchy: hierarchy.length ? hierarchy : ['STRUCTURE NOT ANALYZED'],
  };

  const validAfterEstimate = input.validDimensionsBefore + dimensionEvidence.filter((d) => d.delta != null).length;

  const failure = deriveEvidenceRecoveryFailure({
    regionId: input.def.regionId,
    currentStructure,
    authorityStructure,
    dimensionsAdded: dimensionEvidence.length,
    regionTypeAmbiguous: currentStructure.subtype === 'AMBIGUOUS',
    captureScopeInsufficient: input.captureScopeInsufficient,
  });

  const recoveredDimensions = dimensionEvidence.map((d) => d.dimension);

  const resolvedLabels = currentStructure.childAnchors
    .filter((a) => a.anchorType !== 'CONTAINER')
    .map((a) => a.label);

  let depthTrace: ReturnType<typeof buildStructureToDepthTrace> | null = null;
  if (input.bundleBefore) {
    depthTrace = buildStructureToDepthTrace({
      regionId: input.def.regionId,
      regionName: input.def.regionName,
      internalStructureStatus: currentStructure.status,
      resolvedAnchorLabels: resolvedLabels,
      structureEvidence: dimensionEvidence,
      bundleBefore: input.bundleBefore,
    });
    summary.failureCode = failure?.failureCode ?? depthTrace.blockingReason ?? undefined;
    summary.failureDetail = failure?.details ?? depthTrace.blockingReason ?? undefined;
  } else if (failure) {
    summary.failureCode = failure.failureCode;
    summary.failureDetail = failure.details;
  }

  const trace: InternalStructureRecoveryTrace = {
    regionId: input.def.regionId,
    regionName: input.def.regionName,
    validDimensionsBefore: input.validDimensionsBefore,
    validDimensionsAfter: depthTrace?.validCountAfter ?? validAfterEstimate,
    structureStatus: currentStructure.status,
    recoveredDimensions,
    failure: failure ?? undefined,
    depthTrace: depthTrace ?? undefined,
  };

  return {
    currentStructure,
    authorityStructure,
    dimensionEvidence,
    summary,
    trace,
    depthTrace,
  };
}
