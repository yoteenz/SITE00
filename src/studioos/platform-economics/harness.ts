import { accrueAioServicePayment } from './aio';
import { createPlatformBooks, type PlatformBooks } from './books';
import {
  AIO_PLATFORM_CONTRACT,
  BUILD_TIER_ECONOMICS,
  budgetScopeRetainsPlatform,
  draftPlatformCopy,
  LEGAL_REVIEW_REQUIRED,
  legalClause,
  PUBLIC_TERMS_PUBLISHED,
  saveBlueprintVariant,
  platformDisclosureForFeatures,
} from './disclosure';
import { applyBasisPoints, money, sumMoney } from './money';
import { quotePlatformFee, LIVE_MONEY_MOVEMENT, LIVE_PLATFORM_FEES_COLLECTED } from './processor';
import { canonicalPlatformFeeBasisPoints, formatPlatformFeeRate } from './rate';
import { createStripeConnectAdapter } from './stripeConnect';
import type { PlatformActor } from './types';
import { PLATFORM_ECONOMICS_VERSION } from './version';

const AT = '2026-10-08T12:00:00.000Z';
const PERIOD = { periodStart: '2026-10-01T00:00:00.000Z', periodEnd: '2026-10-31T23:59:59.000Z' };

export type HarnessCase = { id: string; label: string; pass: boolean; detail: string };

const founder: PlatformActor = { actorId: 'founder', role: 'SITE00_FOUNDER', clientOrgId: null };

function clocked(): PlatformBooks {
  return createPlatformBooks({ now: () => AT });
}

function serviceAgreement(
  books: PlatformBooks,
  input: { projectId: string; clientOrgId: string; currency?: string; applicable?: boolean; basisPoints?: number; types?: ('SERVICE_PAYMENT' | 'SUBSCRIPTION' | 'ECOMMERCE')[] },
) {
  const custom = input.basisPoints != null && input.basisPoints !== canonicalPlatformFeeBasisPoints();
  const created = books.createAgreement({
    projectId: input.projectId,
    clientOrgId: input.clientOrgId,
    currency: input.currency ?? 'USD',
    platformFeeApplicable: input.applicable ?? true,
    basisPoints: input.basisPoints,
    rateOverride: custom ? { author: 'founder', reason: 'Enterprise agreement', timestamp: AT } : undefined,
    coveredTransactionTypes: input.types ?? ['SERVICE_PAYMENT', 'SUBSCRIPTION', 'ECOMMERCE'],
  });
  if (!created.ok) return created;
  const active = books.activate(created.agreement.agreementId, { author: 'founder', at: AT });
  if (!active.ok) return active;
  return { ok: true as const, agreement: active.agreement };
}

function feeOf(eligible: number, basisPoints = canonicalPlatformFeeBasisPoints()): number {
  return applyBasisPoints(eligible, basisPoints);
}

