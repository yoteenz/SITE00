import type { PlatformBooks } from './books';
import { formatMinorForDisplay } from './format';
import { agreementDeductionActive, clientFacingAgreementState, type ClientFacingAgreementState } from './presentation';
import { formatPlatformFeeRate } from './rate';
import type { LedgerEntry, PlatformActor, PlatformStatement } from './types';

export type ValueState = 'ESTIMATED' | 'PENDING' | 'POSTED' | 'SETTLED' | 'UNAVAILABLE';

export type MoneyFigure = {
  currency: string;
  minor: number;
  display: string;
  state: ValueState;
};

export type UnavailableFigure = { state: 'UNAVAILABLE'; reason: string };

export type ClientFinancialStatement = {
  ok: true;
  statementId: string;
  clientOrgId: string;
  projectId: string;
  periodStart: string;
  periodEnd: string;
  agreementId: string | null;
  agreementVersion: string | null;
  agreementPresentation: ClientFacingAgreementState | 'UNKNOWN';
  deductionActive: boolean;
  agreedRateBasisPoints: number | null;
  agreedRateLabel: string | null;
  rateNote: string | null;
  gross: MoneyFigure;
  eligible: MoneyFigure;
  excluded: MoneyFigure;
  refundAdjustments: MoneyFigure;
  disputeAdjustments: MoneyFigure;
  platformShare: MoneyFigure;
  processorFees: MoneyFigure | UnavailableFigure;
  clientNetProceeds: MoneyFigure | UnavailableFigure;
  payout: {
    status: 'NONE' | 'DRAFT';
    pendingMinor: number;
    pendingDisplay: string;
    settledMinor: 0;
    settledState: 'SETTLED';
    note: string;
    liveMovement: false;
  };
  statementStatus: 'EMPTY' | 'POSTED' | 'PENDING_PAYOUT';
  currency: string;
  generatedAt: string;
  sourceLedgerEntryIds: string[];
  historicalVersions: { agreementVersion: string; economicsVersion: string; rateBasisPoints: number }[];
  export: { available: false; reason: 'EXPORT_NOT_IMPLEMENTED' };
  mixesSettledWithPending: false;
};

export type ClientStatementResult = ClientFinancialStatement | { ok: false; code: string };

function posted(currency: string, minor: number): MoneyFigure {
  return { currency, minor, display: formatMinorForDisplay(currency, minor), state: 'POSTED' };
}

export function clientStatement(books: PlatformBooks, input: {
  projectId: string;
  periodStart: string;
  periodEnd: string;
  actor: PlatformActor;
}): ClientStatementResult {
  const built = books.buildStatement(input.projectId, input.periodStart, input.periodEnd, input.actor);
  if (!built.ok) return built;
  const read = books.readProject(input.actor, input.projectId);
  if (!read.ok) return read;
  return shapeStatement(books, built.statement, read.entries.filter((entry) => built.statement.sourceLedgerEntryIds.includes(entry.ledgerEntryId)));
}

export function clientStatementHistory(books: PlatformBooks, input: {
  projectId: string;
  actor: PlatformActor;
  periods: readonly { periodStart: string; periodEnd: string }[];
}): ClientStatementResult[] {
  return input.periods.map((period) =>
    clientStatement(books, { projectId: input.projectId, actor: input.actor, periodStart: period.periodStart, periodEnd: period.periodEnd }),
  );
}

export type TransactionBreakdownRow = {
  sourceTransactionId: string;
  grossMinor: number;
  eligibleMinor: number;
  exclusionLines: LedgerEntry['exclusionLines'];
  rateBasisPoints: number;
  platformFeeMinor: number;
  adjustmentsMinor: number;
  currency: string;
  refundOrDispute: string | null;
};

