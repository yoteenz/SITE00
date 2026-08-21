/**
 * Creative Direction context readiness — internal only, never exposed as a fake percentage.
 */

import type {
  BrandLoreProfile,
  CreativeDirectionReadinessState,
  ReadinessDomain,
} from './types.js';

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

/** Map missing readiness domains → lore step ids for calibration injection. */
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
  const steps = new Set<string>();
  for (const domain of missing) {
    for (const step of map[domain] ?? []) steps.add(step);
  }
  return [...steps];
}

export function canBeginCreativeDirection(readiness: CreativeDirectionReadinessState): boolean {
  return readiness === 'CORE_DIRECTION_READY';
}

export { REQUIRED_DOMAINS };
