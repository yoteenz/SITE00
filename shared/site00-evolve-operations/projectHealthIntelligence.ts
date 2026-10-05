/**
 * ProjectHealthIntelligence — meaningful progress, stall detection, waiting states.
 */

import { resolveEvolveOperationsPolicy } from './policyRegistry.js';
import type {
  EvolveExplainReason,
  EvolveMeaningfulProgressKind,
  EvolveOperationalHealth,
  EvolveProjectHealthResult,
  EvolveProjectOpsInput,
} from './types.js';

const MEANINGFUL_PROGRESS: EvolveMeaningfulProgressKind[] = [
  'APPROVAL_COMPLETED',
  'CAMPAIGN_TERRITORY_SELECTED',
  'BRIEF_COMPLETED',
  'TREATMENT_ADVANCED',
  'ASSET_APPROVED',
  'PRODUCTION_STAGE_COMPLETED',
  'LAUNCH_MILESTONE_COMPLETED',
  'CLIENT_RESPONSE_RECEIVED',
  'TECHNICAL_BLOCKER_RESOLVED',
];

export function isMeaningfulProgress(kind: string): boolean {
  return MEANINGFUL_PROGRESS.includes(kind as EvolveMeaningfulProgressKind);
}

function daysSince(iso: string | null, now = Date.now()): number | null {
  if (!iso) return null;
  const ms = now - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function hoursSince(iso: string | null, now = Date.now()): number | null {
  if (!iso) return null;
  const ms = now - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60)));
}