export function clientTransactionBreakdown(books: PlatformBooks, input: {
  projectId: string;
  actor: PlatformActor;
  sourceTransactionId?: string;
}): { ok: true; rows: TransactionBreakdownRow[] } | { ok: false; code: string } {
  const read = books.readProject(input.actor, input.projectId);
  if (!read.ok) return read;
  const ids = [...new Set(read.entries.map((entry) => entry.sourceTransactionId).filter((id): id is string => Boolean(id)))];
  const wanted = input.sourceTransactionId ? ids.filter((id) => id === input.sourceTransactionId) : ids;
  const rows: TransactionBreakdownRow[] = [];
  for (const sourceTransactionId of wanted) {
    const explained = books.explain(sourceTransactionId, input.actor);
    if (!explained.ok) return explained;
    const capture = explained.entries.find((entry) => entry.eventType === 'TRANSACTION_CAPTURED');
    if (capture && capture.projectId !== input.projectId) continue;
    const kinds = explained.entries.map((entry) => entry.adjustmentKind).filter(Boolean);
    rows.push({
      sourceTransactionId,
      grossMinor: explained.grossMinor,
      eligibleMinor: explained.eligibleMinor,
      exclusionLines: capture?.exclusionLines ?? [],
      rateBasisPoints: explained.rateBasisPoints,
      platformFeeMinor: explained.platformFeeMinor,
      adjustmentsMinor: explained.adjustmentsMinor,
      currency: explained.currency,
      refundOrDispute: kinds.includes('REFUND') ? 'REFUND' : kinds.includes('CHARGEBACK') ? 'CHARGEBACK' : null,
    });
  }
  return { ok: true, rows };
}

