import type { BlockedReason } from '../site00-production-guardrails/types.js';
import type { SpendAuthorizationRecord } from '../site00-production-guardrails/providerGateway/spendAuthorization.js';

export type BudgetPrecheckResult =
  | { ok: true; estimatedCredits: number | null; coverage: 'EXACT' | 'ESTIMATED' | 'UNKNOWN_WITH_REASON'; reason?: string }
  | { ok: false; blockedReason: Extract<BlockedReason, 'UNAUTHORIZED_SPEND'>; detail: string };

export function validateJurnlBudgetPrecheck(input: {
  estimatedCostCredits: number | null | undefined;
  authorization: SpendAuthorizationRecord;
}): BudgetPrecheckResult {
  const est = input.estimatedCostCredits ?? null;
  if (est != null && est > input.authorization.maxCredits) {
    return {
      ok: false,
      blockedReason: 'UNAUTHORIZED_SPEND',
      detail: `Estimated ${est} exceeds authorized max ${input.authorization.maxCredits}`,
    };
  }
  if (est == null) {
    return { ok: true, estimatedCredits: null, coverage: 'UNKNOWN_WITH_REASON', reason: 'JURNL credit estimate not supplied' };
  }
  return { ok: true, estimatedCredits: est, coverage: 'ESTIMATED' };
}
