/**
 * P0.VR.4 — Targeted revision loop (bounded passes).
 */

import { MAX_TARGETED_REVISION_PASSES } from './constants.js';
import { buildTargetedRevisionPrompt } from './reconstructionPrompts.js';
import type { DesignAssetReconstructionQA, DesignReconstructionAssetType } from './types.js';
import { extractTargetedRevisionDiagnosis } from './assetReconstructionQA.js';

export function canRunTargetedRevision(revisionCount: number): boolean {
  return revisionCount < MAX_TARGETED_REVISION_PASSES;
}

export function buildRevisionFromQA(input: {
  qa: DesignAssetReconstructionQA;
  assetType: DesignReconstructionAssetType;
  revisionCount: number;
}): { allowed: boolean; prompt: string | null; reason?: string } {
  if (!canRunTargetedRevision(input.revisionCount)) {
    return {
      allowed: false,
      prompt: null,
      reason: 'MAX_REVISION_PASSES_REACHED — founder action required',
    };
  }

  const diagnosis = extractTargetedRevisionDiagnosis(input.qa);
  if (!diagnosis) {
    return { allowed: false, prompt: null, reason: 'No QA diagnosis for targeted revision' };
  }

  return {
    allowed: true,
    prompt: buildTargetedRevisionPrompt({ diagnosis, assetType: input.assetType }),
  };
}
