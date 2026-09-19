/**
 * Sprint B4.9 — Final cinematic storyboard founder judgment store.
 */

import type { FinalStoryboardFounderJudgment } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import { ENTRY_002_FINAL_CINEMATIC_STORYBOARD_ID } from '../../../shared/site00-expression-engine/finalCinematicStoryboardIds.js';

export type FinalCinematicStoryboardJudgmentRecord = {
  storyboardId: typeof ENTRY_002_FINAL_CINEMATIC_STORYBOARD_ID;
  founderJudgment: FinalStoryboardFounderJudgment;
  notes: string | null;
  recordedAt: string;
};

let storedJudgment: FinalCinematicStoryboardJudgmentRecord | null = null;

export function resetFinalCinematicStoryboardJudgmentStore(): void {
  storedJudgment = null;
}

export function getFinalCinematicStoryboardJudgment(): FinalCinematicStoryboardJudgmentRecord | null {
  return storedJudgment;
}

export function recordFinalCinematicStoryboardJudgment(params: {
  founderJudgment: FinalStoryboardFounderJudgment;
  notes?: string | null;
}): FinalCinematicStoryboardJudgmentRecord {
  storedJudgment = {
    storyboardId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_ID,
    founderJudgment: params.founderJudgment,
    notes: params.notes ?? null,
    recordedAt: new Date().toISOString(),
  };
  return storedJudgment;
}

export function resolveFinalStoryboardFounderJudgment(): FinalStoryboardFounderJudgment {
  return storedJudgment?.founderJudgment ?? 'UNREVIEWED';
}
