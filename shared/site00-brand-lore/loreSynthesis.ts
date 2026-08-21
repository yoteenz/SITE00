/**
 * Brand Lore synthesis — transforms raw Identity lore answers into structured BrandLoreProfile.
 * Shared between frontend (world review readiness) and API (persistence).
 */

import { classifyBrandExpressionContext, type ContextClassificationInput } from './contextClassification.js';
import { evaluateCreativeDirectionReadiness } from './readiness.js';
import { LORE_STEP_TO_DOMAIN } from './types.js';
import type { BrandLoreField, BrandLoreProfile } from './types.js';
import { isSkippedAnswer } from './adaptivity.js';
import {
  IDNTY_LORE_FEELING_OPTIONS,
  IDNTY_LORE_ROLE_OPTIONS,
  IDNTY_LORE_ENEMY_OPTIONS,
  IDNTY_LORE_TENSION_OPTIONS,
  IDNTY_LORE_OBJECT_TAGS,
  IDNTY_LORE_RITUAL_OPTIONS,
  IDNTY_LORE_STATUS_OPTIONS,
} from './idnty-lore-questions.js';
import {
  normalizeFreeText,
  normalizeSelectedOptionIds,
  resolveOptionLabels,
} from './loreAnswerTypes.js';
import { getLoreQuestion } from './idnty-lore-questions.js';

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `lore-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function field<T>(
  value: T,
  sourceAnswerIds: string[],
  sourceSelectionIds?: string[],
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
    sourceType: 'IDENTITY_LORE',
    founderConfirmationState: 'PENDING',
    updatedAt: nowIso(),
  };
}

function optionIds(answers: Record<string, string | string[]>, questionId: string): string[] {
  const step = getLoreQuestion(questionId);
  if (!step) return [];
  return normalizeSelectedOptionIds(step, answers[questionId]);
}

function optionLabels(
  answers: Record<string, string | string[]>,
  questionId: string,
  options: { id: string; label: string }[],
): string[] {
  return resolveOptionLabels(optionIds(answers, questionId), options);
}

function freeText(answers: Record<string, string | string[]>, questionId: string): string | null {
  const step = getLoreQuestion(questionId);
  if (!step) return null;
  return normalizeFreeText(answers[questionId]);
}

/** Compound multi-select field — preserves all selections as label array with option-level provenance. */
function compoundSelectField(
  answers: Record<string, string | string[]>,
  questionId: string,
  options: { id: string; label: string }[],
): BrandLoreField<string[]> {
  const ids = optionIds(answers, questionId);
  const labels = resolveOptionLabels(ids, options);
  return field(labels, [questionId], ids);
}

export type LoreSynthesisInput = {
  loreAnswers: Record<string, string | string[]>;
  sourceIntakeId?: string | null;
  organizationId?: string | null;
  projectId?: string | null;
  orgSlug?: string | null;
  operationalAnswers?: {
    projectTypes?: string[];
    goals?: string[];
  };
  existingProfileId?: string | null;
  /** Prior profile — used to preserve founder confirmation when evidence unchanged. */
  priorProfile?: BrandLoreProfile | null;
};

function preserveConfirmation<T>(
  next: BrandLoreField<T>,
  prior: BrandLoreField<T> | undefined,
): BrandLoreField<T> {
  if (!prior || prior.founderConfirmationState !== 'CONFIRMED') return next;
  const priorSel = JSON.stringify(prior.sourceSelectionIds ?? []);
  const nextSel = JSON.stringify(next.sourceSelectionIds ?? []);
  const priorVal = JSON.stringify(prior.value);
  const nextVal = JSON.stringify(next.value);
  if (priorSel === nextSel && priorVal === nextVal) {
    return {
      ...next,
      classification: 'FOUNDER_CONFIRMED',
      founderConfirmationState: 'CONFIRMED',
    };
  }
  return next;
}

export function synthesizeBrandLoreProfile(input: LoreSynthesisInput): BrandLoreProfile {
  const { loreAnswers } = input;
  const ts = nowIso();
  const prior = input.priorProfile;

  const feelingIds = optionIds(loreAnswers, 'feeling');
  const ritualIds = optionIds(loreAnswers, 'ritual');
  const languageRaw = freeText(loreAnswers, 'language');
  const antiLanguageRaw = freeText(loreAnswers, 'line');
  const antiPatternsRaw = freeText(loreAnswers, 'no-go');
  const statusIds = optionIds(loreAnswers, 'status');

  const contextInput: ContextClassificationInput = {
    projectTypes: input.operationalAnswers?.projectTypes,
    goals: input.operationalAnswers?.goals,
    audienceRitual: ritualIds,
    worldMetaphor: freeText(loreAnswers, 'world'),
    orgSlug: input.orgSlug ?? null,
  };
  const contextClassification = classifyBrandExpressionContext(contextInput);

  const profile: BrandLoreProfile = {
    id: input.existingProfileId ?? randomId(),
    organizationId: input.organizationId ?? null,
    projectId: input.projectId ?? null,
    sourceIntakeId: input.sourceIntakeId ?? null,
    sourceIntakeType: 'IDENTITY',

    brandWorld: field(freeText(loreAnswers, 'world'), ['world']),
    audienceRelationship: preserveConfirmation(
      compoundSelectField(loreAnswers, 'role', IDNTY_LORE_ROLE_OPTIONS),
      prior?.audienceRelationship,
    ),
    brandBelief: preserveConfirmation(field(freeText(loreAnswers, 'belief'), ['belief']), prior?.brandBelief),
    culturalOpposition: preserveConfirmation(
      compoundSelectField(loreAnswers, 'enemy', IDNTY_LORE_ENEMY_OPTIONS),
      prior?.culturalOpposition,
    ),
    coreObsessions: preserveConfirmation(field(freeText(loreAnswers, 'obsession'), ['obsession']), prior?.coreObsessions),
    emotionalPromise: preserveConfirmation(
      field(optionLabels(loreAnswers, 'feeling', IDNTY_LORE_FEELING_OPTIONS), ['feeling'], feelingIds),
      prior?.emotionalPromise,
    ),
    creativeTensions: preserveConfirmation(
      compoundSelectField(loreAnswers, 'contradiction', IDNTY_LORE_TENSION_OPTIONS),
      prior?.creativeTensions,
    ),
    worldMetaphor: preserveConfirmation(field(freeText(loreAnswers, 'world'), ['world']), prior?.worldMetaphor),
    materialVocabulary: preserveConfirmation(
      compoundSelectField(loreAnswers, 'objects', IDNTY_LORE_OBJECT_TAGS),
      prior?.materialVocabulary,
    ),
    symbolicVocabulary: field(
      freeText(loreAnswers, 'symbol') ? [freeText(loreAnswers, 'symbol')!] : [],
      ['symbol'],
    ),
    referenceLineage: preserveConfirmation(field(freeText(loreAnswers, 'lineage'), ['lineage']), prior?.referenceLineage),
    currentReferenceSignals: preserveConfirmation(
      field(freeText(loreAnswers, 'now'), ['now']),
      prior?.currentReferenceSignals,
    ),
    authenticLanguageSamples: field(
      languageRaw ? languageRaw.split('\n---\n').filter(Boolean) : [],
      ['language'],
    ),
    antiLanguage: field(antiLanguageRaw ? [antiLanguageRaw] : [], ['line']),
    socialSignal: field(
      statusIds.length ? resolveOptionLabels(statusIds, IDNTY_LORE_STATUS_OPTIONS)[0] ?? null : null,
      ['status'],
      statusIds,
    ),
    audienceRitual: preserveConfirmation(
      compoundSelectField(loreAnswers, 'ritual', IDNTY_LORE_RITUAL_OPTIONS),
      prior?.audienceRitual,
    ),
    memoryGoal: field(freeText(loreAnswers, 'memory'), ['memory']),
    desiredMythology: field(freeText(loreAnswers, 'myth'), ['myth']),
    futureWorld: field(freeText(loreAnswers, 'future'), ['future']),
    creativeAntiPatterns: field(
      antiPatternsRaw ? antiPatternsRaw.split('\n').filter(Boolean) : [],
      ['no-go'],
    ),
    signatureDeviceSeeds: field(freeText(loreAnswers, 'symbol'), ['symbol']),

    rawLoreAnswers: { ...loreAnswers },
    contextClassification,
    readinessState: 'CONTEXT_INCOMPLETE',
    readinessMissingDomains: [],

    createdAt: prior?.createdAt ?? ts,
    updatedAt: ts,
  };

  const readiness = evaluateCreativeDirectionReadiness(profile);
  profile.readinessState = readiness.state;
  profile.readinessMissingDomains = readiness.missingDomains;

  return profile;
}

export function assertSynthesisGrounded(profile: BrandLoreProfile): void {
  for (const [stepId] of Object.entries(LORE_STEP_TO_DOMAIN)) {
    const raw = profile.rawLoreAnswers[stepId];
    if (!raw || isSkippedAnswer(raw)) continue;
    const hasProvenance = Object.values(profile).some(
      (f) =>
        f &&
        typeof f === 'object' &&
        'sourceAnswerIds' in f &&
        Array.isArray((f as BrandLoreField).sourceAnswerIds) &&
        (f as BrandLoreField).sourceAnswerIds.includes(stepId),
    );
    if (!hasProvenance) continue;
  }
}

export function extractOperationalProjectTypes(
  identityAnswers: Record<string, string | string[]>,
): string[] {
  const project = identityAnswers['project'];
  if (Array.isArray(project)) return project;
  if (typeof project === 'string') return [project];
  return [];
}

export function extractOperationalGoals(identityAnswers: Record<string, string | string[]>): string[] {
  const goal = identityAnswers['goal'];
  if (Array.isArray(goal)) return goal;
  if (typeof goal === 'string') return [goal];
  return [];
}
