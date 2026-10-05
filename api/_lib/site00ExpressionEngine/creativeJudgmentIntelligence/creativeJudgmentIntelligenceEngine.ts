/**
 * CreativeJudgmentIntelligence — operational senior creative judgment orchestrator.
 * P0.CJ.1
 */

import type {
  CreativeJudgmentDecision,
  CreativeJudgmentFailureClass,
  CreativeJudgmentInput,
  CreativeJudgmentResult,
} from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';
import { REVISION_TARGETS_BY_FAILURE } from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/failureClasses.js';
import { buildConceptMechanismProof, failsGenericConceptRejection } from './conceptMechanismProof.js';
import { compareTerritoryDistinctiveness } from './territoryDistinctivenessEngine.js';
import { buildDefaultChannelRoleMap, detectResizeOnlyThinking } from './channelRoleMap.js';
import { evaluateCampaignSequence } from './campaignSequenceIntelligence.js';
import { runBrandSwapTest } from './brandSwapTest.js';
import { detectCrossBrandStyleLeak } from './crossBrandStyleLeakDetector.js';
import { scoreProductionUsefulness } from './productionUsefulness.js';
import { rankTerritories } from './territoryRanking.js';
import { buildBrandExpressionFingerprint } from './brandExpressionFingerprint.js';

export const CREATIVE_JUDGMENT_ENGINE_VERSION = 'P0.CJ.1.0';

const ADVANCE_THRESHOLD = 78;
const REVISE_THRESHOLD = 55;

