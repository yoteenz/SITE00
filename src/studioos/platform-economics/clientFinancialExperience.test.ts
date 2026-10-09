import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { blueprintEconomicsForSelection } from '../../site00/builder-experience/spatialStudio/blueprintEconomics';
import { emptySpatialState } from '../../site00/builder-experience/spatialStudio/types';
import { spatialSelectionToBuilder } from '../../site00/builder-experience/spatialStudio/mapping';
import { accrueAioServicePayment } from './aio';
import { createPlatformBooks } from './books';
import {
  AIO_PLATFORM_PARTICIPATION_ACTIVATED,
  AIO_TRANSACTION_MODELS,
  CLIENT_ACCOUNT_FINANCIAL_CONTRACT,
  FINANCIAL_GATES,
  STATEMENT_INTERACTIONS,
} from './clientExperience';
import { clientStatement, clientStatementHistory, clientTransactionBreakdown } from './clientStatement';
import { ELIGIBILITY_CONTRACT_NOTES, illustrativeTransactionPreview } from './illustration';
import { applyBasisPoints } from './money';
import { agreementDeductionActive, blueprintFinancialPresentation, clientFacingAgreementState } from './presentation';
import { quotePlatformFee, LIVE_MONEY_MOVEMENT } from './processor';
import { canonicalPlatformFeeBasisPoints, formatPlatformFeeRate } from './rate';
import type { PlatformActor } from './types';

const founder: PlatformActor = { actorId: 'founder', role: 'SITE00_FOUNDER', clientOrgId: null };
const clientA: PlatformActor = { actorId: 'client-a', role: 'CLIENT_OWNER', clientOrgId: 'org-a' };
const clientB: PlatformActor = { actorId: 'client-b', role: 'CLIENT_OWNER', clientOrgId: 'org-b' };

function openBooks(currency = 'USD', basisPoints?: number) {
  const books = createPlatformBooks();
  const created = books.createAgreement({
    projectId: 'project-a',
    clientOrgId: 'org-a',
    currency,
    platformFeeApplicable: true,
    coveredTransactionTypes: ['SERVICE_PAYMENT', 'ECOMMERCE', 'SUBSCRIPTION'],
    basisPoints,
    rateOverride: basisPoints == null ? undefined : { author: 'founder', reason: 'Client-specific rate', timestamp: '2026-10-09T00:00:00.000Z' },
  });
  if (!created.ok) throw new Error(created.code);
  return { books, agreement: created.agreement };
}

