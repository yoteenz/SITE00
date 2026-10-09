import type { CommissionEntryStatus, ReferralBusinessEventType } from '../../../shared/site00-invitation-system/types.js';
import { isCommissionTriggerEvent, isScanOnlyEvent } from '../../../shared/site00-invitation-system/events.js';
import type { InvitationMemoryState } from './memoryStore.js';

export function commissionStatusFromPaymentEvidence(input: {
  payment_verified: boolean;
  refunded: boolean;
  chargeback: boolean;
}): CommissionEntryStatus {
  if (input.chargeback || input.refunded) return 'REVERSED';
  if (!input.payment_verified) return 'DISQUALIFIED';
  return 'QUALIFIED';
}

export function mayCreateCommissionCandidate(
  state: InvitationMemoryState,
  eventType: ReferralBusinessEventType,
): boolean {
  if (isScanOnlyEvent(eventType)) return false;
  if (!isCommissionTriggerEvent(eventType)) return false;
  if (!state.commissionRules.payout_live) {
    // Still allow CANDIDATE/PENDING ledger rows in draft mode.
    return true;
  }
  return false;
}