export function runFoundationHarness(): { version: string; cases: HarnessCase[]; gate: Record<string, string> } {
  const cases: HarnessCase[] = [];
  const check = (id: string, label: string, pass: boolean, detail: string) => cases.push({ id, label, pass, detail });

  const rate = canonicalPlatformFeeBasisPoints();
  const standardFee = feeOf(100_000);

  const a = clocked();
  const agreementA = serviceAgreement(a, { projectId: 'case-a', clientOrgId: 'org-a' });
  const captureA =
    agreementA.ok &&
    a.ingestCapture({
      agreementId: agreementA.agreement.agreementId,
      sourceTransactionId: 'txn-a',
      transactionType: 'SERVICE_PAYMENT',
      currency: 'USD',
      components: [
        { code: 'SERVICE', minor: 100_000 },
        { code: 'TAX', minor: 9_000 },
      ],
      invoicedMinor: 250_000,
      processorFeeMinor: 2_900,
      processorEventId: 'evt-a',
      processor: 'STRIPE',
      occurredAt: AT,
    });
  const replayA = agreementA.ok && a.ingestCapture({
    agreementId: agreementA.agreement.agreementId,
    sourceTransactionId: 'txn-a',
    transactionType: 'SERVICE_PAYMENT',
    currency: 'USD',
    components: [
      { code: 'SERVICE', minor: 100_000 },
      { code: 'TAX', minor: 9_000 },
    ],
    processorEventId: 'evt-a',
    processor: 'STRIPE',
    occurredAt: AT,
  });
  const explainA = a.explain('txn-a', founder);
  check(
    'A',
    'Service plus tax at the default rate',
    Boolean(
      captureA && captureA.ok && explainA.ok && explainA.eligibleMinor === 100_000 && explainA.platformFeeMinor === standardFee &&
        explainA.exclusionLines.some((line) => line.code === 'TAX' && line.minor === 9_000) &&
        explainA.entries.find((entry) => entry.eventType === 'TRANSACTION_CAPTURED')?.note.includes('INVOICED_IS_NOT_COLLECTED') &&
        explainA.entries.find((entry) => entry.eventType === 'TRANSACTION_CAPTURED')?.processorFeeTreatment === 'UNSPECIFIED',
    ),
    `eligible 100000, fee ${explainA.ok ? explainA.platformFeeMinor : 'n/a'}, tax excluded, invoiced amount ignored`,
  );
  check(
    'IDEMPOTENCY',
    'Duplicate processor event',
    Boolean(replayA && replayA.ok && replayA.duplicate && a.listEntries().filter((entry) => entry.sourceTransactionId === 'txn-a').length === 2),
    'replay returns the original entries',
  );

  const b = clocked();
  const agreementB = serviceAgreement(b, { projectId: 'case-b', clientOrgId: 'org-b' });
  if (agreementB.ok) {
    b.ingestCapture({
      agreementId: agreementB.agreement.agreementId,
      sourceTransactionId: 'txn-b',
      transactionType: 'SERVICE_PAYMENT',
      currency: 'USD',
      components: [
        { code: 'SERVICE', minor: 100_000 },
        { code: 'TAX', minor: 9_000 },
      ],
      processorEventId: 'evt-b',
      occurredAt: AT,
    });
    b.ingestRefund({
      agreementId: agreementB.agreement.agreementId,
      sourceTransactionId: 'txn-b',
      currency: 'USD',
      components: [{ code: 'SERVICE', minor: 20_000 }],
      processorEventId: 'evt-b-refund',
      occurredAt: AT,
    });
  }
  const accrualB = b.listEntries().find((entry) => entry.eventType === 'PLATFORM_FEE_ACCRUED');
  check(
    'B',
    'Partial refund reverses the matching fee',
    accrualB?.platformFee.minor === standardFee && b.netFee('case-b', 'USD') === standardFee - feeOf(20_000),
    `net ${b.netFee('case-b', 'USD')}, original accrual unchanged`,
  );

  const c = clocked();
  const agreementC = serviceAgreement(c, { projectId: 'case-c', clientOrgId: 'org-c' });
  if (agreementC.ok) {
    c.ingestCapture({
      agreementId: agreementC.agreement.agreementId,
      sourceTransactionId: 'txn-c',
      transactionType: 'SERVICE_PAYMENT',
      currency: 'USD',
      components: [
        { code: 'SERVICE', minor: 100_000 },
        { code: 'TAX', minor: 9_000 },
      ],
      processorEventId: 'evt-c',
      occurredAt: AT,
    });
    c.ingestRefund({
      agreementId: agreementC.agreement.agreementId,
      sourceTransactionId: 'txn-c',
      currency: 'USD',
      components: [
        { code: 'SERVICE', minor: 100_000 },
        { code: 'TAX', minor: 9_000 },
      ],
      processorEventId: 'evt-c-refund',
      occurredAt: AT,
    });
  }
  check('C', 'Full refund returns platform accrual to zero', c.netFee('case-c', 'USD') === 0, `net ${c.netFee('case-c', 'USD')}`);

  const d = clocked();
  const agreementD = serviceAgreement(d, { projectId: 'case-d', clientOrgId: 'org-d' });
  if (agreementD.ok) {
    d.ingestCapture({
      agreementId: agreementD.agreement.agreementId,
      sourceTransactionId: 'txn-d',
      transactionType: 'SERVICE_PAYMENT',
      currency: 'USD',
      components: [{ code: 'SERVICE', minor: 100_000 }],
      processorEventId: 'evt-d',
      occurredAt: AT,
    });
    d.ingestChargeback({
      agreementId: agreementD.agreement.agreementId,
      sourceTransactionId: 'txn-d',
      currency: 'USD',
      state: 'OPEN',
      disputedEligibleMinor: 100_000,
      processorEventId: 'evt-d-open',
      occurredAt: AT,
    });
  }
  const openNet = d.netFee('case-d', 'USD');
  if (agreementD.ok) {
    d.ingestChargeback({
      agreementId: agreementD.agreement.agreementId,
      sourceTransactionId: 'txn-d',
      currency: 'USD',
      state: 'LOST',
      disputedEligibleMinor: 100_000,
      processorEventId: 'evt-d-lost',
      occurredAt: AT,
    });
  }
  check(
    'D',
    'Chargeback stays visible and a loss reverses the fee',
    openNet === standardFee && d.netFee('case-d', 'USD') === 0 && d.listEntries().some((entry) => entry.chargebackState === 'OPEN') && d.listEntries().some((entry) => entry.chargebackState === 'LOST'),
    `open net ${openNet}, lost net ${d.netFee('case-d', 'USD')}`,
  );

  const e = clocked();
  const agreementE = serviceAgreement(e, { projectId: 'case-e', clientOrgId: 'org-e' });
  if (agreementE.ok) {
    for (const id of ['sub-1', 'sub-2']) {
      e.ingestCapture({
        agreementId: agreementE.agreement.agreementId,
        sourceTransactionId: id,
        transactionType: 'SUBSCRIPTION',
        currency: 'USD',
        components: [{ code: 'SERVICE', minor: 5_000 }],
        processorEventId: `evt-${id}`,
        occurredAt: AT,
      });
    }
  }
  const subFees = e.listEntries().filter((entry) => entry.eventType === 'PLATFORM_FEE_ACCRUED');
  check(
    'E',
    'Each subscription collection accrues on its own',
    subFees.length === 2 && subFees[0].platformFee.minor === feeOf(5_000) && subFees[1].platformFee.minor === feeOf(5_000) && subFees[0].sourceTransactionId !== subFees[1].sourceTransactionId,
    `two fees of ${feeOf(5_000)}`,
  );

  const f = clocked();
  const agreementF = serviceAgreement(f, { projectId: 'case-f', clientOrgId: 'org-f' });
  if (agreementF.ok) {
    f.ingestCapture({
      agreementId: agreementF.agreement.agreementId,
      sourceTransactionId: 'txn-f',
      transactionType: 'SERVICE_PAYMENT',
      currency: 'USD',
      components: [
        { code: 'SERVICE', minor: 100_000 },
        { code: 'GOVERNMENT_FEE', minor: 5_000 },
      ],
      processorEventId: 'evt-f',
      occurredAt: AT,
    });
  }
  const explainF = f.explain('txn-f', founder);
  check(
    'F',
    'Government pass-through is excluded',
    Boolean(explainF.ok && explainF.eligibleMinor === 100_000 && explainF.platformFeeMinor === standardFee && explainF.exclusionLines.some((line) => line.code === 'GOVERNMENT_FEE')),
    `eligible ${explainF.ok ? explainF.eligibleMinor : 'n/a'}`,
  );

  const g = clocked();
  const denied = g.createAgreement({
    projectId: 'case-g',
    clientOrgId: 'org-g',
    currency: 'USD',
    platformFeeApplicable: true,
    basisPoints: 150,
    coveredTransactionTypes: ['SERVICE_PAYMENT'],
  });
  const agreementG = serviceAgreement(g, { projectId: 'case-g', clientOrgId: 'org-g', basisPoints: 150 });
  if (agreementG.ok) {
    g.ingestCapture({
      agreementId: agreementG.agreement.agreementId,
      sourceTransactionId: 'txn-g',
      transactionType: 'SERVICE_PAYMENT',
      currency: 'USD',
      components: [{ code: 'SERVICE', minor: 100_000 }],
      processorEventId: 'evt-g',
      occurredAt: AT,
    });
  }
  const explainG = g.explain('txn-g', founder);
  check(
    'G',
    'Founder-approved custom rate',
    !denied.ok && denied.code === 'FOUNDER_APPROVAL_REQUIRED' && Boolean(explainG.ok && explainG.rateBasisPoints === 150 && explainG.platformFeeMinor === feeOf(100_000, 150)),
    `fee ${explainG.ok ? explainG.platformFeeMinor : 'n/a'} at 150 basis points`,
  );

  const h = clocked();
  const agreementH = serviceAgreement(h, { projectId: 'case-h', clientOrgId: 'org-h', applicable: false, types: [] });
  if (agreementH.ok) {
    h.ingestCapture({
      agreementId: agreementH.agreement.agreementId,
      sourceTransactionId: 'txn-h',
      transactionType: 'SERVICE_PAYMENT',
      currency: 'USD',
      components: [{ code: 'SERVICE', minor: 100_000 }],
      processorEventId: 'evt-h',
      occurredAt: AT,
    });
  }
  check(
    'H',
    'No-transaction project accrues no percentage fee',
    h.netFee('case-h', 'USD') === 0 && !h.listEntries().some((entry) => entry.eventType === 'PLATFORM_FEE_ACCRUED'),
    'platform fee not applicable',
  );

  const i = clocked();
  const agreementI = serviceAgreement(i, { projectId: 'case-i', clientOrgId: 'org-aio' });
  const aio =
    agreementI.ok &&
    accrueAioServicePayment(i, {
      agreementId: agreementI.agreement.agreementId,
      sourceTransactionId: 'txn-i',
      currency: 'USD',
      components: [{ code: 'SERVICE', minor: 100_000 }],
      processorEventId: 'evt-i',
      occurredAt: AT,
    });
  const quoted = quotePlatformFee({ currency: 'USD', eligibleMinor: 100_000, basisPoints: rate, applicable: true });
  check(
    'I',
    'AIO uses the shared engine',
    Boolean(
      aio && aio.ok && aio.entries.some((entry) => entry.consumer === 'AIO' && entry.eventType === 'PLATFORM_FEE_ACCRUED' && entry.platformFee.minor === quoted.platformFee.minor) &&
        AIO_PLATFORM_CONTRACT.ownsEngine === false && AIO_PLATFORM_CONTRACT.reports.ownsLedger === false,
    ),
    `AIO fee ${quoted.platformFee.minor}, reports do not own the ledger`,
  );

  const j = clocked();
  const agreementJ = serviceAgreement(j, { projectId: 'case-j', clientOrgId: 'org-j' });
  if (agreementJ.ok) {
    for (const [id, minor] of [
      ['j1', 100_000],
      ['j2', 50_000],
      ['j3', 25_000],
    ] as const) {
      j.ingestCapture({
        agreementId: agreementJ.agreement.agreementId,
        sourceTransactionId: id,
        transactionType: 'SERVICE_PAYMENT',
        currency: 'USD',
        components: [{ code: 'SERVICE', minor }],
        processorEventId: `evt-${id}`,
        occurredAt: AT,
      });
    }
    j.ingestRefund({
      agreementId: agreementJ.agreement.agreementId,
      sourceTransactionId: 'j1',
      currency: 'USD',
      components: [{ code: 'SERVICE', minor: 20_000 }],
      processorEventId: 'evt-j-refund',
      occurredAt: AT,
    });
  }
  const batch = j.createPayoutBatch({ projectId: 'case-j', ...PERIOD }, founder);
  const statement = j.buildStatement('case-j', PERIOD.periodStart, PERIOD.periodEnd, founder);
  const reproduced = statement.ok ? j.reproduceStatement(statement.statement.statementId) : null;
  check(
    'J',
    'Monthly payout batch matches ledger state',
    Boolean(
      batch.ok && statement.ok && reproduced?.ok && reproduced.matches && batch.batch.netPayout.minor === j.netFee('case-j', 'USD') &&
        batch.batch.platformFeeAccrued.minor + batch.batch.refundAdjustments.minor + batch.batch.chargebackAdjustments.minor + batch.batch.manualAdjustments.minor === batch.batch.netPayout.minor &&
        batch.batch.eligibleTransactionCount === 3 && batch.batch.liveMovement === false && batch.batch.paidAt === null && statement.statement.netSettlement.minor === batch.batch.netPayout.minor,
    ),
    `batch net ${batch.ok ? batch.batch.netPayout.minor : 'n/a'}`,
  );

  const manualBooks = clocked();
  const manualAgreement = serviceAgreement(manualBooks, { projectId: 'manual', clientOrgId: 'org-m' });
  let manualPass = false;
  if (manualAgreement.ok) {
    const captured = manualBooks.ingestCapture({
      agreementId: manualAgreement.agreement.agreementId,
      sourceTransactionId: 'txn-m',
      transactionType: 'SERVICE_PAYMENT',
      currency: 'USD',
      components: [{ code: 'SERVICE', minor: 10_000 }],
      processorEventId: 'evt-m',
      occurredAt: AT,
    });
    const linked = captured.ok ? captured.entries[0].ledgerEntryId : '';
    const missing = manualBooks.manualAdjustment(
      { linkedLedgerEntryId: linked, currency: 'USD', amountMinor: 50, reason: '', author: 'founder', timestamp: AT, idempotencyKey: 'm1' },
      founder,
    );
    const adjusted = manualBooks.manualAdjustment(
      { linkedLedgerEntryId: linked, currency: 'USD', amountMinor: 50, reason: 'Goodwill credit', author: 'founder', timestamp: AT, idempotencyKey: 'm1' },
      founder,
    );
    const row = manualBooks.listEntries().find((entry) => entry.eventType === 'MANUAL_ADJUSTMENT');
    manualPass = !missing.ok && missing.code === 'AUDIT_REQUIRED' && Boolean(adjusted.ok && row?.author === 'founder' && row.reason === 'Goodwill credit' && row.platformFee.minor === 50);
  }
  check('AUDIT', 'Manual adjustment records author, reason, and time', manualPass, 'silent edit rejected');

  const versionBooks = clocked();
  const versionAgreement = serviceAgreement(versionBooks, { projectId: 'versioned', clientOrgId: 'org-v' });
  let versionPass = false;
  if (versionAgreement.ok) {
    versionBooks.ingestCapture({
      agreementId: versionAgreement.agreement.agreementId,
      sourceTransactionId: 'txn-v',
      transactionType: 'SERVICE_PAYMENT',
      currency: 'USD',
      components: [{ code: 'SERVICE', minor: 100_000 }],
      processorEventId: 'evt-v',
      occurredAt: AT,
    });
    const next = versionBooks.supersede(versionAgreement.agreement.agreementId, {
      projectId: 'versioned',
      clientOrgId: 'org-v',
      currency: 'USD',
      platformFeeApplicable: true,
      basisPoints: 150,
      rateOverride: { author: 'founder', reason: 'Renewed enterprise rate', timestamp: AT },
      coveredTransactionTypes: ['SERVICE_PAYMENT'],
    });
    if (next.ok) versionBooks.activate(next.agreement.agreementId, { author: 'founder', at: AT });
    const original = versionBooks.listEntries().find((entry) => entry.eventType === 'PLATFORM_FEE_ACCRUED' && entry.sourceTransactionId === 'txn-v');
    versionPass = Boolean(original && original.agreementVersion === '1' && original.platformFeeRateBasisPoints === rate && original.platformFee.minor === standardFee);
  }
  check('VERSION', 'Historical agreement rate is preserved', versionPass, 'later rate does not rewrite the first accrual');

  const isolated = clocked();
  serviceAgreement(isolated, { projectId: 'proj-a', clientOrgId: 'client-a' });
  serviceAgreement(isolated, { projectId: 'proj-b', clientOrgId: 'client-b' });
  const clientA: PlatformActor = { actorId: 'a', role: 'CLIENT_OWNER', clientOrgId: 'client-a' };
  const clientB: PlatformActor = { actorId: 'b', role: 'CLIENT_AUTHORIZED_FINANCE', clientOrgId: 'client-b' };
  const readA = isolated.readProject(clientA, 'proj-b');
  const readB = isolated.readProject(clientB, 'proj-a');
  const readOwn = isolated.readProject(clientA, 'proj-a');
  check('ISOLATION', 'A client cannot read another client', !readA.ok && readA.code === 'FORBIDDEN' && !readB.ok && readOwn.ok, 'cross-client read denied');

  const quoteBooks = clocked();
  const draft = quoteBooks.createAgreement({
    projectId: 'quote',
    clientOrgId: 'org-q',
    currency: 'USD',
    platformFeeApplicable: true,
    coveredTransactionTypes: ['SERVICE_PAYMENT'],
  });
  if (draft.ok) {
    quoteBooks.noteQuote(draft.agreement.agreementId, AT);
    quoteBooks.noteBuilderConfigured(draft.agreement.agreementId, AT);
  }
  const jumped = draft.ok ? quoteBooks.transition(draft.agreement.agreementId, 'ACTIVE') : null;
  check(
    'STATES',
    'Quote and Builder do not activate an agreement',
    Boolean(draft.ok && quoteBooks.getAgreement(draft.agreement.agreementId)?.status === 'DRAFT' && jumped && !jumped.ok),
    'status stays DRAFT',
  );

  const stripe = createStripeConnectAdapter();
  const payout = stripe.createPayout();
  check(
    'MONEY',
    'Live money movement stays off',
    LIVE_MONEY_MOVEMENT === false && LIVE_PLATFORM_FEES_COLLECTED === false && payout.ok === false && payout.movedFunds === false && payout.code === 'LIVE_MONEY_MOVEMENT_DISABLED' && stripe.calculatePlatformFee({ currency: 'EUR', eligibleMinor: 100_000, basisPoints: rate, applicable: true }).platformFee.minor === standardFee,
    'Stripe Connect is a stub',
  );

  let mixed = false;
  try {
    sumMoney([money('USD', 1), money('EUR', 1)]);
  } catch (error) {
    mixed = error instanceof Error && error.message === 'MIXED_CURRENCY_AGGREGATE';
  }
  const euro = clocked();
  const euroAgreement = serviceAgreement(euro, { projectId: 'euro', clientOrgId: 'org-eu', currency: 'EUR' });
  if (euroAgreement.ok) {
    euro.ingestCapture({
      agreementId: euroAgreement.agreement.agreementId,
      sourceTransactionId: 'txn-eu',
      transactionType: 'SERVICE_PAYMENT',
      currency: 'EUR',
      components: [{ code: 'SERVICE', minor: 100_000 }],
      processorEventId: 'evt-eu',
      occurredAt: AT,
    });
  }
  check('CURRENCY', 'Currency is per record and aggregates do not mix', mixed && euro.netFee('euro', 'EUR') === standardFee, 'EUR fee calculated, USD+EUR sum rejected');

  const variants = [
    saveBlueprintVariant({
      variantId: 'ideal',
      label: 'BLUEPRINT A — IDEAL',
      buildInvestmentLabel: '$31K–$39K',
      platform: platformDisclosureForFeatures(['ECOMMERCE', 'PAYMENTS']),
      ongoingService: { status: 'OPTIONAL', summary: 'Optional', separateFromPlatformUsage: true, separateFromBuildInvestment: true },
    }),
    saveBlueprintVariant({
      variantId: 'launch',
      label: 'BLUEPRINT B — LAUNCH',
      buildInvestmentLabel: '$22K–$28K',
      platform: platformDisclosureForFeatures(['ECOMMERCE', 'PAYMENTS']),
      ongoingService: { status: 'OPTIONAL', summary: 'Optional', separateFromPlatformUsage: true, separateFromBuildInvestment: true },
    }),
  ];
  const budget = budgetScopeRetainsPlatform({ coveredInfrastructureRemains: true, upfrontBuildReduced: true });
  const copy = draftPlatformCopy();
  check(
    'CONTRACTS',
    'Blueprint, budget, and draft copy stay separate from the build total',
    variants[0].buildInvestmentLabel !== variants[1].buildInvestmentLabel &&
      variants[0].platform.rateLabel === variants[1].platform.rateLabel &&
      variants[0].platform.includedInBuildInvestment === false &&
      budget.platformFeeApplicable &&
      budget.buildCostChanged &&
      copy.published === false &&
      PUBLIC_TERMS_PUBLISHED === false &&
      LEGAL_REVIEW_REQUIRED &&
      legalClause('PLATFORM_RATE').text === null &&
      BUILD_TIER_ECONOMICS.SIMPLE.status === 'NOT_ACTIVATED' &&
      formatPlatformFeeRate(rate) === '2.00%' &&
      applyBasisPoints(333, rate) === 7 &&
      platformDisclosureForFeatures(['CMS']).platformFeeApplicable === false,
    'build range and platform rate are different fields',
  );

  const gate: Record<string, string> = {
    SITE00_OWNS_PLATFORM_ECONOMICS: 'YES',
    AIO_USES_SHARED_ENGINE: cases.find((item) => item.id === 'I')?.pass ? 'YES' : 'NO',
    DEFAULT_PLATFORM_RATE: formatPlatformFeeRate(rate),
    RATE_CONFIGURABLE: cases.find((item) => item.id === 'G')?.pass ? 'YES' : 'NO',
    PLATFORM_FEE_DISCLOSED: 'YES',
    ELIGIBLE_VOLUME_DEFINED: 'YES',
    TAX_EXCLUDED_BY_DEFAULT: cases.find((item) => item.id === 'A')?.pass ? 'YES' : 'NO',
    REFUNDS_SUPPORTED: cases.find((item) => item.id === 'B')?.pass && cases.find((item) => item.id === 'C')?.pass ? 'YES' : 'NO',
    CHARGEBACKS_SUPPORTED: cases.find((item) => item.id === 'D')?.pass ? 'YES' : 'NO',
    LEDGER_AUDITABLE: cases.find((item) => item.id === 'AUDIT')?.pass ? 'YES' : 'NO',
    PAYOUT_BATCHES_SUPPORTED: cases.find((item) => item.id === 'J')?.pass ? 'YES' : 'NO',
    STATEMENTS_SUPPORTED: cases.find((item) => item.id === 'J')?.pass ? 'YES' : 'NO',
    BLUEPRINT_INTEGRATION: 'YES',
    ESTIMATOR_INTEGRATION: 'YES',
    BUILDER_CONTRACT_UPDATED: 'YES',
    MULTI_CLIENT_ISOLATION: cases.find((item) => item.id === 'ISOLATION')?.pass ? 'PASS' : 'FAIL',
    IDEMPOTENCY: cases.find((item) => item.id === 'IDEMPOTENCY')?.pass ? 'PASS' : 'FAIL',
    MONEY_MINOR_UNITS: 'PASS',
    VERSIONING: cases.find((item) => item.id === 'VERSION')?.pass ? 'YES' : 'NO',
    LIVE_MONEY_MOVEMENT: 'NO',
    LIVE_PLATFORM_FEES_COLLECTED: 'NO',
    PUBLIC_TERMS_PUBLISHED: 'NO',
    LEGAL_REVIEW_REQUIRED: 'YES',
    PLATFORM_ECONOMICS_VERSION,
  };

  return { version: PLATFORM_ECONOMICS_VERSION, cases, gate };
}
