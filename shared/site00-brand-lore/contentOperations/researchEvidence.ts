/**
 * Research depth, evidence, claim confidence.
 */

import type {
  ClaimConfidence,
  ClaimStatus,
  ContentClaimRecord,
  ContentEvidenceRequirement,
  ContentOpportunity,
  ResearchDepth,
} from './types.js';

export function determineResearchDepth(opp: ContentOpportunity): ResearchDepth {
  if (opp.humorPotential > 0.7 && opp.evidenceNeeded.length <= 1) return 'QUICK_VERIFY';
  if (opp.domains.some((d) => /finance|money|credit|medical|legal/i.test(d))) return 'DEEP';
  if (opp.investigationPotential >= 0.8) return 'INVESTIGATIVE';
  if (opp.characterFit === 'NEEDS_RESEARCH') return 'STANDARD';
  if (opp.evidenceAvailable.length >= 2) return 'NONE_REQUIRED';
  return 'STANDARD';
}

export function buildEvidenceRequirement(params: {
  thesisId: string;
  opp: ContentOpportunity;
  depth: ResearchDepth;
}): ContentEvidenceRequirement {
  const required: ContentEvidenceRequirement['requiredEvidence'] =
    params.depth === 'INVESTIGATIVE' || params.depth === 'DEEP'
      ? ['PRIMARY_SOURCE', 'PUBLIC_STATEMENT']
      : params.depth === 'QUICK_VERIFY'
        ? ['FOUNDER_OBSERVATION', 'SCREENSHOT']
        : ['REPUTABLE_SECONDARY'];

  return {
    thesisId: params.thesisId,
    requiredEvidence: required,
    supportingEvidence: ['ARCHIVAL', 'CALCULATION'],
    optionalEvidence: ['COMMUNITY_SIGNAL'],
    unverifiedClaims: params.depth === 'DEEP' ? [] : ['Claims requiring verification flagged'],
    evidenceLineage: ['REAL_SOURCE', 'PUBLIC_SOURCE'],
  };
}

export function classifyClaim(params: {
  text: string;
  status: ClaimStatus;
  confidence: ClaimConfidence;
}): ContentClaimRecord {
  return {
    claimId: `claim-${params.text.slice(0, 12).replace(/\s/g, '-')}`,
    text: params.text,
    claimStatus: params.status,
    confidence: params.confidence,
    evidenceIds: [],
  };
}

export function lowConfidenceBlocksConfidentProduction(claims: ContentClaimRecord[]): boolean {
  return claims.some(
    (c) =>
      (c.claimStatus === 'FACT' || c.claimStatus === 'INTERPRETATION') &&
      (c.confidence === 'LOW' || c.confidence === 'UNVERIFIED'),
  );
}

export function claimTypeDistinguishesFactFromTheory(status: ClaimStatus): boolean {
  return ['FACT', 'HYPOTHESIS', 'QUESTION', 'OPINION', 'JOKE'].includes(status);
}

export function aiGeneratedIllustrationCannotBeFactualEvidence(lineage: string): boolean {
  return lineage === 'GENERATED_ILLUSTRATION' || lineage === 'SIMULATED_EXAMPLE';
}

export function fakeReceiptEvidenceBlocked(params: {
  lineage: string;
  claimStatus: ClaimStatus;
}): boolean {
  return (
    params.claimStatus === 'FACT' &&
    (params.lineage === 'GENERATED_ILLUSTRATION' || params.lineage === 'SIMULATED_EXAMPLE')
  );
}

export function researchDepthIsDynamic(depths: ResearchDepth[]): boolean {
  return new Set(depths).size > 1;
}
