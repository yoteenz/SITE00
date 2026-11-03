/**
 * F09-owned safe-to-spend formula (W0.6 / W3). F03/F04 consume; they must not recompute independently.
 *
 * ACCOUNTING INVARIANT (JURNL/MANIFEST/FINANCIAL_OS_UNIFICATION_V1/JURNL_SAFE_TO_SPEND_INVARIANT.md):
 *
 *   SAFE TO SPEND = CASH
 *                 − BILLS DUE        Σ still-due amount of every active bill / subscription occurrence due within the
 *                                    next STS_WINDOW_DAYS (overdue included). Each occurrence once: amount − paid.
 *                 − CARD PAYMENTS    Σ minimum still left on each card due within the window (minimum − paid).
 *                 − HELD − SAFETY BUFFER − PLANS − GOALS − PURCHASES − TRIPS   (unchanged from W3)
 *
 *   CASH = money held in asset accounts that count toward Safe to Spend (bookkeeping balances). Credit available is
 *          never cash, and a credit purchase does not lower cash (it raises what the card is owed).
 *   Money SET ASIDE for a bill is part of that bill's BILLS DUE amount. It is never deducted a second time.
 *   A paid occurrence leaves BILLS DUE (its payment already lowered CASH); the next occurrence counts only if it falls
 *   in the window.
 */

import type { SetupDraft } from '../f02/setupDraft';
import { getSetupDraft } from '../f02/setupDraft';
import { MOCK_CASH, MOCK_UPCOMING } from '../home/mockScenario';
import type { LedgerEntry, UpcomingItem } from '../home/moneyTypes';
import { addDays, compareCalendarDates, getTodayKey, type CalendarDate } from '../foundation/dates';
import { getRepository } from '../repository/deviceRepository';
import { totalPlanAssigned, listPlanIntentions } from '../f08/planStore';
import { totalGoalSetAside } from '../f14/goalsStore';
import { totalPurchaseReserved } from '../f10/purchasesStore';
import { totalTripReserved } from '../f11/tripsStore';
import { computeLedgerPositions, sumCents, toCents } from '../ledger/accounting';
import { accountReservationHealth, reservedFor } from '../f07/reservations';
import { scheduledOccurrences, STS_WINDOW_DAYS } from '../f07/obligationLifecycle';
import { cardsWithKnownMinimum, creditPaymentProjections } from '../f12/creditStore';
import { computeMoneyPicture } from '../ledger/moneyPicture';
import { creditAccounts } from '../foundation/accounts';

export type SafeToSpendCompleteness = 'COMPLETE' | 'PARTIAL' | 'UNSTATED' | 'NEEDS_SETUP' | 'NEEDS_ACCOUNT';

/** Plain words for each completeness level (never show the internal code). */
export const COMPLETENESS_LABEL: Record<SafeToSpendCompleteness, string> = {
  COMPLETE: 'COMPLETE',
  PARTIAL: 'SOME AMOUNTS MISSING',
  UNSTATED: 'NOT ENOUGH KNOWN',
  NEEDS_SETUP: 'FINISH SETUP',
  NEEDS_ACCOUNT: 'ADD AN ACCOUNT',
};

/** Plain words for where each line comes from. */
export const SOURCE_LABEL: Record<string, string> = {
  MOCK: 'SAMPLE',
  ACCOUNTS: 'YOUR ACCOUNTS',
  DERIVED: 'CALCULATED',
  SETUP: 'YOUR BILLS',
  PLAN: 'YOUR PLAN',
  GOALS: 'YOUR GOALS',
  NONE: 'NONE',
};

export type BillOccurrenceLine = {
  obligation_id: string;
  name: string;
  due_date: CalendarDate;
  remaining: number;
  reserved: number;
  account_id: string | null;
  kind: 'BILL' | 'SUBSCRIPTION';
};

export type CardPaymentLine = { account_id: string; name: string; due_date: CalendarDate; remaining: number; reserved: number; payment_account_id: string | null };

