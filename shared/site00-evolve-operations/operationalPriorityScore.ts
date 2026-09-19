/**
 * OperationalPriorityScore — multi-factor priority, not revenue alone.
 */

import type { EvolveExplainReason, EvolveOperationalPriority, EvolveProjectHealthResult, EvolveProjectOpsInput, EvolveSpendState } from './types.js';
import { resolveEvolveOperationsPolicy } from './policyRegistry.js';

const PACKAGE_BASE: Record<string, number> = {
  EVOLVE_SOLO: 10,
  EVOLVE_STUDIO: 15,
  EVOLVE_PRO: 20,
  PROJECT_PASS: 12,
  DISCOVERY_SPRINT: 15,
  DIRECTED_BUILD: 35,
  MARKETING_RETAINER: 40,
  GROWTH_PARTNER: 55,
  AGENCY_ENTERPRISE: 60,
  CUSTOM_AGENCY: 50,
};

export function computeOperationalPriorityScore(
  input: EvolveProjectOpsInput,
  health: EvolveProjectHealthResult,
  spend: EvolveSpendState,
): EvolveOperationalPriority {
  const policy = resolveEvolveOperationsPolicy(input.servicePackage, input.deliveryMode);
  const reasons: EvolveExplainReason[] = [];
  let score = PACKAGE_BASE[input.servicePackage] ?? 10;
  score += policy.serviceTierPriorityBoost;

  if (input.revenueTierCents >= 480_000) {
    score += 25;
    reasons.push({ code: 'HIGH_VALUE', label: 'HIGH-VALUE CLIENT TIER' });
  } else if (input.revenueTierCents >= 200_000) {
    score += 15;
    reasons.push({ code: 'MID_VALUE', label: 'MID-TIER REVENUE CLIENT' });
  }

  if (input.launchUrgencyDays != null && input.launchUrgencyDays <= 1) {
    score += 30;
    reasons.push({ code: 'LAUNCH_URGENT', label: 'LAUNCH WITHIN 24H' });
  } else if (input.launchUrgencyDays != null && input.launchUrgencyDays <= 3) {
    score += 15;
    reasons.push({ code: 'LAUNCH_SOON', label: 'LAUNCH WITHIN 3 DAYS' });
  }

  if (health.health === 'AT_RISK' || health.health === 'STALLED') {
    score += 20;
    reasons.push({ code: 'HEALTH_RISK', label: `PROJECT ${health.health}` });
  }

  if (health.waitingParty === 'CLIENT' && input.approvalWaitingOn === 'CLIENT') {
    const lag = input.clientResponseLagHours ?? 0;
    if (lag >= 4 && input.servicePackage === 'GROWTH_PARTNER') {
      score += 25;
      reasons.push({ code: 'VIP_CLIENT_WAITING', label: `CLIENT WAITING ${lag}H — GROWTH PARTNER` });
    } else if (lag >= 24) {
      score += 10;
      reasons.push({ code: 'CLIENT_LAG', label: `CLIENT RESPONSE LAG ${lag}H` });
    }
  }

  if (input.repeatedFailureCount >= 2) {
    score += 15;
    reasons.push({ code: 'FAILURES', label: `${input.repeatedFailureCount} REPEATED FAILURES` });
  }

  if (spend.health === 'AT_RISK' || spend.health === 'SPEND_BLOCKED') {
    score += 10;
    reasons.push({ code: 'SPEND', label: `SPEND ${spend.health}` });
  }

  if (input.slaHours != null && input.clientResponseLagHours != null && input.clientResponseLagHours > input.slaHours) {
    score += 20;
    reasons.push({ code: 'SLA_BREACH', label: 'SLA RESPONSE THRESHOLD EXCEEDED' });
  }

  const founderInterventionRequired =
    input.servicePackage === 'GROWTH_PARTNER' ||
    input.servicePackage === 'AGENCY_ENTERPRISE' ||
    (health.health === 'AT_RISK' && input.launchUrgencyDays != null && input.launchUrgencyDays <= 1);

  if (founderInterventionRequired && score >= 70) {
    reasons.push({ code: 'FOUNDER', label: 'FOUNDER-LEVEL ATTENTION WARRANTED' });
  }

  score = Math.min(100, Math.max(0, score));

  let band: EvolveOperationalPriority['band'] = 'LOW';
  if (score >= 75) band = 'CRITICAL';
  else if (score >= 50) band = 'HIGH';
  else if (score >= 25) band = 'NORMAL';

  return { score, band, reasons, founderInterventionRequired: founderInterventionRequired && score >= 60 };
}