export function runCreativeJudgmentIntelligence(input: CreativeJudgmentInput): CreativeJudgmentResult {
  const conceptProof = buildConceptMechanismProof(input);
  const failures: CreativeJudgmentFailureClass[] = [];
  const weaknesses: string[] = [];
  const strengths: string[] = [];
  const revisionDirectives: string[] = [];

  if (failsGenericConceptRejection(conceptProof)) {
    failures.push('GENERIC_CONCEPT_REJECTION', 'TOO_GENERIC');
    weaknesses.push('Cannot answer why this and not 20 other campaigns');
  } else {
    strengths.push('Concept mechanism proof present');
  }

  const channelMap = input.channelRoleMap ?? buildDefaultChannelRoleMap(input.campaignId);
  const copyHashes = input.copySamples ?? [input.territory.oneSentenceIdea];
  const mapWithResize = detectResizeOnlyThinking(channelMap, copyHashes);
  if (mapWithResize.resizeOnlyRisk) {
    failures.push('RESIZE_ONLY_THINKING', 'CHANNEL_DUPLICATION');
    weaknesses.push('Channels repeat same narrative job');
    revisionDirectives.push(REVISION_TARGETS_BY_FAILURE.CHANNEL_DUPLICATION!);
  } else if (mapWithResize.allRolesDistinct) {
    strengths.push('Channel roles differentiated');
  }

  const sequence = evaluateCampaignSequence(mapWithResize);
  if (!sequence.coherentSequence) {
    failures.push('WEAK_SEQUENCE');
    weaknesses.push(`Missing sequence stages: ${sequence.missingStages.join(', ')}`);
  }

  const brandSwap = runBrandSwapTest(input);
  if (!brandSwap.passed) {
    failures.push('BRAND_GENERICITY');
    weaknesses.push(brandSwap.rationale);
  } else {
    strengths.push('Brand swap test passed');
  }

  const leak = detectCrossBrandStyleLeak(input);
  if (leak.leaked) {
    failures.push('NDX_LEAK');
    weaknesses.push(`Cross-brand leak: ${leak.evidence.join(', ')}`);
  }

  const t = input.territory;
  if (t.conceptName.toLowerCase().includes('shelf') || t.oneSentenceIdea.toLowerCase().includes('cool')) {
    failures.push('TOO_SAFE', 'OBVIOUS_FIRST_ANSWER');
    weaknesses.push('Polished but obvious territory');
  }

  if (!t.visualWorld || t.visualWorld.length < 8) {
    failures.push('IDEA_ONLY_NO_WORLD');
  } else if (t.mechanism.length < 6) {
    failures.push('STYLE_ONLY_NO_IDEA');
  }

  if (input.interjection) {
    const interjection = input.interjection.toLowerCase();
    if (interjection.length < 20 || interjection.includes('caption')) {
      failures.push('WEAK_INTERJECTION');
    } else if (interjection.includes('skipped')) {
      strengths.push('Interjection compresses argument');
    }
  }

  if (input.territories && input.territories.length > 1) {
    const distinct = compareTerritoryDistinctiveness(input.territories);
    if (distinct.outcome === 'COUSINS' || distinct.outcome === 'NEEDS_REGENERATION') {
      failures.push('TOO_CLOSE');
      weaknesses.push(distinct.recommendation);
    }
  }

  const productionUsefulness = scoreProductionUsefulness({ ...input, channelRoleMap: mapWithResize });
  if (productionUsefulness.score < 60) failures.push('UNDERDEVELOPED');

  const mechanismScore = conceptProof.proofStatus === 'PROVEN' ? 88 : conceptProof.proofStatus === 'WEAK' ? 62 : 35;
  const brandFidelityScore = brandSwap.passed && !leak.leaked ? 86 : leak.leaked ? 40 : 55;
  const originalityScore = failures.includes('TOO_SAFE') ? 45 : failures.includes('OBVIOUS_FIRST_ANSWER') ? 50 : 82;
  const channelDifferentiationScore = mapWithResize.allRolesDistinct && !mapWithResize.resizeOnlyRisk ? 85 : 42;
  const worldBuildingScore = failures.includes('IDEA_ONLY_NO_WORLD') ? 38 : 80;
  const copyAuthenticityScore = leak.leaked ? 35 : 78;
  const selfCritiqueAccuracyScore = failures.length ? 70 : 85;

  const overallScore = Math.round(
    (mechanismScore +
      brandFidelityScore +
      originalityScore +
      channelDifferentiationScore +
      worldBuildingScore +
      copyAuthenticityScore +
      productionUsefulness.score) /
      7,
  );

  let decision: CreativeJudgmentDecision = 'ADVANCE';
  if (failures.includes('GENERIC_CONCEPT_REJECTION') || failures.includes('NDX_LEAK')) {
    decision = failures.includes('GENERIC_CONCEPT_REJECTION') ? 'KILL' : 'REVISE';
  } else if (overallScore < REVISE_THRESHOLD || failures.includes('TOO_CLOSE')) {
    decision = 'KILL';
  } else if (overallScore < ADVANCE_THRESHOLD || failures.length > 0) {
    decision = 'REVISE';
  }
  if (overallScore >= 85 && failures.length === 0) {
    decision = 'ADVANCE';
  }
  if (decision === 'ADVANCE' && (failures.includes('NEEDS_FOUNDER_JUDGMENT') || overallScore < 82)) {
    decision = 'ESCALATE_TO_FOUNDER';
  }

  const requiresFounderReview = decision === 'ESCALATE_TO_FOUNDER' || decision === 'ADVANCE';
  const territoryRanking =
    input.territories && input.territories.length > 1 ? rankTerritories(input.territories) : null;

  for (const f of failures) {
    const target = REVISION_TARGETS_BY_FAILURE[f];
    if (target && !revisionDirectives.includes(target)) revisionDirectives.push(target);
  }

  return {
    judgmentId: `cji-${Date.now()}`,
    projectId: input.projectId,
    brandId: input.brandId,
    entryId: input.entryId ?? null,
    campaignId: input.campaignId,
    territoryId: input.territory.territoryId,
    overallScore,
    decision,
    strengths,
    weaknesses,
    failureClasses: [...new Set(failures)],
    revisionDirectives,
    brandFidelityScore,
    mechanismScore,
    originalityScore,
    channelDifferentiationScore,
    worldBuildingScore,
    copyAuthenticityScore,
    productionUsefulnessScore: productionUsefulness.score,
    selfCritiqueAccuracyScore,
    requiresFounderReview,
    confidence: overallScore >= 80 ? 0.88 : overallScore >= 65 ? 0.72 : 0.55,
    conceptProof,
    channelRoleMap: mapWithResize,
    sequenceIntelligence: sequence,
    brandSwapTest: brandSwap,
    crossBrandLeak: leak,
    productionUsefulness,
    territoryRanking,
    engineVersion: CREATIVE_JUDGMENT_ENGINE_VERSION,
    reasoningMode: input.reasoningMode ?? 'DETERMINISTIC',
    createdAt: new Date().toISOString(),
  };
}

export function getCreativeJudgmentArchitectureStack(): string[] {
  return [
    'BRAND INTELLIGENCE',
    'CONCEPT ENGINE',
    'EXPRESSION ENGINE',
    'CREATIVE JUDGMENT INTELLIGENCE',
    'FOUNDER JUDGMENT MEMORY',
    'BENCHMARK / LEARNING LOOP',
  ];
}

export function enrichInputWithBrandFingerprint(input: CreativeJudgmentInput): CreativeJudgmentInput {
  return {
    ...input,
    brandFingerprint: input.brandFingerprint ?? buildBrandExpressionFingerprint(input.brandId),
  };
}
