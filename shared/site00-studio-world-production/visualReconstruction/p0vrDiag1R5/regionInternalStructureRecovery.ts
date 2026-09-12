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
import type { RegionInternalStructureSummary } from '../p0vrDiag1/types.js';

export function runRegionInternalStructureRecovery(input: {
  def: PageRegionLayoutDefinition;
  dom: DomRegionMeasurement | null | undefined;
  relatedDom: DomRegionMeasurement[];
  authority: VisualRegionBounds;
  validDimensionsBefore: number;
  captureScopeInsufficient?: boolean;
}): {
  currentStructure: RegionInternalStructure;
  authorityStructure: RegionInternalStructure;
  dimensionEvidence: RegionDimensionEvidence[];
  summary: RegionInternalStructureSummary;
  trace: InternalStructureRecoveryTrace;
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
    anchorHierarchy: hierarchy,
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

  const trace: InternalStructureRecoveryTrace = {
    regionId: input.def.regionId,
    regionName: input.def.regionName,
    validDimensionsBefore: input.validDimensionsBefore,
    validDimensionsAfter: validAfterEstimate,
    structureStatus: currentStructure.status,
    recoveredDimensions,
    failure: failure ?? undefined,
  };

  return {
    currentStructure,
    authorityStructure,
    dimensionEvidence,
    summary,
    trace,
  };
}
