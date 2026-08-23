/**
 * Client-facing personality summary — "HOW YOU SHOW UP" review surface.
 */

import type { BrandPersonalityProfile } from './personalityTypes.js';
import type { LoreSummarySection } from './loreSummary.js';
import { formatCompoundLabels } from './loreAnswerTypes.js';
import {
  getPersonalityQuestion,
  IDNTY_PERSONALITY_QUESTIONS,
} from './idnty-personality-questions.js';
import {
  formatRawAnswerForPersonalityReview,
} from './personalitySummaryFormat.js';

export type PersonalitySummarySection = LoreSummarySection;

const PROFILE_SECTION_MAP: { key: keyof BrandPersonalityProfile; label: string }[] = [
  { key: 'socialInstinct', label: 'YOUR INSTINCT' },
  { key: 'confidenceBehavior', label: 'YOUR CONFIDENCE' },
  { key: 'witBehavior', label: 'YOUR HUMOR' },
  { key: 'edgeBehavior', label: 'YOUR EDGE' },
  { key: 'humanityBehavior', label: 'YOUR HUMAN SIDE' },
  { key: 'disagreementBehavior', label: 'HOW YOU DISAGREE' },
  { key: 'observationalBehavior', label: 'WHAT YOU NOTICE' },
  { key: 'memorabilityBehavior', label: 'WHAT STICKS' },
  { key: 'antiPersonality', label: 'WHAT YOU NEVER WANT TO SOUND LIKE' },
  { key: 'personalityTensions', label: 'YOUR CONTRADICTIONS' },
  { key: 'selfCorrectionBehavior', label: 'WHEN YOU GET IT WRONG' },
];

export function buildPersonalitySummaryFromAnswers(
  personalityAnswers: Record<string, string | string[]>,
): PersonalitySummarySection[] {
  const labels: Record<string, string> = {
    'social-instinct': 'YOUR INSTINCT',
    confidence: 'YOUR CONFIDENCE',
    humor: 'YOUR HUMOR',
    edge: 'YOUR EDGE',
    humanity: 'YOUR HUMAN SIDE',
    disagreement: 'HOW YOU DISAGREE',
    observation: 'WHAT YOU NOTICE',
    memorability: 'WHAT STICKS',
    'anti-personality': 'WHAT YOU NEVER WANT TO SOUND LIKE',
    'personality-tension': 'YOUR CONTRADICTIONS',
    'self-correction': 'WHEN YOU GET IT WRONG',
  };

  const sections: PersonalitySummarySection[] = [];
  for (const [stepId, label] of Object.entries(labels)) {
    const formatted = formatRawAnswerForPersonalityReview(stepId, personalityAnswers[stepId]);
    if (formatted) sections.push({ key: stepId, label, value: formatted });
  }
  return sections;
}

export function buildPersonalitySummaryFromProfile(
  personality: BrandPersonalityProfile,
): PersonalitySummarySection[] {
  return PROFILE_SECTION_MAP.map(({ key, label }) => {
    const field = personality[key] as { value: unknown } | undefined;
    const v = field?.value;
    if (v === null || v === undefined) return null;
    if (typeof v === 'string' && v.trim()) return { key: String(key), label, value: v.trim() };
    if (Array.isArray(v) && v.length > 0) {
      return { key: String(key), label, value: formatCompoundLabels(v.map(String), ' + ') };
    }
    return null;
  }).filter((s): s is PersonalitySummarySection => s !== null);
}

export function personalityStepLabel(stepId: string): string {
  return IDNTY_PERSONALITY_QUESTIONS.find((q) => q.id === stepId)?.title.replace(/\n/g, ' ') ?? stepId;
}

export function getPersonalityQuestionForEdit(stepId: string) {
  return getPersonalityQuestion(stepId);
}
