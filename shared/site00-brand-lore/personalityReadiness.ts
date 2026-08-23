/**
 * Brand Personality readiness — gates Core Direction formation for new clients.
 */

import type { BrandLoreProfile } from './types.js';
import type {
  BrandPersonalityProfile,
  BrandPersonalityReadinessState,
  PersonalityReadinessDomain,
} from './personalityTypes.js';
import { IDNTY_PERSONALITY_QUESTIONS } from './idnty-personality-questions.js';
import { isSkippedAnswer } from './adaptivity.js';

export const REQUIRED_PERSONALITY_DOMAINS: PersonalityReadinessDomain[] = [
  'SOCIAL_INSTINCT',
  'CONFIDENCE_BEHAVIOR',
  'VERBAL_PERSONALITY',
  'WIT_BEHAVIOR',
  'HUMANITY',
  'DISAGREEMENT_BEHAVIOR',
  'PERSONALITY_TENSION',
  'ANTI_PERSONALITY',
];

function hasValue(field: { value: unknown; confidence: string } | undefined): boolean {
  if (!field) return false;
  const v = field.value;
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

function domainSatisfied(
  personality: BrandPersonalityProfile | null | undefined,
  lore: BrandLoreProfile | null | undefined,
  domain: PersonalityReadinessDomain,
): boolean {
  if (!personality) return false;
  switch (domain) {
    case 'SOCIAL_INSTINCT':
      return hasValue(personality.socialInstinct);
    case 'CONFIDENCE_BEHAVIOR':
      return hasValue(personality.confidenceBehavior);
    case 'VERBAL_PERSONALITY':
      return (
        hasValue(lore?.authenticLanguageSamples) ||
        hasValue(personality.observationalBehavior) ||
        hasValue(personality.memorabilityBehavior)
      );
    case 'WIT_BEHAVIOR':
      return hasValue(personality.witBehavior);
    case 'HUMANITY':
      return hasValue(personality.humanityBehavior);
    case 'DISAGREEMENT_BEHAVIOR':
      return hasValue(personality.disagreementBehavior);
    case 'PERSONALITY_TENSION':
      return (
        hasValue(personality.personalityTensions) ||
        hasValue(lore?.creativeTensions)
      );
    case 'ANTI_PERSONALITY':
      return hasValue(personality.antiPersonality) || hasValue(lore?.antiLanguage);
    default:
      return false;
  }
}

export function evaluateBrandPersonalityReadiness(
  personality: BrandPersonalityProfile | null | undefined,
  lore: BrandLoreProfile | null | undefined,
): {
  state: BrandPersonalityReadinessState;
  missingDomains: PersonalityReadinessDomain[];
  satisfiedDomains: PersonalityReadinessDomain[];
} {
  if (!personality) {
    return {
      state: 'PERSONALITY_INCOMPLETE',
      missingDomains: [...REQUIRED_PERSONALITY_DOMAINS],
      satisfiedDomains: [],
    };
  }

  const satisfiedDomains = REQUIRED_PERSONALITY_DOMAINS.filter((d) =>
    domainSatisfied(personality, lore, d),
  );
  const missingDomains = REQUIRED_PERSONALITY_DOMAINS.filter(
    (d) => !domainSatisfied(personality, lore, d),
  );

  let state: BrandPersonalityReadinessState;
  if (missingDomains.length === 0) {
    state = 'PERSONALITY_READY';
  } else if (satisfiedDomains.length >= 4) {
    state = 'PERSONALITY_PARTIAL';
  } else {
    state = 'PERSONALITY_INCOMPLETE';
  }

  return { state, missingDomains, satisfiedDomains };
}

export function canBeginCoreDirectionFormation(params: {
  loreState: BrandLoreProfile['readinessState'];
  personalityState: BrandPersonalityReadinessState | null | undefined;
}): boolean {
  return (
    params.loreState === 'CORE_DIRECTION_READY' &&
    params.personalityState === 'PERSONALITY_READY'
  );
}

/** Map missing personality domains → targeted question step ids. */
export function missingPersonalityDomainsToSteps(missing: PersonalityReadinessDomain[]): string[] {
  const map: Partial<Record<PersonalityReadinessDomain, string[]>> = {
    SOCIAL_INSTINCT: ['social-instinct'],
    CONFIDENCE_BEHAVIOR: ['confidence'],
    VERBAL_PERSONALITY: ['observation', 'memorability'],
    WIT_BEHAVIOR: ['humor'],
    HUMANITY: ['humanity'],
    DISAGREEMENT_BEHAVIOR: ['disagreement'],
    PERSONALITY_TENSION: ['personality-tension'],
    ANTI_PERSONALITY: ['anti-personality'],
  };
  const ids = new Set<string>();
  for (const domain of missing) {
    for (const step of map[domain] ?? []) ids.add(step);
  }
  return IDNTY_PERSONALITY_QUESTIONS.filter((q) => ids.has(q.id)).map((q) => q.id);
}

export function isPersonalityStepAnswered(
  answers: Record<string, string | string[]>,
  stepId: string,
): boolean {
  const raw = answers[stepId];
  if (raw === undefined) return false;
  if (isSkippedAnswer(raw)) return true;
  if (Array.isArray(raw)) return raw.length > 0;
  return typeof raw === 'string' && raw.trim().length > 0;
}

export function remainingPersonalityCalibrationStepIds(
  missingDomains: PersonalityReadinessDomain[],
  serverAnswers: Record<string, string | string[]>,
): string[] {
  const stepIds = missingPersonalityDomainsToSteps(missingDomains);
  return stepIds.filter((id) => !isPersonalityStepAnswered(serverAnswers, id));
}
