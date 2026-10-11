import { randomUUID } from 'node:crypto';
import type { CommissionProduct, PartnerCommissionEntry } from '../../../shared/site00-invitation-system/types.js';
import { getInvitationMemoryState } from './memoryStore.js';
import { mayCreateCommissionCandidate } from './eligibility.js';

function nowIso(): string {
  return new Date().toISOString();
}

export function createCommissionCandidate(input: {
  partner_id: string;
  attribution_id: string;
  product: CommissionProduct;
  eligible_amount_minor: number;
  qualifying_payment_id: string;
  currency?: string;
  event_type: 'FOUNDATION_PURCHASED' | 'BLDR_PAYMENT_RECEIVED';
}): PartnerCommissionEntry | null {
  const state = getInvitationMemoryState();
  if (!mayCreateCommissionCandidate(state, input.event_type)) return null;

  const rules = state.commissionRules;
  let calculated = 0;
  if (input.product === 'FOUNDATION') {
    if (rules.foundation.draft_fixed_reward_minor == null) {
      calculated = 0;
    } else {
      calculated = rules.foundation.draft_fixed_reward_minor;
    }
  } else {
    if (rules.bldr.draft_basis_points == null) {
      calculated = 0;
    } else {
      calculated = Math.round((input.eligible_amount_minor * rules.bldr.draft_basis_points) / 10_000);
    }
  }

  const entry: PartnerCommissionEntry = {
    commission_entry_id: randomUUID(),
    partner_id: input.partner_id,
    referred_client_ref: input.attribution_id,
    product: input.product,
    qualifying_order_id: null,
    qualifying_payment_id: input.qualifying_payment_id,
    agreement_version: rules.version,
    commission_rule_version: rules.version,
    rate_basis_points: input.product === 'BLDR' ? rules.bldr.draft_basis_points : null,
    fixed_reward_minor: input.product === 'FOUNDATION' ? rules.foundation.draft_fixed_reward_minor : null,
    currency: input.currency ?? 'USD',
    eligible_amount_minor: input.eligible_amount_minor,
    calculated_reward_minor: calculated,
    status: calculated > 0 ? 'CANDIDATE' : 'PENDING',
    payout_batch_id: null,
    attribution_id: input.attribution_id,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  state.commissions.set(entry.commission_entry_id, entry);
  return entry;
}

export function reverseCommission(entryId: string, reason: string, actor: string): PartnerCommissionEntry | null {
  const state = getInvitationMemoryState();
  const entry = state.commissions.get(entryId);
  if (!entry) return null;
  entry.status = 'REVERSED';
  entry.updated_at = nowIso();
  state.adjustments.push({
    adjustment_id: randomUUID(),
    commission_entry_id: entryId,
    reason,
    delta_minor: -entry.calculated_reward_minor,
    created_at: nowIso(),
    actor,
  });
  return entry;
}
