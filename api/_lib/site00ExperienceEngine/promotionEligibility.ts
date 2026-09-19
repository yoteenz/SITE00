/**
 * Experience Engine V0 — promotion eligibility (strict gate, Sprint A).
 */

import type {
  FidelityIterationStatus,
  PromotionEligibilityResult,
  RouteReferenceAuthorityLevel,
  Site00FidelityIterationRecord,
  Site00RouteReferenceRecord,
} from '../../../shared/site00-experience-engine/types.js';
import {
  EXPERIENCE_ENGINE_PIXEL_PASS_THRESHOLD,
  EXPERIENCE_ENGINE_STRUCTURAL_PASS_THRESHOLD,
} from '../../../shared/site00-experience-engine/constants.js';

export type EvaluatePromotionInput = {
  reference: Site00RouteReferenceRecord | null;
  latestIteration: Site00FidelityIterationRecord | null;
  threshold?: number;
};

export function evaluatePromotionEligibility(input: EvaluatePromotionInput): PromotionEligibilityResult {
  const threshold = input.threshold ?? EXPERIENCE_ENGINE_PIXEL_PASS_THRESHOLD;
  const reasons: string[] = [];

  const reference = input.reference;
  if (!reference) {
    return {
      eligible: false,
      reasons: ['NO_ROUTE_REFERENCE'],
      pixelScore: null,
      threshold,
      authorityLevel: null,
      iterationStatus: null,
    };
  }

  if (reference.status === 'BLOCKED_PENDING_REFERENCE_AUTHORITY') {
    return {
      eligible: false,
      reasons: ['BLOCKED_PENDING_REFERENCE_AUTHORITY'],
      pixelScore: null,
      threshold,
      authorityLevel: reference.authorityLevel,
      iterationStatus: null,
    };
  }

  if (reference.authorityLevel !== 'DESIGN_AUTHORITY') {
    reasons.push(`AUTHORITY_NOT_DESIGN_AUTHORITY:${reference.authorityLevel}`);
  }

  if (reference.authorityLevel === 'IMPLEMENTATION_BASELINE') {
    return {
      eligible: false,
      reasons: ['IMPLEMENTATION_BASELINE_CANNOT_SATISFY_DESIGN_AUTHORITY_GATE'],
      pixelScore: input.latestIteration?.pixelScore ?? null,
      threshold,
      authorityLevel: reference.authorityLevel,
      iterationStatus: input.latestIteration?.status ?? null,
    };
  }

  const iteration = input.latestIteration;
  if (!iteration) {
    return {
      eligible: false,
      reasons: reasons.length ? reasons : ['NO_FIDELITY_ITERATION'],
      pixelScore: null,
      threshold,
      authorityLevel: reference.authorityLevel,
      iterationStatus: null,
    };
  }

  if (iteration.status === 'BLOCKED' || iteration.status === 'FAILED') {
    return {
      eligible: false,
      reasons: [`ITERATION_${iteration.status}`],
      pixelScore: iteration.pixelScore,
      threshold,
      authorityLevel: reference.authorityLevel,
      iterationStatus: iteration.status,
    };
  }

  if (iteration.comparisonMetadata.comparisonEngine === 'NOT_EVALUATED') {
    return {
      eligible: false,
      reasons: ['NOT_EVALUATED'],
      pixelScore: iteration.pixelScore,
      threshold,
      authorityLevel: reference.authorityLevel,
      iterationStatus: iteration.status,
    };
  }

  const structuralOnly =
    iteration.pixelScore >= EXPERIENCE_ENGINE_STRUCTURAL_PASS_THRESHOLD &&
    iteration.pixelScore < EXPERIENCE_ENGINE_PIXEL_PASS_THRESHOLD &&
    iteration.status !== 'PIXEL_PASS';

  if (structuralOnly) {
    return {
      eligible: false,
      reasons: ['STRUCTURAL_PASS_DOES_NOT_SHIP'],
      pixelScore: iteration.pixelScore,
      threshold,
      authorityLevel: reference.authorityLevel,
      iterationStatus: iteration.status,
    };
  }

  const score = iteration.pixelScore;
  if (score < threshold) {
    return {
      eligible: false,
      reasons: [`PIXEL_SCORE_BELOW_THRESHOLD:${score.toFixed(4)}<${threshold}`],
      pixelScore: score,
      threshold,
      authorityLevel: reference.authorityLevel,
      iterationStatus: iteration.status,
    };
  }

  if (iteration.status !== 'PIXEL_PASS') {
    return {
      eligible: false,
      reasons: [`ITERATION_STATUS_NOT_PIXEL_PASS:${iteration.status}`],
      pixelScore: score,
      threshold,
      authorityLevel: reference.authorityLevel,
      iterationStatus: iteration.status,
    };
  }

  const blockedRegions = new Set(
    ((reference.metadata.blockedRegionIds as string[] | undefined) ?? ['status-strip']).filter(Boolean),
  );
  const failedRegions = iteration.comparisonMetadata.regionScores.filter(
    (r) => !r.passed && !blockedRegions.has(r.regionId),
  );
  if (failedRegions.length > 0) {
    return {
      eligible: false,
      reasons: failedRegions.map((r) => `REGION_FAILED:${r.regionId}:${r.pixelScore.toFixed(4)}`),
      pixelScore: score,
      threshold,
      authorityLevel: reference.authorityLevel,
      iterationStatus: iteration.status,
    };
  }

  const telemetryFailures = iteration.comparisonMetadata.regionScores.filter(
    (r) => !r.passed && blockedRegions.has(r.regionId),
  );
  if (telemetryFailures.length > 0) {
    reasons.push(
      ...telemetryFailures.map((r) => `REGION_TELEMETRY_ONLY:${r.regionId}:${r.pixelScore.toFixed(4)}`),
    );
  }

  return {
    eligible: true,
    reasons: ['PIXEL_PASS', 'DESIGN_AUTHORITY', 'REQUIRED_REGIONS_PASS', ...reasons],
    pixelScore: score,
    threshold,
    authorityLevel: reference.authorityLevel,
    iterationStatus: iteration.status,
  };
}

export function classifyThresholdBehavior(score: number): {
  passes094: boolean;
  passes093: boolean;
  structuralOnly: boolean;
} {
  return {
    passes094: score >= EXPERIENCE_ENGINE_PIXEL_PASS_THRESHOLD,
    passes093: score >= 0.93,
    structuralOnly:
      score >= EXPERIENCE_ENGINE_STRUCTURAL_PASS_THRESHOLD && score < EXPERIENCE_ENGINE_PIXEL_PASS_THRESHOLD,
  };
}

export function authorityBlocksPromotion(level: RouteReferenceAuthorityLevel): boolean {
  return level === 'IMPLEMENTATION_BASELINE' || level === 'UNAPPROVED';
}

export function statusBlocksPromotion(status: FidelityIterationStatus | null): boolean {
  return status === 'BLOCKED' || status === 'FAILED' || status === 'CAPTURED' || status === 'COMPARED';
}