export function deriveProjectHealth(input: EvolveProjectOpsInput, now = Date.now()): EvolveProjectHealthResult {
  const policy = resolveEvolveOperationsPolicy(input.servicePackage, input.deliveryMode);
  const reasons: EvolveExplainReason[] = [];
  const daysIdle = daysSince(input.lastMeaningfulProgressAt, now);
  const approvalPendingDays = daysSince(input.approvalPendingSince, now);
  const approvalPendingHours = hoursSince(input.approvalPendingSince, now);

  if (input.productionCompletionPercent === 100 || input.projectStage.toUpperCase().includes('COMPLETE')) {
    return {
      health: 'COMPLETE',
      reasons: [{ code: 'COMPLETE', label: 'ENGAGEMENT COMPLETE' }],
      stallReason: null,
      daysSinceMeaningfulProgress: daysIdle,
      waitingParty: null,
      nextRecommendedAction: null,
    };
  }

  if (input.repeatedFailureCount >= 3 || input.unresolvedBlockerCount > 0) {
    if (input.repeatedFailureCount >= 3) {
      reasons.push({ code: 'REPEATED_FAILURES', label: `${input.repeatedFailureCount} REPEATED PROVIDER FAILURES` });
    }
    if (input.unresolvedBlockerCount > 0) {
      reasons.push({ code: 'BLOCKERS', label: `${input.unresolvedBlockerCount} UNRESOLVED BLOCKERS` });
    }
    return {
      health: 'SYSTEM_BLOCKED',
      reasons,
      stallReason: reasons.map((r) => r.label).join(' · '),
      daysSinceMeaningfulProgress: daysIdle,
      waitingParty: 'SYSTEM',
      nextRecommendedAction: 'RESOLVE SYSTEM BLOCKERS OR ESCALATE',
    };
  }

  if (input.approvalWaitingOn === 'CLIENT' && approvalPendingDays != null && approvalPendingDays >= 1) {
    reasons.push({
      code: 'CLIENT_APPROVAL',
      label: `WAITING ${approvalPendingDays} DAY${approvalPendingDays === 1 ? '' : 'S'} FOR CLIENT APPROVAL`,
    });
    const stalled = approvalPendingDays >= policy.stallThresholdDays;
    return {
      health: stalled ? 'STALLED' : 'WAITING_ON_CLIENT',
      reasons,
      stallReason: stalled ? reasons[0]?.label ?? null : null,
      daysSinceMeaningfulProgress: daysIdle,
      waitingParty: 'CLIENT',
      nextRecommendedAction: stalled ? 'AUTOMATED NUDGE OR CLIENT OUTREACH' : 'MONITOR CLIENT APPROVAL',
    };
  }

  if (input.approvalWaitingOn === 'SITE00') {
    const waitHours = approvalPendingHours ?? 0;
    reasons.push({ code: 'SITE00_REVIEW', label: `CLIENT WAITING ${waitHours}H ON SITE 00 REVIEW` });
    return {
      health: waitHours >= 48 ? 'AT_RISK' : 'WAITING_ON_SITE00',
      reasons,
      stallReason: waitHours >= 72 ? reasons[0]?.label ?? null : null,
      daysSinceMeaningfulProgress: daysIdle,
      waitingParty: 'SITE00',
      nextRecommendedAction: 'COMPLETE SITE 00 REVIEW',
    };
  }

  if (input.spend.remainingCredits <= 0 && input.deliveryMode === 'SELF_DIRECTED') {
    reasons.push({ code: 'CREDITS_EXHAUSTED', label: 'CREDITS EXHAUSTED' });
    return {
      health: 'SYSTEM_BLOCKED',
      reasons,
      stallReason: 'CREDITS EXHAUSTED',
      daysSinceMeaningfulProgress: daysIdle,
      waitingParty: 'CLIENT',
      nextRecommendedAction: 'TOP UP OR WAIT FOR CYCLE RESET',
    };
  }

  if (daysIdle != null && daysIdle >= policy.stallThresholdDays) {
    reasons.push({ code: 'INACTIVITY', label: `NO MEANINGFUL PROGRESS FOR ${daysIdle} DAYS` });
    return {
      health: 'STALLED',
      reasons,
      stallReason: reasons[0]?.label ?? null,
      daysSinceMeaningfulProgress: daysIdle,
      waitingParty: null,
      nextRecommendedAction: 'IDENTIFY BLOCKER AND ROUTE',
    };
  }

  if (input.launchUrgencyDays != null && input.launchUrgencyDays <= 1 && input.approvalWaitingOn === 'CLIENT') {
    reasons.push({ code: 'LAUNCH_RISK', label: 'LAUNCH IMMINENT — CLIENT APPROVAL BLOCKED' });
    return {
      health: 'AT_RISK',
      reasons,
      stallReason: null,
      daysSinceMeaningfulProgress: daysIdle,
      waitingParty: 'CLIENT',
      nextRecommendedAction: 'ESCALATE CLIENT APPROVAL',
    };
  }

  if (input.paymentState === 'PAST_DUE') {
    reasons.push({ code: 'BILLING', label: 'BILLING PAST DUE' });
    return {
      health: 'AT_RISK',
      reasons,
      stallReason: null,
      daysSinceMeaningfulProgress: daysIdle,
      waitingParty: null,
      nextRecommendedAction: 'ACCOUNT OPS REVIEW',
    };
  }

  return {
    health: 'ON_TRACK',
    reasons: [{ code: 'ON_TRACK', label: 'MEANINGFUL PROGRESS WITHIN THRESHOLD' }],
    stallReason: null,
    daysSinceMeaningfulProgress: daysIdle,
    waitingParty: null,
    nextRecommendedAction: null,
  };
}

export function deriveDiscoverySprintHealth(stage: string): EvolveOperationalHealth {
  const s = stage.toUpperCase();
  if (s.includes('COMPLETE') || s.includes('HANDOFF')) return 'COMPLETE';
  if (s.includes('INTAKE')) return 'ON_TRACK';
  if (s.includes('ASSESSMENT')) return 'WAITING_ON_SITE00';
  if (s.includes('RECOMMENDATION')) return 'WAITING_ON_CLIENT';
  return 'ON_TRACK';
}

export function deriveDirectedBuildHealth(
  completionPercent: number,
  blockerCount: number,
): EvolveOperationalHealth {
  if (completionPercent >= 100) return 'COMPLETE';
  if (blockerCount > 0) return 'SYSTEM_BLOCKED';
  if (completionPercent < 30) return 'ON_TRACK';
  return 'ON_TRACK';
}
