/** Founder-locked commission policy (record-only UI; no live payout execution). */
export const REFERRAL_COMMISSION_POLICY = {
  standardUsd: 25,
  establishedUsd: 35,
  strategicMaxUsd: 50,
  universalCapUsd: 50,
  aioProposedUsd: 50,
  qualifyingBasePackageUsd: 500,
  attributionWindowDays: 90,
  holdDaysAfterVerifiedPayment: 14,
  payoutTargetDayOfMonth: 15,
  executionMode: 'EXTERNAL_MANUAL_RECORD_ONLY' as const,
  paymentEvidenceRequired: true,
};

export const AIO_PARTNER_DISPLAY = {
  legalName: 'ALL IN ONE ENTERPRISES INC.',
  classification: 'PLANNED_STRATEGIC_PARTNER' as const,
  proposedFeeUsd: 50,
  autoActive: false,
};

export const CARD_STUDIO_COPY = {
  frontLine1: 'YOUR BUSINESS.',
  frontLine2: 'BUILT TO LAST.',
  backLine: 'START HERE.',
  partnerName: AIO_PARTNER_DISPLAY.legalName,
};
