/**
 * Brand Personality synthesis — deterministic, never invents founder answers.
 */

import {
  IDNTY_PERSONALITY_CHARM_OPTIONS,
  IDNTY_PERSONALITY_CONFIDENCE_OPTIONS,
  IDNTY_PERSONALITY_DISAGREEMENT_OPTIONS,
  IDNTY_PERSONALITY_EDGE_OPTIONS,
  IDNTY_PERSONALITY_EMOTIONAL_RANGE_OPTIONS,
  IDNTY_PERSONALITY_HUMANITY_OPTIONS,
  IDNTY_PERSONALITY_HUMOR_OPTIONS,
  IDNTY_PERSONALITY_RESTRAINT_OPTIONS,
  IDNTY_PERSONALITY_SELF_CORRECTION_OPTIONS,
  IDNTY_PERSONALITY_SOCIAL_INSTINCT_OPTIONS,
  IDNTY_PERSONALITY_SOCIAL_REACTION_OPTIONS,
  IDNTY_PERSONALITY_TENSION_OPTIONS,
  getPersonalityQuestion,
} from './idnty-personality-questions.js';
import { evaluateBrandPersonalityReadiness } from './personalityReadiness.js';
import type { BrandLoreField } from './types.js';
import type { BrandPersonalityProfile } from './personalityTypes.js';
import {
  normalizeFreeText,
  normalizeSelectedOptionIds,
  resolveOptionLabels,
} from './loreAnswerTypes.js';
import { isSkippedAnswer } from './adaptivity.js';

function nowIso(): string {
  return new Date().toISOString();
}

function field<T>(
  value: T,
  sourceAnswerIds: string[],
  sourceSelectionIds?: string[],
  sourceType: BrandLoreField<T>['sourceType'] = 'IDENTITY_LORE',
  classification: BrandLoreField<T>['classification'] = 'RAW_FOUNDER_INPUT',
): BrandLoreField<T> {
  const hasContent =
    value !== null &&
    value !== undefined &&
    !(typeof value === 'string' && !value.trim()) &&
    !(Array.isArray(value) && value.length === 0);

  return {
    value,
    classification,
    confidence: hasContent ? 'HIGH' : 'NONE',
    sourceAnswerIds,
    sourceSelectionIds,
    sourceType,
    founderConfirmationState: 'PENDING',
    updatedAt: nowIso(),
  };
}

function optionIds(answers: Record<string, string | string[]>, questionId: string): string[] {
  const step = getPersonalityQuestion(questionId);
  if (!step) return [];
  const raw = answers[questionId];
  if (isSkippedAnswer(raw)) return [];
  return normalizeSelectedOptionIds(step, raw);
}

function optionLabels(
  answers: Record<string, string | string[]>,
  questionId: string,
  options: { id: string; label: string }[],
): string[] {
  return resolveOptionLabels(optionIds(answers, questionId), options);
}

function freeText(answers: Record<string, string | string[]>, questionId: string): string | null {
  const step = getPersonalityQuestion(questionId);
  if (!step) return null;
  const raw = answers[questionId];
  if (isSkippedAnswer(raw)) return null;
  return normalizeFreeText(raw);
}

function compoundSelect(
  answers: Record<string, string | string[]>,
  questionId: string,
  options: { id: string; label: string }[],
): BrandLoreField<string[]> {
  const ids = optionIds(answers, questionId);
  return field(optionLabels(answers, questionId, options), [questionId], ids);
}

function singleSelect(
  answers: Record<string, string | string[]>,
  questionId: string,
  options: { id: string; label: string }[],
): BrandLoreField<string | null> {
  const labels = optionLabels(answers, questionId, options);
  const ids = optionIds(answers, questionId);
  return field(labels[0] ?? null, [questionId], ids);
}

