/**
 * Client-safe V2.3 founder revision label helpers (no node:crypto).
 */

import type { V23FounderJudgment } from './types.js';
import {
  V23A_FOUNDER_JUDGMENTS,
  V23B_FOUNDER_JUDGMENTS,
  V23_FOUNDER_JUDGMENTS,
} from './constants.js';

export const V23_APPROVAL_JUDGMENTS = [
  'LIME_PERFECT',
  'LIME_FEELS_SIGNATURE',
  'THIS_FEELS_HAND_MADE',
  'THATS_NDX',
  'YES_THIS_FEELS_LIKE_AN_OBJECT',
  'KEEP_THIS_CLEAN',
] as const satisfies readonly V23FounderJudgment[];

type V23FounderJudgmentValue = NonNullable<V23FounderJudgment>;

const ALL_V23: readonly V23FounderJudgmentValue[] = [
  ...V23_FOUNDER_JUDGMENTS,
  ...V23A_FOUNDER_JUDGMENTS,
  ...V23B_FOUNDER_JUDGMENTS,
];

export function isV23ApprovalJudgment(judgment: string): boolean {
  return (V23_APPROVAL_JUDGMENTS as readonly string[]).includes(judgment);
}

export function judgmentRequiresRevisionNote(judgment: string): boolean {
  return (ALL_V23 as readonly string[]).includes(judgment) && !isV23ApprovalJudgment(judgment);
}

export function revisionNotePlaceholder(judgment: string): string {
  const map: Record<string, string> = {
    NEEDS_LIME: 'Where should signature lime appear? e.g. "APOLOGY word in lime" or "NDX circle in lime not red"',
    MORE_LIME: 'Which element needs stronger lime? Keep everything else the same.',
    WRONG_THING_IS_LIME: 'What is wrongly lime now, and what should be lime instead?',
    MAKE_THIS_WORD_LIME: 'Which exact word? e.g. APOLOGY',
    MAKE_THIS_MARK_LIME: 'Which mark? e.g. NDX circle around source mark',
    MAKE_PUNCTUATION_LIME: 'Which punctuation? e.g. the period after APOLOGY',
    MAKE_ICONS_HAND_DRAWN: 'Describe the icons that should be hand-drawn in signature lime.',
    MICRO_REVISION_ONLY: 'Smallest change only — preserve composition, portrait, materiality. Change:',
    KEEP_EVERYTHING_ELSE: 'Change only this — preserve everything else:',
    NEEDS_MORE_MAKER_PRESENCE: 'What maker action is missing? e.g. lime underline, circle, annotation',
    TOO_AI_LOOKING: 'What looks AI-generated? What should look hand-made instead?',
  };
  return map[judgment] ?? `Founder revision note for ${judgment.replace(/_/g, ' ').toLowerCase()}:`;
}
