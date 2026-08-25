/**
 * P0.5E.4C — Provider selection for still-image casting (reuses P0.5E.5 capability registry).
 */

import { buildGptImage2TextCapability } from '../characterContinuityPipeline/generationCapability.js';
import { DEFAULT_CASTING_CANDIDATE_COUNT } from './constants.js';

export type CastingProviderRecommendation = {
  provider: string | null;
  model: string | null;
  readiness: 'READY' | 'AUTH_REQUIRED' | 'SCHEMA_REVIEW_REQUIRED' | 'CASTING_BLOCKED_PROVIDER';
  estimatedCostUsd: number | null;
  referenceEvidenceSummary: string;
};

const ESTIMATED_COST_PER_STILL_USD = 0.08;

export function recommendStillImageCastingProvider(falConfigured: boolean): CastingProviderRecommendation {
  const cap = buildGptImage2TextCapability();
  if (!falConfigured) {
    return {
      provider: cap.provider,
      model: cap.endpoint,
      readiness: 'AUTH_REQUIRED',
      estimatedCostUsd: DEFAULT_CASTING_CANDIDATE_COUNT * ESTIMATED_COST_PER_STILL_USD,
      referenceEvidenceSummary: 'Visual tendency evidence + character truth snapshot',
    };
  }
  if (cap.schemaSupportState === 'SCHEMA_REVIEW_REQUIRED') {
    return {
      provider: cap.provider,
      model: cap.endpoint,
      readiness: 'SCHEMA_REVIEW_REQUIRED',
      estimatedCostUsd: DEFAULT_CASTING_CANDIDATE_COUNT * ESTIMATED_COST_PER_STILL_USD,
      referenceEvidenceSummary: 'Visual tendency evidence + character truth snapshot',
    };
  }
  return {
    provider: cap.provider,
    model: cap.endpoint,
    readiness: 'READY',
    estimatedCostUsd: DEFAULT_CASTING_CANDIDATE_COUNT * ESTIMATED_COST_PER_STILL_USD,
    referenceEvidenceSummary: 'Visual tendency evidence + character truth snapshot',
  };
}

export function estimateCastingRoundCost(candidateCount: number, falConfigured: boolean): number | null {
  const rec = recommendStillImageCastingProvider(falConfigured);
  if (rec.estimatedCostUsd == null) return null;
  return (rec.estimatedCostUsd / DEFAULT_CASTING_CANDIDATE_COUNT) * candidateCount;
}
