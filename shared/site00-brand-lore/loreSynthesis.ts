/**
 * Brand Lore synthesis — transforms raw Identity lore answers into structured BrandLoreProfile.
 * Shared between frontend (world review readiness) and API (persistence).
 */

import { classifyBrandExpressionContext, type ContextClassificationInput } from './contextClassification.js';
import { evaluateCreativeDirectionReadiness } from './readiness.js';
import { LORE_STEP_TO_DOMAIN } from './types.js';
import type { BrandLoreField, BrandLoreProfile } from './types.js';
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
    contextClassification,
    readinessState: 'CONTEXT_INCOMPLETE',
    readinessMissingDomains: [],

    createdAt: ts,
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
