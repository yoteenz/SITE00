/** Campaign lifecycle state machine — server-side enforcement */

import type { CampaignStatus } from './types.js';

const TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  IDEA: ['STRATEGY', 'CANCELLED'],
  STRATEGY: ['PLANNED', 'IDEA', 'PAUSED', 'CANCELLED'],
  PLANNED: ['AWAITING_APPROVAL', 'STRATEGY', 'PAUSED', 'CANCELLED'],
  AWAITING_APPROVAL: ['APPROVED', 'PLANNED', 'PAUSED', 'CANCELLED'],
  APPROVED: ['IN_PRODUCTION', 'READY', 'SCHEDULED', 'PAUSED', 'CANCELLED'],
  IN_PRODUCTION: ['READY', 'APPROVED', 'PAUSED', 'CANCELLED'],
  READY: ['SCHEDULED', 'LIVE', 'IN_PRODUCTION', 'PAUSED', 'CANCELLED'],
  SCHEDULED: ['LIVE', 'READY', 'PAUSED', 'CANCELLED'],
  LIVE: ['MEASURING', 'PAUSED', 'CANCELLED'],
  MEASURING: ['OPTIMIZING', 'COMPLETE', 'PAUSED'],
  OPTIMIZING: ['COMPLETE', 'MEASURING', 'PAUSED'],
  COMPLETE: [],
  PAUSED: ['STRATEGY', 'PLANNED', 'APPROVED', 'IN_PRODUCTION', 'READY', 'SCHEDULED', 'CANCELLED'],
  CANCELLED: [],
};

export type TransitionContext = {
  hasRequiredApproval?: boolean;
  productionComplete?: boolean;
  hasLiveEvidence?: boolean;
  deliverablesComplete?: boolean;
};

export function canTransitionCampaign(
  from: CampaignStatus,
  to: CampaignStatus,
  ctx: TransitionContext = {},
): { ok: boolean; error?: string } {
  if (from === to) return { ok: true };
  const allowed = TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    return { ok: false, error: `Invalid transition: ${from} → ${to}` };
  }
  if (to === 'APPROVED' && !ctx.hasRequiredApproval) {
    return { ok: false, error: 'Cannot become APPROVED without required approval' };
  }
  if (to === 'READY' && ctx.productionComplete === false) {
    return { ok: false, error: 'Cannot become READY — required production incomplete' };
  }
  if (to === 'LIVE') {
    if (ctx.deliverablesComplete && !['APPROVED', 'READY', 'SCHEDULED'].includes(from)) {
      return { ok: false, error: 'Asset completion does not authorize LIVE — campaign must be APPROVED, READY, or SCHEDULED' };
    }
    if (!ctx.hasLiveEvidence && from !== 'SCHEDULED' && from !== 'READY') {
      return { ok: false, error: 'Cannot become LIVE without publication evidence or prior SCHEDULED/READY state' };
    }
  }
  if (to === 'MEASURING' && !ctx.hasLiveEvidence && from !== 'LIVE') {
    return { ok: false, error: 'Cannot become MEASURING without LIVE/publication evidence' };
  }
  return { ok: true };
}

export function assertCampaignTransition(
  from: CampaignStatus,
  to: CampaignStatus,
  ctx: TransitionContext = {},
): void {
  const result = canTransitionCampaign(from, to, ctx);
  if (!result.ok) throw new Error(result.error);
}
