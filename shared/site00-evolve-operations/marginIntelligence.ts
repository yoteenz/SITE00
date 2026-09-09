/**
 * MarginIntelligence — internal only; client firewall enforced elsewhere.
 */

import { resolveEvolveOperationsPolicy } from './policyRegistry.js';
import type {
  EvolveDeliveryMode,
  EvolveExplainReason,
  EvolveMarginHealth,
  EvolveMarginSnapshot,
  EvolveServicePackageId,
} from './types.js';

export function computeMarginSnapshot(
  clientRevenueCents: number,
  providerCostCents: number,
  humanDeliveryCostCents: number,
  otherDeliveryCostCents = 0,
  servicePackage: EvolveServicePackageId,
  deliveryMode: EvolveDeliveryMode,
): EvolveMarginSnapshot {
  const policy = resolveEvolveOperationsPolicy(servicePackage, deliveryMode);
  const totalCost = providerCostCents + humanDeliveryCostCents + otherDeliveryCostCents;
  const marginCents = clientRevenueCents - totalCost;
  const marginPercent = clientRevenueCents > 0 ? Math.round((marginCents / clientRevenueCents) * 100) : 0;
  const reasons: EvolveExplainReason[] = [];

  let health: EvolveMarginHealth = 'HEALTHY';
  if (marginCents < 0) {
    health = 'UNPROFITABLE';
    reasons.push({ code: 'NEGATIVE_MARGIN', label: 'DELIVERY COST EXCEEDS CLIENT REVENUE' });
  } else if (marginPercent < policy.marginWatchThresholdPercent) {
    health = 'ERODING';
    reasons.push({
      code: 'LOW_MARGIN',
      label: `MARGIN ${marginPercent}% BELOW WATCH THRESHOLD ${policy.marginWatchThresholdPercent}%`,
    });
  } else if (marginPercent < policy.marginWatchThresholdPercent + 10) {
    health = 'WATCH';
    reasons.push({ code: 'MARGIN_WATCH', label: `MARGIN ${marginPercent}% — MONITOR DELIVERY COST` });
  } else {
    reasons.push({ code: 'HEALTHY_MARGIN', label: `MARGIN ${marginPercent}% WITHIN POLICY` });
  }

  reasons.push({
    code: 'BREAKDOWN',
    label: `REV ${clientRevenueCents} · PROVIDER ${providerCostCents} · HUMAN ${humanDeliveryCostCents}`,
  });

  return {
    clientRevenueCents,
    providerCostCents,
    humanDeliveryCostCents,
    otherDeliveryCostCents,
    marginCents,
    marginPercent,
    health,
    reasons,
  };
}

export function isMarginInternalOnly(): true {
  return true;
}
