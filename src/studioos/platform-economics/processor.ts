import { platformFeeMinor } from './eligibility';
import type { Money } from './money';
import { money } from './money';

export const LIVE_MONEY_MOVEMENT = false;
export const LIVE_PLATFORM_FEES_COLLECTED = false;

export type ProcessorBlock = { ok: false; code: 'LIVE_MONEY_MOVEMENT_DISABLED'; movedFunds: false };

export type PlatformFeeQuote = {
  ok: true;
  currency: string;
  eligible: Money;
  platformFee: Money;
  movedFunds: false;
};

export type PlatformPaymentProvider = {
  id: string;
  liveMoneyMovement: false;
  calculatePlatformFee: (input: { currency: string; eligibleMinor: number; basisPoints: number; applicable: boolean }) => PlatformFeeQuote;
  createConnectedAccount: () => ProcessorBlock;
  createPayment: () => ProcessorBlock;
  splitPayment: () => ProcessorBlock;
  createTransfer: () => ProcessorBlock;
  createPayout: () => ProcessorBlock;
  retrieveTransaction: () => ProcessorBlock;
  retrieveRefund: () => ProcessorBlock;
  retrieveDispute: () => ProcessorBlock;
  retrieveApplicationFee: () => ProcessorBlock;
  reconcile: () => ProcessorBlock;
};

export function blockedProcessorCall(): ProcessorBlock {
  return { ok: false, code: 'LIVE_MONEY_MOVEMENT_DISABLED', movedFunds: false };
}

export function quotePlatformFee(input: {
  currency: string;
  eligibleMinor: number;
  basisPoints: number;
  applicable: boolean;
}): PlatformFeeQuote {
  const fee = platformFeeMinor(input.eligibleMinor, input.basisPoints, input.applicable);
  return {
    ok: true,
    currency: input.currency,
    eligible: money(input.currency, input.eligibleMinor),
    platformFee: money(input.currency, fee),
    movedFunds: false,
  };
}