describe('client financial experience', () => {
  it('keeps a Blueprint proposal from looking like an active deduction', () => {
    const selection = spatialSelectionToBuilder({
      ...emptySpatialState(),
      placePath: 'ADVANCED',
      feelVibe: 'MODERN',
      workModules: ['PAGES', 'SHOP'],
      pace: 'STANDARD',
    });
    const view = blueprintEconomicsForSelection(selection, '$17,000–$22,000');
    expect(view.platform.deductionActive).toBe(false);
    expect(view.platform.presentation).toBe('PROPOSED');
    expect(view.platform.rateLabel).toBe(formatPlatformFeeRate(canonicalPlatformFeeBasisPoints()));
    expect(view.platform.rateBasisPoints).toBe(canonicalPlatformFeeBasisPoints());
    expect(view.build.amountLabel).toBe('$17,000–$22,000');
    expect(view.build.includedPlatformShare).toBe(false);
    expect(view.build.guaranteed).toBe(false);
    expect(view.thirdParty.site00IsProcessor).toBe(false);
    expect(view.thirdParty.settlementTimingPromised).toBe(false);
    expect(view.agreement.legalReviewRequired).toBe(true);
    expect(view.illustration?.label).toBe('EXAMPLE');
    expect(view.illustration?.notClientHistory).toBe(true);
    expect(view.illustration?.movedFunds).toBe(false);
    expect(view.illustration?.oneLine).toContain(view.platform.rateLabel!);
    expect(view.illustration?.platformFeeMinor).toBe(
      quotePlatformFee({
        currency: 'USD',
        eligibleMinor: view.illustration!.eligibleMinor,
        basisPoints: canonicalPlatformFeeBasisPoints(),
        applicable: true,
      }).platformFee.minor,
    );
  });

  it('does not invent a platform share for a project with no covered payments', () => {
    const selection = spatialSelectionToBuilder({
      ...emptySpatialState(),
      placePath: 'SIMPLE',
      feelVibe: 'EDITORIAL',
      workModules: ['PAGES'],
      pace: 'STANDARD',
    });
    const view = blueprintEconomicsForSelection(selection, null);
    expect(view.platform.presentation).toBe('NOT_APPLICABLE');
    expect(view.platform.deductionActive).toBe(false);
    expect(view.illustration).toBeNull();
  });

  it('maps agreement states and never treats an unaccepted rate as a deduction', () => {
    expect(clientFacingAgreementState('DRAFT')).toBe('PROPOSED');
    expect(clientFacingAgreementState('OFFERED')).toBe('PROPOSED');
    expect(clientFacingAgreementState('CLIENT_REVIEW')).toBe('PENDING_ACCEPTANCE');
    expect(clientFacingAgreementState('ACCEPTED')).toBe('PENDING_ACCEPTANCE');
    expect(clientFacingAgreementState('ACTIVE')).toBe('ACTIVE');
    expect(clientFacingAgreementState('SUPERSEDED')).toBe('SUPERSEDED');
    expect(clientFacingAgreementState('ENDED')).toBe('TERMINATED');
    expect(clientFacingAgreementState('SUSPENDED')).toBe('SUSPENDED');
    for (const status of ['DRAFT', 'FOUNDER_REVIEW', 'OFFERED', 'CLIENT_REVIEW', 'ACCEPTED', 'SUPERSEDED', 'ENDED', 'SUSPENDED'] as const) {
      expect(agreementDeductionActive(status, true)).toBe(false);
    }
    expect(agreementDeductionActive('ACTIVE', true)).toBe(true);
    expect(agreementDeductionActive('ACTIVE', false)).toBe(false);
  });

  it('uses a client-specific rate only on that agreement', () => {
    const { agreement } = openBooks('USD', 250);
    const view = blueprintFinancialPresentation({
      featureIds: ['ECOMMERCE'],
      buildInvestmentLabel: '$1–$2',
      agreement,
    });
    expect(view.platform.customRate).toBe(true);
    expect(view.platform.rateBasisPoints).toBe(250);
    expect(view.platform.presentation).toBe('PROPOSED');
    expect(view.platform.deductionActive).toBe(false);
    expect(view.illustration?.rateBasisPoints).toBe(250);
  });

  it('calculates the illustrative example in the economics engine', () => {
    const preview = illustrativeTransactionPreview({
      currency: 'USD',
      basisPoints: canonicalPlatformFeeBasisPoints(),
      customRate: false,
      applicable: true,
    });
    expect(preview.eligibleMinor).toBe(10_000);
    expect(preview.excludedMinor).toBe(800 + 500 + 200);
    expect(preview.platformFeeMinor).toBe(applyBasisPoints(preview.eligibleMinor, canonicalPlatformFeeBasisPoints()));
    expect(preview.processorFeeTreatment).toBe('UNSPECIFIED');
    expect(preview.clientProceeds.state).toBe('UNAVAILABLE');
    expect(preview.movedFunds).toBe(false);
    expect(ELIGIBILITY_CONTRACT_NOTES.some((note) => note.topic === 'SHIPPING')).toBe(true);
  });

  it('keeps historical rates when a later agreement replaces them', () => {
    const { books, agreement } = openBooks();
    const active = books.activate(agreement.agreementId, { author: 'founder', at: '2026-01-01T00:00:00.000Z' });
    if (!active.ok) throw new Error(active.code);
    const captured = books.ingestCapture({
      agreementId: agreement.agreementId,
      sourceTransactionId: 'sale-1',
      transactionType: 'SERVICE_PAYMENT',
      currency: 'USD',
      components: [{ code: 'SERVICE', minor: 333 }],
      processorEventId: 'evt-1',
      occurredAt: '2026-01-15T00:00:00.000Z',
    });
    expect(captured.ok).toBe(true);
    const replaced = books.supersede(agreement.agreementId, {
      projectId: 'project-a',
      clientOrgId: 'org-a',
      currency: 'USD',
      platformFeeApplicable: true,
      coveredTransactionTypes: ['SERVICE_PAYMENT'],
      basisPoints: 250,
      rateOverride: { author: 'founder', reason: 'Later rate', timestamp: '2026-02-01T00:00:00.000Z' },
    });
    if (!replaced.ok) throw new Error(replaced.code);
    const next = books.activate(replaced.agreement.agreementId, { author: 'founder', at: '2026-02-01T00:00:00.000Z' });
    if (!next.ok) throw new Error(next.code);
    books.ingestCapture({
      agreementId: replaced.agreement.agreementId,
      sourceTransactionId: 'sale-2',
      transactionType: 'SERVICE_PAYMENT',
      currency: 'USD',
      components: [{ code: 'SERVICE', minor: 10_000 }],
      processorEventId: 'evt-2',
      occurredAt: '2026-02-15T00:00:00.000Z',
    });
    const january = clientStatement(books, {
      projectId: 'project-a',
      periodStart: '2026-01-01T00:00:00.000Z',
      periodEnd: '2026-01-31T00:00:00.000Z',
      actor: clientA,
    });
    const february = clientStatement(books, {
      projectId: 'project-a',
      periodStart: '2026-02-01T00:00:00.000Z',
      periodEnd: '2026-02-28T00:00:00.000Z',
      actor: clientA,
    });
    if (!january.ok || !february.ok) throw new Error('statement');
    expect(january.agreedRateBasisPoints).toBe(canonicalPlatformFeeBasisPoints());
    expect(january.agreementPresentation).toBe('SUPERSEDED');
    expect(january.deductionActive).toBe(false);
    expect(january.platformShare.minor).toBe(applyBasisPoints(333, canonicalPlatformFeeBasisPoints()));
    expect(february.agreedRateBasisPoints).toBe(250);
    expect(february.agreementPresentation).toBe('ACTIVE');
    expect(february.deductionActive).toBe(true);
    expect(january.historicalVersions[0]?.rateBasisPoints).toBe(canonicalPlatformFeeBasisPoints());
  });

  it('separates refunds, chargebacks, and processor fees from the platform share', () => {
    const { books, agreement } = openBooks();
    books.activate(agreement.agreementId, { author: 'founder', at: '2026-03-01T00:00:00.000Z' });
    books.ingestCapture({
      agreementId: agreement.agreementId,
      sourceTransactionId: 'sale-refund',
      transactionType: 'ECOMMERCE',
      currency: 'USD',
      components: [
        { code: 'SERVICE', minor: 10_000 },
        { code: 'TAX', minor: 800 },
      ],
      processorFeeMinor: 290,
      processorEventId: 'evt-refund',
      occurredAt: '2026-03-02T00:00:00.000Z',
    });
    books.ingestRefund({
      agreementId: agreement.agreementId,
      sourceTransactionId: 'sale-refund',
      currency: 'USD',
      components: [{ code: 'SERVICE', minor: 10_000 }],
      processorEventId: 'evt-refund-back',
      occurredAt: '2026-03-03T00:00:00.000Z',
    });
    books.ingestCapture({
      agreementId: agreement.agreementId,
      sourceTransactionId: 'sale-dispute',
      transactionType: 'SUBSCRIPTION',
      currency: 'USD',
      components: [{ code: 'SERVICE', minor: 5_000 }],
      processorEventId: 'evt-dispute',
      occurredAt: '2026-03-04T00:00:00.000Z',
    });
    books.ingestChargeback({
      agreementId: agreement.agreementId,
      sourceTransactionId: 'sale-dispute',
      currency: 'USD',
      state: 'LOST',
      disputedEligibleMinor: 5_000,
      processorEventId: 'evt-dispute-lost',
      occurredAt: '2026-03-05T00:00:00.000Z',
    });
    const statement = clientStatement(books, {
      projectId: 'project-a',
      periodStart: '2026-03-01T00:00:00.000Z',
      periodEnd: '2026-03-31T00:00:00.000Z',
      actor: clientA,
    });
    if (!statement.ok) throw new Error(statement.code);
    expect(statement.gross.minor).toBe(10_800 + 5_000);
    expect(statement.eligible.minor).toBe(10_000 + 5_000);
    expect(statement.excluded.minor).toBe(800);
    expect(statement.refundAdjustments.minor).toBe(10_000);
    expect(statement.disputeAdjustments.minor).toBe(5_000);
    expect(statement.platformShare.minor).toBe(0);
    expect(statement.platformShare.state).toBe('POSTED');
    expect(statement.processorFees).toMatchObject({ state: 'POSTED', minor: 290 });
    expect(statement.clientNetProceeds).toEqual({ state: 'UNAVAILABLE', reason: 'PROCESSOR_FEE_TREATMENT_UNSPECIFIED' });
    expect(statement.payout.settledMinor).toBe(0);
    expect(statement.payout.liveMovement).toBe(false);
    expect(statement.export.available).toBe(false);
    expect(statement.mixesSettledWithPending).toBe(false);
    const rows = clientTransactionBreakdown(books, { projectId: 'project-a', actor: clientA });
    if (!rows.ok) throw new Error(rows.code);
    expect(rows.rows.find((row) => row.sourceTransactionId === 'sale-refund')?.refundOrDispute).toBe('REFUND');
    expect(rows.rows.find((row) => row.sourceTransactionId === 'sale-dispute')?.refundOrDispute).toBe('CHARGEBACK');
  });

  it('keeps a draft payout pending and settled at zero', () => {
    const { books, agreement } = openBooks();
    books.activate(agreement.agreementId, { author: 'founder', at: '2026-04-01T00:00:00.000Z' });
    books.ingestCapture({
      agreementId: agreement.agreementId,
      sourceTransactionId: 'sale-payout',
      transactionType: 'SERVICE_PAYMENT',
      currency: 'USD',
      components: [{ code: 'SERVICE', minor: 10_000 }],
      processorEventId: 'evt-payout',
      occurredAt: '2026-04-02T00:00:00.000Z',
    });
    const batch = books.createPayoutBatch(
      { projectId: 'project-a', periodStart: '2026-04-01T00:00:00.000Z', periodEnd: '2026-04-30T00:00:00.000Z' },
      founder,
    );
    expect(batch.ok).toBe(true);
    const statement = clientStatement(books, {
      projectId: 'project-a',
      periodStart: '2026-04-01T00:00:00.000Z',
      periodEnd: '2026-04-30T00:00:00.000Z',
      actor: clientA,
    });
    if (!statement.ok) throw new Error(statement.code);
    expect(statement.statementStatus).toBe('PENDING_PAYOUT');
    expect(statement.payout.status).toBe('DRAFT');
    expect(statement.payout.pendingMinor).toBe(statement.platformShare.minor);
    expect(statement.payout.settledMinor).toBe(0);
    expect(books.completePayout().code).toBe('LIVE_MONEY_MOVEMENT_DISABLED');
  });

  it('returns an empty posted statement when a period has no transactions', () => {
    const { books, agreement } = openBooks();
    books.activate(agreement.agreementId, { author: 'founder', at: '2026-05-01T00:00:00.000Z' });
    const statement = clientStatement(books, {
      projectId: 'project-a',
      periodStart: '2026-05-01T00:00:00.000Z',
      periodEnd: '2026-05-31T00:00:00.000Z',
      actor: clientA,
    });
    if (!statement.ok) throw new Error(statement.code);
    expect(statement.statementStatus).toBe('EMPTY');
    expect(statement.gross.minor).toBe(0);
    expect(statement.platformShare.minor).toBe(0);
    expect(statement.platformShare.state).toBe('POSTED');
    expect(statement.export.available).toBe(false);
  });

  it('refuses another client and a missing agreement', () => {
    const { books } = openBooks();
    const denied = clientStatement(books, {
      projectId: 'project-a',
      periodStart: '2026-01-01T00:00:00.000Z',
      periodEnd: '2026-01-31T00:00:00.000Z',
      actor: clientB,
    });
    expect(denied).toEqual({ ok: false, code: 'FORBIDDEN' });
    const missing = clientStatement(books, {
      projectId: 'missing',
      periodStart: '2026-01-01T00:00:00.000Z',
      periodEnd: '2026-01-31T00:00:00.000Z',
      actor: founder,
    });
    expect(missing).toEqual({ ok: false, code: 'AGREEMENT_NOT_FOUND' });
    const history = clientStatementHistory(books, {
      projectId: 'project-a',
      actor: clientA,
      periods: [{ periodStart: '2026-01-01T00:00:00.000Z', periodEnd: '2026-01-31T00:00:00.000Z' }],
    });
    expect(history[0]?.ok).toBe(true);
  });

  it('formats currency without treating a minor unit as a dollar, and does not mix currencies', () => {
    const { books, agreement } = openBooks('EUR');
    books.activate(agreement.agreementId, { author: 'founder', at: '2026-06-01T00:00:00.000Z' });
    const statement = clientStatement(books, {
      projectId: 'project-a',
      periodStart: '2026-06-01T00:00:00.000Z',
      periodEnd: '2026-06-30T00:00:00.000Z',
      actor: clientA,
    });
    if (!statement.ok) throw new Error(statement.code);
    expect(statement.currency).toBe('EUR');
    expect(statement.gross.display).toContain('€');
    const mismatch = books.ingestCapture({
      agreementId: agreement.agreementId,
      sourceTransactionId: 'sale-usd',
      transactionType: 'SERVICE_PAYMENT',
      currency: 'USD',
      components: [{ code: 'SERVICE', minor: 100 }],
      processorEventId: 'evt-usd',
      occurredAt: '2026-06-02T00:00:00.000Z',
    });
    expect(mismatch).toEqual({ ok: false, code: 'AGREEMENT_CURRENCY_MISMATCH' });
  });

  it('leaves AIO participation off and does not assume one eligibility rule', () => {
    expect(AIO_PLATFORM_PARTICIPATION_ACTIVATED).toBe(false);
    expect(AIO_TRANSACTION_MODELS.find((model) => model.id === 'BROKERAGE')?.eligibility).toBe('NOT_ASSUMED');
    expect(AIO_TRANSACTION_MODELS.find((model) => model.id === 'INSURANCE')?.activated).toBe(false);
    expect(AIO_TRANSACTION_MODELS.find((model) => model.id === 'SERVICE_PAYMENT')?.coveredType).toBe('SERVICE_PAYMENT');
    const { books, agreement } = openBooks();
    const draft = accrueAioServicePayment(books, {
      agreementId: agreement.agreementId,
      sourceTransactionId: 'aio-draft',
      currency: 'USD',
      components: [{ code: 'SERVICE', minor: 10_000 }],
      processorEventId: 'aio-evt',
      occurredAt: '2026-07-02T00:00:00.000Z',
    });
    expect(draft.ok).toBe(true);
    if (draft.ok) {
      const accrual = draft.entries.find((entry) => entry.eventType === 'PLATFORM_FEE_ACCRUED');
      expect(accrual?.platformFee.minor ?? 0).toBe(0);
    }
  });

  it('places statements inside the existing account and leaves export unavailable', () => {
    expect(CLIENT_ACCOUNT_FINANCIAL_CONTRACT.route).toBe('/account');
    expect(CLIENT_ACCOUNT_FINANCIAL_CONTRACT.separateEnvironment).toBe(false);
    expect(CLIENT_ACCOUNT_FINANCIAL_CONTRACT.studioOsVisibleToClient).toBe(false);
    expect(CLIENT_ACCOUNT_FINANCIAL_CONTRACT.visualImplemented).toBe(false);
    expect(STATEMENT_INTERACTIONS.export.available).toBe(false);
    expect(FINANCIAL_GATES.legalReview).toBe('PENDING');
    expect(FINANCIAL_GATES.liveMoneyMovement).toBe(false);
    expect(FINANCIAL_GATES.stripeConnectActivated).toBe(false);
    expect(LIVE_MONEY_MOVEMENT).toBe(false);
  });

  it('does not add a Blueprint tab for fees', () => {
    const source = readFileSync(new URL('../../site00/pages/bldr/BldrSpatialStudioPage.tsx', import.meta.url), 'utf8');
    expect(source).toContain("id: 'OVERVIEW'");
    expect(source).toContain("id: 'STRUCTURE'");
    expect(source).toContain("id: 'PAGES'");
    expect(source).toContain("id: 'FEATURES'");
    expect(source).toContain("id: 'TIMELINE'");
    expect(source).toContain('blueprintEconomicsForSelection');
    expect(source).not.toContain("id: 'FEES'");
    expect(source).not.toContain("id: 'BILLING'");
  });
});
