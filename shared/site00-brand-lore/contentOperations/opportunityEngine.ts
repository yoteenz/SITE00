/**
 * Content Opportunity Engine — discovery, fit, ranking.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { ContentOpportunity, ContentOpportunityRank, OpportunityFitResult } from './types.js';
import type { ContentMemoryIndex } from './types.js';
import { evaluateOpportunityVisualPotential } from '../culturalVisualParticipation/integration.js';
import { evaluateContentSimilarity } from './contentSimilarity.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export type SeedOpportunitySpec = {
  sourceType: ContentOpportunity['sourceType'];
  subject: string;
  summary: string;
  whyInteresting: string;
  domains: string[];
};

export const PILOT_OPPORTUNITY_SEEDS: SeedOpportunitySpec[] = [
  {
    sourceType: 'CULTURAL_SIGNAL',
    subject: 'subscription normalization',
    summary: 'Another formerly one-time purchase moved to recurring billing',
    whyInteresting: 'NDX noticed the pattern before the headline — irritation at normalization',
    domains: ['money / consumer behavior'],
  },
  {
    sourceType: 'NEWS',
    subject: 'corporate layoff memo language',
    summary: 'Leadership memo uses "we remain confident" during layoffs',
    whyInteresting: 'Euphemism detection — NDX translates institutional language',
    domains: ['work / career'],
  },
  {
    sourceType: 'HISTORICAL_CALLBACK',
    subject: 'late fees across decades',
    summary: 'Blockbuster late fees vs streaming cancellation windows',
    whyInteresting: 'Structural similarity across eras — connection behavior',
    domains: ['historical callback'],
  },
  {
    sourceType: 'ARCHIVE_REVISIT',
    subject: 'saved tweet vs current announcement',
    summary: 'TechCo "never show ads" tweet vs new ad tier headline',
    whyInteresting: 'Receipt behavior — memory returns when context shifts',
    domains: ['technology', 'business'],
  },
  {
    sourceType: 'FOUNDER_SEED',
    subject: 'standing desk reconsideration',
    summary: 'Founder dismissed standing desks, then changed mind with evidence',
    whyInteresting: 'Self-correction — preserves old belief while revising',
    domains: ['lifestyle'],
  },
  {
    sourceType: 'UNRESOLVED_PRIOR_INVESTIGATION',
    subject: 'attention economy pattern',
    summary: 'Same engagement pattern across unrelated feeds — investigation still open',
    whyInteresting: 'Rabbit hole — I have a theory, hold open',
    domains: ['internet behavior'],
  },
  {
    sourceType: 'AUDIENCE_QUESTION',
    subject: 'look into airline loyalty devaluation',
    summary: 'Audience asked NDX to investigate points program changes',
    whyInteresting: 'Content request inbox — character working when people ask NDX to look',
    domains: ['money / consumer behavior'],
  },
  {
    sourceType: 'EVERGREEN',
    subject: 'self-checkout time promise',
    summary: 'Self-checkout took longer than staffed lane in timed observation',
    whyInteresting: 'Failed promise — technology efficiency claim vs reality',
    domains: ['technology'],
  },
];

export function createContentOpportunity(params: {
  projectId: string;
  spec: SeedOpportunitySpec;
  memory?: ContentMemoryIndex | null;
  liveLineage?: ContentOpportunity['liveLineage'];
}): ContentOpportunity {
  const similarity = params.memory
    ? evaluateContentSimilarity({ subject: params.spec.subject, memory: params.memory })
    : { result: 'NEW' as const, priorId: null };

  const opp: ContentOpportunity = {
    id: `cop-${randomUUID().slice(0, 8)}`,
    projectId: params.projectId,
    sourceType: params.spec.sourceType,
    sourceReference: null,
    subject: params.spec.subject,
    summary: params.spec.summary,
    whyPotentiallyInteresting: params.spec.whyInteresting,
    observedAt: new Date().toISOString(),
    freshness: 'HIGH',
    urgency: 'MEDIUM',
    domains: params.spec.domains,
    entities: [],
    themes: params.spec.domains,
    evidenceAvailable: [],
    evidenceNeeded: ['Primary source or observation'],
    characterFit: null,
    brandRelevance: 0.7,
    audienceRelevance: 0.6,
    novelty: 0.7,
    timeliness: 0.5,
    depthPotential: 0.6,
    humorPotential: 0.4,
    culturalPotential: 0.5,
    investigationPotential: 0.6,
    risk: 'LOW',
    duplicateSimilarity: similarity.result,
    priorCoverageIds: similarity.priorId ? [similarity.priorId] : [],
    rank: null,
    selectionStatus: null,
    status: 'DISCOVERED',
    fingerprint: '',
    liveLineage: params.liveLineage ?? null,
  };
  opp.characterFit = evaluateNDXOpportunityFit(opp);
  opp.rank = rankContentOpportunity(opp);
  opp.visualPotential = evaluateOpportunityVisualPotential(opp);
  opp.fingerprint = fp(opp);
  return opp;
}

export function evaluateNDXOpportunityFit(opp: ContentOpportunity): OpportunityFitResult {
  if (opp.duplicateSimilarity === 'DUPLICATE') return 'TOO_REPETITIVE';
  if (opp.risk === 'BLOCKED') return 'TOO_RISKY';
  if (opp.summary.length < 20) return 'TOO_THIN';
  if (opp.sourceType === 'TREND' && opp.timeliness > 0.9 && opp.depthPotential < 0.3) {
    return 'TOO_TREND_DEPENDENT';
  }
  const score =
    (opp.brandRelevance + opp.novelty + opp.investigationPotential + opp.culturalPotential) / 4;
  if (score >= 0.75) return 'STRONG_OPPORTUNITY';
  if (score >= 0.55) return 'PROMISING';
  if (opp.evidenceNeeded.length > 2) return 'NEEDS_RESEARCH';
  return 'PROMISING';
}

export function rankContentOpportunity(opp: ContentOpportunity): ContentOpportunityRank {
  const dimensions: Record<string, number> = {
    NDX_CHARACTER_FIT: opp.characterFit === 'STRONG_OPPORTUNITY' ? 0.9 : 0.6,
    AUDIENCE_VALUE: opp.audienceRelevance,
    NOVELTY: opp.novelty,
    TIMELINESS: opp.timeliness,
    EVIDENCE_STRENGTH: opp.evidenceAvailable.length > 0 ? 0.7 : 0.4,
    INVESTIGATION_DEPTH: opp.investigationPotential,
    CULTURAL_RELEVANCE: opp.culturalPotential,
    REPETITION_RISK: opp.duplicateSimilarity === 'DUPLICATE' ? 0.1 : 0.8,
    PRODUCTION_COST: 0.6,
  };
  const compositeScore =
    Object.values(dimensions).reduce((a, b) => a + b, 0) / Object.values(dimensions).length;
  const whyHighPriority: string[] = [];
  if (dimensions.NDX_CHARACTER_FIT! >= 0.8) whyHighPriority.push('Strong character resonance');
  if (dimensions.INVESTIGATION_DEPTH! >= 0.7) whyHighPriority.push('Investigation depth potential');
  if (opp.duplicateSimilarity === 'CALLBACK') whyHighPriority.push('Meaningful callback opportunity');
  if (opp.sourceType === 'AUDIENCE_QUESTION') whyHighPriority.push('Audience asked NDX to look into this');

  return {
    opportunityId: opp.id,
    dimensions,
    compositeScore,
    whyHighPriority,
    explainability: 'Multi-dimensional score — not opaque viral score',
    rankedAt: new Date().toISOString(),
  };
}

export function viralScoreAloneCannotSelect(dimensions: Record<string, number>): boolean {
  return Object.keys(dimensions).length > 1;
}

export function opportunityIsNotContent(opp: ContentOpportunity): boolean {
  return opp.status === 'DISCOVERED' || opp.status === 'EVALUATED';
}

export function seedPilotOpportunities(projectId: string, memory?: ContentMemoryIndex | null): ContentOpportunity[] {
  return PILOT_OPPORTUNITY_SEEDS.map((spec) => createContentOpportunity({ projectId, spec, memory }));
}
