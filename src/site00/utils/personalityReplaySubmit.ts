import type { PersonalityReplayStatus } from '../../../shared/site00-brand-lore/personalityReplayTypes';

/** Statuses where founder can still tap Submit on the review screen. */
const PERSONALITY_REPLAY_SUBMITTABLE_STATUSES: PersonalityReplayStatus[] = [
  'CREATED',
  'INTAKE_IN_PROGRESS',
  'PERSONALITY_READY',
];

export function isPersonalityReplayIntakeSubmitted(status: string | null | undefined): boolean {
  if (!status) return false;
  return !PERSONALITY_REPLAY_SUBMITTABLE_STATUSES.includes(status as PersonalityReplayStatus);
}

export function canSubmitPersonalityReplayIntake(params: {
  status: string | null | undefined;
  hasAnswers: boolean;
  submitting?: boolean;
}): boolean {
  if (params.submitting) return false;
  if (!params.hasAnswers) return false;
  return !isPersonalityReplayIntakeSubmitted(params.status);
}
