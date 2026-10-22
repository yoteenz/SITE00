/**
 * Foundation credit presentation states (boards 12 and 14). Derived from the Phase 1 eligibility contract —
 * never from a URL, never from presentation state.
 */
import { assessFoundationCreditEligibility } from './builderHandoff.js';
import type { FoundationBuildCredit } from './types.js';

export type FoundationCreditDisplayState = 'AVAILABLE' | 'PENDING_VERIFICATION' | 'REDEEMED' | 'EXPIRED' | 'NOT_ELIGIBLE';

export const FOUNDATION_CREDIT_DISPLAY_LABEL: Record<FoundationCreditDisplayState, string> = {
  AVAILABLE: 'AVAILABLE',
  PENDING_VERIFICATION: 'PENDING VERIFICATION',
  REDEEMED: 'REDEEMED',
  EXPIRED: 'EXPIRED',
  NOT_ELIGIBLE: 'NOT ELIGIBLE',
};

export type FoundationCreditDisplay = {
  state: FoundationCreditDisplayState;
  label: string;
  /** Only true when the server-side eligibility contract passes. */
  redeemable: boolean;
  amount_minor: number | null;
  currency: string | null;
  expires_at: string | null;
};

export function foundationCreditDisplay(input: {
  completion_state: string;
  credit: FoundationBuildCredit | null;
  now?: Date;
}): FoundationCreditDisplay {
  const eligibility = assessFoundationCreditEligibility(input);
  const credit = input.credit;
  let state: FoundationCreditDisplayState;
  if (eligibility.ok) {
    state = 'AVAILABLE';
  } else {
    switch (eligibility.code) {
      case 'COMPLETION_REQUIRED':
        state = credit ? 'PENDING_VERIFICATION' : 'NOT_ELIGIBLE';
        break;
      case 'CREDIT_EXPIRED':
        state = 'EXPIRED';
        break;
      case 'CREDIT_NOT_AVAILABLE':
        state =
          credit?.status === 'APPLIED'
            ? 'REDEEMED'
            : credit?.status === 'RESERVED'
              ? 'PENDING_VERIFICATION'
              : credit?.status === 'EXPIRED'
                ? 'EXPIRED'
                : 'NOT_ELIGIBLE';
        break;
      case 'NO_CREDIT':
      default:
        state = 'NOT_ELIGIBLE';
    }
  }
  return {
    state,
    label: FOUNDATION_CREDIT_DISPLAY_LABEL[state],
    redeemable: eligibility.ok,
    amount_minor: credit?.amount_minor ?? null,
    currency: credit?.currency ?? null,
    expires_at: credit?.expires_at ?? null,
  };
}

/** Whole days left in the redemption window (floor), or null when there is no live window. */
export function foundationCreditDaysLeft(expiresAt: string | null, now = new Date()): number | null {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - now.getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;
  return Math.floor(ms / 86_400_000);
}
