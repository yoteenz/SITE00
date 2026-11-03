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
import { creditPaymentProjections } from '../f12/creditStore';

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
    return { cash: toCents(sumCents(eligible.map((p) => p.held)) + unassigned.delta), source: 'ACCOUNTS', unassigned: unassigned.count, totalAssets, owed };
  }
  // Preview: no eligible account → the sample cash figure plus everything the user recorded on asset accounts.
  const recorded = sumCents(assets.map((p) => p.recordedDelta));
  return { cash: toCents(MOCK_CASH + recorded + unassigned.delta), source: 'MOCK', unassigned: unassigned.count, totalAssets, owed };
}

export function computeSafeToSpend(draft: SetupDraft = getSetupDraft(), entries: LedgerEntry[] = getRepository().listTransactions()): SafeToSpendBreakdown {
  const today = getTodayKey();
  const windowEnd = addDays(today, STS_WINDOW_DAYS);
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

  if (repoObligations.length) {
    upcomingSource = 'SETUP';
    for (const ob of repoObligations) {
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
  } else {
    upcomingSource = 'MOCK';
    upcoming = MOCK_UPCOMING.reduce((sum, item) => sum + item.amount, 0);
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
  const unfundedCommitments = toCents(Math.max(0, upcoming + cardPayments - reservedForPayments));

  // Account-specific coverage: money in one place does not pay a bill set to come from another.
  const positions = computeLedgerPositions(snap.accounts, snap.creditAttributes, entries, today).positions;
  const committedBy = new Map<string, number[]>();
  for (const l of billLines) if (l.account_id) committedBy.set(l.account_id, [...(committedBy.get(l.account_id) ?? []), l.remaining]);
  for (const l of cardLines) if (l.payment_account_id) committedBy.set(l.payment_account_id, [...(committedBy.get(l.payment_account_id) ?? []), l.remaining]);
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
  const value = toCents(completeness === 'UNSTATED' ? cash - others : cash - upcoming - cardPayments - others);

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
  };
}

/** @deprecated Import from f09/safeToSpend — kept for transitional imports via money.ts re-export. */
export type SafeToSpend = SafeToSpendBreakdown;

export function safeToSpend(draft?: SetupDraft, entries?: LedgerEntry[]): SafeToSpendBreakdown {
  return computeSafeToSpend(draft ?? getSetupDraft(), entries ?? getRepository().listTransactions());
}
