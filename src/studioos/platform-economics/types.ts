import type { Money } from './money';

export const REVENUE_TYPES = ['BUILD_FEE', 'PLATFORM_USAGE_FEE', 'RECURRING_SERVICE_FEE', 'CUSTOM_COMMERCIAL_FEE'] as const;
export type RevenueType = (typeof REVENUE_TYPES)[number];

export const COVERED_TRANSACTION_TYPES = [
  'ECOMMERCE',
  'BOOKING',
  'MEMBERSHIP',
  'SUBSCRIPTION',
  'MARKETPLACE',
  'SERVICE_PAYMENT',
  'INVOICE_PAYMENT',
  'PORTAL_PAYMENT',
  'WORLD_COMMERCE',
  'OTHER_APPROVED_COMMERCE',
] as const;
export type CoveredTransactionType = (typeof COVERED_TRANSACTION_TYPES)[number];

export const AGREEMENT_STATUSES = [
  'DRAFT',
  'FOUNDER_REVIEW',
  'OFFERED',
  'CLIENT_REVIEW',
  'ACCEPTED',
  'ACTIVE',
  'SUSPENDED',
  'ENDED',
  'SUPERSEDED',
] as const;
export type AgreementStatus = (typeof AGREEMENT_STATUSES)[number];

export const LEDGER_EVENT_TYPES = [
  'TRANSACTION_CAPTURED',
  'PLATFORM_FEE_ACCRUED',
  'PLATFORM_FEE_ADJUSTED',
  'REFUND_APPLIED',
  'CHARGEBACK_APPLIED',
  'REVERSAL_APPLIED',
  'PLATFORM_FEE_RELEASED',
  'PAYOUT_CREATED',
  'PAYOUT_COMPLETED',
  'PAYOUT_FAILED',
  'MANUAL_ADJUSTMENT',
] as const;
export type LedgerEventType = (typeof LEDGER_EVENT_TYPES)[number];

export const PAYOUT_SCHEDULES = ['WEEKLY', 'SEMI_MONTHLY', 'MONTHLY', 'CUSTOM'] as const;
export type PayoutSchedule = (typeof PAYOUT_SCHEDULES)[number];

export const BENEFICIARY_KINDS = ['SITE00_PLATFORM', 'FOUNDING_ENTITY', 'APPROVED_REVENUE_PARTICIPANT'] as const;
export type BeneficiaryKind = (typeof BENEFICIARY_KINDS)[number];

export const ACTOR_ROLES = ['SITE00_FOUNDER', 'SITE00_AUTHORIZED_FINANCE', 'CLIENT_OWNER', 'CLIENT_AUTHORIZED_FINANCE'] as const;
export type PlatformActorRole = (typeof ACTOR_ROLES)[number];

export type ExclusionTreatment = 'EXCLUDED' | 'INCLUDED';
export type ProcessorFeeTreatment = 'UNSPECIFIED' | 'EXCLUDED' | 'INCLUDED';
export type RefundTreatment = 'PROPORTIONAL' | 'NONE' | 'CUSTOM';
export type ChargebackTreatment = 'REVERSE_ON_LOSS' | 'REVERSE_ON_OPEN' | 'NO_REVERSAL';
export type ChargebackState = 'OPEN' | 'WON' | 'LOST';
export type OfflinePaymentPolicy = 'NOT_TRACKED' | 'MANUALLY_REPORTED' | 'PLATFORM_FEE_APPLICABLE' | 'PLATFORM_FEE_NOT_APPLICABLE';
export type CalculationBasis = 'COLLECTED' | 'INVOICED';
export type AmountComponentCode = 'SERVICE' | 'OTHER_COMMERCE' | 'TAX' | 'GRATUITY' | 'GOVERNMENT_FEE' | 'REGULATORY_FEE' | 'PASS_THROUGH';

export type MoneyComponent = {
  code: AmountComponentCode;
  minor: number;
};

export type RateOverride = {
  basisPoints: number;
  author: string;
  reason: string;
  timestamp: string;
};

export type CalculationConfigSnapshot = {
  snapshotId: string;
  economicsVersion: string;
  commercialTermsVersion: string;
  basisPoints: number;
  calculationBasis: CalculationBasis;
  taxTreatment: ExclusionTreatment;
  gratuityTreatment: ExclusionTreatment;
  governmentFeeTreatment: ExclusionTreatment;
  passThroughFeeTreatment: ExclusionTreatment;
  processorFeeTreatment: ProcessorFeeTreatment;
  refundTreatment: RefundTreatment;
  chargebackTreatment: ChargebackTreatment;
  coveredTransactionTypes: CoveredTransactionType[];
  payoutSchedule: PayoutSchedule;
};

export type PlatformBeneficiary = {
  beneficiaryId: string;
  kind: BeneficiaryKind;
  displayName: string;
  /** Configurable legal-entity reference. Never a bank account number. */
  legalEntityRef: string | null;
  createdAt: string;
};