function preserveConfirmation<T>(
  fresh: BrandLoreField<T>,
  prior: BrandLoreField<T> | undefined,
): BrandLoreField<T> {
  if (!prior) return fresh;
  if (
    prior.founderConfirmationState === 'CONFIRMED' &&
    JSON.stringify(prior.value) === JSON.stringify(fresh.value)
  ) {
    return prior;
  }
  return fresh;
}

/** Derive signature moves from answered behaviors — deterministic labels only. */
function deriveSignatureMoves(answers: Record<string, string | string[]>): BrandLoreField<string[]> {
  const moves: string[] = [];
  const wit = optionLabels(answers, 'humor', IDNTY_PERSONALITY_HUMOR_OPTIONS);
  const disagree = optionLabels(answers, 'disagreement', IDNTY_PERSONALITY_DISAGREEMENT_OPTIONS);
  const selfCorrection = optionLabels(answers, 'self-correction', IDNTY_PERSONALITY_SELF_CORRECTION_OPTIONS);
  const observation = freeText(answers, 'observation');

  if (wit.includes('CONTRADICTION')) moves.push('Contradiction via correction');
  if (wit.includes('UNEXPECTED SPECIFICITY')) moves.push('Unexpected specificity in microcopy');
  if (disagree.includes('SHOWS THE EVIDENCE')) moves.push('Receipts before rhetoric');
  if (disagree.includes('ASKS A BETTER QUESTION')) moves.push('Reframe via question');
  if (selfCorrection.includes('UPDATE THE RECORD')) moves.push('Live correction behavior');
  if (selfCorrection.includes('PUBLICLY CORRECT IT')) moves.push('Public self-correction');
  if (observation) moves.push(`Notices: ${observation.slice(0, 80)}`);

  const sourceIds = ['humor', 'disagreement', 'self-correction', 'observation'].filter(
    (id) => optionIds(answers, id).length > 0 || freeText(answers, id),
  );

  return field(moves, sourceIds, undefined, 'IDENTITY_LORE', moves.length ? 'SYNTHESIZED' : 'UNKNOWN');
}

function deriveForbiddenBehaviors(answers: Record<string, string | string[]>): BrandLoreField<string[]> {
  const anti = freeText(answers, 'anti-personality');
  if (!anti) return field([], ['anti-personality']);
  const lines = anti
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return field(lines.length ? lines : [anti], ['anti-personality'], undefined, 'IDENTITY_LORE', 'SYNTHESIZED');
}

export type PersonalitySynthesisInput = {
  personalityAnswers: Record<string, string | string[]>;
  prior?: BrandPersonalityProfile | null;
  profileVersion?: number;
};

