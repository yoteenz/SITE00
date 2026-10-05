/**
 * Client firewall — strip internal-only operational data.
 */

import type {
  EvolveClientSafeOpsView,
  EvolveMarginSnapshot,
  EvolveOperationalPriority,
  EvolveProjectOpsView,
  EvolveSpendState,
} from './types.js';
import type { EvolveProjectHealthResult } from './types.js';

const INTERNAL_FIELDS = [
  'providerCostCents',
  'marginCents',
  'marginPercent',
  'priorityScore',
  'escalationLevel',
  'internalSummary',
  'founderInterventionRequired',
] as const;

export function stripInternalFields<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out = { ...obj };
  for (const key of INTERNAL_FIELDS) {
    delete (out as Record<string, unknown>)[key];
  }
  return out;
}

export function buildClientSafeOpsView(
  health: EvolveProjectHealthResult,
  spend: EvolveSpendState,
  pendingReviews: number,
  blockers: string[],
): EvolveClientSafeOpsView {
  const total = spend.usagePercent > 0 ? Math.round(100 / (spend.usagePercent / 100)) : 0;
  const used = Math.round((spend.usagePercent / 100) * total);
  const remaining = Math.max(0, total - used);

  const alerts: EvolveClientSafeOpsView['alerts'] = [];
  if (spend.health === 'WATCH' || spend.health === 'AT_RISK') {
    alerts.push({
      type: 'SPEND_WARNING',
      title: 'CREDIT WARNING',
      message: spend.clientSafeSummary,
      route: null,
    });
  }
  if (spend.health === 'LIMIT_REACHED' || spend.health === 'SPEND_BLOCKED') {
    alerts.push({
      type: 'CREDIT_LIMIT',
      title: 'CREDIT LIMIT',
      message: spend.clientSafeSummary,
      route: null,
    });
  }
  if (health.health === 'WAITING_ON_CLIENT') {
    alerts.push({
      type: 'ACTION_REQUIRED',
      title: 'APPROVAL NEEDED',
      message: health.reasons[0]?.label ?? 'YOUR REVIEW IS REQUIRED',
      route: null,
    });
  }
  if (health.health === 'SYSTEM_BLOCKED') {
    alerts.push({
      type: 'ACTION_REQUIRED',
      title: 'ACTION REQUIRED',
      message: 'GENERATION FAILED — ACTION REQUIRED',
      route: null,
    });
  }

  return {
    projectHealth: health.health,
    healthLabel: health.health.replace(/_/g, ' '),
    creditsUsed: used,
    creditsRemaining: remaining,
    creditsTotal: total,
    usagePercent: spend.usagePercent,
    needsAttention: health.health !== 'ON_TRACK' && health.health !== 'COMPLETE',
    nextAction: health.nextRecommendedAction,
    pendingReviews,
    blockers: blockers.filter(Boolean),
    alerts,
  };
}

export function firewallProjectOpsView(view: EvolveProjectOpsView): EvolveClientSafeOpsView {
  return view.clientSafe;
}

export function assertMarginNotClientVisible(margin: EvolveMarginSnapshot | null, audience: 'CLIENT' | 'INTERNAL'): EvolveMarginSnapshot | null {
  if (audience === 'CLIENT') return null;
  return margin;
}

export function assertPriorityNotClientVisible(
  priority: EvolveOperationalPriority | null,
  audience: 'CLIENT' | 'INTERNAL',
): null {
  if (audience === 'CLIENT') return null;
  return priority as null;
}
