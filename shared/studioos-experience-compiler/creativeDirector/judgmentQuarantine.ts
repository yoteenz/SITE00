import type { FounderJudgment } from '../creativeDirectorTypes.js';

export const TEST_JUDGMENT_PREFIX = 'TEST_JUDGMENT_ONLY';

export function isQuarantinedTestJudgment(note: string): boolean {
  return note.trimStart().startsWith(TEST_JUDGMENT_PREFIX);
}

/** Judgments that may feed revision context but never become founder authority. */
export function activeFounderJudgmentsForContext(judgments: FounderJudgment[]): FounderJudgment[] {
  return judgments.filter((j) => !isQuarantinedTestJudgment(j.founder_note));
}

export function canPromoteJudgmentToApproval(action: string, founder_note: string): boolean {
  if (isQuarantinedTestJudgment(founder_note)) return false;
  return action === 'LOVE_IT';
}
