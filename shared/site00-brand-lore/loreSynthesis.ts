/**
 * Brand Lore synthesis — transforms raw Identity lore answers into structured BrandLoreProfile.
 * Shared between frontend (world review readiness) and API (persistence).
 */

import { classifyBrandExpressionContext, type ContextClassificationInput } from './contextClassification.js';
import { evaluateCreativeDirectionReadiness } from './readiness.js';
import {
  mergePreservingPersonalityConfirmations,
  synthesizeBrandPersonalityProfile,
} from './personalitySynthesis.js';
import { LORE_STEP_TO_DOMAIN } from './types.js';
import type { BrandLoreField, BrandLoreProfile, BrandLoreReferenceEntry, ReferenceRole } from './types.js';
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

/**
 * Structured reference metadata (XXI) derived from the two reference-bearing lore steps —
 * "lineage" (WHAT DID YOU GROW UP LOVING) and "now" (WHAT HAS YOUR ATTENTION RIGHT NOW). Each
 * line the founder wrote becomes one evidence entry with full project/org lineage and provenance,
 * classified as REFERENCE — never FOUNDER_CONFIRMED canon (XXII). No binary upload architecture
 * exists yet (known gap) so source is always 'TEXT' and assetId is always null; this preserves the
 * same referenceId/founderNote/referenceRole/createdAt contract the future upload pipeline will use.
 */
function deriveReferenceEvidence(
  answers: Record<string, string | string[]>,
  ctx: { sourceIntakeId: string | null; projectId: string | null; organizationId: string | null },
): BrandLoreReferenceEntry[] {
  const entries: BrandLoreReferenceEntry[] = [];
  const ts = nowIso();
  const fromStep = (stepId: string, role: ReferenceRole) => {
    const raw = freeText(answers, stepId);
    if (!raw) return;
    for (const line of raw.split('\n').map((l) => l.trim()).filter(Boolean)) {
      entries.push({
        referenceId: randomId(),
        source: 'TEXT',
        assetId: null,
        intakeId: ctx.sourceIntakeId,
        projectId: ctx.projectId,
        organizationId: ctx.organizationId,
        founderNote: line,
        referenceRole: role,
        createdAt: ts,
      });
    }
  };
  fromStep('lineage', 'CULTURAL_REFERENCE');
  fromStep('now', 'VISUAL_LANGUAGE');
  return entries;
}

export type LoreSynthesisInput = {
  loreAnswers: Record<string, string | string[]>;
  personalityAnswers?: Record<string, string | string[]>;
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
    referenceEvidence: deriveReferenceEvidence(loreAnswers, {
      sourceIntakeId: input.sourceIntakeId ?? null,
      projectId: input.projectId ?? null,
      organizationId: input.organizationId ?? null,
    }),
    contextClassification,
    readinessState: 'CONTEXT_INCOMPLETE',
    readinessMissingDomains: [],
    profileVersion: 1,

    createdAt: prior?.createdAt ?? ts,
    updatedAt: ts,
  };

  const readiness = evaluateCreativeDirectionReadiness(profile);
  profile.readinessState = readiness.state;
  profile.readinessMissingDomains = readiness.missingDomains;

  const personalityAnswers =
    input.personalityAnswers ?? prior?.brandPersonality?.rawPersonalityAnswers ?? {};
  if (Object.keys(personalityAnswers).length > 0) {
    const freshPersonality = synthesizeBrandPersonalityProfile({
      personalityAnswers,
      prior: prior?.brandPersonality,
    });
    profile.brandPersonality = mergePreservingPersonalityConfirmations(
      prior?.brandPersonality,
      freshPersonality,
    );
  } else if (prior?.brandPersonality) {
    profile.brandPersonality = prior.brandPersonality;
  } else {
    profile.brandPersonality = null;
  }

  return profile;
}

/** Every BrandLoreField-typed key on BrandLoreProfile — used to merge re-synthesis with prior
 * founder confirmations without hardcoding the field list in two places. */
