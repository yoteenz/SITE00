/**
 * Client-safe voice founder revision label helpers.
 */

import { FOUNDER_VOICE_JUDGMENTS } from './constants.js';
import type { FounderVoiceJudgment } from './types.js';

export const VOICE_APPROVAL_JUDGMENTS = [
  'YES_THATS_HER',
  'CLOSE',
  'NO_NOT_HER',
  'SURPRISINGLY_YES',
] as const satisfies readonly FounderVoiceJudgment[];

export const VOICE_REVISION_JUDGMENTS = [
  'TOO_YOUNG',
  'TOO_OLD',
  'TOO_POLISHED',
  'TOO_PERFORMATIVE',
  'TOO_INFLUENCER',
  'TOO_SERIOUS',
  'TOO_PLAYFUL',
  'TOO_SOFT',
  'TOO_HARD',
  'TOO_GENERIC',
  'TOO_FAST',
  'TOO_SLOW',
  'WRONG_ENERGY',
  'VOICE_RIGHT_PERFORMANCE_WRONG',
  'HUMAN_WRONG_CHARACTER',
  'RIGHT_CHARACTER_TOO_SYNTHETIC',
  'CUSTOM',
] as const satisfies readonly FounderVoiceJudgment[];

const ALL: readonly FounderVoiceJudgment[] = FOUNDER_VOICE_JUDGMENTS;

export function isVoiceApprovalJudgment(judgment: string): boolean {
  return (VOICE_APPROVAL_JUDGMENTS as readonly string[]).includes(judgment);
}

export function judgmentRequiresVoiceRevisionNote(judgment: string): boolean {
  return (VOICE_REVISION_JUDGMENTS as readonly string[]).includes(judgment);
}

export function isKnownVoiceJudgment(judgment: string): boolean {
  return (ALL as readonly string[]).includes(judgment as FounderVoiceJudgment);
}

export function revisionNotePlaceholder(judgment: string): string {
  const map: Record<string, string> = {
    TOO_FAST: 'Slow down — e.g. "more measured, less rushed, let pauses breathe"',
    TOO_SLOW: 'Pick up pace — e.g. "quicker cognitive rhythm, still natural"',
    TOO_YOUNG: 'Age up — e.g. "late 20s professional, not teen energy"',
    TOO_OLD: 'Age down — e.g. "early 30s, not matronly"',
    TOO_POLISHED: 'Less polished — e.g. "more casual, less announcer, imperfect timing"',
    TOO_PERFORMATIVE: 'Less performative — e.g. "talking to a friend, not presenting"',
    TOO_INFLUENCER: 'Less influencer — e.g. "no social-media presenter energy"',
    TOO_SOFT: 'More presence — e.g. "stronger delivery without getting hard"',
    TOO_HARD: 'Softer edge — e.g. "warmth without losing attitude"',
    TOO_GENERIC: 'More specific — e.g. "African-American woman late 20s, charisma, personality"',
    VOICE_RIGHT_PERFORMANCE_WRONG: 'Voice timbre OK — fix performance: e.g. "more attitude, less flat delivery"',
    RIGHT_CHARACTER_TOO_SYNTHETIC: 'Character fit OK — fix synthetic quality: e.g. "more human micro-pauses, less TTS"',
    WRONG_ENERGY: 'Correct energy — e.g. "confident and witty, not sleepy or hyper"',
    CUSTOM: 'Describe exactly what should change in voice or performance:',
  };
  return map[judgment] ?? `Founder revision note for ${judgment.replace(/_/g, ' ').toLowerCase()}:`;
}
