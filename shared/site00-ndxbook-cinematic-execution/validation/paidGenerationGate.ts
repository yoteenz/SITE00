import {
  issueSpendAuthorization,
  validateSpendAuthorization,
  type SpendAuthorizationRecord,
} from '../../site00-production-guardrails/providerGateway/spendAuthorization.js';
import type { ReferenceBindingManifest } from '../types/schemas.js';
import { isNdxbookKling4ExecutionEnabled } from '../featureFlags.js';

export type PaidGenerationIntent = {
  projectId: string;
  provider: string;
  model: string;
  shotId: string;
  durationSec: number;
  aspectRatio: string;
  resolution: string;
  referenceCount: number;
  estimatedCostCredits: number | null;
  generationCount: number;
  outputLocation: string;
  spendAuthorizationId?: string | null;
  actorId?: string;
};

export type PaidGenerationGateResult =
  | { allowed: false; blockedReason: 'FEATURE_DISABLED' | 'UNAUTHORIZED_SPEND' | 'MISSING_AUTHORIZATION'; detail: string }
  | { allowed: true; authorization: SpendAuthorizationRecord };

export function assertPaidGenerationAuthorized(intent: PaidGenerationIntent): PaidGenerationGateResult {
  if (!isNdxbookKling4ExecutionEnabled()) {
    return {
      allowed: false,
      blockedReason: 'FEATURE_DISABLED',
      detail: 'NDXBOOK_KLING4_EXECUTION_ENABLED is false (server + VITE).',
    };
  }

  const validation = validateSpendAuthorization(intent.spendAuthorizationId, {
    projectId: intent.projectId,
    provider: intent.provider,
    generationClass: 'NET_NEW_AUTHORITY',
    estimatedCostCredits: intent.estimatedCostCredits,
  });

  if (!validation.ok) {
    return {
      allowed: false,
      blockedReason: 'UNAUTHORIZED_SPEND',
      detail: validation.detail,
    };
  }

  return { allowed: true, authorization: validation.record };
}

/** Founder-facing preflight summary (no credits spent). */
export function buildPaidGenerationPreflightReport(
  intent: PaidGenerationIntent,
  manifest: ReferenceBindingManifest,
): Record<string, unknown> {
  return {
    provider: intent.provider,
    model: intent.model,
    shotId: intent.shotId,
    durationSec: intent.durationSec,
    aspectRatio: intent.aspectRatio,
    resolution: intent.resolution,
    referenceCount: intent.referenceCount,
    manifestReferenceCount: manifest.references.length,
    estimatedCostCredits: intent.estimatedCostCredits,
    generationCount: intent.generationCount,
    outputLocation: intent.outputLocation,
    featureFlagEnabled: isNdxbookKling4ExecutionEnabled(),
    requiresSpendAuthorizationId: true,
  };
}

export function issueBenchmarkSpendAuthorization(input: {
  projectId: string;
  actorId: string;
  maxCredits: number;
  purpose: string;
}): SpendAuthorizationRecord {
  return issueSpendAuthorization({
    projectId: input.projectId,
    actorId: input.actorId,
    provider: 'artlist-kling-4',
    model: 'kling-4.0',
    generationClass: 'NET_NEW_AUTHORITY',
    maxCredits: input.maxCredits,
    purpose: input.purpose,
  });
}
