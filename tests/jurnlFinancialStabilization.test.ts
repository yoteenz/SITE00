/**
 * P0.JURNL.FINANCIAL-OS.FOUNDER-DECISIONS-TRANSFER-SETTLEMENT-AND-E2E-STABILIZATION1 — invariants T01–T28.
 * Synthetic world (tests/helpers/jurnlFinancialWorld.ts): RIDE $300 · BANK $100 · CASH $100 · VISA owes $400 / $2,000.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { addDays, type CalendarDate } from '../src/projects/jurnl/data/foundation/dates';
import { getRepository } from '../src/projects/jurnl/data/repository/deviceRepository';
import { applyOp, recordExpense, recordTransfer, recordTransferStep, removeLinkedEvent } from '../src/projects/jurnl/data/ledger/ledgerOps';
import { computeMoneyPicture } from '../src/projects/jurnl/data/ledger/moneyPicture';
import { allowedActions, transferViews } from '../src/projects/jurnl/data/ledger/transferSettlement';
import { balanceBasis, computeLedgerPositions, entryEffect, isEffective, accountNature, resolveEntryAccount, sumCents, toCents } from '../src/projects/jurnl/data/ledger/accounting';
import { computeNextIncomeView, computeSafeToSpend } from '../src/projects/jurnl/data/f09/safeToSpend';
import { createIncomeSource } from '../src/projects/jurnl/data/f06/incomeStore';
import { saveDailyEarnings } from '../src/projects/jurnl/data/f06/dailyEarnings';
import { createBillOrSubscription, editBillOrSubscription, markObligationPaid, obligationFunding } from '../src/projects/jurnl/data/f07/obligationLifecycle';
import { buildReduceReservation, buildSetAside } from '../src/projects/jurnl/data/f07/reservations';
import { billSetAsideRows } from '../src/projects/jurnl/data/f08/billSetAsides';
import { cardFactsFor, upsertCreditTerms } from '../src/projects/jurnl/data/f12/creditStore';
import { paymentSafety, utilizationPlan } from '../src/projects/jurnl/data/f12/creditGuidance';
import { projectUpcoming } from '../src/projects/jurnl/data/foundation/upcomingProjection';
import { simulatePaydownProjection } from '../src/projects/jurnl/data/f13/paydownStore';
import type { LedgerEntry } from '../src/projects/jurnl/data/home/moneyTypes';
import { TODAY, position, world } from './helpers/jurnlFinancialWorld';

const snap = () => getRepository().getSnapshot();
const picture = () => computeMoneyPicture(snap().accounts, snap().creditAttributes, snap().transactions, TODAY);
const linkOf = (r: ReturnType<typeof recordTransfer>) => (r.ok ? r.value.linkId : '');
const stateOf = (linkId: string) => transferViews(snap().transactions, TODAY).find((v) => v.linkId === linkId)!.state;
const visa = () => snap().accounts.find((a) => a.account_id === 'visa')!;

function bill(name: string, amount: number, dueIn: number, account = 'bank') {
  const r = createBillOrSubscription({ name, amount, cadence: 'MONTHLY', next_due_date: addDays(TODAY, dueIn), kind: 'BILL', account_id: account });
  if (!r.ok) throw new Error(r.error);
  return r.value;
}

function setAside(obId: string, accountId: string, amount: number) {
  const s = snap();
  const ob = s.obligations.find((o) => o.obligation_id === obId)!;
  const f = obligationFunding(ob, s.transactions, s.reservations);
  const pos = computeLedgerPositions(s.accounts, s.creditAttributes, s.transactions, TODAY).positions;
  return applyOp(buildSetAside(s.accounts, pos, s.reservations, { target: { kind: 'OBLIGATION', id: obId, occurrence_date: ob.next_due_date, name: ob.name, cap: f.remaining }, account_id: accountId, amount }));
}

function cardTerms(min = 45, dueIn = 4) {
  upsertCreditTerms('visa', { minimum_payment: min, payment_due_date: addDays(TODAY, dueIn), statement_closing_date: addDays(TODAY, -10), statement_balance: 400 });
}

describe('Transfers — settlement and in-transit money', () => {
  beforeEach(() => world());

  it('T01 a scheduled transfer changes no balance', () => {
    expect(recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 80, occurred_on: addDays(TODAY, 3) }).ok).toBe(true);
    const r = recordTransfer({ from_account_id: 'ride', to_account_id: 'cash', amount: 10, occurred_on: TODAY, start: 'SCHEDULED' });
    expect(stateOf(linkOf(r))).toBe('SCHEDULED');
    expect([position('ride'), position('bank'), position('cash')]).toEqual([300, 100, 100]);
  });

  it('T02 a started transfer whose money has not left changes no balance', () => {
    const r = recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 80, occurred_on: TODAY, start: 'PENDING' });
    expect(stateOf(linkOf(r))).toBe('PENDING');
    expect([position('ride'), position('bank')]).toEqual([300, 100]);
    expect(picture().inTransit).toBe(0);
  });

  it('T03 / T04 money that left the source is out of the source and tracked as in transit', () => {
    const r = recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 80, occurred_on: TODAY, start: 'IN_TRANSIT' });
    expect(stateOf(linkOf(r))).toBe('IN_TRANSIT');
    expect(position('ride')).toBe(220);
    expect(position('bank')).toBe(100);
    const p = picture();
    // The founder's example: RIDE + BANK hold 320; 80 in transit; 400 tracked (cash 100 + 320 + 80 = 500 overall).
    expect(p.inTransit).toBe(80);
    expect(p.availableInAccounts).toBe(420);
    expect(p.trackedAssets).toBe(500);
  });

  it('T05 / T25 money on its way to the bank is not spendable there and cannot pay a bank bill', () => {
    recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 80, occurred_on: TODAY, start: 'IN_TRANSIT' });
    const ob = bill('PHONE', 150, 3);
    const sts = computeSafeToSpend();
    expect(sts.accountShortfalls).toEqual([{ account_id: 'bank', name: 'BANK', held: 100, committed: 150, short: 50 }]);
    // Setting aside more than BANK has settled is refused (the incoming $80 does not count).
    const r = setAside(ob.obligation_id, 'bank', 150);
    expect(r.ok).toBe(false);
    // Cash counts only settled money: RIDE 220 + BANK 100 + CASH 100 = 420 (the $80 in transit is in neither).
    expect(sts.cash).toBe(420);
  });

  it('T06 / T07 arrival credits the destination exactly once, however often it is confirmed', () => {
    const r = recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 80, occurred_on: TODAY, start: 'IN_TRANSIT' });
    const id = linkOf(r);
    const first = recordTransferStep(id, 'RECEIVED');
    expect(first.ok && first.changed).toBe(true);
    expect([position('ride'), position('bank'), picture().inTransit]).toEqual([220, 180, 0]);
    const again = recordTransferStep(id, 'RECEIVED');
    expect(again.ok && again.changed).toBe(false);
    expect(position('bank')).toBe(180);
    expect(stateOf(id)).toBe('COMPLETED');
  });

  it('T08 a failed transfer returns the money correctly', () => {
    const r = recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 80, occurred_on: TODAY, start: 'IN_TRANSIT' });
    const id = linkOf(r);
    recordTransferStep(id, 'FAIL');
    expect(stateOf(id)).toBe('RETURNING');
    expect([position('ride'), position('bank'), picture().inTransit]).toEqual([220, 100, 80]);
    recordTransferStep(id, 'MONEY_RETURNED');
    expect(stateOf(id)).toBe('FAILED');
    expect([position('ride'), position('bank'), picture().inTransit]).toEqual([300, 100, 0]);
    // Failing a transfer whose money never left changes nothing.
    const r2 = recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 20, occurred_on: TODAY, start: 'PENDING' });
    recordTransferStep(linkOf(r2), 'FAIL');
    expect(position('ride')).toBe(300);
  });

  it('T09 an unsent transfer can be cancelled with no change; a sent one cannot be cancelled or deleted', () => {
    const r = recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 80, occurred_on: TODAY, start: 'PENDING' });
    expect(recordTransferStep(linkOf(r), 'CANCEL').ok).toBe(true);
    expect([position('ride'), position('bank')]).toEqual([300, 100]);
    const sent = recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 30, occurred_on: TODAY, start: 'IN_TRANSIT' });
    expect(recordTransferStep(linkOf(sent), 'CANCEL').ok).toBe(false);
    expect(removeLinkedEvent(linkOf(sent)).ok).toBe(false);
    expect(position('ride')).toBe(270);
  });

  it('T10 a cash deposit in transit keeps assets whole without overstating the bank', () => {
    world({ user: 'fin-deposit@jurnl.test' });
    const r = recordTransfer({ from_account_id: 'cash', to_account_id: 'bank', amount: 60, occurred_on: TODAY, start: 'IN_TRANSIT' });
    expect([position('cash'), position('bank')]).toEqual([40, 100]);
    const p = picture();
    expect(p.inTransit).toBe(60);
    expect(p.trackedAssets).toBe(500);
    expect(computeSafeToSpend().cash).toBe(440);
    recordTransferStep(linkOf(r), 'RECEIVED');
    expect([position('cash'), position('bank')]).toEqual([40, 160]);
    // Never income.
    expect(snap().transactions.filter((t) => t.txn_class === 'INCOME')).toHaveLength(0);
  });

  it('T12 legacy "still on its way" records need confirmation and change nothing until confirmed', () => {
    const now = new Date().toISOString();
    const leg = (id: string, account: string, counter: string, dir: 'INCOME' | 'EXPENSE', leg: 'OUT' | 'IN'): LedgerEntry => ({
      id, merchant: 'OLD TRANSFER', amount: 50, direction: dir, when: TODAY, account: account.toUpperCase(), account_id: account, category: 'TRANSFER',
      status: 'PENDING', recurring: false, memo: '', source: 'ADDED', related: null, txn_class: 'TRANSFER', occurred_on: TODAY, recorded_at: now,
      confirmation: 'PENDING_CONFIRMATION', origin_family: 'F05', link: { kind: 'TRANSFER', id: 'xfer-legacy', leg }, counterparty_account_id: counter,
    });
    getRepository().commit({ reason: 'LEGACY', transactions: { upsert: [leg('legacy-out', 'ride', 'bank', 'EXPENSE', 'OUT'), leg('legacy-in', 'bank', 'ride', 'INCOME', 'IN')] } });
    expect(stateOf('xfer-legacy')).toBe('NEEDS_RECONCILIATION');
    expect([position('ride'), position('bank')]).toEqual([300, 100]);
    expect(computeSafeToSpend().transfersToConfirm).toBe(1);
    expect(allowedActions('NEEDS_RECONCILIATION')).toEqual(['LEFT_SOURCE', 'RECEIVED', 'CANCEL', 'FAIL']);
    recordTransferStep('xfer-legacy', 'RECEIVED');
    expect([position('ride'), position('bank')]).toEqual([250, 150]);
    // A legacy CLEARED transfer stays completed (unchanged meaning of "ARRIVED").
    const done = { ...leg('legacy2-out', 'ride', 'cash', 'EXPENSE', 'OUT'), status: 'CLEARED' as const, link: { kind: 'TRANSFER' as const, id: 'xfer-legacy2', leg: 'OUT' as const } };
    const doneIn = { ...leg('legacy2-in', 'cash', 'ride', 'INCOME', 'IN'), status: 'CLEARED' as const, link: { kind: 'TRANSFER' as const, id: 'xfer-legacy2', leg: 'IN' as const } };
    getRepository().commit({ reason: 'LEGACY', transactions: { upsert: [done, doneIn] } });
    expect(stateOf('xfer-legacy2')).toBe('COMPLETED');
    expect(position('cash')).toBe(150);
  });

  it('a not-yet-sent transfer to an account outside Safe to Spend is held back from it once', () => {
    world({ user: 'fin-committed@jurnl.test' });
    const s0 = computeSafeToSpend().value;
    getRepository().commit({ reason: 'TEST', accounts: { upsert: [{ ...snap().accounts.find((a) => a.account_id === 'cash')!, include_in_safe_to_spend: false }] } });
    const base = computeSafeToSpend().value;
    expect(base).toBe(s0 - 100);
    recordTransfer({ from_account_id: 'bank', to_account_id: 'cash', amount: 40, occurred_on: TODAY, start: 'PENDING' });
    expect(computeSafeToSpend().value).toBe(base - 40);
    // Between two Safe to Spend accounts a planned move changes nothing.
    recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 40, occurred_on: TODAY, start: 'PENDING' });
    expect(computeSafeToSpend().value).toBe(base - 40);
  });
});

describe('Card payments — settlement and minimums', () => {
  beforeEach(() => {
    world();
    cardTerms();
  });

  it('T11 a payment on its way does not settle the card; the minimum is counted once', () => {
    const before = computeSafeToSpend();
    expect(before.cardPayments).toBe(45);
    const r = recordTransfer({ from_account_id: 'ride', to_account_id: 'visa', amount: 45, occurred_on: TODAY, start: 'PENDING' });
    const f = cardFactsFor(visa())!;
    expect(f.owed).toBe(400);
    expect(f.remainingMinimum).toBe(45);
    expect(f.remainingMinimumAfterPending).toBe(0);
    expect(paymentSafety(f, TODAY).state).toBe('PAYMENT_PENDING');
    const mid = computeSafeToSpend();
    expect(mid.cardPayments).toBe(0);
    expect(mid.committedTransfers).toBe(45);
    expect(mid.value).toBe(before.value);
    recordTransferStep(linkOf(r), 'LEFT_SOURCE');
    const sent = computeSafeToSpend();
    expect([position('ride'), position('visa')]).toEqual([255, 400]);
    expect(sent.value).toBe(before.value);
    recordTransferStep(linkOf(r), 'RECEIVED');
    expect(position('visa')).toBe(355);
    expect(paymentSafety(cardFactsFor(visa())!, TODAY).state).toBe('MINIMUM_PAID');
    expect(computeSafeToSpend().value).toBe(before.value);
  });

  it('T16 a bill that is the card payment is counted once (linked), and flagged when not linked', () => {
    const r = createBillOrSubscription({ name: 'VISA PAYMENT', amount: 45, cadence: 'MONTHLY', next_due_date: addDays(TODAY, 4), kind: 'BILL', account_id: 'ride' });
    const ob = r.ok ? r.value : null!;
    const unlinked = computeSafeToSpend();
    expect(unlinked.possibleDuplicates.map((d) => d.obligation_id)).toEqual([ob.obligation_id]);
    editBillOrSubscription(ob, { name: ob.name, amount: 45, cadence: 'MONTHLY', next_due_date: ob.next_due_date, kind: 'BILL', account_id: 'ride' });
    getRepository().commit({ reason: 'LINK', obligations: { upsert: [{ ...snap().obligations.find((o) => o.obligation_id === ob.obligation_id)!, linked_card_account_id: 'visa' }] } });
    const linked = computeSafeToSpend();
    expect(linked.cardPayments).toBe(45);
    expect(linked.upcoming).toBe(0);
    expect(linked.linkedCardBills.map((l) => l.obligation_id)).toEqual([ob.obligation_id]);
    expect(linked.value).toBe(unlinked.value + 45);
    const rows = projectUpcoming(getRepository().listIncomeSources(), getRepository().listObligations()).filter((i) => i.direction === 'MONEY_OUT');
    expect(rows.map((i) => i.label)).toEqual(['VISA PAYMENT']);
    expect(rows[0]!.source_domain).toBe('CREDIT_PAYMENT');
    // Marking the linked bill paid would be spending; it is refused in favour of a card payment.
    expect(markObligationPaid(snap().obligations.find((o) => o.obligation_id === ob.obligation_id)!, { amount: 45, account_id: 'ride', paid_on: TODAY }).ok).toBe(false);
  });

  it('T17 only confirmed payments in this billing cycle reduce the minimum', () => {
    recordTransfer({ from_account_id: 'ride', to_account_id: 'visa', amount: 20, occurred_on: addDays(TODAY, -12) });
    expect(cardFactsFor(visa())!.remainingMinimum).toBe(45);
    recordTransfer({ from_account_id: 'ride', to_account_id: 'visa', amount: 25, occurred_on: TODAY });
    expect(cardFactsFor(visa())!.remainingMinimum).toBe(20);
    // Without a statement closing date no payment can be matched to the cycle: the minimum stays, payment is flagged.
    upsertCreditTerms('visa', { statement_closing_date: null });
    const f = cardFactsFor(visa())!;
    expect(f.remainingMinimum).toBe(45);
    // Both payments (12 days ago and today) are recorded but cannot be matched to a statement.
    expect(f.unmatchedPayments).toBe(45);
  });

  it('T18 an extra payment is never an additional minimum; a simulated paydown changes nothing', () => {
    const before = computeSafeToSpend().value;
    simulatePaydownProjection(TODAY, 500);
    expect(computeSafeToSpend().value).toBe(before);
    recordTransfer({ from_account_id: 'ride', to_account_id: 'visa', amount: 200, occurred_on: TODAY });
    const f = cardFactsFor(visa())!;
    expect(f.remainingMinimum).toBe(0);
    expect(computeSafeToSpend().cardPayments).toBe(0);
    expect(position('visa')).toBe(200);
  });

  it('T26 utilization never assumes a pending payment has reached the card', () => {
    recordTransfer({ from_account_id: 'ride', to_account_id: 'visa', amount: 300, occurred_on: TODAY, start: 'IN_TRANSIT' });
    const f = cardFactsFor(visa())!;
    expect(f.owed).toBe(400);
    expect(utilizationPlan(f.owed, f.limit, 10, 'CURRENT')!.percent).toBe(20);
  });
});

describe('Safe to Spend — 30 days and before next income', () => {
  beforeEach(() => world());

  it('T13 opening the next-income view never changes the 30-day number or the records', () => {
    bill('INSURANCE', 140, 3);
    createIncomeSource({ source_name: 'PAYCHECK', amount: 900, cadence: 'BIWEEKLY', next_due_date: addDays(TODAY, 2) });
    const before = computeSafeToSpend();
    const rev = snap().updatedAt;
    const v = computeNextIncomeView();
    expect(v.primary.value).toBe(before.value);
    expect(computeSafeToSpend().value).toBe(before.value);
    expect(snap().updatedAt).toBe(rev);
  });

  it('T14 unknown next income is stated, never invented — daily earnings are not forecast', () => {
    saveDailyEarnings({ work_date: TODAY, income_source: 'UBER', source_kind: 'RIDESHARE', tips_mode: 'INCLUDED', digital_earnings: 180, digital_tips: 20, cash_tips: 0, digital_account_id: 'ride', cash_account_id: null });
    const v = computeNextIncomeView();
    expect(v.income).toBeNull();
    expect(v.view).toBeNull();
    expect(getRepository().listIncomeSources()).toHaveLength(0);
  });

  it('T15 known expected income is labelled expected and never added to money held', () => {
    bill('INSURANCE', 140, 3);
    bill('RENT', 900, 12);
    createIncomeSource({ source_name: 'PAYCHECK', amount: 1200, cadence: 'BIWEEKLY', next_due_date: addDays(TODAY, 7) });
    const v = computeNextIncomeView();
    expect(v.income).toMatchObject({ name: 'PAYCHECK', amount: 1200, date: addDays(TODAY, 7), estimated: false });
    expect(v.view!.cash).toBe(v.primary.cash);
    expect(v.view!.cash).toBe(500);
    expect(v.view!.upcoming).toBe(140);
    expect(v.primary.upcoming).toBe(1040);
    expect(v.view!.value).toBe(500 - 140);
    expect(v.onlyIn30Days.map((l) => l.label)).toEqual(['RENT']);
    // A date without an amount: the date is used, the amount is not invented.
    world({ user: 'fin-income-noamount@jurnl.test' });
    createIncomeSource({ source_name: 'CLIENT', amount: 0, cadence: 'MONTHLY', next_due_date: addDays(TODAY, 5) });
    expect(computeNextIncomeView().income).toMatchObject({ amount: null, estimated: true });
  });

  it('T22 a partly paid bill contributes only what is still due, in both periods', () => {
    const ob = bill('INSURANCE', 140, 3);
    markObligationPaid(ob, { amount: 50, account_id: 'bank', paid_on: TODAY });
    createIncomeSource({ source_name: 'PAYCHECK', amount: 900, cadence: 'BIWEEKLY', next_due_date: addDays(TODAY, 5) });
    const v = computeNextIncomeView();
    expect(v.primary.upcoming).toBe(90);
    expect(v.view!.upcoming).toBe(90);
  });

  it('T23 / T24 per-account shortfalls stay visible; changing the paying account moves them without a transfer', () => {
    const ob = bill('INSURANCE', 140, 3);
    const s = computeSafeToSpend();
    expect(s.value).toBeGreaterThan(0);
    expect(s.accountShortfalls).toEqual([{ account_id: 'bank', name: 'BANK', held: 100, committed: 140, short: 40 }]);
    const txBefore = snap().transactions.length;
    editBillOrSubscription(ob, { name: ob.name, amount: 140, cadence: 'MONTHLY', next_due_date: ob.next_due_date, kind: 'BILL', account_id: 'ride' });
    expect(computeSafeToSpend().accountShortfalls).toEqual([]);
    expect(snap().transactions.length).toBe(txBefore);
  });
});

describe('Money set aside — one model, two entry points', () => {
  beforeEach(() => world());

  it('T19 / T20 / T21 F07 and F08 show the same set-aside; changing it from either updates both; no extra deduction', () => {
    const ob = bill('INSURANCE', 140, 3, 'ride');
    const before = computeSafeToSpend().value;
    expect(setAside(ob.obligation_id, 'ride', 95).ok).toBe(true);
    const f07 = () => obligationFunding(snap().obligations.find((o) => o.obligation_id === ob.obligation_id)!, snap().transactions, snap().reservations);
    const f08 = () => billSetAsideRows(snap().obligations, snap().transactions, snap().reservations, snap().accounts).find((r) => r.obligation.obligation_id === ob.obligation_id)!;
    expect(f07().reserved).toBe(95);
    expect(f08().funding.reserved).toBe(95);
    expect(f08().pieces.map((p) => [p.accountName, p.reservation.amount])).toEqual([['RIDE', 95]]);
    expect(computeSafeToSpend().value).toBe(before);
    // Reduce from the F08 row's reservation id: F07 shows the new amount.
    applyOp(buildReduceReservation(snap().reservations, f08().pieces[0]!.reservation.reservation_id, 35));
    expect(f07().reserved).toBe(60);
    expect(f07().stillNeeded).toBe(80);
    expect(f08().funding.label).toBe(f07().label);
    expect(computeSafeToSpend().value).toBe(before);
    expect(snap().reservations.filter((r) => r.status === 'ACTIVE')).toHaveLength(1);
  });
});

describe('Labels and traceability', () => {
  beforeEach(() => world());

  it('T27 manually recorded data is labelled as such', () => {
    recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 10, occurred_on: TODAY });
    const s = snap();
    expect(computeLedgerPositions(s.accounts, s.creditAttributes, s.transactions, TODAY).positions.every((p) => p.basis === 'ENTERED_BY_YOU')).toBe(true);
    expect(s.transactions.filter((t) => t.source === 'ADDED').every((t) => t.confirmation === 'RECORDED_BY_YOU')).toBe(true);
    expect(balanceBasis({ is_manual: true, is_connected: false })).toBe('ENTERED_BY_YOU');
  });

  it('T28 every Safe to Spend figure traces to canonical records', () => {
    cardTerms();
    bill('INSURANCE', 140, 3);
    recordExpense({ merchant: 'LUNCH', amount: 12.45, account_id: 'cash', category: 'FOOD', occurred_on: TODAY });
    recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 80, occurred_on: TODAY, start: 'IN_TRANSIT' });
    upsertCreditTerms('visa', {});
    const s = snap();
    const sts = computeSafeToSpend();
    // Cash = Σ (entered + effects of settled entries) over eligible asset accounts, recomputed independently.
    const recomputed = s.accounts
      .filter((a) => a.status === 'ACTIVE' && accountNature(a.account_type) === 'ASSET' && a.include_in_safe_to_spend)
      .map((a) => toCents(a.available_balance + sumCents(s.transactions.filter((t) => isEffective(t, TODAY) && resolveEntryAccount(t, s.accounts)?.account_id === a.account_id).map((t) => entryEffect(t, 'ASSET')))));
    expect(sts.cash).toBe(sumCents(recomputed));
    for (const l of sts.billLines) expect(s.obligations.some((o) => o.obligation_id === l.obligation_id)).toBe(true);
    for (const l of sts.cardLines) expect(s.accounts.some((a) => a.account_id === l.account_id)).toBe(true);
    for (const l of sts.transferLines) expect(s.transactions.some((t) => t.link?.id === l.link_id)).toBe(true);
    expect(sts.value).toBe(toCents(sts.cash - sts.upcoming - sts.cardPayments - sts.committedTransfers - sts.protected - sts.safetyBuffer - sts.assigned - sts.goalReserved - sts.purchaseReserved - sts.tripReserved));
  });
});

describe('Daily earnings regression (unchanged by settlement)', () => {
  beforeEach(() => world());

  it('digital and cash land instantly, once, with no transfer or pending state', () => {
    const r = saveDailyEarnings({ work_date: TODAY, income_source: 'UBER', source_kind: 'RIDESHARE', tips_mode: 'INCLUDED', digital_earnings: 180, digital_tips: 25, cash_tips: 15, digital_account_id: 'ride', cash_account_id: 'cash' });
    expect(r.ok).toBe(true);
    expect([position('ride'), position('cash')]).toEqual([480, 115]);
    const legs = snap().transactions.filter((t) => t.link?.kind === 'DAILY_EARNINGS');
    expect(legs.every((l) => l.settlement === undefined && l.status === 'CLEARED' && l.txn_class === 'INCOME')).toBe(true);
    expect(transferViews(snap().transactions, TODAY)).toHaveLength(0);
    expect(picture().inTransit).toBe(0);
  });
});

export const _types: CalendarDate | null = null;