function shapeStatement(books: PlatformBooks, statement: PlatformStatement, rows: LedgerEntry[]): ClientFinancialStatement {
  const currency = statement.currency;
  const captures = rows.filter((entry) => entry.eventType === 'TRANSACTION_CAPTURED');
  const agreementIds = [...new Set(rows.map((entry) => entry.agreementId))];
  const agreement = agreementIds.length === 1 ? books.getAgreement(agreementIds[0]!) : agreementIds.length === 0 ? currentAgreement(books, statement.projectId) : null;
  const mixed = agreementIds.length > 1;
  const grossMinor = captures.reduce((total, entry) => total + entry.gross.minor, 0);
  const excludedMinor = captures.reduce((total, entry) => total + entry.excluded.minor, 0);
  const refundMinor = rows.filter((entry) => entry.eventType === 'REFUND_APPLIED').reduce((total, entry) => total + entry.refund.minor, 0);
  const disputeMinor = rows.filter((entry) => entry.eventType === 'CHARGEBACK_APPLIED').reduce((total, entry) => total + entry.chargeback.minor, 0);
  const processorMinor = captures.reduce((total, entry) => total + (entry.processorFee?.minor ?? 0), 0);
  const processorUnspecified = captures.some((entry) => entry.processorFeeTreatment === 'UNSPECIFIED');
  const processorIncluded = captures.every((entry) => entry.processorFeeTreatment === 'INCLUDED');
  const processorExcluded = captures.length > 0 && captures.every((entry) => entry.processorFeeTreatment === 'EXCLUDED');
  const platformMinor = statement.netSettlement.minor;
  const batches = books.listBatches().filter((batch) => batch.projectId === statement.projectId && batch.status === 'DRAFT');
  const pendingMinor = batches.reduce((total, batch) => total + batch.netPayout.minor, 0);
  const historicalVersions = uniqueHistory(rows);
  const empty = captures.length === 0 && rows.length === 0;

  let clientNetProceeds: MoneyFigure | UnavailableFigure;
  if (empty) {
    clientNetProceeds = posted(currency, 0);
  } else if (processorUnspecified || mixed) {
    clientNetProceeds = { state: 'UNAVAILABLE', reason: processorUnspecified ? 'PROCESSOR_FEE_TREATMENT_UNSPECIFIED' : 'MIXED_AGREEMENTS_IN_PERIOD' };
  } else if (processorIncluded) {
    const minor = statement.eligibleVolume.minor - platformMinor - processorMinor;
    clientNetProceeds = minor < 0 ? { state: 'UNAVAILABLE', reason: 'CLIENT_PROCEEDS_NOT_RECONCILED' } : posted(currency, minor);
  } else if (processorExcluded) {
    const minor = statement.eligibleVolume.minor - platformMinor;
    clientNetProceeds = minor < 0 ? { state: 'UNAVAILABLE', reason: 'CLIENT_PROCEEDS_NOT_RECONCILED' } : posted(currency, minor);
  } else {
    clientNetProceeds = { state: 'UNAVAILABLE', reason: 'PROCESSOR_FEE_TREATMENT_UNSPECIFIED' };
  }

  return {
    ok: true,
    statementId: statement.statementId,
    clientOrgId: statement.clientOrgId,
    projectId: statement.projectId,
    periodStart: statement.periodStart,
    periodEnd: statement.periodEnd,
    agreementId: agreement?.agreementId ?? null,
    agreementVersion: mixed ? null : (captures[0]?.agreementVersion ?? agreement?.agreementVersion ?? null),
    agreementPresentation: agreement ? clientFacingAgreementState(agreement.status) : 'UNKNOWN',
    deductionActive: agreement ? agreementDeductionActive(agreement.status, agreement.platformFeeApplicable) : false,
    agreedRateBasisPoints: mixed ? null : (statement.platformFeeRateBasisPoints ?? agreement?.platformFeeRateBasisPoints ?? null),
    agreedRateLabel: mixed || (statement.platformFeeRateBasisPoints ?? agreement?.platformFeeRateBasisPoints) == null
      ? null
      : formatPlatformFeeRate(statement.platformFeeRateBasisPoints ?? agreement?.platformFeeRateBasisPoints ?? 0),
    rateNote: mixed ? 'This period includes more than one agreement. Each transaction keeps the rate recorded on it.' : null,
    gross: posted(currency, grossMinor),
    eligible: posted(currency, statement.eligibleVolume.minor),
    excluded: posted(currency, excludedMinor),
    refundAdjustments: posted(currency, refundMinor),
    disputeAdjustments: posted(currency, disputeMinor),
    platformShare: posted(currency, platformMinor),
    processorFees: processorUnspecified && processorMinor === 0
      ? { state: 'UNAVAILABLE', reason: 'PROCESSOR_FEE_NOT_RECORDED' }
      : posted(currency, processorMinor),
    clientNetProceeds,
    payout: {
      status: batches.length > 0 ? 'DRAFT' : 'NONE',
      pendingMinor,
      pendingDisplay: formatMinorForDisplay(currency, pendingMinor),
      settledMinor: 0,
      settledState: 'SETTLED',
      note: 'A draft payout is the posted share waiting to be paid. It is not a second fee. Nothing in this version has settled.',
      liveMovement: false,
    },
    statementStatus: empty ? 'EMPTY' : batches.length > 0 ? 'PENDING_PAYOUT' : 'POSTED',
    currency,
    generatedAt: statement.createdAt,
    sourceLedgerEntryIds: statement.sourceLedgerEntryIds,
    historicalVersions,
    export: { available: false, reason: 'EXPORT_NOT_IMPLEMENTED' },
    mixesSettledWithPending: false,
  };
}

function currentAgreement(books: PlatformBooks, projectId: string) {
  const rows = books.listAgreements().filter((agreement) => agreement.projectId === projectId);
  return (
    rows.find((agreement) => agreement.status === 'ACTIVE') ??
    [...rows].reverse().find((agreement) => agreement.status !== 'SUPERSEDED' && agreement.status !== 'ENDED') ??
    rows.at(-1) ??
    null
  );
}

function uniqueHistory(rows: LedgerEntry[]) {
  const seen = new Set<string>();
  const versions: ClientFinancialStatement['historicalVersions'] = [];
  for (const entry of rows) {
    if (entry.eventType !== 'TRANSACTION_CAPTURED' && entry.eventType !== 'PLATFORM_FEE_ACCRUED') continue;
    const key = `${entry.agreementVersion}:${entry.economicsVersion}:${entry.platformFeeRateBasisPoints}`;
    if (seen.has(key)) continue;
    seen.add(key);
    versions.push({
      agreementVersion: entry.agreementVersion,
      economicsVersion: entry.economicsVersion,
      rateBasisPoints: entry.platformFeeRateBasisPoints,
    });
  }
  return versions;
}
