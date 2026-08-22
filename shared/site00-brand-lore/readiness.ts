/**
 * Creative Direction context readiness — internal only, never exposed as a fake percentage.
 */

import type {
  BrandLoreProfile,
  CreativeDirectionReadinessState,
  ReadinessDomain,
} from './types.js';
import { IDNTY_LORE_QUESTIONS } from './idnty-lore-questions.js';

const REQUIRED_DOMAINS: ReadinessDomain[] = [
  'PURPOSE',
  'AUDIENCE_RELATIONSHIP',
  'WORLDVIEW',
  'EMOTIONAL_PROMISE',
  'CULTURAL_TENSION',
  'PRIMARY_EXPRESSION_CONTEXT',
  'REFERENCE_CONTEXT',
  'ANTI_DIRECTION',
];

function hasValue(field: { value: unknown; confidence: string } | undefined): boolean {
  if (!field) return false;
  const v = field.value;
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

function domainSatisfied(profile: BrandLoreProfile, domain: ReadinessDomain): boolean {
  switch (domain) {
    case 'PURPOSE':
      return hasValue(profile.brandBelief) || hasValue(profile.coreObsessions);
    case 'AUDIENCE_RELATIONSHIP':
      return hasValue(profile.audienceRelationship);
    case 'WORLDVIEW':
      return hasValue(profile.worldMetaphor) || hasValue(profile.brandWorld);
    case 'EMOTIONAL_PROMISE':
      return hasValue(profile.emotionalPromise);
    case 'CULTURAL_TENSION':
      return hasValue(profile.culturalOpposition) || hasValue(profile.creativeTensions);
    case 'PRIMARY_EXPRESSION_CONTEXT':
      return profile.contextClassification !== null;
    case 'REFERENCE_CONTEXT':
      return (
        hasValue(profile.referenceLineage) ||
        hasValue(profile.currentReferenceSignals) ||
        hasValue(profile.materialVocabulary)
      );
    case 'ANTI_DIRECTION':
      return hasValue(profile.creativeAntiPatterns) || hasValue(profile.antiLanguage);
    default:
      return false;
  }
}

export function evaluateCreativeDirectionReadiness(
  profile: BrandLoreProfile | null,
): {
  state: CreativeDirectionReadinessState;
  missingDomains: ReadinessDomain[];
  satisfiedDomains: ReadinessDomain[];
} {
  if (!profile) {
    return {
      state: 'CONTEXT_INCOMPLETE',
      missingDomains: [...REQUIRED_DOMAINS],
      satisfiedDomains: [],
    };
  }

  const satisfiedDomains = REQUIRED_DOMAINS.filter((d) => domainSatisfied(profile, d));
  const missingDomains = REQUIRED_DOMAINS.filter((d) => !domainSatisfied(profile, d));

  let state: CreativeDirectionReadinessState;
  if (missingDomains.length === 0) {
    state = 'CORE_DIRECTION_READY';
  } else if (satisfiedDomains.length >= 4) {
    state = 'CONTEXT_PARTIAL';
  } else {
    state = 'CONTEXT_INCOMPLETE';
  }

  return { state, missingDomains, satisfiedDomains };
}

/** Map missing readiness domains → lore step ids in canonical lore flow order. */
export function missingDomainsToLoreSteps(missing: ReadinessDomain[]): string[] {
  const map: Partial<Record<ReadinessDomain, string[]>> = {
    PURPOSE: ['belief', 'obsession'],
    AUDIENCE_RELATIONSHIP: ['role'],
    WORLDVIEW: ['world'],
    EMOTIONAL_PROMISE: ['feeling'],
    CULTURAL_TENSION: ['enemy', 'contradiction'],
    PRIMARY_EXPRESSION_CONTEXT: [],
    REFERENCE_CONTEXT: ['lineage', 'now', 'objects'],
    ANTI_DIRECTION: ['no-go', 'line'],
  };
  const ids = new Set<string>();
  for (const domain of missing) {
    for (const step of map[domain] ?? []) ids.add(step);
  }
  return IDNTY_LORE_QUESTIONS.filter((q) => ids.has(q.id)).map((q) => q.id);
}

/** Lore step id → readiness domain for calibration scope (inverse of missingDomainsToLoreSteps). */
const LORE_STEP_TO_READINESS_DOMAIN: Partial<Record<string, ReadinessDomain>> = {
  feeling: 'EMOTIONAL_PROMISE',
  role: 'AUDIENCE_RELATIONSHIP',
  belief: 'PURPOSE',
  obsession: 'PURPOSE',
  world: 'WORLDVIEW',
  enemy: 'CULTURAL_TENSION',
  contradiction: 'CULTURAL_TENSION',
  lineage: 'REFERENCE_CONTEXT',
  now: 'REFERENCE_CONTEXT',
  objects: 'REFERENCE_CONTEXT',
  'no-go': 'ANTI_DIRECTION',
  line: 'ANTI_DIRECTION',
};

/** Domains in scope for this calibration session — current gaps plus any domain with saved answers. */
export function calibrationScopeDomains(
  missingDomains: ReadinessDomain[],
  serverAnswers: Record<string, string | string[]>,
): ReadinessDomain[] {
  const domains = new Set(missingDomains);
  for (const question of IDNTY_LORE_QUESTIONS) {
    if (serverAnswers[question.id] === undefined) continue;
    const domain = LORE_STEP_TO_READINESS_DOMAIN[question.id];
    if (domain) domains.add(domain);
  }
  return REQUIRED_DOMAINS.filter((d) => domains.has(d));
}

/** Merge step id lists preserving canonical lore flow order. */
export function mergeCanonicalCalibrationStepIds(...lists: string[][]): string[] {
  const ids = new Set<string>();
  for (const list of lists) {
    for (const id of list) ids.add(id);
  }
  return IDNTY_LORE_QUESTIONS.filter((q) => ids.has(q.id)).map((q) => q.id);
}

export function canBeginCreativeDirection(readiness: CreativeDirectionReadinessState): boolean {
  return readiness === 'CORE_DIRECTION_READY';
}

export type DomainInspectorStatus = 'READY' | 'MISSING' | 'NEEDS_CONFIRMATION';

export type ReadinessInspectorRow = {
  domain: ReadinessDomain;
  status: DomainInspectorStatus;
};

/** Maps a required domain to the field(s) that back it, for founder-confirmation status. */
const DOMAIN_FIELDS: Partial<Record<ReadinessDomain, Array<keyof BrandLoreProfile>>> = {
  PURPOSE: ['brandBelief', 'coreObsessions'],
  AUDIENCE_RELATIONSHIP: ['audienceRelationship'],
  WORLDVIEW: ['worldMetaphor', 'brandWorld'],
  EMOTIONAL_PROMISE: ['emotionalPromise'],
  CULTURAL_TENSION: ['culturalOpposition', 'creativeTensions'],
  REFERENCE_CONTEXT: ['referenceLineage', 'currentReferenceSignals', 'materialVocabulary'],
  ANTI_DIRECTION: ['creativeAntiPatterns', 'antiLanguage'],
};

/**
 * Truthful, no-fake-percentage readiness breakdown for admin/founder debugging (XXXIV) — READY,
 * MISSING, or NEEDS_CONFIRMATION (satisfied but no field backing it has been founder-confirmed
 * yet) per conceptual domain.
 */
export function buildReadinessInspector(profile: BrandLoreProfile | null): ReadinessInspectorRow[] {
  return REQUIRED_DOMAINS.map((domain) => {
    if (!profile || !domainSatisfied(profile, domain)) {
      return { domain, status: 'MISSING' as const };
    }
    const fields = DOMAIN_FIELDS[domain];
    if (!fields) return { domain, status: 'READY' as const };
    const anyConfirmed = fields.some((key) => {
      const f = profile[key] as { founderConfirmationState?: string } | undefined;
      return f?.founderConfirmationState === 'CONFIRMED';
    });
    return { domain, status: anyConfirmed ? ('READY' as const) : ('NEEDS_CONFIRMATION' as const) };
  });
}

export { REQUIRED_DOMAINS };