export type ProjectPlatformAgreement = {
  agreementId: string;
  projectId: string;
  clientOrgId: string;
  status: AgreementStatus;
  platformFeeApplicable: boolean;
  platformFeeRateBasisPoints: number;
  calculationBasis: CalculationBasis;
  coveredTransactionTypes: CoveredTransactionType[];
  taxTreatment: ExclusionTreatment;
  processorFeeTreatment: ProcessorFeeTreatment;
  refundTreatment: RefundTreatment;
  chargebackTreatment: ChargebackTreatment;
  gratuityTreatment: ExclusionTreatment;
  governmentFeeTreatment: ExclusionTreatment;
  passThroughFeeTreatment: ExclusionTreatment;
  offlinePaymentPolicy: OfflinePaymentPolicy;
  payoutSchedule: PayoutSchedule;
  currency: string;
  beneficiaryId: string;
  effectiveDate: string | null;
  endDate: string | null;
  agreementVersion: string;
  commercialTermsVersion: string;
  economicsVersion: string;
  calculationConfig: CalculationConfigSnapshot;
  founderApprovedAt: string | null;
  founderApprovedBy: string | null;
  clientAcceptedAt: string | null;
  rateOverride: RateOverride | null;
  quoteNotedAt: string | null;
  builderConfiguredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PlatformFeeStatus = 'NOT_APPLICABLE' | 'ACCRUED' | 'ADJUSTED' | 'REVERSED' | 'DISPUTED' | 'RELEASED' | 'PENDING_PAYOUT' | 'PAID';

export type LedgerEntry = {
  ledgerEntryId: string;
  projectId: string;
  clientOrgId: string;
  agreementId: string;
  agreementVersion: string;
  economicsVersion: string;
  commercialTermsVersion: string;
  calculationSnapshotId: string;
  sourceTransactionId: string;
  sourcePaymentId: string | null;
  sourceInvoiceId: string | null;
  serviceId: string | null;
  consumer: 'SITE00' | 'AIO';
  eventType: LedgerEventType;
  transactionType: CoveredTransactionType | 'NONE';
  gross: Money;
  excluded: Money;
  eligible: Money;
  /** Signed effect on remaining eligible volume. Captures add. Refunds and lost disputes subtract. */
  eligibleEffectMinor: number;
  platformFeeRateBasisPoints: number;
  platformFee: Money;
  processorFee: Money | null;
  processorFeeTreatment: ProcessorFeeTreatment;
  clientNet: Money;
  currency: string;
  transactionStatus: string;
  platformFeeStatus: PlatformFeeStatus;
  refund: Money;
  chargeback: Money;
  chargebackState: ChargebackState | null;
  adjustment: Money;
  payoutBatchId: string | null;
  processor: string | null;
  processorReference: string | null;
  idempotencyKey: string;
  channel: 'ONLINE' | 'OFFLINE';
  exclusionLines: { code: string; minor: number }[];
  adjustmentKind: 'REFUND' | 'CHARGEBACK' | 'REVERSAL' | 'MANUAL' | null;
  note: string;
  linkedLedgerEntryId: string | null;
  author: string | null;
  reason: string | null;
  occurredAt: string;
  createdAt: string;
};

export type PlatformPayoutBatch = {
  payoutBatchId: string;
  beneficiaryId: string;
  projectId: string;
  schedule: PayoutSchedule;
  periodStart: string;
  periodEnd: string;
  sourceLedgerEntryIds: string[];
  eligibleTransactionCount: number;
  grossEligible: Money;
  platformFeeAccrued: Money;
  refundAdjustments: Money;
  chargebackAdjustments: Money;
  manualAdjustments: Money;
  netPayout: Money;
  currency: string;
  status: 'DRAFT' | 'READY_FOR_REVIEW';
  processorPayoutReference: string | null;
  liveMovement: false;
  createdAt: string;
  paidAt: null;
};

export type PlatformStatement = {
  statementId: string;
  projectId: string;
  clientOrgId: string;
  periodStart: string;
  periodEnd: string;
  cadence: 'MONTHLY';
  currency: string;
  economicsVersion: string;
  commercialTermsVersion: string;
  sourceLedgerEntryIds: string[];
  snapshotHash: string;
  eligibleTransactionCount: number;
  eligibleVolume: Money;
  platformFeeRateBasisPoints: number | null;
  platformFees: Money;
  refunds: Money;
  reversals: Money;
  netSettlement: Money;
  createdAt: string;
};

export type PlatformActor = {
  actorId: string;
  role: PlatformActorRole;
  clientOrgId: string | null;
};

export type IngestOk = { ok: true; duplicate: boolean; entries: LedgerEntry[] };
export type IngestFail = { ok: false; code: string };
export type IngestResult = IngestOk | IngestFail;
