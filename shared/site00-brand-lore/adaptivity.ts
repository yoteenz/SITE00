/**
 * Adaptive lore question logic — skip redundant prompts when equivalent intelligence exists.
 */

import { IDNTY_LORE_QUESTIONS, type LoreQuestionStep } from './idnty-lore-questions.js';
import type { BrandLoreProfile } from './types.js';

export type LoreAdaptivityContext = {
  /** Existing synthesized or confirmed lore profile (if any). */
  existingProfile?: BrandLoreProfile | null;
  /** Raw lore answers already captured this session. */
  loreAnswers?: Record<string, string | string[]>;
  /** Founder-confirmed Content Brain keys (if bridged). */
  confirmedCanonKeys?: string[];
  /** Calibration mode — only show steps for these ids. */
  calibrationStepIds?: string[] | null;
};

function isAnswered(answers: Record<string, string | string[]>, stepId: string): boolean {
  const v = answers[stepId];
  if (v === undefined || v === null) return false;
  if (v === 'skip' || v === 'not-sure') return true;
  if (typeof v === 'string') return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return false;
}

function profileCoversStep(profile: BrandLoreProfile, step: LoreQuestionStep): boolean {
  if (profile.rawLoreAnswers[step.id]) return true;
  const map: Record<string, keyof BrandLoreProfile> = {
    feeling: 'emotionalPromise',
    role: 'audienceRelationship',
    belief: 'brandBelief',
    enemy: 'culturalOpposition',
    obsession: 'coreObsessions',
    world: 'worldMetaphor',
    objects: 'materialVocabulary',
    lineage: 'referenceLineage',
    now: 'currentReferenceSignals',
    contradiction: 'creativeTensions',
    language: 'authenticLanguageSamples',
    line: 'antiLanguage',
    status: 'socialSignal',
    ritual: 'audienceRitual',
    memory: 'memoryGoal',
    symbol: 'symbolicVocabulary',
    myth: 'desiredMythology',
    future: 'futureWorld',
    'no-go': 'creativeAntiPatterns',
  };
  const key = map[step.id];
  if (!key) return false;
  const field = profile[key] as { value: unknown; founderConfirmationState?: string } | undefined;
  if (!field?.value) return false;
  if (field.founderConfirmationState === 'CONFIRMED') return true;
  if (typeof field.value === 'string' && field.value.trim()) return true;
  if (Array.isArray(field.value) && field.value.length) return true;
  return false;
}

export function resolveActiveLoreSteps(ctx: LoreAdaptivityContext): LoreQuestionStep[] {
  const answers = ctx.loreAnswers ?? {};
  const profile = ctx.existingProfile;

  if (ctx.calibrationStepIds?.length) {
    const ids = new Set(ctx.calibrationStepIds);
    return IDNTY_LORE_QUESTIONS.filter((q) => ids.has(q.id));
  }

  return IDNTY_LORE_QUESTIONS.filter((step) => {
    if (isAnswered(answers, step.id)) return false;
    if (profile && profileCoversStep(profile, step)) return false;
    if (ctx.confirmedCanonKeys?.includes(step.domain)) return false;
    return true;
  });
}

export function loreFlowComplete(ctx: LoreAdaptivityContext): boolean {
  return resolveActiveLoreSteps(ctx).length === 0;
}

export const LORE_SKIP_VALUE = 'skip';
export const LORE_NOT_SURE_VALUE = 'not-sure';

export function isSkippedAnswer(value: string | string[] | undefined): boolean {
  if (value === LORE_SKIP_VALUE || value === LORE_NOT_SURE_VALUE) return true;
  if (Array.isArray(value) && value.length === 1 && (value[0] === LORE_SKIP_VALUE || value[0] === LORE_NOT_SURE_VALUE)) {
    return true;
  }
  return false;
}
