import type { CinematicGenerationJobRecord } from '../types/schemas.js';

export type RoughCutHandoffInput = {
  job: CinematicGenerationJobRecord;
  outputAssetId: string;
  videoPath: string;
  shotOrder: number;
  narrativeBeat: string;
  timelineDurationSec: number;
  founderApprovedOutput: boolean;
};

export type RoughCutHandoffResult =
  | { ok: true; roughCutClipId: string; filmId: string }
  | { ok: false; blockedReason: 'UNAPPROVED_OUTPUT' | 'INVALID_VIDEO_SOURCE' | 'JOB_NOT_SUCCEEDED' | 'MISSING_SHOT_ID' };

/**
 * Validates handoff into existing filmProduction rough cut — does not auto-promote to final reel.
 */
export function validateRoughCutHandoff(input: RoughCutHandoffInput): RoughCutHandoffResult {
  if (!input.founderApprovedOutput) {
    return { ok: false, blockedReason: 'UNAPPROVED_OUTPUT' };
  }
  if (input.job.state !== 'FOUNDER_APPROVED' && input.job.state !== 'OUTPUT_IMPORTED' && input.job.state !== 'SUCCEEDED') {
    return { ok: false, blockedReason: 'JOB_NOT_SUCCEEDED' };
  }
  if (!input.videoPath.trim()) {
    return { ok: false, blockedReason: 'INVALID_VIDEO_SOURCE' };
  }
  if (!input.job.promptHash) {
    return { ok: false, blockedReason: 'MISSING_SHOT_ID' };
  }
  const filmId = `film-${input.job.jobId}`;
  const roughCutClipId = `clip-${input.outputAssetId}`;
  return { ok: true, roughCutClipId, filmId };
}
