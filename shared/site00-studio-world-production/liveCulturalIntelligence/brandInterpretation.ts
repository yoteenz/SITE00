/**
 * Generic BrandSignalInterpretation — brand decides relevance, not trend volume.
 */

import { randomUUID } from 'node:crypto';
import type {
  BrandRelevanceDecision,
  BrandSignalInterpretation,
  CurrentIntelligencePackage,
  LiveWorldSignal,
} from './types.js';

export function interpretBrandSignal(params: {
  brandId: string;
  signal: LiveWorldSignal;
  intelligencePackage: CurrentIntelligencePackage;
  scores?: Partial<{
    naturalInterest: number;
    characterFit: number;
    wouldBrandCareWithoutTrend: boolean;
    trendDependencyRisk: number;
    forcedParticipationRisk: number;
    hasDistinctiveObservation: boolean;
    hasHistoricalCallback: boolean;
  }>;
}): BrandSignalInterpretation {
  const s = params.scores ?? {};
  const naturalInterest = s.naturalInterest ?? 0.5;
  const characterFit = s.characterFit ?? 0.5;
  const wouldBrandCare = s.wouldBrandCareWithoutTrend ?? naturalInterest > 0.6;
  const trendDep = s.trendDependencyRisk ?? (wouldBrandCare ? 0.2 : 0.8);
  const forced = s.forcedParticipationRisk ?? (wouldBrandCare ? 0.1 : 0.9);

  let decision: BrandRelevanceDecision = 'PROMISING_INVESTIGATE';
  if (forced > 0.7) decision = 'FORCED_PARTICIPATION';
  else if (trendDep > 0.7 && !wouldBrandCare) decision = 'NOTHING_NEW_TO_ADD';
  else if (naturalInterest > 0.75 && characterFit > 0.6) decision = 'STRONG_OPPORTUNITY';
  else if (s.hasHistoricalCallback) decision = 'CALLBACK_OPPORTUNITY';
  else if (params.signal.saturation > 0.85 && !s.hasDistinctiveObservation) decision = 'TOO_SATURATED';
  else if (naturalInterest < 0.3) decision = 'NOT_FOR_THIS_BRAND';

  return {
    id: `bsi-${randomUUID().slice(0, 8)}`,
    brandId: params.brandId,
    signalId: params.signal.id,
    intelligencePackageId: params.intelligencePackage.id,
    naturalInterest,
    audienceInterest: 0.5,
    characterFit,
    editorialFit: characterFit,
    knowledgeFit: 0.5,
    culturalFit: 0.5,
    hasDistinctiveObservation: s.hasDistinctiveObservation ?? false,
    hasDistinctiveJudgment: naturalInterest > 0.6,
    hasUsefulConnection: s.hasDistinctiveObservation ?? false,
    hasHistoricalCallback: s.hasHistoricalCallback ?? false,
    hasContradiction: false,
    hasReceipts: s.hasHistoricalCallback ?? false,
    hasData: params.intelligencePackage.currentDataPoints.length > 0,
    hasVisualPotential: params.intelligencePackage.visualEvidenceCandidates.length > 0,
    hasHumorPotential: false,
    hasTeachingPotential: naturalInterest > 0.5,
    hasConversationPotential: true,
    wouldBrandCareWithoutTrend: wouldBrandCare,
    trendDependencyRisk: trendDep,
    forcedParticipationRisk: forced,
    recommendedBehavior: decision === 'STRONG_OPPORTUNITY' ? 'INVESTIGATE' : null,
    reasoning: wouldBrandCare ? 'Brand would care independent of trend volume' : 'Trend-dependent interest only',
    rejectionReason: decision === 'FORCED_PARTICIPATION' || decision === 'NOTHING_NEW_TO_ADD' ? 'Insufficient brand-native angle' : null,
    decision,
    evaluatedAt: new Date().toISOString(),
  };
}

export function brandRelevanceRequiredBeforePromotion(interpretation: BrandSignalInterpretation): boolean {
  return interpretation.decision === 'STRONG_OPPORTUNITY' ||
    interpretation.decision === 'PROMISING_INVESTIGATE' ||
    interpretation.decision === 'CALLBACK_OPPORTUNITY' ||
    interpretation.decision === 'RAPID_RESPONSE';
}

export function trendDoesNotAutomaticallyBecomeContent(interpretation: BrandSignalInterpretation): boolean {
  return interpretation.decision !== 'STRONG_OPPORTUNITY' || interpretation.wouldBrandCareWithoutTrend;
}

export function forcedParticipationRejected(interpretation: BrandSignalInterpretation): boolean {
  return interpretation.decision === 'FORCED_PARTICIPATION' || interpretation.decision === 'NOTHING_NEW_TO_ADD';
}
