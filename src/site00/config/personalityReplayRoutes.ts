/** Client routes for blind personality replay intake (no benchmark exposure during answering). */

export function projectPersonalityReplayPath(projectSlug: string): string {
  return `/projects/${projectSlug}/personality-replay`;
}

export function projectPersonalityReplayStepPath(projectSlug: string, stepId: string): string {
  return `/projects/${projectSlug}/personality-replay/${stepId}`;
}

export function projectPersonalityReplayReviewPath(projectSlug: string): string {
  return `/projects/${projectSlug}/personality-replay/review`;
}

/** Legacy validation namespace — still supported for admin deep links. */
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
  project: projectPersonalityReplayPath,
  projectStep: projectPersonalityReplayStepPath,
  projectReview: projectPersonalityReplayReviewPath,
  intake: personalityReplayIntakePath,
  review: personalityReplayReviewPath,
  admin: personalityReplayValidationAdminPath,
} as const;
