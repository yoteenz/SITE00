import { classifyCollected, platformFeeMinor } from './eligibility';
import { money, zeroMoney, type Money } from './money';
import { canAdminister, canReadClientOrg } from './permissions';
import { canonicalPlatformFeeBasisPoints, isDefaultPlatformRate } from './rate';
import type {
  AgreementStatus,
  CalculationBasis,
  ChargebackState,
  ChargebackTreatment,
  CoveredTransactionType,
  ExclusionTreatment,
  IngestResult,
  LedgerEntry,
  MoneyComponent,
  OfflinePaymentPolicy,
  PlatformActor,
  PlatformBeneficiary,
  PlatformPayoutBatch,
  PlatformStatement,
  ProcessorFeeTreatment,
  ProjectPlatformAgreement,
  PayoutSchedule,
  RateOverride,
  RefundTreatment,
} from './types';
import { COMMERCIAL_TERMS_VERSION, PLATFORM_ECONOMICS_VERSION } from './version';

const NEXT_STATUS: Record<AgreementStatus, AgreementStatus[]> = {
  DRAFT: ['FOUNDER_REVIEW', 'SUPERSEDED'],
  FOUNDER_REVIEW: ['OFFERED', 'DRAFT', 'SUPERSEDED'],
  OFFERED: ['CLIENT_REVIEW', 'SUPERSEDED'],
  CLIENT_REVIEW: ['ACCEPTED', 'OFFERED', 'SUPERSEDED'],
  ACCEPTED: ['ACTIVE', 'SUPERSEDED'],
  ACTIVE: ['SUSPENDED', 'ENDED', 'SUPERSEDED'],
  SUSPENDED: ['ACTIVE', 'ENDED'],
  ENDED: [],
  SUPERSEDED: [],
};

const BANK_KEYS = ['accountnumber', 'routingnumber', 'iban', 'bankaccount', 'cardnumber', 'secret'];

export type CreateAgreementInput = {
  projectId: string;
  clientOrgId: string;
  currency: string;
  platformFeeApplicable: boolean;
  basisPoints?: number;
  rateOverride?: Omit<RateOverride, 'basisPoints'>;
  coveredTransactionTypes?: CoveredTransactionType[];
  calculationBasis?: CalculationBasis;
  taxTreatment?: ExclusionTreatment;
  gratuityTreatment?: ExclusionTreatment;
  governmentFeeTreatment?: ExclusionTreatment;
  passThroughFeeTreatment?: ExclusionTreatment;
  processorFeeTreatment?: ProcessorFeeTreatment;
  refundTreatment?: RefundTreatment;
  chargebackTreatment?: ChargebackTreatment;
  offlinePaymentPolicy?: OfflinePaymentPolicy;
  payoutSchedule?: PayoutSchedule;
  beneficiaryId?: string;
  effectiveDate?: string | null;
};

export type CaptureInput = {
  agreementId: string;
  sourceTransactionId: string;
  sourcePaymentId?: string | null;
  sourceInvoiceId?: string | null;
  serviceId?: string | null;
  transactionType: CoveredTransactionType;
  currency: string;
  components: MoneyComponent[];
  invoicedMinor?: number | null;
  processorFeeMinor?: number;
  processorEventId: string;
  processor?: string | null;
  occurredAt: string;
  channel?: 'ONLINE' | 'OFFLINE';
  consumer?: 'SITE00' | 'AIO';
};

export type RefundInput = {
  agreementId: string;
  sourceTransactionId: string;
  currency: string;
  components: MoneyComponent[];
  processorEventId: string;
  processor?: string | null;
  occurredAt: string;
};

export type ChargebackInput = {
  agreementId: string;
  sourceTransactionId: string;
  currency: string;
  state: ChargebackState;
  disputedEligibleMinor: number;
  processorEventId: string;
  processor?: string | null;
  occurredAt: string;
};

export type ManualAdjustmentInput = {
  linkedLedgerEntryId: string;
  currency: string;
  amountMinor: number;
  reason: string;
  author: string;
  timestamp: string;
  idempotencyKey: string;
};

type Fail = { ok: false; code: string };
type Ok<T> = { ok: true } & T;

function fail(code: string): Fail {
  return { ok: false, code };
}

function hashSnapshot(parts: string[]): string {
  let hash = 5381;
  const text = parts.join('|');
  for (let index = 0; index < text.length; index += 1) {
    hash = (Math.imul(hash, 33) + text.charCodeAt(index)) | 0;
  }
  return `snap_${(hash >>> 0).toString(16)}`;
}

