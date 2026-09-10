/**
 * P0.VR.7R1 — Workflow sequence intelligence core.
 */

import type { ReferenceAssetCandidate } from '../referenceReconstructionIntelligence/referenceAssetMismatch.js';
import { displayNameForCandidate, resolveSiblingAssetSet } from './siblingAssetSetResolver.js';
import type { WorkflowSequenceIntelligenceInput, WorkflowSequenceIntelligenceOutput } from './types.js';

function buildIntentSummary(input: {
  setType: string;
  count: number;
  spatialPattern: string;
  founderInstruction?: string | null;
}): string[] {
  const lines: string[] = [];
  if (input.setType === 'BRAND_FAMILY_VISUAL_ROW') {
    lines.push(`RECONSTRUCT ${input.count} BRAND FAMILY VISUALS`);
    lines.push('LEFT TO RIGHT');
  } else {
    lines.push(`RECONSTRUCT ${input.count} SIBLING ASSETS`);
    lines.push(input.spatialPattern.replace(/_/g, ' '));
  }
  lines.push('SAME TREATMENT');
  lines.push('SEPARATE APPROVAL PER CROP');
  lines.push('BATCH GENERATION AFTER CROP REVIEW');
  if (input.founderInstruction?.trim()) {
    lines.push(`INSTRUCTION: ${input.founderInstruction.trim().toUpperCase()}`);
  }
  return lines;
}

function currentIndexFromCandidates(candidates: ReferenceAssetCandidate[], orderedIds: string[]): number {
  const firstIncomplete = orderedIds.findIndex((id) => {
    const c = candidates.find((x) => x.candidateId === id);
    return c && c.cropStatus !== 'APPROVED';
  });
  if (firstIncomplete >= 0) return firstIncomplete;
  return Math.max(0, orderedIds.length - 1);
}

export function analyzeWorkflowSequence(input: WorkflowSequenceIntelligenceInput): WorkflowSequenceIntelligenceOutput {
  const resolution = resolveSiblingAssetSet({
    candidates: input.candidates,
    founderInstruction: input.founderInstruction,
    parentComponent: input.spatialHints?.parentComponent ?? null,
  });

  const orderedAssetIds = resolution.orderedCandidateIds;
  const currentIndex = currentIndexFromCandidates(input.candidates, orderedAssetIds);
  const nextAssetId = orderedAssetIds[currentIndex] ?? orderedAssetIds[0] ?? null;
  const sharedTreatment =
    input.candidates[0]?.treatmentPlan.reconstructionRequired === false
      ? 'DIRECT_EXTRACTION'
      : 'RECONSTRUCTION';

  const autoAdvanceAllowed =
    (input.autoAdvanceEnabled ?? true) &&
    !resolution.orderAmbiguous &&
    resolution.confidence >= 0.7 &&
    orderedAssetIds.length > 1;

  return {
    sequenceId: `seq-${input.jobId}`,
    sequenceType: resolution.setType,
    orderedAssetIds,
    spatialPattern: resolution.spatialPattern,
    sharedIntent: resolution.setType === 'BRAND_FAMILY_VISUAL_ROW' ? 'brand-family-visual-reconstruction' : 'sibling-asset-reconstruction',
    sharedTreatment,
    sharedCropBehavior: 'inner-media-isolation',
    sharedGenerationPolicy: 'explicit-batch-approval',
    currentIndex,
    nextAssetId,
    confidence: resolution.confidence,
    autoAdvanceAllowed,
    orderAmbiguous: resolution.orderAmbiguous,
    intentSummary: buildIntentSummary({
      setType: resolution.setType,
      count: orderedAssetIds.length,
      spatialPattern: resolution.spatialPattern,
      founderInstruction: input.founderInstruction,
    }),
  };
}

export function sequenceProgressLabel(input: {
  intelligence: WorkflowSequenceIntelligenceOutput;
  candidates: ReferenceAssetCandidate[];
}): string {
  const approved = input.candidates.filter((c) => c.cropStatus === 'APPROVED').length;
  const total = input.intelligence.orderedAssetIds.length;
  const currentId = input.intelligence.nextAssetId;
  const current = input.candidates.find((c) => c.candidateId === currentId);
  const currentName = current ? displayNameForCandidate(current) : 'NEXT ASSET';
  return `${approved} OF ${total} CROPS APPROVED · NEXT: ${currentName}`;
}