export type AccountShortfall = { account_id: string; name: string; held: number; committed: number; short: number };

/** A transfer or card payment from a Safe to Spend account that has not left yet: committed, not spendable. */
export type TransferCommitLine = { link_id: string; from_account_id: string; to_account_id: string | null; amount: number; state: string; date: CalendarDate | null; kind: 'TRANSFER' | 'CARD_PAYMENT' };

export type SafeToSpendHorizon = 'NEXT_30_DAYS' | 'BEFORE_NEXT_INCOME';

export type SafeToSpendBreakdown = {
  cash: number;
  /** Bills and subscriptions still due in the window (part set aside or not). */
  upcoming: number;
  protected: number;
  assigned: number;
  goalReserved: number;
  purchaseReserved: number;
  tripReserved: number;
  safetyBuffer: number;
  value: number;
  cashSource: 'MOCK' | 'ACCOUNTS' | 'DERIVED';
  upcomingSource: 'MOCK' | 'SETUP' | 'DERIVED';
  protectedSource: 'SETUP' | 'DERIVED';
  assignedSource: 'PLAN' | 'NONE';
  goalReservedSource: 'GOALS' | 'NONE';
  valueSource: 'DERIVED';
  completeness: SafeToSpendCompleteness;
  setupObligationCount: number;
  unknownUpcoming: boolean;
  /** @deprecated use safetyBuffer + protected — kept for transitional UI */
  userBuffer: number;
  /** Card minimums still due in the window. */
  cardPayments: number;
  /** Money set aside toward the bills and card payments above (already inside them, not deducted again). */
  reservedForPayments: number;
  /** Bills + card payments not yet covered by money set aside. */
  unfundedCommitments: number;
  /** Money held across every asset account (including ones excluded from Safe to Spend). */
  totalAssets: number;
  /** Owed on cards and loans (shown separately; never subtracted from cash here). */
  owedOnCards: number;
  windowDays: number;
  windowEnd: CalendarDate;
  billLines: BillOccurrenceLine[];
  cardLines: CardPaymentLine[];
  /** Accounts expected to pay more in the window than they hold. */
  accountShortfalls: AccountShortfall[];
  /** Accounts with more set aside than they hold (after later spending). */
  overSetAside: { account_id: string; name: string; overBy: number }[];
  /** Recorded entries with no known account (counted in cash, flagged). */
  unassignedEntries: number;
  /** Which planning period this reading covers (the canonical number is NEXT_30_DAYS). */
  horizon: SafeToSpendHorizon;
  /** Transfers and card payments from a Safe to Spend account that have not left yet (planned, started, unconfirmed). */
  committedTransfers: number;
  transferLines: TransferCommitLine[];
  /** Money that left one account and has not reached the other. Never spendable; shown separately. */
  inTransit: number;
  /** Available in accounts + in transit (labelled TOTAL TRACKED ASSETS; never the spendable figure). */
  trackedAssets: number;
  /** Legacy transfers that need the user to say whether money moved. */
  transfersToConfirm: number;
  /** Bills linked to a card whose minimum is known: counted once, through the card (not in BILLS DUE). */
  linkedCardBills: { obligation_id: string; name: string; card_account_id: string }[];
  /** Unlinked bills that look like a card's payment (possibly counted twice until linked). */
  possibleDuplicates: { obligation_id: string; name: string; card_account_id: string; card_name: string }[];
};

