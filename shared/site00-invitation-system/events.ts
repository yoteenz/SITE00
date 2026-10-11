import type { ReferralBusinessEventType } from './types.js';

export const REFERRAL_EVENT_SOURCE = 'SITE00_INVITATION_SYSTEM';

export function isCommissionTriggerEvent(type: ReferralBusinessEventType): boolean {
  return type === 'FOUNDATION_PURCHASED' || type === 'BLDR_PAYMENT_RECEIVED';
}

export function isScanOnlyEvent(type: ReferralBusinessEventType): boolean {
  return type === 'INVITATION_SCANNED' || type === 'INVITATION_VIEWED';
}