export const LORE_FIELD_KEYS: Array<keyof BrandLoreProfile> = [
  'brandWorld',
  'audienceRelationship',
  'brandBelief',
  'culturalOpposition',
  'coreObsessions',
  'emotionalPromise',
  'creativeTensions',
  'worldMetaphor',
  'materialVocabulary',
  'symbolicVocabulary',
  'referenceLineage',
  'currentReferenceSignals',
  'authenticLanguageSamples',
  'antiLanguage',
  'socialSignal',
  'audienceRitual',
  'memoryGoal',
  'desiredMythology',
  'futureWorld',
  'creativeAntiPatterns',
  'signatureDeviceSeeds',
];

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Re-synthesis must never silently discard a founder's prior CONFIRM CANON action on an
 * unrelated field (see XII "not alter unrelated fields" / test 17). Every intake autosave that
 * touches loreAnswers re-derives the WHOLE profile from raw answers — so any field whose
 * synthesized value is unchanged from the previously CONFIRMED value keeps its FOUNDER_CONFIRMED
 * state; any field whose value actually changed (the founder edited that raw answer) legitimately
 * reverts to PENDING/RAW_FOUNDER_INPUT — this is the "correction resets confirmation" behavior
 * required by XIII, not a bug.
 */
export function mergePreservingFounderConfirmations(
  previous: BrandLoreProfile | null,
  fresh: BrandLoreProfile,
): BrandLoreProfile {
  if (!previous) return fresh;

  const merged: BrandLoreProfile = { ...fresh, id: previous.id, createdAt: previous.createdAt };
  for (const key of LORE_FIELD_KEYS) {
    const prevField = previous[key] as BrandLoreField | undefined;
    const freshField = fresh[key] as BrandLoreField | undefined;
    if (!prevField || !freshField) continue;
    if (prevField.founderConfirmationState === 'CONFIRMED' && deepEqual(prevField.value, freshField.value)) {
      (merged as Record<string, unknown>)[key] = prevField;
    }
  }
  merged.profileVersion = (previous.profileVersion ?? 1) + 1;
  return merged;
}

export function fieldHasContent(f: BrandLoreField | undefined): boolean {
  if (!f) return false;
  const v = f.value;
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

/**
 * NDX BOOK targeted calibration (XXIX/XXX): merges freshly re-synthesized answers (existing raw
 * answers + newly submitted calibration answers) into a profile that may have originated from
 * Content Brain reconciliation rather than a real IDENTITY intake. Two rules on top of
 * mergePreservingFounderConfirmations:
 *  1. A field left blank by fresh synthesis never overwrites an existing field that had real
 *     content (e.g. content-brain-reconciled coreObsessions/antiLanguage survive calibration
 *     answers about unrelated domains).
 *  2. Lineage identity (sourceIntakeType/sourceIntakeId/organizationId) is preserved so this
 *     upserts the same durable row instead of forking a duplicate profile.
 */
export function mergeCalibrationIntoProfile(
  existing: BrandLoreProfile,
  fresh: BrandLoreProfile,
): BrandLoreProfile {
  const merged = mergePreservingFounderConfirmations(existing, fresh);
  for (const key of LORE_FIELD_KEYS) {
    const mergedField = merged[key] as BrandLoreField | undefined;
    const existingField = existing[key] as BrandLoreField | undefined;
    if (!fieldHasContent(mergedField) && fieldHasContent(existingField)) {
      (merged as Record<string, unknown>)[key] = existingField;
    }
  }
  if (merged.referenceEvidence.length === 0 && existing.referenceEvidence.length > 0) {
    merged.referenceEvidence = existing.referenceEvidence;
  }
  if (!merged.brandPersonality && existing.brandPersonality) {
    merged.brandPersonality = existing.brandPersonality;
  }
  merged.sourceIntakeType = existing.sourceIntakeType;
  merged.sourceIntakeId = existing.sourceIntakeId;
  merged.organizationId = existing.organizationId;
  const readiness = evaluateCreativeDirectionReadiness(merged);
  merged.readinessState = readiness.state;
  merged.readinessMissingDomains = readiness.missingDomains;
  return merged;
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
