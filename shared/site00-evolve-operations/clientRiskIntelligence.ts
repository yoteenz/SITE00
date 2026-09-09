/**
 * ClientRiskIntelligence — churn / delivery risk with explainable reasons.
 */

import type {
  EvolveClientRisk,
  EvolveClientRiskLevel,
  EvolveExplainReason,
  EvolveProjectHealthResult,
  EvolveProjectOpsInput,
  EvolveSpendState,
} from './types.js';

export function deriveClientRisk(
  input: EvolveProjectOpsInput,
  health: EvolveProjectHealthResult,
  spend: EvolveSpendState,
): EvolveClientRisk {
  const reasons: EvolveExplainReason[] = [];
  let churnRiskScore = 0;

  if (input.repeatedFailureCount >= 2) {
    churnRiskScore += 20;
    reasons.push({ code: 'FAILURES', label: `${input.repeatedFailureCount} REPEATED FAILURES` });
  }
  if (health.health === 'STALLED') {
    churnRiskScore += 25;
    reasons.push({ code: 'STALLED', label: health.stallReason ?? 'PROJECT STALLED' });
  }
  if (input.clientResponseLagHours != null && input.clientResponseLagHours >= 72) {
    churnRiskScore += 15;
    reasons.push({ code: 'ENGAGEMENT', label: 'DECLINING ENGAGEMENT — LONG CLIENT LAG' });
  }
  if (spend.health === 'LIMIT_REACHED' || spend.health === 'SPEND_BLOCKED') {
    churnRiskScore += 10;
    reasons.push({ code: 'CREDITS', label: 'CREDIT EXHAUSTION BLOCKING PROGRESS' });
  }
  if (input.paymentState === 'PAST_DUE') {
    churnRiskScore += 30;
    reasons.push({ code: 'BILLING', label: 'BILLING ISSUE' });
  }
  if (input.launchUrgencyDays != null && input.launchUrgencyDays <= 1 && health.waitingParty === 'CLIENT') {
    churnRiskScore += 20;
    reasons.push({ code: 'LAUNCH', label: 'LAUNCH RISK — CLIENT BLOCKING' });
  }
  if (input.openReviewCount >= 3) {
    churnRiskScore += 10;
    reasons.push({ code: 'REJECTED', label: 'MULTIPLE OPEN REVIEWS / REJECTED CONCEPTS' });
  }

  let level: EvolveClientRiskLevel = 'LOW';
  if (churnRiskScore >= 60) level = 'CRITICAL';
  else if (churnRiskScore >= 40) level = 'HIGH';
  else if (churnRiskScore >= 20) level = 'WATCH';

  if (reasons.length === 0) {
    reasons.push({ code: 'LOW_RISK', label: 'NO MATERIAL RISK SIGNALS' });
  }

  return { level, reasons, churnRiskScore: Math.min(100, churnRiskScore) };
}
