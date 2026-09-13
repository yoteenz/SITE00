import type { ConceptGalleryState, ConceptCandidate } from '../p0vrTwinV22/types.js';
import { PAIRED_CONCEPT_COVERAGE_MIN } from './constants.js';

export function assertPairedConceptApprovalGate(input: {
  candidate: ConceptCandidate;
  gallery: ConceptGalleryState;
}): void {
  if (input.candidate.conceptOrigin !== 'DUAL_OUTPUT_PAIRED') {
    return;
  }
  const paired = input.gallery.pairedArtifacts?.[input.candidate.conceptId];
  const coverage = input.gallery.blueprintVisualCoverage?.[input.candidate.conceptId];
  const assetCov = input.gallery.assetCoverage?.[input.candidate.conceptId];
  const reconciled = input.gallery.reconciledVisualBlueprints?.[
    paired?.conceptVisualBlueprintId ?? ''
  ];

  if (!paired || paired.status === 'RECONCILIATION_REQUIRED') {
    throw new Error('TWIN_V25_APPROVAL_BLOCKED: reconciliation required');
  }
  if (!reconciled) {
    throw new Error('TWIN_V25_APPROVAL_BLOCKED: missing reconciled visual blueprint');
  }
  if (!coverage || coverage.coveragePercent < PAIRED_CONCEPT_COVERAGE_MIN) {
    throw new Error('TWIN_V25_APPROVAL_BLOCKED: visual coverage below 95%');
  }
  if (!assetCov || assetCov.status !== 'PASS') {
    throw new Error('TWIN_V25_APPROVAL_BLOCKED: asset coverage incomplete');
  }
  if (!input.candidate.buildReadiness.visualReady || !input.candidate.buildReadiness.blueprintReady) {
    throw new Error('CONCEPT_INCOMPLETE');
  }
  if (!input.candidate.buildReadiness.assetsReady) {
    throw new Error('ASSET_INCOMPLETE');
  }
  if (!input.candidate.buildReadiness.functionsReady) {
    throw new Error('FUNCTION_PLAN_INCOMPLETE');
  }
}
