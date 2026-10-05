/**
 * Post-hoc semantic convergence for personality replay validation.
 * Deterministic overlap heuristics — not pixel or string equality.
 */

import type { BrandPersonalityProfile } from './personalityTypes.js';
import type {
  PersonalityConvergenceClassification,
  PersonalityDomainConvergenceReport,
} from './personalityReplayTypes.js';

type DomainExtractor = (p: BrandPersonalityProfile) => string[];

const DOMAIN_EXTRACTORS: Record<string, DomainExtractor> = {
  SOCIAL_INSTINCT: (p) => (p.socialInstinct.value ?? []).map(String),
  CONFIDENCE: (p) => (p.confidenceBehavior.value ?? []).map(String),
  WIT: (p) => (p.witBehavior.value ?? []).map(String),
  HUMANITY: (p) => (p.humanityBehavior.value ?? []).map(String),
  DISAGREEMENT: (p) => (p.disagreementBehavior.value ?? []).map(String),
  EDGE: (p) => (p.edgeBehavior.value ? [String(p.edgeBehavior.value)] : []),
  CHARM: (p) => (p.charmBehavior.value ?? []).map(String),
  OBSERVATION: (p) => (p.observationalBehavior.value ? [String(p.observationalBehavior.value)] : []),
  MEMORABILITY: (p) => (p.memorabilityBehavior.value ? [String(p.memorabilityBehavior.value)] : []),
  EMOTIONAL_RANGE: (p) => (p.emotionalRange.value ?? []).map(String),
  RESTRAINT: (p) => (p.restraintBehavior.value ?? []).map(String),
  PERSONALITY_TENSIONS: (p) => (p.personalityTensions.value ?? []).map(String),
  SOCIAL_REACTION: (p) => (p.socialReactionBehavior.value ?? []).map(String),
  SELF_CORRECTION: (p) => (p.selfCorrectionBehavior.value ?? []).map(String),
  ANTI_PERSONALITY: (p) => (p.antiPersonality.value ? [String(p.antiPersonality.value)] : []),
};

function normalizeToken(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function tokenSet(values: string[]): Set<string> {
  const out = new Set<string>();
  for (const v of values) {
    for (const token of normalizeToken(v).split(/\s+/)) {
      if (token.length > 2) out.add(token);
    }
  }
  return out;
}

function overlapRatio(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const t of a) {
    if (b.has(t)) shared += 1;
  }
  return shared / Math.max(a.size, b.size);
}

function classifyOverlap(ratio: number, bothEmpty: boolean): PersonalityConvergenceClassification {
  if (bothEmpty) return 'NOT_COMPARABLE';
  if (ratio >= 0.45) return 'STRONG_CONVERGENCE';
  if (ratio >= 0.2) return 'PARTIAL_CONVERGENCE';
  return 'MEANINGFUL_DIVERGENCE';
}

export function comparePersonalityProfiles(params: {
  canonical: BrandPersonalityProfile | null;
  shadow: BrandPersonalityProfile | null;
}): PersonalityDomainConvergenceReport[] {
  const reports: PersonalityDomainConvergenceReport[] = [];

  for (const [domain, extract] of Object.entries(DOMAIN_EXTRACTORS)) {
    const canonicalValues = params.canonical ? extract(params.canonical) : [];
    const shadowValues = params.shadow ? extract(params.shadow) : [];
    const canonicalText = canonicalValues.join(' · ') || null;
    const shadowText = shadowValues.join(' · ') || null;
    const bothEmpty = canonicalValues.length === 0 && shadowValues.length === 0;
    const ratio = overlapRatio(tokenSet(canonicalValues), tokenSet(shadowValues));

    reports.push({
      domain,
      canonicalValue: canonicalText,
      shadowValue: shadowText,
      classification: classifyOverlap(ratio, bothEmpty),
    });
  }

  return reports;
}

export function scorePersonalityConvergence(reports: PersonalityDomainConvergenceReport[]): number {
  const scored = reports.filter((r) => r.classification !== 'NOT_COMPARABLE');
  if (scored.length === 0) return 0;
  const points = scored.reduce((sum, r) => {
    switch (r.classification) {
      case 'STRONG_CONVERGENCE':
        return sum + 5;
      case 'PARTIAL_CONVERGENCE':
        return sum + 3;
      case 'MEANINGFUL_DIVERGENCE':
        return sum + 0;
      default:
        return sum;
    }
  }, 0);
  return Math.round((points / (scored.length * 5)) * 5 * 10) / 10;
}

/** Post-formation semantic match for marked-up analog selection. */
export function scoreDirectionMarkedUpAnalog(text: string): number {
  const lower = text.toLowerCase();
  const signals = [
    'marked',
    'annotation',
    'revision',
    'document',
    'editorial',
    'passed',
    'argument',
    'living publication',
    'copy under',
  ];
  let hits = 0;
  for (const signal of signals) {
    if (lower.includes(signal)) hits += 1;
  }
  return hits;
}
