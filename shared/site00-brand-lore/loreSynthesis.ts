/**
 * Brand Lore synthesis — transforms raw Identity lore answers into structured BrandLoreProfile.
 * Shared between frontend (world review readiness) and API (persistence).
 */

import { classifyBrandExpressionContext, type ContextClassificationInput } from './contextClassification.js';
import { evaluateCreativeDirectionReadiness } from './readiness.js';
import { LORE_STEP_TO_DOMAIN } from './types.js';
import type { BrandLoreField, BrandLoreProfile, BrandLoreReferenceEntry, ReferenceRole } from './types.js';
import { isSkippedAnswer } from './adaptivity.js';

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
    sourceType: 'IDENTITY_LORE',
    founderConfirmationState: 'PENDING',
    updatedAt: nowIso(),
  };
}

function strAnswer(answers: Record<string, string | string[]>, id: string): string | null {
  const v = answers[id];
  if (isSkippedAnswer(v)) return null;
  if (typeof v === 'string') return v.trim() || null;
  if (Array.isArray(v) && v.length === 1 && typeof v[0] === 'string') return v[0].trim() || null;
  return null;
}

function arrAnswer(answers: Record<string, string | string[]>, id: string): string[] {
  const v = answers[id];
  if (isSkippedAnswer(v)) return [];
  if (Array.isArray(v)) return v.filter((x) => typeof x === 'string' && x.trim());
  if (typeof v === 'string' && v.trim()) return [v.trim()];
  return [];
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
    const raw = strAnswer(answers, stepId);
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
  sourceIntakeId?: string | null;
  organizationId?: string | null;
  projectId?: string | null;
  orgSlug?: string | null;
  operationalAnswers?: {
    projectTypes?: string[];
    goals?: string[];
  };
  existingProfileId?: string | null;
};

export function synthesizeBrandLoreProfile(input: LoreSynthesisInput): BrandLoreProfile {
  const { loreAnswers } = input;
  const ts = nowIso();

  const feelingIds = arrAnswer(loreAnswers, 'feeling');
  const roleId = strAnswer(loreAnswers, 'role');
  const enemyIds = arrAnswer(loreAnswers, 'enemy');
  const tensionIds = arrAnswer(loreAnswers, 'contradiction');
  const objectIds = arrAnswer(loreAnswers, 'objects');
  const ritualIds = arrAnswer(loreAnswers, 'ritual');
  const languageRaw = strAnswer(loreAnswers, 'language');
  const antiLanguageRaw = strAnswer(loreAnswers, 'line');
  const antiPatternsRaw = strAnswer(loreAnswers, 'no-go');

  const contextInput: ContextClassificationInput = {
    projectTypes: input.operationalAnswers?.projectTypes,
    goals: input.operationalAnswers?.goals,
    audienceRitual: ritualIds,
    worldMetaphor: strAnswer(loreAnswers, 'world'),
    orgSlug: input.orgSlug ?? null,
  };
  const contextClassification = classifyBrandExpressionContext(contextInput);

  const profile: BrandLoreProfile = {
    id: input.existingProfileId ?? randomId(),
    organizationId: input.organizationId ?? null,
    projectId: input.projectId ?? null,
    sourceIntakeId: input.sourceIntakeId ?? null,
    sourceIntakeType: 'IDENTITY',

    brandWorld: field(strAnswer(loreAnswers, 'world'), ['world']),
    audienceRelationship: field(roleId, ['role']),
    brandBelief: field(strAnswer(loreAnswers, 'belief'), ['belief']),
    culturalOpposition: field(enemyIds, ['enemy']),
    coreObsessions: field(strAnswer(loreAnswers, 'obsession'), ['obsession']),
    emotionalPromise: field(feelingIds, ['feeling']),
    creativeTensions: field(tensionIds, ['contradiction']),
    worldMetaphor: field(strAnswer(loreAnswers, 'world'), ['world']),
    materialVocabulary: field(objectIds, ['objects']),
    symbolicVocabulary: field(
      strAnswer(loreAnswers, 'symbol') ? [strAnswer(loreAnswers, 'symbol')!] : [],
      ['symbol'],
    ),
    referenceLineage: field(strAnswer(loreAnswers, 'lineage'), ['lineage']),
    currentReferenceSignals: field(strAnswer(loreAnswers, 'now'), ['now']),
    authenticLanguageSamples: field(
      languageRaw ? languageRaw.split('\n---\n').filter(Boolean) : [],
      ['language'],
    ),
    antiLanguage: field(antiLanguageRaw ? [antiLanguageRaw] : [], ['line']),
    socialSignal: field(strAnswer(loreAnswers, 'status'), ['status']),
    audienceRitual: field(ritualIds, ['ritual']),
    memoryGoal: field(strAnswer(loreAnswers, 'memory'), ['memory']),
    desiredMythology: field(strAnswer(loreAnswers, 'myth'), ['myth']),
    futureWorld: field(strAnswer(loreAnswers, 'future'), ['future']),
    creativeAntiPatterns: field(
      antiPatternsRaw ? antiPatternsRaw.split('\n').filter(Boolean) : [],
      ['no-go'],
    ),
    signatureDeviceSeeds: field(strAnswer(loreAnswers, 'symbol'), ['symbol']),

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

    createdAt: ts,
    updatedAt: ts,
  };

  const readiness = evaluateCreativeDirectionReadiness(profile);
  profile.readinessState = readiness.state;
  profile.readinessMissingDomains = readiness.missingDomains;

  return profile;
}

/** Every BrandLoreField-typed key on BrandLoreProfile — used to merge re-synthesis with prior
 * founder confirmations without hardcoding the field list in two places. */
const LORE_FIELD_KEYS: Array<keyof BrandLoreProfile> = [
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

function fieldHasContent(f: BrandLoreField | undefined): boolean {
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
