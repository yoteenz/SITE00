/**
 * P0.5E.5 — Pre-casting mode + production generation gate.
 * P0.5E.4F — Delegates to canonical character authority when casting state available.
 */

import type { CharacterVisualCastingState } from '../characterVisualCasting/types.js';
import { evaluateNDXVisualIdentityReadiness } from '../characterAuthority/readiness.js';
import type { CharacterContinuityPipelineRun } from './types.js';

export const PRE_CASTING_PIPELINE_MODE = true as const;
export const PRODUCTION_GENERATION_BLOCKED_CHARACTER_NOT_CAST =
  'PRODUCTION_GENERATION_BLOCKED_CHARACTER_NOT_CAST' as const;

export function isPreCastingMode(run: CharacterContinuityPipelineRun): boolean {
  return run.system.preCastingMode === true;
}

export function productionGenerationBlocked(run: CharacterContinuityPipelineRun): boolean {
  return run.productionGenerationBlocked === true;
}

export function assertProductionGenerationAllowed(
  run: CharacterContinuityPipelineRun,
  casting?: CharacterVisualCastingState | null,
): {
  allowed: boolean;
  reason: string;
} {
  if (casting) {
    const visual = evaluateNDXVisualIdentityReadiness(casting);
    if (!visual.ready) {
      return { allowed: false, reason: 'CHARACTER_VISUAL_IDENTITY_NOT_READY' };
    }
  }
  if (run.productionGenerationBlocked) {
    return { allowed: false, reason: PRODUCTION_GENERATION_BLOCKED_CHARACTER_NOT_CAST };
  }
  if (run.preCastingStatus === 'CHARACTER_IDENTITY_NOT_CAST') {
    return { allowed: false, reason: 'CHARACTER_IDENTITY_NOT_CAST' };
  }
  return { allowed: false, reason: PRODUCTION_GENERATION_BLOCKED_CHARACTER_NOT_CAST };
}

export function noAutomaticGeneration(run: CharacterContinuityPipelineRun): boolean {
  return run.falGenerationRequests === 0;
}

export function noAutomaticTraining(run: CharacterContinuityPipelineRun): boolean {
  return run.trainedIdentity?.trainingExecuted === false;
}
