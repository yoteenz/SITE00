/**
 * SpendIntelligence — credit allowance, burn projection, spend health states.
 */

import { resolveEvolveOperationsPolicy } from './policyRegistry.js';
import type {
  EvolveDeliveryMode,
  EvolveExplainReason,
  EvolveProjectOpsInput,
  EvolveServicePackageId,
  EvolveSpendSnapshot,
  EvolveSpendState,
} from './types.js';

function usagePercent(spend: EvolveSpendSnapshot): number {
  const total = spend.includedMonthlyCredits + spend.purchasedCredits;
  if (total <= 0) return spend.usedCredits > 0 ? 100 : 0;
  return Math.round((spend.usedCredits / total) * 100);
}

function projectedExceedAllowance(spend: EvolveSpendSnapshot): boolean {
  const total = spend.includedMonthlyCredits + spend.purchasedCredits;
  if (total <= 0 || spend.cycleDaysRemaining <= 0) return false;
  const dailyBurn = spend.usedCredits / Math.max(1, spend.cycleDaysTotal - spend.cycleDaysRemaining);
  const projected = spend.usedCredits + dailyBurn * spend.cycleDaysRemaining;
  return projected > total;
}

export function deriveSpendState(
  spend: EvolveSpendSnapshot,
  servicePackage: EvolveServicePackageId,
  deliveryMode: EvolveDeliveryMode,
): EvolveSpendState {
  const policy = resolveEvolveOperationsPolicy(servicePackage, deliveryMode);
  const pct = usagePercent(spend);
  const reasons: EvolveExplainReason[] = [];
  const totalAllowance = spend.includedMonthlyCredits + spend.purchasedCredits;
  const remaining = Math.max(0, totalAllowance - spend.usedCredits);

  if (deliveryMode === 'SELF_DIRECTED') {
    if (remaining <= 0 && !spend.hasTopUp) {
      reasons.push({ code: 'CREDITS_EXHAUSTED', label: 'INCLUDED ALLOWANCE EXHAUSTED', detail: 'NO TOP-UP AVAILABLE' });
      return {
        health: 'SPEND_BLOCKED',
        usagePercent: pct,
        reasons,
        clientSafeSummary: 'CREDIT LIMIT REACHED — TOP UP OR WAIT FOR NEXT CYCLE',
        internalSummary: 'SELF-DIRECTED HARD BLOCK — NO NEGATIVE BALANCE',
        blockGeneration: true,
      };
    }

    if (pct >= policy.hardBlockAtPercent && !spend.hasTopUp) {
      reasons.push({ code: 'LIMIT_REACHED', label: `${pct}% OF INCLUDED CREATIVE RUNS USED` });
      return {
        health: 'LIMIT_REACHED',
        usagePercent: pct,
        reasons,
        clientSafeSummary: 'CREDIT LIMIT REACHED',
        internalSummary: '100% ALLOWANCE — BLOCK UNLESS TOP-UP',
        blockGeneration: true,
      };
    }

    if (pct >= policy.spendCriticalPercent) {
      reasons.push({ code: 'CRITICAL_USAGE', label: `${pct}% OF INCLUDED CREATIVE RUNS USED` });
      if (spend.cycleDaysRemaining > 0) {
        reasons.push({ code: 'CYCLE_REMAINING', label: `${spend.cycleDaysRemaining} DAYS REMAIN IN CYCLE` });
      }
      if (projectedExceedAllowance(spend)) {
        reasons.push({ code: 'PROJECTED_EXCEED', label: 'PROJECTED TO EXCEED ALLOWANCE' });
      }
      return {
        health: 'AT_RISK',
        usagePercent: pct,
        reasons,
        clientSafeSummary: `${remaining} CREATIVE RUNS LEFT — USAGE AT ${pct}%`,
        internalSummary: 'CRITICAL THRESHOLD — MONITOR BURN',
        blockGeneration: false,
      };
    }

    if (pct >= policy.spendWarningPercent) {
      reasons.push({ code: 'WARNING_USAGE', label: `${pct}% OF INCLUDED CREATIVE RUNS USED` });
      if (spend.cycleDaysRemaining > 0) {
        reasons.push({ code: 'CYCLE_REMAINING', label: `${spend.cycleDaysRemaining} DAYS REMAIN IN CYCLE` });
      }
      if (projectedExceedAllowance(spend)) {
        reasons.push({ code: 'PROJECTED_EXCEED', label: 'PROJECTED TO EXCEED ALLOWANCE' });
      }
      return {
        health: 'WATCH',
        usagePercent: pct,
        reasons,
        clientSafeSummary: `${remaining} CREATIVE RUNS LEFT`,
        internalSummary: 'WATCH — APPROACHING ALLOWANCE',
        blockGeneration: false,
      };
    }

    return {
      health: 'HEALTHY',
      usagePercent: pct,
      reasons: [{ code: 'WITHIN_ALLOWANCE', label: 'WITHIN MONTHLY ALLOWANCE' }],
      clientSafeSummary: `${remaining} CREATIVE RUNS REMAINING`,
      internalSummary: 'HEALTHY BURN',
      blockGeneration: false,
    };
  }

  // SITE00_DIRECTED — soft warnings, internal approval routing
  const internalSpend = spend.providerCostCents;
  if (policy.internalBudgetHardLimitCents != null && internalSpend >= policy.internalBudgetHardLimitCents) {
    reasons.push({ code: 'INTERNAL_BUDGET_HARD', label: 'INTERNAL PROVIDER BUDGET AT HARD LIMIT' });
    return {
      health: 'SPEND_BLOCKED',
      usagePercent: pct,
      reasons,
      clientSafeSummary: 'PRODUCTION PAUSED — SITE 00 REVIEW IN PROGRESS',
      internalSummary: 'DIRECTED HARD INTERNAL LIMIT — FOUNDER / OPS APPROVAL REQUIRED',
      blockGeneration: true,
    };
  }

  if (policy.internalBudgetSoftLimitCents != null && internalSpend >= policy.internalBudgetSoftLimitCents) {
    reasons.push({ code: 'INTERNAL_BUDGET_SOFT', label: 'INTERNAL PROVIDER BUDGET ABOVE SOFT LIMIT' });
    return {
      health: 'WATCH',
      usagePercent: pct,
      reasons,
      clientSafeSummary: 'PRODUCTION CONTINUES — INTERNAL REVIEW ACTIVE',
      internalSummary: 'SOFT WARNING — SCOPE / SPEND APPROVAL ROUTE',
      blockGeneration: false,
    };
  }

  if (servicePackage === 'GROWTH_PARTNER') {
    reasons.push({ code: 'GROWTH_PARTNER_POOL', label: 'POOLED MONTHLY ALLOWANCE — ROLLING UTILIZATION' });
    if (pct >= policy.spendCriticalPercent) {
      return {
        health: 'WATCH',
        usagePercent: pct,
        reasons,
        clientSafeSummary: 'HIGH UTILIZATION — PROACTIVE BUDGET REVIEW',
        internalSummary: 'GROWTH PARTNER — PROACTIVE BUDGET ADJUSTMENT',
        blockGeneration: false,
      };
    }
  }

  return {
    health: 'HEALTHY',
    usagePercent: pct,
    reasons: [{ code: 'DIRECTED_WITHIN_BUDGET', label: 'WITHIN INTERNAL ENGAGEMENT BUDGET' }],
    clientSafeSummary: 'PRODUCTION ACTIVE',
    internalSummary: 'DIRECTED SPEND WITHIN POLICY',
    blockGeneration: false,
  };
}

