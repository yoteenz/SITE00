/**
 * Automated nudge intelligence — cooldowns, history tracking.
 */

import type { EvolveExplainReason, EvolveProjectOpsInput } from './types.js';
import { resolveEvolveOperationsPolicy } from './policyRegistry.js';

export type NudgeRecord = {
  projectId: string;
  nudgeType: string;
  sentAt: string;
};

export function shouldSendNudge(
  input: EvolveProjectOpsInput,
  nudgeType: 'PENDING_APPROVAL' | 'MISSING_ASSETS' | 'CREDIT_WARNING' | 'LAUNCH_DEADLINE' | 'STALLED_BRIEF',
  history: NudgeRecord[],
  now = Date.now(),
): { send: boolean; reasons: EvolveExplainReason[] } {
  const policy = resolveEvolveOperationsPolicy(input.servicePackage, input.deliveryMode);
  const cooldownMs = policy.clientApprovalNudgeCooldownHours * 60 * 60 * 1000;
  const reasons: EvolveExplainReason[] = [];

  const last = history
    .filter((n) => n.projectId === input.projectId && n.nudgeType === nudgeType)
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt))[0];

  if (last && now - new Date(last.sentAt).getTime() < cooldownMs) {
    reasons.push({ code: 'COOLDOWN', label: 'NUDGE COOLDOWN ACTIVE' });
    return { send: false, reasons };
  }

  switch (nudgeType) {
    case 'PENDING_APPROVAL':
      if (input.approvalWaitingOn !== 'CLIENT') {
        reasons.push({ code: 'NOT_WAITING', label: 'NOT WAITING ON CLIENT' });
        return { send: false, reasons };
      }
      break;
    case 'CREDIT_WARNING':
      if (input.spend.remainingCredits / Math.max(1, input.spend.includedMonthlyCredits) > 0.15) {
        reasons.push({ code: 'CREDITS_OK', label: 'CREDITS NOT LOW ENOUGH' });
        return { send: false, reasons };
      }
      break;
    case 'LAUNCH_DEADLINE':
      if (input.launchUrgencyDays == null || input.launchUrgencyDays > 3) {
        reasons.push({ code: 'NO_DEADLINE', label: 'NO IMMINENT LAUNCH' });
        return { send: false, reasons };
      }
      break;
    default:
      break;
  }

  reasons.push({ code: 'NUDGE_ALLOWED', label: `${nudgeType} NUDGE PERMITTED` });
  return { send: true, reasons };
}