export function synthesizeBrandPersonalityProfile(input: PersonalitySynthesisInput): BrandPersonalityProfile {
  const { personalityAnswers, prior } = input;
  const now = nowIso();

  const profile: BrandPersonalityProfile = {
    profileVersion: (prior?.profileVersion ?? 0) + 1,
    socialInstinct: preserveConfirmation(
      compoundSelect(personalityAnswers, 'social-instinct', IDNTY_PERSONALITY_SOCIAL_INSTINCT_OPTIONS),
      prior?.socialInstinct,
    ),
    confidenceBehavior: preserveConfirmation(
      compoundSelect(personalityAnswers, 'confidence', IDNTY_PERSONALITY_CONFIDENCE_OPTIONS),
      prior?.confidenceBehavior,
    ),
    witBehavior: preserveConfirmation(
      compoundSelect(personalityAnswers, 'humor', IDNTY_PERSONALITY_HUMOR_OPTIONS),
      prior?.witBehavior,
    ),
    humanityBehavior: preserveConfirmation(
      compoundSelect(personalityAnswers, 'humanity', IDNTY_PERSONALITY_HUMANITY_OPTIONS),
      prior?.humanityBehavior,
    ),
    disagreementBehavior: preserveConfirmation(
      compoundSelect(personalityAnswers, 'disagreement', IDNTY_PERSONALITY_DISAGREEMENT_OPTIONS),
      prior?.disagreementBehavior,
    ),
    edgeBehavior: preserveConfirmation(
      singleSelect(personalityAnswers, 'edge', IDNTY_PERSONALITY_EDGE_OPTIONS),
      prior?.edgeBehavior,
    ),
    charmBehavior: preserveConfirmation(
      compoundSelect(personalityAnswers, 'charm', IDNTY_PERSONALITY_CHARM_OPTIONS),
      prior?.charmBehavior,
    ),
    observationalBehavior: preserveConfirmation(
      field(freeText(personalityAnswers, 'observation'), ['observation']),
      prior?.observationalBehavior,
    ),
    memorabilityBehavior: preserveConfirmation(
      field(freeText(personalityAnswers, 'memorability'), ['memorability']),
      prior?.memorabilityBehavior,
    ),
    emotionalRange: preserveConfirmation(
      compoundSelect(personalityAnswers, 'emotional-range', IDNTY_PERSONALITY_EMOTIONAL_RANGE_OPTIONS),
      prior?.emotionalRange,
    ),
    restraintBehavior: preserveConfirmation(
      compoundSelect(personalityAnswers, 'restraint', IDNTY_PERSONALITY_RESTRAINT_OPTIONS),
      prior?.restraintBehavior,
    ),
    personalityTensions: preserveConfirmation(
      compoundSelect(personalityAnswers, 'personality-tension', IDNTY_PERSONALITY_TENSION_OPTIONS),
      prior?.personalityTensions,
    ),
    socialReactionBehavior: preserveConfirmation(
      compoundSelect(personalityAnswers, 'social-reaction', IDNTY_PERSONALITY_SOCIAL_REACTION_OPTIONS),
      prior?.socialReactionBehavior,
    ),
    selfCorrectionBehavior: preserveConfirmation(
      compoundSelect(personalityAnswers, 'self-correction', IDNTY_PERSONALITY_SELF_CORRECTION_OPTIONS),
      prior?.selfCorrectionBehavior,
    ),
    antiPersonality: preserveConfirmation(
      field(freeText(personalityAnswers, 'anti-personality'), ['anti-personality']),
      prior?.antiPersonality,
    ),
    signatureMoves: deriveSignatureMoves(personalityAnswers),
    forbiddenBehaviors: deriveForbiddenBehaviors(personalityAnswers),
    rawPersonalityAnswers: { ...personalityAnswers },
    personalityReadinessState: 'PERSONALITY_INCOMPLETE',
    personalityMissingDomains: [],
    createdAt: prior?.createdAt ?? now,
    updatedAt: now,
  };

  const readiness = evaluateBrandPersonalityReadiness(profile, null);
  profile.personalityReadinessState = readiness.state;
  profile.personalityMissingDomains = readiness.missingDomains;

  return profile;
}

export function mergePreservingPersonalityConfirmations(
  previous: BrandPersonalityProfile | null | undefined,
  fresh: BrandPersonalityProfile,
): BrandPersonalityProfile {
  if (!previous) return fresh;
  const merged = { ...fresh, createdAt: previous.createdAt };
  const keys = [
    'socialInstinct',
    'confidenceBehavior',
    'witBehavior',
    'humanityBehavior',
    'disagreementBehavior',
    'edgeBehavior',
    'charmBehavior',
    'observationalBehavior',
    'memorabilityBehavior',
    'emotionalRange',
    'restraintBehavior',
    'personalityTensions',
    'socialReactionBehavior',
    'selfCorrectionBehavior',
    'antiPersonality',
    'signatureMoves',
    'forbiddenBehaviors',
  ] as const;

  for (const key of keys) {
    const prevField = previous[key];
    const freshField = fresh[key];
    if (
      prevField?.founderConfirmationState === 'CONFIRMED' &&
      JSON.stringify(prevField.value) === JSON.stringify(freshField.value)
    ) {
      (merged as Record<string, unknown>)[key] = prevField;
    }
  }
  merged.profileVersion = (previous.profileVersion ?? 1) + 1;
  return merged;
}