export function enforceNoNegativeBalance(spend: EvolveSpendSnapshot): boolean {
  const total = spend.includedMonthlyCredits + spend.purchasedCredits;
  return spend.remainingCredits >= 0 && spend.usedCredits <= total + (spend.hasTopUp ? spend.purchasedCredits : 0);
}

export function computeFailureBudget(spend: EvolveSpendSnapshot): {
  productiveSpendCents: number;
  failedSpendCents: number;
  retrySpendCents: number;
  regenerationSpendCents: number;
  productiveSpendPercent: number;
  failureSpendPercent: number;
  regenerationRate: number;
} {
  const total =
    spend.productiveSpendCents + spend.failedSpendCents + spend.retrySpendCents + spend.regenerationSpendCents;
  const productiveSpendPercent = total > 0 ? Math.round((spend.productiveSpendCents / total) * 100) : 100;
  const failureSpendPercent = total > 0 ? Math.round(((spend.failedSpendCents + spend.retrySpendCents) / total) * 100) : 0;
  const regenerationRate =
    spend.productiveSpendCents > 0
      ? Math.round((spend.regenerationSpendCents / spend.productiveSpendCents) * 100)
      : 0;
  return {
    productiveSpendCents: spend.productiveSpendCents,
    failedSpendCents: spend.failedSpendCents,
    retrySpendCents: spend.retrySpendCents,
    regenerationSpendCents: spend.regenerationSpendCents,
    productiveSpendPercent,
    failureSpendPercent,
    regenerationRate,
  };
}

export function deriveSpendFromProject(input: EvolveProjectOpsInput): EvolveSpendState {
  return deriveSpendState(input.spend, input.servicePackage, input.deliveryMode);
}