export function createPlatformBooks(options?: { now?: () => string }) {
  const now = options?.now ?? (() => new Date().toISOString());
  let sequence = 0;
  const nextId = (prefix: string) => {
    sequence += 1;
    return `${prefix}_${sequence}`;
  };

  const beneficiaries = new Map<string, PlatformBeneficiary>();
  const agreements = new Map<string, ProjectPlatformAgreement>();
  const entries: LedgerEntry[] = [];
  const batches: PlatformPayoutBatch[] = [];
  const statements: PlatformStatement[] = [];
  const idempotency = new Map<string, LedgerEntry[]>();

  function addBeneficiary(
    input: { kind: PlatformBeneficiary['kind']; displayName: string; legalEntityRef: string | null } & Record<string, unknown>,
  ): Ok<{ beneficiary: PlatformBeneficiary }> | Fail {
    for (const key of Object.keys(input)) {
      if (BANK_KEYS.includes(key.toLowerCase())) return fail('BANK_CREDENTIALS_FORBIDDEN');
    }
    const beneficiary: PlatformBeneficiary = {
      beneficiaryId: nextId('ben'),
      kind: input.kind,
      displayName: input.displayName,
      legalEntityRef: input.legalEntityRef,
      createdAt: now(),
    };
    beneficiaries.set(beneficiary.beneficiaryId, beneficiary);
    return { ok: true, beneficiary };
  }

  const siteBeneficiary = addBeneficiary({ kind: 'SITE00_PLATFORM', displayName: 'SITE 00 Platform', legalEntityRef: null });
  if (!siteBeneficiary.ok) throw new Error(siteBeneficiary.code);
  const platformBeneficiaryId = siteBeneficiary.beneficiary.beneficiaryId;

  function createAgreement(input: CreateAgreementInput): Ok<{ agreement: ProjectPlatformAgreement }> | Fail {
    if (!/^[A-Z]{3}$/.test(input.currency)) return fail('CURRENCY_REQUIRED');
    const basisPoints = input.basisPoints ?? canonicalPlatformFeeBasisPoints();
    if (!Number.isInteger(basisPoints) || basisPoints < 0) return fail('RATE_NOT_BASIS_POINTS');
    if (!isDefaultPlatformRate(basisPoints)) {
      const override = input.rateOverride;
      if (!override?.author || !override.reason || !override.timestamp) return fail('FOUNDER_APPROVAL_REQUIRED');
    }
    const beneficiaryId = input.beneficiaryId ?? platformBeneficiaryId;
    if (!beneficiaries.has(beneficiaryId)) return fail('BENEFICIARY_NOT_FOUND');
    const createdAt = now();
    const config = {
      snapshotId: nextId('cfg'),
      economicsVersion: PLATFORM_ECONOMICS_VERSION,
      commercialTermsVersion: COMMERCIAL_TERMS_VERSION,
      basisPoints,
      calculationBasis: input.calculationBasis ?? ('COLLECTED' as const),
      taxTreatment: input.taxTreatment ?? ('EXCLUDED' as const),
      gratuityTreatment: input.gratuityTreatment ?? ('EXCLUDED' as const),
      governmentFeeTreatment: input.governmentFeeTreatment ?? ('EXCLUDED' as const),
      passThroughFeeTreatment: input.passThroughFeeTreatment ?? ('EXCLUDED' as const),
      processorFeeTreatment: input.processorFeeTreatment ?? ('UNSPECIFIED' as const),
      refundTreatment: input.refundTreatment ?? ('PROPORTIONAL' as const),
      chargebackTreatment: input.chargebackTreatment ?? ('REVERSE_ON_LOSS' as const),
      coveredTransactionTypes: input.coveredTransactionTypes ?? [],
      payoutSchedule: input.payoutSchedule ?? ('MONTHLY' as const),
    };
    const agreement: ProjectPlatformAgreement = {
      agreementId: nextId('agr'),
      projectId: input.projectId,
      clientOrgId: input.clientOrgId,
      status: 'DRAFT',
      platformFeeApplicable: input.platformFeeApplicable,
      platformFeeRateBasisPoints: basisPoints,
      calculationBasis: config.calculationBasis,
      coveredTransactionTypes: [...config.coveredTransactionTypes],
      taxTreatment: config.taxTreatment,
      processorFeeTreatment: config.processorFeeTreatment,
      refundTreatment: config.refundTreatment,
      chargebackTreatment: config.chargebackTreatment,
      gratuityTreatment: config.gratuityTreatment,
      governmentFeeTreatment: config.governmentFeeTreatment,
      passThroughFeeTreatment: config.passThroughFeeTreatment,
      offlinePaymentPolicy: input.offlinePaymentPolicy ?? 'NOT_TRACKED',
      payoutSchedule: config.payoutSchedule,
      currency: input.currency,
      beneficiaryId,
      effectiveDate: input.effectiveDate ?? null,
      endDate: null,
      agreementVersion: String(1 + [...agreements.values()].filter((row) => row.projectId === input.projectId).length),
      commercialTermsVersion: COMMERCIAL_TERMS_VERSION,
      economicsVersion: PLATFORM_ECONOMICS_VERSION,
      calculationConfig: config,
      founderApprovedAt: null,
      founderApprovedBy: null,
      clientAcceptedAt: null,
      rateOverride: isDefaultPlatformRate(basisPoints)
        ? null
        : {
            basisPoints,
            author: input.rateOverride!.author,
            reason: input.rateOverride!.reason,
            timestamp: input.rateOverride!.timestamp,
          },
      quoteNotedAt: null,
      builderConfiguredAt: null,
      createdAt,
      updatedAt: createdAt,
    };
    agreements.set(agreement.agreementId, agreement);
    return { ok: true, agreement };
  }

  function transition(agreementId: string, status: AgreementStatus): Ok<{ agreement: ProjectPlatformAgreement }> | Fail {
    const agreement = agreements.get(agreementId);
    if (!agreement) return fail('AGREEMENT_NOT_FOUND');
    if (!NEXT_STATUS[agreement.status].includes(status)) return fail('AGREEMENT_TRANSITION_DENIED');
    if (status === 'ACCEPTED' && !agreement.clientAcceptedAt) return fail('CLIENT_ACCEPTANCE_REQUIRED');
    if (status === 'ACTIVE' && agreement.status !== 'ACCEPTED' && agreement.status !== 'SUSPENDED') return fail('AGREEMENT_TRANSITION_DENIED');
    if (status === 'ACTIVE' && (!agreement.founderApprovedAt || !agreement.clientAcceptedAt)) return fail('ACTIVATION_REQUIRES_BOTH_PARTIES');
    agreement.status = status;
    agreement.updatedAt = now();
    return { ok: true, agreement };
  }

  function recordFounderApproval(agreementId: string, audit: { author: string; at: string }): Ok<{ agreement: ProjectPlatformAgreement }> | Fail {
    const agreement = agreements.get(agreementId);
    if (!agreement) return fail('AGREEMENT_NOT_FOUND');
    if (agreement.status !== 'FOUNDER_REVIEW' && agreement.status !== 'ACCEPTED') return fail('FOUNDER_APPROVAL_NOT_OPEN');
    if (!audit.author || !audit.at) return fail('AUDIT_REQUIRED');
    agreement.founderApprovedAt = audit.at;
    agreement.founderApprovedBy = audit.author;
    agreement.updatedAt = audit.at;
    return { ok: true, agreement };
  }

  function recordClientAcceptance(agreementId: string, audit: { at: string }): Ok<{ agreement: ProjectPlatformAgreement }> | Fail {
    const agreement = agreements.get(agreementId);
    if (!agreement) return fail('AGREEMENT_NOT_FOUND');
    if (agreement.status !== 'CLIENT_REVIEW') return fail('CLIENT_ACCEPTANCE_NOT_OPEN');
    if (!audit.at) return fail('AUDIT_REQUIRED');
    agreement.clientAcceptedAt = audit.at;
    agreement.updatedAt = audit.at;
    return { ok: true, agreement };
  }

  function noteQuote(agreementId: string, at: string): Ok<{ agreement: ProjectPlatformAgreement }> | Fail {
    const agreement = agreements.get(agreementId);
    if (!agreement) return fail('AGREEMENT_NOT_FOUND');
    const status = agreement.status;
    agreement.quoteNotedAt = at;
    agreement.updatedAt = at;
    return agreement.status === status ? { ok: true, agreement } : fail('STATUS_MUTATED');
  }

  function noteBuilderConfigured(agreementId: string, at: string): Ok<{ agreement: ProjectPlatformAgreement }> | Fail {
    const agreement = agreements.get(agreementId);
    if (!agreement) return fail('AGREEMENT_NOT_FOUND');
    const status = agreement.status;
    agreement.builderConfiguredAt = at;
    agreement.updatedAt = at;
    return agreement.status === status ? { ok: true, agreement } : fail('STATUS_MUTATED');
  }

  function activate(agreementId: string, audit: { author: string; at: string }): Ok<{ agreement: ProjectPlatformAgreement }> | Fail {
    const steps: AgreementStatus[] = ['FOUNDER_REVIEW', 'OFFERED', 'CLIENT_REVIEW', 'ACCEPTED', 'ACTIVE'];
    if (!agreements.get(agreementId)) return fail('AGREEMENT_NOT_FOUND');
    if (agreements.get(agreementId)?.status !== 'DRAFT') return fail('AGREEMENT_TRANSITION_DENIED');
    for (const status of steps) {
      if (status === 'FOUNDER_REVIEW') {
        const moved = transition(agreementId, status);
        if (!moved.ok) return moved;
        const approved = recordFounderApproval(agreementId, audit);
        if (!approved.ok) return approved;
      } else if (status === 'CLIENT_REVIEW') {
        const moved = transition(agreementId, status);
        if (!moved.ok) return moved;
        const accepted = recordClientAcceptance(agreementId, { at: audit.at });
        if (!accepted.ok) return accepted;
      } else {
        const moved = transition(agreementId, status);
        if (!moved.ok) return moved;
      }
    }
    const agreement = agreements.get(agreementId);
    return agreement ? { ok: true, agreement } : fail('AGREEMENT_NOT_FOUND');
  }

  function supersede(agreementId: string, patch: CreateAgreementInput): Ok<{ previous: ProjectPlatformAgreement; agreement: ProjectPlatformAgreement }> | Fail {
    const previous = agreements.get(agreementId);
    if (!previous) return fail('AGREEMENT_NOT_FOUND');
    const moved = transition(agreementId, 'SUPERSEDED');
    if (!moved.ok) return moved;
    previous.endDate = now();
    const created = createAgreement({
      ...patch,
      projectId: patch.projectId || previous.projectId,
      clientOrgId: patch.clientOrgId || previous.clientOrgId,
      currency: patch.currency || previous.currency,
    });
    if (!created.ok) return created;
    return { ok: true, previous, agreement: created.agreement };
  }

  function remember(key: string, created: LedgerEntry[]): IngestResult {
    idempotency.set(key, created);
    return { ok: true, duplicate: false, entries: created };
  }

  function existing(key: string): IngestResult | null {
    const prior = idempotency.get(key);
    return prior ? { ok: true, duplicate: true, entries: prior } : null;
  }

  function push(entry: LedgerEntry): LedgerEntry {
    Object.freeze(entry.gross);
    Object.freeze(entry.excluded);
    Object.freeze(entry.eligible);
    Object.freeze(entry.platformFee);
    Object.freeze(entry.clientNet);
    Object.freeze(entry.refund);
    Object.freeze(entry.chargeback);
    Object.freeze(entry.adjustment);
    if (entry.processorFee) Object.freeze(entry.processorFee);
    Object.freeze(entry.exclusionLines);
    const frozen = Object.freeze(entry);
    entries.push(frozen);
    return frozen;
  }

  function blank(currency: string) {
    return {
      gross: zeroMoney(currency),
      excluded: zeroMoney(currency),
      eligible: zeroMoney(currency),
      platformFee: zeroMoney(currency),
      processorFee: null as Money | null,
      clientNet: zeroMoney(currency),
      refund: zeroMoney(currency),
      chargeback: zeroMoney(currency),
      adjustment: zeroMoney(currency),
    };
  }

  function baseEntry(
    agreement: ProjectPlatformAgreement,
    partial: Pick<LedgerEntry, 'eventType' | 'sourceTransactionId' | 'idempotencyKey' | 'occurredAt'> & Partial<LedgerEntry>,
  ): LedgerEntry {
    return {
      ledgerEntryId: nextId('led'),
      projectId: agreement.projectId,
      clientOrgId: agreement.clientOrgId,
      agreementId: agreement.agreementId,
      agreementVersion: agreement.agreementVersion,
      economicsVersion: agreement.economicsVersion,
      commercialTermsVersion: agreement.commercialTermsVersion,
      calculationSnapshotId: agreement.calculationConfig.snapshotId,
      sourcePaymentId: null,
      sourceInvoiceId: null,
      serviceId: null,
      consumer: 'SITE00',
      transactionType: 'NONE',
      ...blank(agreement.currency),
      eligibleEffectMinor: 0,
      platformFeeRateBasisPoints: agreement.platformFeeRateBasisPoints,
      processorFeeTreatment: agreement.processorFeeTreatment,
      currency: agreement.currency,
      transactionStatus: 'RECORDED',
      platformFeeStatus: 'NOT_APPLICABLE',
      chargebackState: null,
      payoutBatchId: null,
      processor: null,
      processorReference: null,
      channel: 'ONLINE',
      exclusionLines: [],
      adjustmentKind: null,
      note: '',
      linkedLedgerEntryId: null,
      author: null,
      reason: null,
      createdAt: now(),
      ...partial,
    };
  }

  function position(sourceTransactionId: string) {
    const related = entries.filter((entry) => entry.sourceTransactionId === sourceTransactionId);
    return {
      related,
      eligibleRemaining: related.reduce((total, entry) => total + entry.eligibleEffectMinor, 0),
      feeRemaining: related.reduce((total, entry) => total + entry.platformFee.minor, 0),
    };
  }

  function ingestCapture(input: CaptureInput): IngestResult {
    const key = `${input.processor ?? 'SITE00'}:${input.processorEventId}:CAPTURE`;
    const prior = existing(key);
    if (prior) return prior;
    const agreement = agreements.get(input.agreementId);
    if (!agreement) return fail('AGREEMENT_NOT_FOUND');
    if (input.currency !== agreement.currency) return fail('AGREEMENT_CURRENCY_MISMATCH');
    const channel = input.channel ?? 'ONLINE';
    if (channel === 'OFFLINE' && agreement.offlinePaymentPolicy === 'NOT_TRACKED') return fail('OFFLINE_NOT_TRACKED');
    const config = agreement.calculationConfig;
    const classified = classifyCollected(input.components, config, input.processorFeeMinor ?? 0, config.processorFeeTreatment);
    const basisEligible =
      config.calculationBasis === 'INVOICED' && input.invoicedMinor != null
        ? Math.max(0, input.invoicedMinor - classified.exclusionLines.reduce((total, line) => total + line.minor, 0))
        : classified.eligibleMinor;
    const covered = agreement.coveredTransactionTypes.includes(input.transactionType);
    const inForce = !agreement.effectiveDate || input.occurredAt >= agreement.effectiveDate;
    const offlineBlocked = channel === 'OFFLINE' && agreement.offlinePaymentPolicy === 'PLATFORM_FEE_NOT_APPLICABLE';
    const applicable = agreement.status === 'ACTIVE' && agreement.platformFeeApplicable && covered && inForce && !offlineBlocked;
    const fee = platformFeeMinor(basisEligible, config.basisPoints, applicable);
    const note = [classified.processorFeeNote, config.calculationBasis === 'COLLECTED' && input.invoicedMinor != null ? 'INVOICED_IS_NOT_COLLECTED' : '']
      .filter(Boolean)
      .join(' ');
    const capture = push(
      baseEntry(agreement, {
        eventType: 'TRANSACTION_CAPTURED',
        sourceTransactionId: input.sourceTransactionId,
        sourcePaymentId: input.sourcePaymentId ?? null,
        sourceInvoiceId: input.sourceInvoiceId ?? null,
        serviceId: input.serviceId ?? null,
        consumer: input.consumer ?? 'SITE00',
        transactionType: input.transactionType,
        idempotencyKey: key,
        occurredAt: input.occurredAt,
        gross: money(agreement.currency, classified.grossMinor),
        excluded: money(agreement.currency, classified.grossMinor - basisEligible),
        eligible: money(agreement.currency, basisEligible),
        eligibleEffectMinor: applicable ? basisEligible : 0,
        processorFee: money(agreement.currency, input.processorFeeMinor ?? 0),
        clientNet: money(agreement.currency, Math.max(0, basisEligible - (input.processorFeeMinor ?? 0))),
        transactionStatus: applicable ? 'COLLECTED' : 'RECORDED',
        platformFeeStatus: applicable ? 'ACCRUED' : 'NOT_APPLICABLE',
        processor: input.processor ?? null,
        processorReference: input.processorEventId,
        channel,
        exclusionLines: classified.exclusionLines,
        note: applicable ? note : note || (agreement.status === 'ACTIVE' ? 'NOT_COVERED_OR_NOT_APPLICABLE' : 'AGREEMENT_NOT_ACTIVE'),
      }),
    );
    const created = [capture];
    if (applicable) {
      created.push(
        push(
          baseEntry(agreement, {
            eventType: 'PLATFORM_FEE_ACCRUED',
            sourceTransactionId: input.sourceTransactionId,
            sourcePaymentId: input.sourcePaymentId ?? null,
            consumer: input.consumer ?? 'SITE00',
            transactionType: input.transactionType,
            idempotencyKey: key,
            occurredAt: input.occurredAt,
            eligible: money(agreement.currency, basisEligible),
            platformFee: money(agreement.currency, fee),
            platformFeeStatus: 'ACCRUED',
            processor: input.processor ?? null,
            processorReference: input.processorEventId,
            channel,
            exclusionLines: classified.exclusionLines,
            note,
            linkedLedgerEntryId: capture.ledgerEntryId,
          }),
        ),
      );
    }
    return remember(key, created);
  }

  function feeReversal(sourceTransactionId: string, eligibleRefund: number): number {
    const { eligibleRemaining, feeRemaining } = position(sourceTransactionId);
    if (feeRemaining === 0 || eligibleRefund === 0) return 0;
    if (eligibleRefund >= eligibleRemaining) return feeRemaining;
    const capture = entries.find((entry) => entry.sourceTransactionId === sourceTransactionId && entry.eventType === 'TRANSACTION_CAPTURED');
    return Math.min(feeRemaining, platformFeeMinor(eligibleRefund, capture?.platformFeeRateBasisPoints ?? 0, true));
  }

  function historical(capture: LedgerEntry) {
    return {
      agreementVersion: capture.agreementVersion,
      economicsVersion: capture.economicsVersion,
      commercialTermsVersion: capture.commercialTermsVersion,
      calculationSnapshotId: capture.calculationSnapshotId,
      platformFeeRateBasisPoints: capture.platformFeeRateBasisPoints,
      transactionType: capture.transactionType,
      linkedLedgerEntryId: capture.ledgerEntryId,
    };
  }

  function ingestRefund(input: RefundInput): IngestResult {
    const key = `${input.processor ?? 'SITE00'}:${input.processorEventId}:REFUND`;
    const prior = existing(key);
    if (prior) return prior;
    const agreement = agreements.get(input.agreementId);
    if (!agreement) return fail('AGREEMENT_NOT_FOUND');
    if (input.currency !== agreement.currency) return fail('AGREEMENT_CURRENCY_MISMATCH');
    const capture = entries.find((entry) => entry.sourceTransactionId === input.sourceTransactionId && entry.eventType === 'TRANSACTION_CAPTURED');
    if (!capture) return fail('SOURCE_TRANSACTION_NOT_FOUND');
    const classified = classifyCollected(input.components, agreement.calculationConfig, 0, 'UNSPECIFIED');
    const eligibleRefund = Math.min(classified.eligibleMinor, position(input.sourceTransactionId).eligibleRemaining);
    const reversal = agreement.refundTreatment === 'NONE' || agreement.refundTreatment === 'CUSTOM' ? 0 : feeReversal(input.sourceTransactionId, eligibleRefund);
    const refundEntry = push(
      baseEntry(agreement, {
        eventType: 'REFUND_APPLIED',
        sourceTransactionId: input.sourceTransactionId,
        idempotencyKey: key,
        occurredAt: input.occurredAt,
        gross: money(agreement.currency, classified.grossMinor),
        excluded: money(agreement.currency, classified.excludedMinor),
        eligible: money(agreement.currency, eligibleRefund),
        eligibleEffectMinor: -eligibleRefund,
        refund: money(agreement.currency, classified.grossMinor),
        platformFeeStatus: reversal > 0 ? 'REVERSED' : 'NOT_APPLICABLE',
        processor: input.processor ?? null,
        processorReference: input.processorEventId,
        adjustmentKind: 'REFUND',
        note: 'REFUND',
        ...historical(capture),
      }),
    );
    const created = [refundEntry];
    if (reversal > 0) {
      created.push(
        push(
          baseEntry(agreement, {
            eventType: 'PLATFORM_FEE_ADJUSTED',
            sourceTransactionId: input.sourceTransactionId,
            idempotencyKey: key,
            occurredAt: input.occurredAt,
            platformFee: money(agreement.currency, -reversal),
            adjustment: money(agreement.currency, -reversal),
            platformFeeStatus: 'ADJUSTED',
            processor: input.processor ?? null,
            processorReference: input.processorEventId,
            adjustmentKind: 'REFUND',
            note: 'REFUND',
            ...historical(capture),
          }),
        ),
      );
    }
    return remember(key, created);
  }

  function ingestChargeback(input: ChargebackInput): IngestResult {
    const key = `${input.processor ?? 'SITE00'}:${input.processorEventId}:CHARGEBACK:${input.state}`;
    const prior = existing(key);
    if (prior) return prior;
    const agreement = agreements.get(input.agreementId);
    if (!agreement) return fail('AGREEMENT_NOT_FOUND');
    if (input.currency !== agreement.currency) return fail('AGREEMENT_CURRENCY_MISMATCH');
    const capture = entries.find((entry) => entry.sourceTransactionId === input.sourceTransactionId && entry.eventType === 'TRANSACTION_CAPTURED');
    if (!capture) return fail('SOURCE_TRANSACTION_NOT_FOUND');
    if (!Number.isInteger(input.disputedEligibleMinor) || input.disputedEligibleMinor < 0) return fail('MONEY_NOT_MINOR_UNITS');
    const treatment = agreement.chargebackTreatment;
    const priorAdjustments = entries.filter(
      (entry) => entry.sourceTransactionId === input.sourceTransactionId && entry.adjustmentKind === 'CHARGEBACK' && entry.eventType === 'PLATFORM_FEE_ADJUSTED',
    );
    const alreadyReversed = priorAdjustments.some((entry) => entry.platformFee.minor < 0);
    let delta = 0;
    if (treatment !== 'NO_REVERSAL') {
      const shouldReverse = input.state === 'LOST' || (input.state === 'OPEN' && treatment === 'REVERSE_ON_OPEN');
      if (shouldReverse && !alreadyReversed) delta = -feeReversal(input.sourceTransactionId, input.disputedEligibleMinor);
      if (input.state === 'WON' && treatment === 'REVERSE_ON_OPEN') {
        delta = -priorAdjustments.reduce((total, entry) => total + entry.platformFee.minor, 0);
      }
    }
    const eligibleHit = delta < 0 ? -Math.min(input.disputedEligibleMinor, position(input.sourceTransactionId).eligibleRemaining) : 0;
    const disputeEntry = push(
      baseEntry(agreement, {
        eventType: 'CHARGEBACK_APPLIED',
        sourceTransactionId: input.sourceTransactionId,
        idempotencyKey: key,
        occurredAt: input.occurredAt,
        eligibleEffectMinor: eligibleHit,
        chargeback: money(agreement.currency, input.disputedEligibleMinor),
        chargebackState: input.state,
        platformFeeStatus: input.state === 'OPEN' ? 'DISPUTED' : input.state === 'LOST' ? 'REVERSED' : 'ACCRUED',
        processor: input.processor ?? null,
        processorReference: input.processorEventId,
        adjustmentKind: 'CHARGEBACK',
        note: input.state,
        ...historical(capture),
      }),
    );
    const created = [disputeEntry];
    if (delta !== 0) {
      created.push(
        push(
          baseEntry(agreement, {
            eventType: 'PLATFORM_FEE_ADJUSTED',
            sourceTransactionId: input.sourceTransactionId,
            idempotencyKey: key,
            occurredAt: input.occurredAt,
            platformFee: money(agreement.currency, delta),
            adjustment: money(agreement.currency, delta),
            chargebackState: input.state,
            platformFeeStatus: 'ADJUSTED',
            processor: input.processor ?? null,
            processorReference: input.processorEventId,
            adjustmentKind: 'CHARGEBACK',
            note: input.state,
            ...historical(capture),
          }),
        ),
      );
    }
    return remember(key, created);
  }

  function ingestReversal(input: RefundInput): IngestResult {
    const key = `${input.processor ?? 'SITE00'}:${input.processorEventId}:REVERSAL`;
    const prior = existing(key);
    if (prior) return prior;
    const agreement = agreements.get(input.agreementId);
    if (!agreement) return fail('AGREEMENT_NOT_FOUND');
    const capture = entries.find((entry) => entry.sourceTransactionId === input.sourceTransactionId && entry.eventType === 'TRANSACTION_CAPTURED');
    if (!capture) return fail('SOURCE_TRANSACTION_NOT_FOUND');
    const { eligibleRemaining, feeRemaining } = position(input.sourceTransactionId);
    const reversalEntry = push(
      baseEntry(agreement, {
        eventType: 'REVERSAL_APPLIED',
        sourceTransactionId: input.sourceTransactionId,
        idempotencyKey: key,
        occurredAt: input.occurredAt,
        eligible: money(agreement.currency, eligibleRemaining),
        eligibleEffectMinor: -eligibleRemaining,
        adjustmentKind: 'REVERSAL',
        note: 'REVERSAL',
        processorReference: input.processorEventId,
        ...historical(capture),
      }),
    );
    const created = [reversalEntry];
    if (feeRemaining !== 0) {
      created.push(
        push(
          baseEntry(agreement, {
            eventType: 'PLATFORM_FEE_ADJUSTED',
            sourceTransactionId: input.sourceTransactionId,
            idempotencyKey: key,
            occurredAt: input.occurredAt,
            platformFee: money(agreement.currency, -feeRemaining),
            adjustment: money(agreement.currency, -feeRemaining),
            adjustmentKind: 'REVERSAL',
            note: 'REVERSAL',
            platformFeeStatus: 'ADJUSTED',
            processorReference: input.processorEventId,
            ...historical(capture),
          }),
        ),
      );
    }
    return remember(key, created);
  }

  function manualAdjustment(input: ManualAdjustmentInput, actor: PlatformActor): IngestResult {
    if (!canAdminister(actor)) return fail('FORBIDDEN');
    if (!input.reason || !input.author || !input.timestamp) return fail('AUDIT_REQUIRED');
    if (!Number.isInteger(input.amountMinor)) return fail('MONEY_NOT_MINOR_UNITS');
    const linked = entries.find((entry) => entry.ledgerEntryId === input.linkedLedgerEntryId);
    if (!linked) return fail('LINKED_ENTRY_NOT_FOUND');
    if (input.currency !== linked.currency) return fail('AGREEMENT_CURRENCY_MISMATCH');
    const key = `MANUAL:${input.idempotencyKey}`;
    const prior = existing(key);
    if (prior) return prior;
    const agreement = agreements.get(linked.agreementId);
    if (!agreement) return fail('AGREEMENT_NOT_FOUND');
    return remember(key, [
      push(
        baseEntry(agreement, {
          eventType: 'MANUAL_ADJUSTMENT',
          sourceTransactionId: linked.sourceTransactionId,
          idempotencyKey: key,
          occurredAt: input.timestamp,
          platformFee: money(input.currency, input.amountMinor),
          adjustment: money(input.currency, input.amountMinor),
          platformFeeStatus: 'ADJUSTED',
          adjustmentKind: 'MANUAL',
          note: 'MANUAL',
          linkedLedgerEntryId: linked.ledgerEntryId,
          author: input.author,
          reason: input.reason,
          platformFeeRateBasisPoints: linked.platformFeeRateBasisPoints,
          calculationSnapshotId: linked.calculationSnapshotId,
          agreementVersion: linked.agreementVersion,
          transactionType: linked.transactionType,
        }),
      ),
    ]);
  }

  function projectEntries(projectId: string): LedgerEntry[] {
    return entries.filter((entry) => entry.projectId === projectId);
  }

  function readProject(actor: PlatformActor, projectId: string): Ok<{ entries: LedgerEntry[] }> | Fail {
    const agreement = [...agreements.values()].find((row) => row.projectId === projectId);
    if (!agreement) return fail('AGREEMENT_NOT_FOUND');
    if (!canReadClientOrg(actor, agreement.clientOrgId)) return fail('FORBIDDEN');
    return { ok: true, entries: projectEntries(projectId) };
  }

  function netOf(rows: LedgerEntry[]): number {
    return rows.reduce((total, entry) => total + entry.platformFee.minor, 0);
  }

  function inPeriod(entry: LedgerEntry, periodStart: string, periodEnd: string): boolean {
    return entry.occurredAt >= periodStart && entry.occurredAt <= periodEnd;
  }

  function createPayoutBatch(
    input: { projectId: string; periodStart: string; periodEnd: string },
    actor: PlatformActor,
  ): Ok<{ batch: PlatformPayoutBatch }> | Fail {
    if (!canAdminister(actor)) return fail('FORBIDDEN');
    const agreement = [...agreements.values()].find((row) => row.projectId === input.projectId && row.status !== 'SUPERSEDED');
    if (!agreement) return fail('AGREEMENT_NOT_FOUND');
    const claimed = new Set(batches.flatMap((batch) => batch.sourceLedgerEntryIds));
    const rows = projectEntries(input.projectId).filter(
      (entry) => inPeriod(entry, input.periodStart, input.periodEnd) && entry.eventType !== 'PAYOUT_CREATED' && entry.eventType !== 'PLATFORM_FEE_RELEASED' && !claimed.has(entry.ledgerEntryId),
    );
    const currency = agreement.currency;
    const captures = rows.filter((entry) => entry.eventType === 'TRANSACTION_CAPTURED');
    const accrued = rows.filter((entry) => entry.eventType === 'PLATFORM_FEE_ACCRUED').reduce((total, entry) => total + entry.platformFee.minor, 0);
    const refundAdj = rows
      .filter((entry) => entry.eventType === 'PLATFORM_FEE_ADJUSTED' && (entry.adjustmentKind === 'REFUND' || entry.adjustmentKind === 'REVERSAL'))
      .reduce((total, entry) => total + entry.platformFee.minor, 0);
    const chargebackAdj = rows
      .filter((entry) => entry.eventType === 'PLATFORM_FEE_ADJUSTED' && entry.adjustmentKind === 'CHARGEBACK')
      .reduce((total, entry) => total + entry.platformFee.minor, 0);
    const manualAdj = rows.filter((entry) => entry.eventType === 'MANUAL_ADJUSTMENT').reduce((total, entry) => total + entry.platformFee.minor, 0);
    const batch: PlatformPayoutBatch = {
      payoutBatchId: nextId('pay'),
      beneficiaryId: agreement.beneficiaryId,
      projectId: input.projectId,
      schedule: agreement.payoutSchedule,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      sourceLedgerEntryIds: rows.map((entry) => entry.ledgerEntryId),
      eligibleTransactionCount: new Set(captures.map((entry) => entry.sourceTransactionId)).size,
      grossEligible: money(currency, captures.reduce((total, entry) => total + entry.eligible.minor, 0)),
      platformFeeAccrued: money(currency, accrued),
      refundAdjustments: money(currency, refundAdj),
      chargebackAdjustments: money(currency, chargebackAdj),
      manualAdjustments: money(currency, manualAdj),
      netPayout: money(currency, accrued + refundAdj + chargebackAdj + manualAdj),
      currency,
      status: 'DRAFT',
      processorPayoutReference: null,
      liveMovement: false,
      createdAt: now(),
      paidAt: null,
    };
    batches.push(Object.freeze(batch));
    push(
      baseEntry(agreement, {
        eventType: 'PAYOUT_CREATED',
        sourceTransactionId: batch.payoutBatchId,
        idempotencyKey: `PAYOUT:${batch.payoutBatchId}`,
        occurredAt: input.periodEnd,
        payoutBatchId: batch.payoutBatchId,
        note: 'DRAFT_BATCH_NO_FUNDS_MOVED',
        platformFeeStatus: 'PENDING_PAYOUT',
      }),
    );
    return { ok: true, batch };
  }

  function buildStatement(projectId: string, periodStart: string, periodEnd: string, actor: PlatformActor): Ok<{ statement: PlatformStatement }> | Fail {
    const read = readProject(actor, projectId);
    if (!read.ok) return read;
    const agreement = [...agreements.values()].find((row) => row.projectId === projectId);
    if (!agreement) return fail('AGREEMENT_NOT_FOUND');
    const rows = read.entries.filter((entry) => inPeriod(entry, periodStart, periodEnd) && entry.eventType !== 'PAYOUT_CREATED');
    const captures = rows.filter((entry) => entry.eventType === 'TRANSACTION_CAPTURED');
    const currency = agreement.currency;
    const statement: PlatformStatement = {
      statementId: nextId('stm'),
      projectId,
      clientOrgId: agreement.clientOrgId,
      periodStart,
      periodEnd,
      cadence: 'MONTHLY',
      currency,
      economicsVersion: PLATFORM_ECONOMICS_VERSION,
      commercialTermsVersion: COMMERCIAL_TERMS_VERSION,
      sourceLedgerEntryIds: rows.map((entry) => entry.ledgerEntryId),
      snapshotHash: hashSnapshot(rows.map((entry) => `${entry.ledgerEntryId}:${entry.eventType}:${entry.platformFee.minor}:${entry.eligible.minor}`)),
      eligibleTransactionCount: captures.length,
      eligibleVolume: money(currency, captures.reduce((total, entry) => total + entry.eligible.minor, 0)),
      platformFeeRateBasisPoints: captures[0]?.platformFeeRateBasisPoints ?? null,
      platformFees: money(currency, rows.filter((entry) => entry.eventType === 'PLATFORM_FEE_ACCRUED').reduce((total, entry) => total + entry.platformFee.minor, 0)),
      refunds: money(currency, rows.filter((entry) => entry.adjustmentKind === 'REFUND' && entry.eventType === 'PLATFORM_FEE_ADJUSTED').reduce((total, entry) => total + entry.platformFee.minor, 0)),
      reversals: money(currency, rows.filter((entry) => entry.adjustmentKind === 'REVERSAL' && entry.eventType === 'PLATFORM_FEE_ADJUSTED').reduce((total, entry) => total + entry.platformFee.minor, 0)),
      netSettlement: money(currency, netOf(rows)),
      createdAt: now(),
    };
    statements.push(Object.freeze(statement));
    return { ok: true, statement };
  }

  function reproduceStatement(statementId: string): Ok<{ matches: boolean }> | Fail {
    const statement = statements.find((row) => row.statementId === statementId);
    if (!statement) return fail('STATEMENT_NOT_FOUND');
    const rows = entries.filter((entry) => statement.sourceLedgerEntryIds.includes(entry.ledgerEntryId));
    const hash = hashSnapshot(rows.map((entry) => `${entry.ledgerEntryId}:${entry.eventType}:${entry.platformFee.minor}:${entry.eligible.minor}`));
    return { ok: true, matches: hash === statement.snapshotHash };
  }

  function explain(sourceTransactionId: string, actor: PlatformActor) {
    const related = entries.filter((entry) => entry.sourceTransactionId === sourceTransactionId);
    if (related.length === 0) return fail('SOURCE_TRANSACTION_NOT_FOUND');
    if (!canReadClientOrg(actor, related[0].clientOrgId)) return fail('FORBIDDEN');
    const capture = related.find((entry) => entry.eventType === 'TRANSACTION_CAPTURED') ?? related[0];
    const accrual = related.find((entry) => entry.eventType === 'PLATFORM_FEE_ACCRUED');
    return {
      ok: true as const,
      sourceTransactionId,
      grossMinor: capture.gross.minor,
      exclusionLines: capture.exclusionLines,
      eligibleMinor: capture.eligible.minor,
      rateBasisPoints: capture.platformFeeRateBasisPoints,
      platformFeeMinor: accrual?.platformFee.minor ?? 0,
      adjustmentsMinor: related
        .filter((entry) => entry.eventType !== 'PLATFORM_FEE_ACCRUED' && entry.eventType !== 'TRANSACTION_CAPTURED')
        .reduce((total, entry) => total + entry.platformFee.minor, 0),
      netMinor: netOf(related),
      currency: capture.currency,
      entries: related,
    };
  }

  function portfolio(actor: PlatformActor) {
    if (!canAdminister(actor)) return fail('FORBIDDEN');
    const currencies = [...new Set(entries.map((entry) => entry.currency))];
    return {
      ok: true as const,
      live: false as const,
      currencies: currencies.map((currency) => {
        const rows = entries.filter((entry) => entry.currency === currency);
        const captures = rows.filter((entry) => entry.eventType === 'TRANSACTION_CAPTURED');
        const accruedMinor = netOf(rows);
        return {
          currency,
          eligibleVolumeMinor: captures.reduce((total, entry) => total + entry.eligible.minor, 0),
          accruedMinor,
          collectedMinor: 0 as const,
          pendingMinor: accruedMinor,
          paidMinor: 0 as const,
          refundedMinor: rows.filter((entry) => entry.adjustmentKind === 'REFUND').reduce((total, entry) => total + entry.platformFee.minor, 0),
          disputedMinor: rows.filter((entry) => entry.chargebackState === 'OPEN').reduce((total, entry) => total + entry.chargeback.minor, 0),
          projects: [...new Set(rows.map((entry) => entry.projectId))].map((projectId) => ({
            projectId,
            accruedMinor: netOf(rows.filter((entry) => entry.projectId === projectId)),
          })),
        };
      }),
    };
  }

  return {
    addBeneficiary,
    createAgreement,
    transition,
    recordFounderApproval,
    recordClientAcceptance,
    noteQuote,
    noteBuilderConfigured,
    activate,
    supersede,
    ingestCapture,
    ingestRefund,
    ingestChargeback,
    ingestReversal,
    manualAdjustment,
    readProject,
    createPayoutBatch,
    completePayout: (): Fail => fail('LIVE_MONEY_MOVEMENT_DISABLED'),
    buildStatement,
    reproduceStatement,
    explain,
    portfolio,
    netFee: (projectId: string, currency: string) => netOf(projectEntries(projectId).filter((entry) => entry.currency === currency)),
    getAgreement: (agreementId: string) => agreements.get(agreementId) ?? null,
    listAgreements: () => [...agreements.values()],
    listEntries: () => entries.slice(),
    listBatches: () => batches.slice(),
  };
}

export type PlatformBooks = ReturnType<typeof createPlatformBooks>;
