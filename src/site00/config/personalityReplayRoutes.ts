/** Client routes for blind personality replay intake (no benchmark exposure during answering). */

export function personalityReplayIntakePath(replayId: string, stepId: string): string {
  return `/validation/ndxbook/replay/${replayId}/personality/${stepId}`;
}

export function personalityReplayReviewPath(replayId: string): string {
  return `/validation/ndxbook/replay/${replayId}/personality/review`;
}

export function personalityReplayValidationAdminPath(replayId?: string): string {
  return replayId
    ? `/admin/site00/orchestration/ndxbook/evolve/pipeline-replay-validation/${replayId}`
    : '/admin/site00/orchestration/ndxbook/evolve/pipeline-replay-validation';
}

export const PERSONALITY_REPLAY_VALIDATION_ROUTES = {
  intake: personalityReplayIntakePath,
  review: personalityReplayReviewPath,
  admin: personalityReplayValidationAdminPath,
} as const;