export function protectedAmountFromSetup(draft: SetupDraft): number {
  const raw = draft.protectedAmount.trim();
  if (!raw || draft.protectedSkipped) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export function safetyBufferFromSettings(): number {
  const raw = getRepository().getSettings().safeToSpendBuffer.trim();
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function setupObligationsAsUpcoming(draft: SetupDraft): UpcomingItem[] {
  return draft.obligations.map((o, i) => ({
    id: `up-setup-${i}`,
    name: o.name,
    when: o.cadence,
    amount: 0,
    kind: 'BILL' as const,
    source: 'SETUP' as const,
  }));
}

/** Cash for Safe to Spend: bookkeeping balances of eligible asset accounts (+ unassigned recorded entries, flagged). */
export function cashForSafeToSpend(entries: LedgerEntry[], today: CalendarDate = getTodayKey()): { cash: number; source: SafeToSpendBreakdown['cashSource']; unassigned: number; totalAssets: number; owed: number } {
  const snap = getRepository().getSnapshot();
  const { positions, unassigned } = computeLedgerPositions(snap.accounts, snap.creditAttributes, entries, today);
  const assets = positions.filter((p) => p.nature === 'ASSET');
  const eligible = assets.filter((p) => p.account.include_in_safe_to_spend);
  const totalAssets = sumCents(assets.map((p) => p.held));
  const owed = sumCents(positions.map((p) => p.owed));
  if (eligible.length) {
    // Only seeded sample accounts → this is the preview, and the number says so (SAMPLE), with sample bills.
    const source: SafeToSpendBreakdown['cashSource'] = eligible.some((p) => p.basis !== 'SAMPLE') ? 'ACCOUNTS' : 'MOCK';
    return { cash: toCents(sumCents(eligible.map((p) => p.held)) + unassigned.delta), source, unassigned: unassigned.count, totalAssets, owed };
  }
  // Preview: no eligible account → the sample cash figure plus everything the user recorded on asset accounts.
  const recorded = sumCents(assets.map((p) => p.recordedDelta));
  return { cash: toCents(MOCK_CASH + recorded + unassigned.delta), source: 'MOCK', unassigned: unassigned.count, totalAssets, owed };
}

/** The canonical Safe to Spend: the next 30 days. Every surface reads this number. */
export function computeSafeToSpend(draft: SetupDraft = getSetupDraft(), entries: LedgerEntry[] = getRepository().listTransactions()): SafeToSpendBreakdown {
  return computeSafeToSpendThrough(addDays(getTodayKey(), STS_WINDOW_DAYS), 'NEXT_30_DAYS', draft, entries);
}

/**
 * The one formula, for any planning period ending on `horizonEnd` (inclusive; overdue items always included).
 * Pure read: computing another period never writes or changes the canonical 30-day number.
 */
export function computeSafeToSpendThrough(
  horizonEnd: CalendarDate,
  horizon: SafeToSpendHorizon,
  draft: SetupDraft = getSetupDraft(),
  entries: LedgerEntry[] = getRepository().listTransactions(),
): SafeToSpendBreakdown {
  const today = getTodayKey();
  const windowEnd = horizonEnd;
  const snap = getRepository().getSnapshot();
  const reservations = snap.reservations ?? [];
  const held = protectedAmountFromSetup(draft);
  const safetyBuffer = safetyBufferFromSettings();
  const repoObligations = getRepository().listObligations();
  // A plan line linked to a tracked bill is that bill's money, already inside BILLS DUE: do not count it twice.
  const activeObligationIds = new Set(repoObligations.map((o) => o.obligation_id));
  const linkedPlanAssigned = sumCents(listPlanIntentions().filter((p) => p.linked_obligation_id && activeObligationIds.has(p.linked_obligation_id)).map((p) => Math.max(0, p.assigned_amount)));
  const assigned = toCents(totalPlanAssigned() - linkedPlanAssigned);
  const goalReserved = totalGoalSetAside();
  const purchaseReserved = totalPurchaseReserved();
  const tripReserved = totalTripReserved();
  const { cash, source: cashSource, unassigned, totalAssets, owed } = cashForSafeToSpend(entries, today);

  let upcoming = 0;
  let upcomingSource: SafeToSpendBreakdown['upcomingSource'] = 'DERIVED';
  let unknownUpcoming = false;
  const billLines: BillOccurrenceLine[] = [];

  const knownCards = cardsWithKnownMinimum(today);
  const linkedCardBills: SafeToSpendBreakdown['linkedCardBills'] = [];
  if (repoObligations.length) {
    upcomingSource = 'SETUP';
    for (const ob of repoObligations) {
      // A bill that IS a card's payment is counted once, through the card's minimum (stable card reference).
      if (ob.linked_card_account_id && knownCards.has(ob.linked_card_account_id)) {
        linkedCardBills.push({ obligation_id: ob.obligation_id, name: ob.name, card_account_id: ob.linked_card_account_id });
        continue;
      }
      if (!(ob.amount > 0)) {
        unknownUpcoming = true;
        continue;
      }
      for (const occ of scheduledOccurrences(ob, entries, windowEnd)) {
        if (occ.remaining <= 0) continue;
        billLines.push({
          obligation_id: ob.obligation_id,
          name: ob.name,
          due_date: occ.due_date,
          remaining: occ.remaining,
          reserved: occ.isCurrent ? Math.min(occ.remaining, reservedFor(reservations, 'OBLIGATION', ob.obligation_id, occ.due_date)) : 0,
          account_id: ob.account_id,
          kind: ob.kind,
        });
      }
    }
    upcoming = sumCents(billLines.map((l) => l.remaining));
  } else if (draft.obligations.length) {
    upcomingSource = 'SETUP';
    for (const item of setupObligationsAsUpcoming(draft)) {
      if (item.amount > 0) upcoming += item.amount;
      else unknownUpcoming = true;
    }
  } else if (cashSource === 'MOCK') {
    // Full preview (sample cash): the sample bills go with it.
    upcomingSource = 'MOCK';
    upcoming = MOCK_UPCOMING.reduce((sum, item) => sum + item.amount, 0);
  } else {
    // Real accounts and no bills entered: nothing is deducted for bills (no sample bills against real balances).
    upcomingSource = 'DERIVED';
    upcoming = 0;
  }

  const cardLines: CardPaymentLine[] = creditPaymentProjections(today)
    .filter((p) => compareCalendarDates(p.due_date, windowEnd) <= 0)
    .map((p) => ({
      account_id: p.account_id,
      name: p.label,
      due_date: p.due_date,
      remaining: p.amount,
      reserved: Math.min(p.amount, reservedFor(reservations, 'CARD_PAYMENT', p.account_id)),
      payment_account_id: p.payment_account_id,
    }));
  const cardPayments = sumCents(cardLines.map((l) => l.remaining));
  const reservedForPayments = sumCents([...billLines.map((l) => l.reserved), ...cardLines.map((l) => l.reserved)]);

  // Transfers / card payments from a Safe to Spend account that have not left yet are committed (not spendable).
  // In-transit money already left its source and is not in any account's balance, so it is not in CASH.
  const picture = computeMoneyPicture(snap.accounts, snap.creditAttributes, entries, today);
  const positions = picture.positions;
  const eligibleIds = new Set(positions.filter((p) => p.nature === 'ASSET' && p.account.include_in_safe_to_spend).map((p) => p.account_id));
  const transferLines: TransferCommitLine[] = picture.transfers
    .filter(
      (v) =>
        (v.state === 'PENDING' || v.state === 'NEEDS_RECONCILIATION' || (v.state === 'SCHEDULED' && v.date != null && compareCalendarDates(v.date, windowEnd) <= 0))
        && v.fromId != null
        && eligibleIds.has(v.fromId)
        // Between two Safe to Spend accounts a not-yet-sent transfer moves nothing out of the pool — except a legacy
        // record nobody confirmed, which is held back until the user says what happened.
        && (v.state === 'NEEDS_RECONCILIATION' || v.toId == null || !eligibleIds.has(v.toId)),
    )
    .map((v) => ({ link_id: v.linkId, from_account_id: v.fromId!, to_account_id: v.toId, amount: v.amount, state: v.state, date: v.date, kind: v.kind }));
  const committedTransfers = sumCents(transferLines.map((l) => l.amount));
  const unfundedCommitments = toCents(Math.max(0, upcoming + cardPayments - reservedForPayments));

  // Possible duplicates: an unlinked bill whose name names a card that already has a minimum in this period.
  const possibleDuplicates: SafeToSpendBreakdown['possibleDuplicates'] = [];
  for (const ob of repoObligations) {
    if (ob.linked_card_account_id || ob.kind !== 'BILL') continue;
    for (const card of creditAccounts()) {
      if (card.display_name.length < 3 || !knownCards.has(card.account_id) || !cardLines.some((l) => l.account_id === card.account_id)) continue;
      if (ob.name.includes(card.display_name)) possibleDuplicates.push({ obligation_id: ob.obligation_id, name: ob.name, card_account_id: card.account_id, card_name: card.display_name });
    }
  }

  // Account-specific coverage: money in one place does not pay a bill set to come from another.
  const committedBy = new Map<string, number[]>();
  for (const l of billLines) if (l.account_id) committedBy.set(l.account_id, [...(committedBy.get(l.account_id) ?? []), l.remaining]);
  for (const l of cardLines) if (l.payment_account_id) committedBy.set(l.payment_account_id, [...(committedBy.get(l.payment_account_id) ?? []), l.remaining]);
  for (const v of picture.transfers) {
    // Every not-yet-sent transfer out of an account is money that account is committed to send.
    const due = v.state === 'PENDING' || v.state === 'NEEDS_RECONCILIATION' || (v.state === 'SCHEDULED' && v.date != null && compareCalendarDates(v.date, windowEnd) <= 0);
    if (due && v.fromId) committedBy.set(v.fromId, [...(committedBy.get(v.fromId) ?? []), v.amount]);
  }
  const accountShortfalls: AccountShortfall[] = [];
  for (const [accountId, amounts] of committedBy) {
    const pos = positions.find((p) => p.account_id === accountId);
    if (!pos || pos.nature !== 'ASSET') continue;
    const committed = sumCents(amounts);
    const short = toCents(committed - Math.max(0, pos.held));
    if (short > 0) accountShortfalls.push({ account_id: accountId, name: pos.account.display_name, held: pos.held, committed, short });
  }
  const overSetAside = accountReservationHealth(positions, reservations)
    .filter((h) => h.overBy > 0)
    .map((h) => ({ account_id: h.account_id, name: h.name, overBy: h.overBy }));

  let completeness: SafeToSpendCompleteness = 'COMPLETE';
  if (!draft.started) completeness = 'NEEDS_SETUP';
  else if (draft.accounts === 'SKIPPED' && cashSource === 'MOCK') completeness = 'NEEDS_ACCOUNT';
  else if (draft.accounts === 'SKIPPED' || (!draft.cadence && !draft.amount && draft.started)) completeness = 'UNSTATED';
  else if (unknownUpcoming || repoObligations.some((i) => i.amount <= 0)) completeness = 'PARTIAL';

  const others = held + safetyBuffer + assigned + goalReserved + purchaseReserved + tripReserved;
  const value = toCents(completeness === 'UNSTATED' ? cash - committedTransfers - others : cash - upcoming - cardPayments - committedTransfers - others);

  return {
    cash,
    upcoming: toCents(upcoming),
    protected: held,
    assigned,
    goalReserved,
    purchaseReserved,
    tripReserved,
    safetyBuffer,
    value,
    cashSource,
    upcomingSource,
    protectedSource: held > 0 ? 'SETUP' : 'DERIVED',
    assignedSource: assigned > 0 ? 'PLAN' : 'NONE',
    goalReservedSource: goalReserved > 0 ? 'GOALS' : 'NONE',
    valueSource: 'DERIVED',
    completeness,
    setupObligationCount: repoObligations.length || draft.obligations.length,
    unknownUpcoming,
    userBuffer: held + safetyBuffer,
    cardPayments,
    reservedForPayments,
    unfundedCommitments,
    totalAssets,
    owedOnCards: owed,
    windowDays: STS_WINDOW_DAYS,
    windowEnd,
    billLines,
    cardLines,
    accountShortfalls,
    overSetAside,
    unassignedEntries: unassigned,
    horizon,
    committedTransfers,
    transferLines,
    inTransit: picture.inTransit,
    trackedAssets: picture.trackedAssets,
    transfersToConfirm: picture.transferTotals.needsConfirmation,
    linkedCardBills,
    possibleDuplicates,
  };
}

// ─── Before next income (D1) ─────────────────────────────────────────────────

export type NextIncome = { income_id: string; name: string; date: CalendarDate; amount: number | null; estimated: boolean };

/**
 * The next expected income from F06's schedule (the only income registry). Daily earnings are never forecast:
 * an income source must exist with a date. Amount is null when not known.
 */
export function nextExpectedIncome(today: CalendarDate = getTodayKey()): NextIncome | null {
  const next = getRepository()
    .listIncomeSources()
    .filter((src) => (src.status === 'EXPECTED' || src.status === 'LATE') && compareCalendarDates(src.next_due_date, today) >= 0)
    .sort((a, b) => compareCalendarDates(a.next_due_date, b.next_due_date))[0];
  if (!next) return null;
  return { income_id: next.income_id, name: next.source_name, date: next.next_due_date, amount: next.amount > 0 ? toCents(next.amount) : null, estimated: next.is_estimated || !(next.amount > 0) };
}

export type HorizonLine = { key: string; label: string; due_date: CalendarDate | null; amount: number; kind: 'BILL' | 'CARD' | 'TRANSFER' };

export type NextIncomeView = {
  primary: SafeToSpendBreakdown;
  income: NextIncome | null;
  /** The same formula through the next income date; null when no date is recorded. */
  view: SafeToSpendBreakdown | null;
  /** In the 30-day number but due after the next income. */
  onlyIn30Days: HorizonLine[];
  /** Due before the next income but after the 30-day period (income more than 30 days away). */
  onlyBeforeIncome: HorizonLine[];
};

function horizonLines(b: SafeToSpendBreakdown): HorizonLine[] {
  return [
    ...b.billLines.map((l) => ({ key: `bill:${l.obligation_id}:${l.due_date}`, label: l.name, due_date: l.due_date, amount: l.remaining, kind: 'BILL' as const })),
    ...b.cardLines.map((l) => ({ key: `card:${l.account_id}:${l.due_date}`, label: l.name, due_date: l.due_date, amount: l.remaining, kind: 'CARD' as const })),
    ...b.transferLines.map((l) => ({ key: `xfer:${l.link_id}`, label: l.kind === 'CARD_PAYMENT' ? 'CARD PAYMENT NOT SENT YET' : 'TRANSFER NOT SENT YET', due_date: l.date, amount: l.amount, kind: 'TRANSFER' as const })),
  ];
}

/**
 * The 30-day number plus a second reading through the next expected income. Expected income is never added to
 * money held, and the 30-day number is computed exactly as everywhere else (this function cannot change it).
 */
export function computeNextIncomeView(draft: SetupDraft = getSetupDraft(), entries: LedgerEntry[] = getRepository().listTransactions()): NextIncomeView {
  const primary = computeSafeToSpend(draft, entries);
  const income = nextExpectedIncome();
  if (!income) return { primary, income: null, view: null, onlyIn30Days: [], onlyBeforeIncome: [] };
  const view = computeSafeToSpendThrough(income.date, 'BEFORE_NEXT_INCOME', draft, entries);
  const a = horizonLines(primary);
  const b = horizonLines(view);
  const bKeys = new Set(b.map((l) => l.key));
  const aKeys = new Set(a.map((l) => l.key));
  return { primary, income, view, onlyIn30Days: a.filter((l) => !bKeys.has(l.key)), onlyBeforeIncome: b.filter((l) => !aKeys.has(l.key)) };
}

/** @deprecated Import from f09/safeToSpend — kept for transitional imports via money.ts re-export. */
export type SafeToSpend = SafeToSpendBreakdown;

export function safeToSpend(draft?: SetupDraft, entries?: LedgerEntry[]): SafeToSpendBreakdown {
  return computeSafeToSpend(draft ?? getSetupDraft(), entries ?? getRepository().listTransactions());
}
