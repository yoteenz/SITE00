/**
 * P0.VR.DIAG.1R5 — Root-cause when internal structure recovery does not add depth.
 */

import type { EvidenceRecoveryFailure, EvidenceRecoveryFailureCode, RegionInternalStructure } from './types.js';
import { computeInternalStructureCompleteness } from './internalStructureCompleteness.js';

export function deriveEvidenceRecoveryFailure(input: {
  regionId: string;
  currentStructure: RegionInternalStructure;
  authorityStructure: RegionInternalStructure;
  dimensionsAdded: number;
  regionTypeAmbiguous?: boolean;
  captureScopeInsufficient?: boolean;
}): EvidenceRecoveryFailure | null {
  if (input.dimensionsAdded > 0) return null;

  if (input.captureScopeInsufficient) {
    return failure(
      input.regionId,
      'CAPTURE_SCOPE_INSUFFICIENT',
      'DOM_STRUCTURE',
      'Region DOM target is outside capture scope or missing measurements.',
      'Expand capture scroll scope or recapture with full page height.',
    );
  }

  if (input.regionTypeAmbiguous || input.currentStructure.subtype === 'AMBIGUOUS') {
    return failure(
      input.regionId,
      'REGION_TYPE_AMBIGUOUS',
      'DOM_STRUCTURE',
      'Complex region subtype could not be classified (milestone vs card rail vs composite).',
      'Confirm region type in layout profile or split composite region in authority.',
    );
  }

  if (input.currentStructure.status === 'UNRESOLVED' || input.currentStructure.status === 'UNSUPPORTED') {
    return failure(
      input.regionId,
      'DOM_CHILDREN_UNRESOLVED',
      'DOM_STRUCTURE',
      'Container matched but meaningful child anchors were not resolved in DOM.',
      'Verify component targets expose nav items, cells, or progress track in domMeasurements.',
    );
  }

  if (input.authorityStructure.status === 'UNRESOLVED' || input.authorityStructure.childAnchors.length < 2) {
    return failure(
      input.regionId,
      'AUTHORITY_ANCHORS_UNRESOLVED',
      'AUTHORITY_STRUCTURE',
      'Authority crop did not yield enough internal anchors for comparison.',
      'Use higher-resolution authority or manual region confirmation.',
    );
  }

  const completeness = computeInternalStructureCompleteness(input.currentStructure);
  if (completeness.missingAnchors.length > 0 && input.currentStructure.status === 'PARTIAL') {
    return failure(
      input.regionId,
      'DOM_CHILDREN_UNRESOLVED',
      'MEASUREMENT',
      `Partial structure — missing anchors: ${completeness.missingAnchors.join(', ')}.`,
      'Add related DOM measurements for repeated siblings or active indicator.',
    );
  }

  return failure(
    input.regionId,
    'STRUCTURE_UNSUPPORTED',
    'MEASUREMENT',
    'Internal structure resolved but no new comparable dimensions qualified for depth.',
    'Review dimension profile vs recovered measurements; check confidence and units.',
  );
}

function failure(
  regionId: string,
  failureCode: EvidenceRecoveryFailureCode,
  failedStage: EvidenceRecoveryFailure['failedStage'],
  details: string,
  recommendedNextAction: string,
): EvidenceRecoveryFailure {
  return { regionId, failureCode, failedStage, details, recommendedNextAction };
}
