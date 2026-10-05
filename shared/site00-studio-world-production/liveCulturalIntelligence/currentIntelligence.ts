/**
 * CurrentIntelligencePackage + claim evaluation + provenance.
 */

import { createHash, randomUUID } from 'node:crypto';
import type {
  CurrentClaimEvaluation,
  CurrentIntelligencePackage,
  ForecastConfidence,
  FreshnessState,
  IntelligenceFailureState,
  LiveWorldSignal,
  SignalCluster,
  WhyNowEvaluation,
} from './types.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function buildForecastConfidence(params: {
  level: ForecastConfidence['level'];
  evidence: string[];
  reasoning: string;
}): ForecastConfidence {
  return {
    level: params.level,
    evidence: params.evidence,
    reasoningSummary: params.reasoning,
    uncertainties: params.level === 'SPECULATIVE' || params.level === 'WEAK_FORECAST' ? ['Outcome uncertain'] : [],
    whatWouldChangeForecast: ['New primary source', 'Event cancellation', 'Contradicting data'],
  };
}

export function classifyCurrentClaim(params: {
  claim: string;
  sourceCount: number;
  disputed?: boolean;
}): CurrentClaimEvaluation {
  let classification: CurrentClaimEvaluation['classification'] = 'UNVERIFIED';
  if (params.disputed) classification = 'DISPUTED';
  else if (params.sourceCount >= 3) classification = 'VERIFIED';
  else if (params.sourceCount === 2) classification = 'SUPPORTED';
  else if (params.sourceCount === 1) classification = 'SINGLE_SOURCE';
  return {
    claim: params.claim,
    classification,
    sourceIds: [],
    reasoning: `${params.sourceCount} source(s)`,
  };
}

export function buildCurrentIntelligencePackage(params: {
  projectId: string;
  signal: LiveWorldSignal;
  cluster: SignalCluster | null;
  whyNow: WhyNowEvaluation;
  verifiedFacts?: string[];
  unverifiedClaims?: string[];
}): CurrentIntelligencePackage {
  const verified = params.verifiedFacts ?? [];
  const unverified = params.unverifiedClaims ?? [];
  const claims = [
    ...verified.map((c) => classifyCurrentClaim({ claim: c, sourceCount: 2 })),
    ...unverified.map((c) => classifyCurrentClaim({ claim: c, sourceCount: 0 })),
  ];
  const riskFlags: IntelligenceFailureState[] = [];
  if (unverified.some((c) => c.length > 0) && verified.length === 0) {
    riskFlags.push('FAIL_UNVERIFIED_AS_FACT');
  }

  return {
    id: `cip-${randomUUID().slice(0, 8)}`,
    projectId: params.projectId,
    signalIds: [params.signal.id],
    clusterId: params.cluster?.id ?? null,
    primarySources: params.signal.sourceIds,
    secondarySources: [],
    sourceDates: [params.signal.observedAt],
    retrievedAt: new Date().toISOString(),
    verifiedFacts: verified,
    unverifiedClaims: unverified,
    disputedClaims: [],
    unknowns: [],
    currentDataPoints: [],
    historicalDataPoints: [],
    historicalComparisons: [],
    relevantPeople: params.signal.entities,
    relevantOrganizations: [],
    relevantEvents: [],
    relevantCulturalReferences: [],
    whatChanged: params.whyNow.whatChanged,
    whyNow: params.whyNow.whyRelevantNow,
    conversationContext: params.signal.summary,
    dominantNarratives: [params.signal.summary],
    minorityOrContrarianNarratives: [],
    commonMisunderstandings: [],
    possibleConnections: [],
    visualEvidenceCandidates: [],
    archivalEvidenceCandidates: [],
    dataVisualizationCandidates: [],
    claimEvaluations: claims,
    freshnessEvaluation: params.signal.freshnessState,
    confidenceEvaluation: buildForecastConfidence({
      level: params.signal.verificationState === 'CORROBORATED' ? 'OBSERVED_FACT' : 'MODERATE_FORECAST',
      evidence: verified,
      reasoning: 'Based on captured signal state',
    }),
    riskFlags,
    fingerprint: fp(params.signal.id),
  };
}

export function unverifiedCannotBecomeFactualAssertion(claim: CurrentClaimEvaluation): boolean {
  return claim.classification === 'UNVERIFIED' || claim.classification === 'SPECULATIVE';
}

export function developingClaimPreservesUncertainty(claim: CurrentClaimEvaluation): boolean {
  return claim.classification === 'DEVELOPING' || claim.classification === 'SINGLE_SOURCE';
}

export function generatedImageCannotBeFactualEvidence(): IntelligenceFailureState {
  return 'FAIL_GENERATED_IMAGE_AS_FACTUAL_EVIDENCE';
}

export function forecastCannotBecomeFact(confidence: ForecastConfidence): boolean {
  return confidence.level !== 'OBSERVED_FACT' && confidence.level !== 'SCHEDULED_CERTAINTY';
}

export function intelligencePackagePreservesProvenance(pkg: CurrentIntelligencePackage): boolean {
  return pkg.primarySources.length > 0 && pkg.retrievedAt.length > 0;
}

export type FreshnessStateExport = FreshnessState;
