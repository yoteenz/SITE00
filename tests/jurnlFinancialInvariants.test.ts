/**
 * P0.JURNL.PERSONAL-FINANCIAL-OPERATING-SYSTEM — financial correctness matrix (A–Z).
 * Synthetic accounts and amounts only. Each scenario names the brief's letter.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { JurnlAccountRecord } from '../src/projects/jurnl/data/foundation/accounts';
import { addDays, addMonthsClamped, getTodayKey, nextOccurrenceAfter, occurrencesThrough, type CalendarDate } from '../src/projects/jurnl/data/foundation/dates';
import { patchSetup } from '../src/projects/jurnl/data/f02/setupDraft';
import { getRepository, resetRepositoryForDev, setRepositoryUserId } from '../src/projects/jurnl/data/repository/deviceRepository';
import { resetCachedRepoViewsForTests } from '../src/projects/jurnl/data/repository/cachedRepoView';
import {
  balanceBasis,
  ceilCents,
  computeLedgerPositions,
  flowTotals,
  summarizePositions,
  sumCents,
  toCents,
} from '../src/projects/jurnl/data/ledger/accounting';
import { recordExpense, recordTransfer, removeLinkedEvent, setAccountBalance, parseMoneyInput } from '../src/projects/jurnl/data/ledger/ledgerOps';
import { suggestAccountForPurpose } from '../src/projects/jurnl/data/ledger/purposes';
import { setPurposeAccount, suggestAccount } from '../src/projects/jurnl/data/ledger/moneyPositions';
import { deleteDailyEarnings, earningsBreakdown, earningsPeriods, saveDailyEarnings, type DailyEarningsInput } from '../src/projects/jurnl/data/f06/dailyEarnings';
import {
  createBillOrSubscription,
  markObligationPaid,
  obligationFunding,
  rescheduleObligationOccurrence,
  scheduledOccurrences,
  setObligationStatus,
  skipObligationOccurrence,
  undoObligationPayment,
} from '../src/projects/jurnl/data/f07/obligationLifecycle';
import { buildSetAside, buildReassignReservation, reservedFor } from '../src/projects/jurnl/data/f07/reservations';
import { annualEquivalent, monthlyEquivalent, subscriptionTotals } from '../src/projects/jurnl/data/f07/subscriptions';
import { cardFacts, interestGuidance, overallUtilization, paymentSafety, utilizationPlan } from '../src/projects/jurnl/data/f12/creditGuidance';
import { cardFactsFor, upsertCreditTerms } from '../src/projects/jurnl/data/f12/creditStore';
import { computeSafeToSpend } from '../src/projects/jurnl/data/f09/safeToSpend';
import { applyOp } from '../src/projects/jurnl/data/ledger/ledgerOps';

const TODAY = getTodayKey();

function acct(id: string, name: string, type: JurnlAccountRecord['account_type'], balance: number, extra: Partial<JurnlAccountRecord> = {}): JurnlAccountRecord {
  const now = new Date().toISOString();
  return {
    account_id: id,
    user_id: getRepository().userId,
    institution_id: null,
    display_name: name,
    account_type: type,
    subtype: null,
    currency: 'USD',
    balance,
    available_balance: balance,
    credit_limit: null,
    is_manual: true,
    is_connected: false,
    connection_id: null,
    status: 'ACTIVE',
    include_in_safe_to_spend: type !== 'CREDIT_CARD',
    include_in_net_worth: true,
    include_in_spending: true,
    masked_identifier: null,
    as_of: TODAY,
    created_at: now,
    updated_at: now,
    archived_at: null,
    ...extra,
  };
}

/** Synthetic world: BANK $500 · RIDESHARE payout card $240 · CASH $100 · VISA owes $400 of $2,000. */
function world(user = 'fin-invariants@jurnl.test') {
  setRepositoryUserId(user);
  resetRepositoryForDev();
  resetCachedRepoViewsForTests();
  const repo = getRepository();
  const seeded = repo.listAccounts().map((a) => ({ ...a, status: 'ARCHIVED' as const }));
  repo.commit({
    reason: 'TEST_WORLD',
    accounts: {
      upsert: [
        ...seeded,
        acct('bank', 'BANK', 'CHECKING', 500),
        acct('ride', 'RIDESHARE', 'DEBIT_CARD', 240, { is_payout_card: true }),
        acct('cash', 'CASH', 'CASH', 100),
        acct('visa', 'VISA', 'CREDIT_CARD', 400, { credit_limit: 2000, include_in_safe_to_spend: false }),
      ],
    },
  });
  upsertCreditTerms('visa', { credit_limit: 2000, current_balance: 400, minimum_payment: null, payment_due_day: null, statement_day: null });
  patchSetup({ started: true, accounts: 'NAMED', cadence: 'DAILY', amount: '200', obligations: [], protectedAmount: '', protectedSkipped: true });
  repo.patchSettings({ safeToSpendBuffer: '' });
}

function held(id: string): number {
  const s = getRepository().getSnapshot();
  return computeLedgerPositions(s.accounts, s.creditAttributes, s.transactions, TODAY).positions.find((p) => p.account_id === id)!.position;
}

function earnings(over: Partial<DailyEarningsInput> = {}): DailyEarningsInput {
  return {
    work_date: TODAY,
    income_source: 'UBER',
    source_kind: 'RIDESHARE',
    tips_mode: 'INCLUDED',
    digital_earnings: 180,
    digital_tips: 25,
    cash_tips: 15,
    digital_account_id: 'ride',
    cash_account_id: 'cash',
    ...over,
  };
}

function addedCount() {
  return getRepository().listTransactions().filter((t) => t.source === 'ADDED').length;
}

describe('JURNL financial invariants — money locations and daily earnings', () => {
  beforeEach(() => world());

  it('A. cash tips increase cash only', () => {
    const r = saveDailyEarnings(earnings({ digital_earnings: 0, digital_tips: 0, cash_tips: 22 }));
    expect(r.ok).toBe(true);
    expect(held('cash')).toBe(122);
    expect(held('ride')).toBe(240);
    expect(held('bank')).toBe(500);
  });

  it('B. digital earnings increase the selected digital account only', () => {
    saveDailyEarnings(earnings({ cash_tips: 0 }));
    expect(held('ride')).toBe(420);
    expect(held('bank')).toBe(500);
    expect(held('cash')).toBe(100);
  });

  it('C. digital tips already included are not added twice; separate tips are added once', () => {
    const a = earningsBreakdown({ tips_mode: 'INCLUDED', digital_earnings: 180, digital_tips: 25, cash_tips: 15 });
    expect(a).toMatchObject({ digitalReceived: 180, cashReceived: 15, totalEarned: 195, baseEarnings: 155, tipsTotal: 40 });
    const b = earningsBreakdown({ tips_mode: 'SEPARATE', digital_earnings: 180, digital_tips: 25, cash_tips: 15 });
    expect(b).toMatchObject({ digitalReceived: 205, cashReceived: 15, totalEarned: 220, baseEarnings: 180 });
    saveDailyEarnings(earnings());
    expect(held('ride')).toBe(420);
    expect(held('cash')).toBe(115);
    // Mode A refuses tips larger than the total they are part of.
    world();
    const bad = saveDailyEarnings(earnings({ digital_earnings: 20, digital_tips: 25 }));
    expect(bad.ok).toBe(false);
  });

  it('D. editing a day rewrites its legs: balances move by the difference, no duplicate income', () => {
    const first = saveDailyEarnings(earnings());
    expect(first.ok).toBe(true);
    const id = first.ok ? first.value.earnings_id : '';
    expect(addedCount()).toBe(2);
    const edit = saveDailyEarnings(earnings({ digital_earnings: 150, cash_tips: 0 }), id);
    expect(edit.ok).toBe(true);
    expect(addedCount()).toBe(1);
    expect(held('ride')).toBe(390);
    expect(held('cash')).toBe(100);
    const rec = getRepository().listDailyEarnings().filter((r) => r.status === 'RECORDED');
    expect(rec).toHaveLength(1);
    expect(rec[0]!.revisions.map((r) => r.action)).toEqual(['CREATED', 'EDITED']);
  });

  it('one daily submission is one traceable event; the same source and day cannot be recorded twice', () => {
    const r = saveDailyEarnings(earnings());
    const id = r.ok ? r.value.earnings_id : '';
    const legs = getRepository().listTransactions().filter((t) => t.link?.id === id);
    expect(legs.map((l) => l.link?.leg).sort()).toEqual(['CASH', 'DIGITAL']);
    expect(legs.every((l) => l.txn_class === 'INCOME' && l.status === 'CLEARED' && l.origin_family === 'F06')).toBe(true);
    const again = saveDailyEarnings(earnings());
    expect(again.ok).toBe(false);
    expect(addedCount()).toBe(2);
    // A different source the same day is its own record.
    expect(saveDailyEarnings(earnings({ income_source: 'LYFT', cash_tips: 0 })).ok).toBe(true);
  });

  it('daily, weekly and monthly totals add each day once', () => {
    saveDailyEarnings(earnings());
    saveDailyEarnings(earnings({ income_source: 'LYFT', digital_earnings: 60, digital_tips: 0, cash_tips: 0 }));
    const p = earningsPeriods(getRepository().listDailyEarnings(), TODAY);
    expect(p.today).toMatchObject({ days: 1, total: 255, digital: 240, cash: 15 });
    expect(p.week.total).toBe(255);
    expect(p.month.total).toBe(255);
  });

  it('earnings cannot be received into a credit card', () => {
    const r = saveDailyEarnings(earnings({ digital_account_id: 'visa' }));
    expect(r.ok).toBe(false);
    expect(held('visa')).toBe(400);
  });
});

describe('JURNL financial invariants — spending, transfers, liabilities', () => {
  beforeEach(() => world());

  it('E. a cash purchase reduces cash, not the bank', () => {
    expect(recordExpense({ merchant: "MCDONALD'S", amount: 12.45, account_id: 'cash', category: 'FOOD', occurred_on: TODAY }).ok).toBe(true);
    expect(held('cash')).toBe(87.55);
    expect(held('bank')).toBe(500);
  });

  it('F. a debit purchase reduces the bank, not cash', () => {
    recordExpense({ merchant: 'SHOP', amount: 25, account_id: 'bank', category: 'SHOPPING', occurred_on: TODAY });
    expect(held('bank')).toBe(475);
    expect(held('cash')).toBe(100);
  });

  it('G. a credit purchase raises what the card is owed; no cash leaves; Safe to Spend cash is unchanged', () => {
    const before = computeSafeToSpend();
    const r = recordExpense({ merchant: 'GROCER', amount: 65, account_id: 'visa', category: 'GROCERIES', occurred_on: TODAY });
    expect(r.ok && r.value.txn_class).toBe('CREDIT_PURCHASE');
    expect(held('visa')).toBe(465);
    expect(held('bank')).toBe(500);
    expect(held('cash')).toBe(100);
    const after = computeSafeToSpend();
    expect(after.cash).toBe(before.cash);
    expect(after.owedOnCards).toBe(465);
    expect(flowTotals(getRepository().listTransactions(), getRepository().listAccounts(), TODAY, TODAY, TODAY).spending).toBe(65);
  });

  it('H. a card payment lowers the source and the card balance and is not new spending', () => {
    recordExpense({ merchant: 'GROCER', amount: 65, account_id: 'visa', category: 'GROCERIES', occurred_on: TODAY });
    const pay = recordTransfer({ from_account_id: 'ride', to_account_id: 'visa', amount: 100, occurred_on: TODAY });
    expect(pay.ok && pay.value.kind).toBe('CARD_PAYMENT');
    expect(held('ride')).toBe(140);
    expect(held('visa')).toBe(365);
    const t = flowTotals(getRepository().listTransactions(), getRepository().listAccounts(), TODAY, TODAY, TODAY);
    expect(t.spending).toBe(65);
    expect(t.cardPayments).toBe(100);
    expect(t.income).toBe(0);
  });

  it('I. a transfer between owned accounts creates no income and keeps total money the same', () => {
    const s0 = getRepository().getSnapshot();
    const before = summarizePositions(computeLedgerPositions(s0.accounts, s0.creditAttributes, s0.transactions, TODAY).positions);
    expect(recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 200, occurred_on: TODAY }).ok).toBe(true);
    const s1 = getRepository().getSnapshot();
    const after = summarizePositions(computeLedgerPositions(s1.accounts, s1.creditAttributes, s1.transactions, TODAY).positions);
    expect(after.ownedAssets).toBe(before.ownedAssets);
    expect(held('ride')).toBe(40);
    expect(held('bank')).toBe(700);
    const t = flowTotals(s1.transactions, s1.accounts, TODAY, TODAY, TODAY);
    expect(t).toMatchObject({ income: 0, spending: 0, transfers: 200 });
    // The same transfer entered twice is refused unless the user says it happened twice.
    expect(recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 200, occurred_on: TODAY }).ok).toBe(false);
  });

  it('J. a cash deposit lowers cash and raises the bank', () => {
    recordTransfer({ from_account_id: 'cash', to_account_id: 'bank', amount: 50, occurred_on: TODAY });
    expect(held('cash')).toBe(50);
    expect(held('bank')).toBe(550);
  });

  it('transfers can be reversed as one event; money cannot move out of a credit card', () => {
    const r = recordTransfer({ from_account_id: 'bank', to_account_id: 'cash', amount: 40, occurred_on: TODAY });
    expect(held('cash')).toBe(140);
    removeLinkedEvent(r.ok ? r.value.linkId : '');
    expect(held('cash')).toBe(100);
    expect(held('bank')).toBe(500);
    expect(addedCount()).toBe(0);
    expect(recordTransfer({ from_account_id: 'visa', to_account_id: 'bank', amount: 40, occurred_on: TODAY }).ok).toBe(false);
  });

  it('a scheduled (future-dated) transfer changes nothing until its date', () => {
    recordTransfer({ from_account_id: 'bank', to_account_id: 'cash', amount: 40, occurred_on: addDays(TODAY, 3) });
    expect(held('bank')).toBe(500);
    expect(held('cash')).toBe(100);
  });

  it('a balance correction after entries records the difference instead of re-counting', () => {
    recordExpense({ merchant: 'SHOP', amount: 25, account_id: 'bank', category: 'SHOPPING', occurred_on: TODAY });
    expect(held('bank')).toBe(475);
    setAccountBalance('bank', 480);
    expect(held('bank')).toBe(480);
    const adj = getRepository().listTransactions().find((t) => t.txn_class === 'ADJUSTMENT');
    expect(adj?.amount).toBe(5);
    expect(flowTotals(getRepository().listTransactions(), getRepository().listAccounts(), TODAY, TODAY, TODAY)).toMatchObject({ income: 0, spending: 25 });
  });
});

describe('JURNL financial invariants — account purposes', () => {
  beforeEach(() => world());

  it('suggests the usual account by purpose, honours a chosen account, and explains when none fits', () => {
    expect(suggestAccount('BILLS').account?.account_id).toBe('bank');
    expect(suggestAccount('GROCERIES').account?.account_id).toBe('visa');
    expect(suggestAccount('CARD_PAYMENTS').account?.account_id).toBe('ride');
    expect(suggestAccount('CASH_PURCHASES').account?.account_id).toBe('cash');
    setPurposeAccount('GROCERIES', 'bank');
    expect(suggestAccount('GROCERIES')).toMatchObject({ status: 'CHOSEN', account: { account_id: 'bank' } });
    const none = suggestAccountForPurpose('SAVINGS', getRepository().listAccounts(), {});
    expect(none.status).toBe('MISSING');
    expect(none.reason).toMatch(/SAVINGS ACCOUNT/);
    // A credit card can never be the usual account for receiving earnings.
    setPurposeAccount('RIDESHARE_EARNINGS', 'visa');
    expect(suggestAccount('RIDESHARE_EARNINGS').account?.account_id).toBe('ride');
  });
});

describe('JURNL financial invariants — bills, subscriptions, set-asides, Safe to Spend', () => {
  beforeEach(() => world());

  function insurance(amount = 140, due: CalendarDate = addDays(TODAY, 3)) {
    const r = createBillOrSubscription({ name: 'CAR INSURANCE', amount, cadence: 'MONTHLY', next_due_date: due, kind: 'BILL', account_id: 'bank' });
    if (!r.ok) throw new Error(r.error);
    return r.value;
  }

  function onlyBank() {
    // Bank $500 only counts toward Safe to Spend (the founder's worked example).
    const s = getRepository().getSnapshot();
    getRepository().commit({ reason: 'TEST', accounts: { upsert: s.accounts.filter((a) => a.account_id === 'ride' || a.account_id === 'cash').map((a) => ({ ...a, include_in_safe_to_spend: false })) } });
  }

  function reserve(targetId: string, cap: number, accountId: string, amount: number, occurrence: CalendarDate) {
    const s = getRepository().getSnapshot();
    const pos = computeLedgerPositions(s.accounts, s.creditAttributes, s.transactions, TODAY).positions;
    return applyOp(buildSetAside(s.accounts, pos, s.reservations, { target: { kind: 'OBLIGATION', id: targetId, occurrence_date: occurrence, name: 'BILL', cap }, account_id: accountId, amount }));
  }

  it('K. recurrence produces scheduled occurrences, never completed payments', () => {
    const r = createBillOrSubscription({ name: 'GYM', amount: 10, cadence: 'WEEKLY', next_due_date: TODAY, kind: 'SUBSCRIPTION', account_id: 'bank' });
    const ob = r.ok ? r.value : null!;
    const occ = scheduledOccurrences(ob, getRepository().listTransactions(), addDays(TODAY, 30));
    expect(occ.length).toBe(5);
    expect(occ.every((o) => o.paid === 0)).toBe(true);
    expect(addedCount()).toBe(0);
    expect(computeSafeToSpend().upcoming).toBe(50);
  });

  it('L. marking a bill paid creates exactly one payment and moves to the next date', () => {
    const ob = insurance();
    const r = markObligationPaid(ob, { amount: 140, account_id: 'bank', paid_on: TODAY });
    expect(r.ok).toBe(true);
    const pays = getRepository().listTransactions().filter((t) => t.obligation_id === ob.obligation_id);
    expect(pays).toHaveLength(1);
    expect(held('bank')).toBe(360);
    const after = getRepository().getSnapshot().obligations.find((o) => o.obligation_id === ob.obligation_id)!;
    expect(after.next_due_date).toBe(addMonthsClamped(ob.next_due_date, 1));
    // The paid occurrence is no longer deducted; only the next one if it falls in the window.
    const sts = computeSafeToSpend();
    expect(sts.billLines.some((l) => l.due_date === ob.next_due_date)).toBe(false);
  });

  it('partial payments keep the occurrence open and cannot exceed what is due', () => {
    const ob = insurance();
    expect(markObligationPaid(ob, { amount: 50, account_id: 'bank', paid_on: TODAY }).ok).toBe(true);
    const cur = getRepository().getSnapshot().obligations.find((o) => o.obligation_id === ob.obligation_id)!;
    expect(cur.next_due_date).toBe(ob.next_due_date);
    expect(obligationFunding(cur, getRepository().listTransactions(), []).remaining).toBe(90);
    expect(markObligationPaid(cur, { amount: 100, account_id: 'bank', paid_on: TODAY }).ok).toBe(false);
    expect(computeSafeToSpend().upcoming).toBe(90);
  });

  it('M. setting money aside moves no money and writes no ledger entry', () => {
    const ob = insurance();
    const before = getRepository().listTransactions().length;
    expect(reserve(ob.obligation_id, 140, 'bank', 95, ob.next_due_date).ok).toBe(true);
    expect(getRepository().listTransactions().length).toBe(before);
    expect(held('bank')).toBe(500);
  });

  it('N. $95 set aside toward a $140 bill is part of the $140 — Safe to Spend stays $360, not $265', () => {
    onlyBank();
    const ob = insurance();
    const base = computeSafeToSpend();
    expect(base.cash).toBe(500);
    expect(base.value).toBe(360);
    reserve(ob.obligation_id, 140, 'bank', 95, ob.next_due_date);
    const s = computeSafeToSpend();
    expect(s.value).toBe(360);
    expect(s.reservedForPayments).toBe(95);
    expect(s.unfundedCommitments).toBe(45);
    const f = obligationFunding(getRepository().getSnapshot().obligations.find((o) => o.obligation_id === ob.obligation_id)!, getRepository().listTransactions(), getRepository().listReservations());
    expect(f).toMatchObject({ amount: 140, reserved: 95, stillNeeded: 45 });
    expect(f.label).toBe('$95 OF $140 SET ASIDE · $45 STILL NEEDED');
  });

  it('O. the same money cannot silently fund two bills; later over-commitment is reported', () => {
    const a = insurance(140);
    const b = insurance(450, addDays(TODAY, 5));
    expect(reserve(a.obligation_id, 140, 'bank', 140, a.next_due_date).ok).toBe(true);
    const over = reserve(b.obligation_id, 450, 'bank', 400, b.next_due_date);
    expect(over.ok).toBe(false);
    expect(over.ok ? '' : over.error).toMatch(/BANK HAS \$360 NOT ALREADY SET ASIDE\. SETTING ASIDE \$400 WOULD BE \$40 MORE THAN IT HOLDS/);
    expect(reserve(a.obligation_id, 140, 'bank', 1, a.next_due_date).ok).toBe(false);
    // Spending after setting money aside leaves the account short — reported, not hidden.
    recordExpense({ merchant: 'SHOP', amount: 400, account_id: 'bank', category: 'SHOPPING', occurred_on: TODAY });
    expect(computeSafeToSpend().overSetAside).toEqual([{ account_id: 'bank', name: 'BANK', overBy: 40 }]);
  });

  it('paying a funded bill uses the set-aside money; extra is released or carried as chosen', () => {
    const ob = insurance();
    reserve(ob.obligation_id, 140, 'bank', 140, ob.next_due_date);
    const r = markObligationPaid(ob, { amount: 140, account_id: 'bank', paid_on: TODAY });
    expect(r.ok && r.value.applied).toBe(140);
    expect(reservedFor(getRepository().listReservations(), 'OBLIGATION', ob.obligation_id)).toBe(0);
    // Reserved $100 in CASH, paid from BANK: the CASH earmark is released (BANK paid it), not left dangling.
    world();
    const ob2 = insurance();
    reserve(ob2.obligation_id, 140, 'cash', 100, ob2.next_due_date);
    const r2 = markObligationPaid(ob2, { amount: 140, account_id: 'bank', paid_on: TODAY });
    expect(r2.ok && r2.value.released).toBe(100);
  });

  it('reassigning set-aside money keeps it in the same account and respects the new cap', () => {
    const a = insurance(140);
    const b = insurance(60, addDays(TODAY, 6));
    reserve(a.obligation_id, 140, 'bank', 100, a.next_due_date);
    const s = getRepository().getSnapshot();
    const res = s.reservations.find((r) => r.target_id === a.obligation_id)!;
    expect(buildReassignReservation(s.reservations, res.reservation_id, { kind: 'OBLIGATION', id: b.obligation_id, occurrence_date: b.next_due_date, name: 'B', cap: 60 }, 80).ok).toBe(false);
    const ok = applyOp(buildReassignReservation(s.reservations, res.reservation_id, { kind: 'OBLIGATION', id: b.obligation_id, occurrence_date: b.next_due_date, name: 'B', cap: 60 }, 60));
    expect(ok.ok).toBe(true);
    expect(reservedFor(getRepository().listReservations(), 'OBLIGATION', a.obligation_id)).toBe(40);
    expect(reservedFor(getRepository().listReservations(), 'OBLIGATION', b.obligation_id)).toBe(60);
    expect(held('bank')).toBe(500);
  });

  it('an account-specific shortfall is reported even when total Safe to Spend is positive', () => {
    insurance(600);
    const s = computeSafeToSpend();
    expect(s.accountShortfalls).toEqual([{ account_id: 'bank', name: 'BANK', held: 500, committed: 600, short: 100 }]);
  });

  it('skip and reschedule change dates only; cancel keeps history and releases set-asides', () => {
    const ob = insurance();
    const skipped = skipObligationOccurrence(ob);
    expect(skipped.ok && skipped.value.next_due_date).toBe(addMonthsClamped(ob.next_due_date, 1));
    expect(addedCount()).toBe(0);
    const cur = skipped.ok ? skipped.value : ob;
    const moved = rescheduleObligationOccurrence(cur, addDays(cur.next_due_date, 4));
    expect(moved.ok).toBe(true);
    const m = moved.ok ? moved.value : cur;
    markObligationPaid(m, { amount: 140, account_id: 'bank', paid_on: TODAY });
    const after = getRepository().getSnapshot().obligations.find((o) => o.obligation_id === ob.obligation_id)!;
    // The schedule after a moved occurrence returns to its anchor day.
    expect(after.next_due_date).toBe(addMonthsClamped(cur.next_due_date, 1));
    reserve(ob.obligation_id, 140, 'bank', 50, after.next_due_date);
    setObligationStatus(after, 'CANCELLED');
    const c = getRepository().getSnapshot().obligations.find((o) => o.obligation_id === ob.obligation_id)!;
    expect(c.status).toBe('CANCELLED');
    expect(c.occurrence_log?.map((l) => l.outcome)).toEqual(['SKIPPED', 'RESCHEDULED', 'PAID']);
    expect(reservedFor(getRepository().listReservations(), 'OBLIGATION', ob.obligation_id)).toBe(0);
    expect(computeSafeToSpend().billLines).toHaveLength(0);
  });

  it('subscription totals convert each frequency instead of adding them as monthly', () => {
    expect(monthlyEquivalent(10, 'WEEKLY')).toBe(43.33);
    expect(monthlyEquivalent(120, 'ANNUAL')).toBe(10);
    expect(monthlyEquivalent(30, 'QUARTERLY')).toBe(10);
    expect(annualEquivalent(10, 'WEEKLY')).toBe(520);
    createBillOrSubscription({ name: 'MUSIC', amount: 10.99, cadence: 'MONTHLY', next_due_date: TODAY, kind: 'SUBSCRIPTION', account_id: 'bank' });
    createBillOrSubscription({ name: 'CLOUD', amount: 99, cadence: 'ANNUAL', next_due_date: addDays(TODAY, 40), kind: 'SUBSCRIPTION', account_id: 'bank' });
    const t = subscriptionTotals(getRepository().getSnapshot().obligations);
    expect(t).toMatchObject({ count: 2, monthly: 19.24, annual: 230.88, mixedCadence: true });
  });
});

describe('JURNL financial invariants — credit cards', () => {
  beforeEach(() => world());

  function facts(today: CalendarDate = TODAY) {
    const s = getRepository().getSnapshot();
    const pos = computeLedgerPositions(s.accounts, s.creditAttributes, s.transactions, today).positions.find((p) => p.account_id === 'visa')!;
    return cardFacts(pos, s.creditAttributes.find((c) => c.account_id === 'visa') ?? null, s.transactions, s.reservations, s.accounts, s.settings.purposeAccounts, today);
  }

  it('P. utilization uses the card limit and balance; payment to a chosen target rounds up', () => {
    recordExpense({ merchant: 'GROCER', amount: 65, account_id: 'visa', category: 'GROCERIES', occurred_on: TODAY });
    const f = facts();
    expect(f.owed).toBe(465);
    const plan = utilizationPlan(f.owed, f.limit, 10, 'CURRENT')!;
    expect(plan.percent).toBe(23.3);
    expect(plan.targetBalance).toBe(200);
    expect(plan.paymentToTarget).toBe(265);
    expect(utilizationPlan(370.37, 1234.56, 30, 'CURRENT')!).toMatchObject({ targetBalance: 370.36, paymentToTarget: 0.01 });
    expect(utilizationPlan(100, null, 30, 'CURRENT')).toBeNull();
    const overall = overallUtilization([{ name: 'VISA', balance: 465, limit: 2000 }, { name: 'STORE', balance: 300, limit: null }, { name: 'AMEX', balance: 35, limit: 1000 }]);
    expect(overall).toMatchObject({ balance: 500, limit: 3000, excluded: ['STORE'] });
  });

  it('Q. payment guidance counts payments already made; a paid minimum leaves Safe to Spend', () => {
    upsertCreditTerms('visa', { minimum_payment: 45, payment_due_date: addDays(TODAY, 4), statement_closing_date: addDays(TODAY, -10), statement_balance: 400 });
    expect(cardFactsFor(getRepository().listAccounts().find((a) => a.account_id === 'visa')!)!.remainingMinimum).toBe(45);
    expect(computeSafeToSpend().cardPayments).toBe(45);
    recordTransfer({ from_account_id: 'ride', to_account_id: 'visa', amount: 20, occurred_on: TODAY });
    const f = facts();
    expect(f.paidSinceStatement).toBe(20);
    expect(f.remainingMinimum).toBe(25);
    expect(paymentSafety(f, TODAY).line).toMatch(/MINIMUM REMAINING IS \$25\./);
    recordTransfer({ from_account_id: 'ride', to_account_id: 'visa', amount: 25, occurred_on: TODAY });
    expect(paymentSafety(facts(), TODAY).state).toBe('MINIMUM_PAID');
    expect(computeSafeToSpend().cardPayments).toBe(0);
    expect(facts().remainingStatement).toBe(355);
  });

  it('R. statement closing date and payment due date stay distinct', () => {
    upsertCreditTerms('visa', { statement_day: 1, payment_due_day: 25, minimum_payment: 40, statement_balance: 400 });
    const f = facts('2026-11-03' as CalendarDate);
    expect(f.statementClosingDate).toBe('2026-11-01');
    expect(f.dueDate).toBe('2026-11-25');
    const g = facts('2026-11-27' as CalendarDate);
    expect(g.statementClosingDate).toBe('2026-11-01');
    expect(paymentSafety(g, '2026-11-27' as CalendarDate).state).toBe('PAST_DUE');
  });

  it('interest guidance never promises interest avoidance when a balance is carried', () => {
    upsertCreditTerms('visa', { statement_balance: 400, payment_due_date: addDays(TODAY, 10), carries_interest_balance: true });
    expect(interestGuidance(facts(), TODAY).state).toBe('CARRYING_BALANCE');
    upsertCreditTerms('visa', { carries_interest_balance: false });
    expect(interestGuidance(facts(), TODAY).line).toMatch(/IF YOUR CARD HAS A GRACE PERIOD/);
  });

  it('W. missing card data produces an honest explanation, not a number', () => {
    const f = facts();
    expect(f.missing).toEqual(expect.arrayContaining(['MINIMUM PAYMENT', 'PAYMENT DUE DATE', 'STATEMENT BALANCE']));
    expect(paymentSafety(f, TODAY)).toMatchObject({ state: 'MISSING_DATA' });
    expect(paymentSafety(f, TODAY).line).toMatch(/ADD THE MINIMUM PAYMENT AND PAYMENT DUE DATE/);
    expect(interestGuidance(f, TODAY).state).toBe('MISSING_DATA');
  });
});

describe('JURNL financial invariants — integrity across time, users and rounding', () => {
  beforeEach(() => world());

  it('S. corrections and reversals keep history: deleted days and undone payments stay traceable', () => {
    const r = saveDailyEarnings(earnings());
    const id = r.ok ? r.value.earnings_id : '';
    deleteDailyEarnings(id);
    expect(held('ride')).toBe(240);
    expect(held('cash')).toBe(100);
    const rec = getRepository().listDailyEarnings().find((x) => x.earnings_id === id)!;
    expect(rec.status).toBe('DELETED');
    expect(rec.revisions.map((x) => x.action)).toEqual(['CREATED', 'DELETED']);
    const ob = createBillOrSubscription({ name: 'PHONE', amount: 60, cadence: 'MONTHLY', next_due_date: TODAY, kind: 'BILL', account_id: 'bank' });
    const o = ob.ok ? ob.value : null!;
    const paid = markObligationPaid(o, { amount: 60, account_id: 'bank', paid_on: TODAY });
    const entryId = paid.ok ? paid.value.entry.id : '';
    const advanced = getRepository().getSnapshot().obligations.find((x) => x.obligation_id === o.obligation_id)!;
    expect(undoObligationPayment(advanced, entryId).ok).toBe(true);
    const back = getRepository().getSnapshot().obligations.find((x) => x.obligation_id === o.obligation_id)!;
    expect(back.next_due_date).toBe(TODAY);
    expect(back.occurrence_log?.map((l) => l.outcome)).toEqual(['PAID', 'PAYMENT_UNDONE']);
    expect(held('bank')).toBe(500);
  });

  it('T. reloading from storage does not duplicate entries', async () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
    });
    try {
      world('fin-reload@jurnl.test');
      saveDailyEarnings(earnings());
      recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 100, occurred_on: TODAY });
      const before = getRepository().getSnapshot();
      vi.resetModules();
      const fresh = await import('../src/projects/jurnl/data/repository/deviceRepository');
      fresh.setRepositoryUserId('fin-reload@jurnl.test');
      const after = fresh.getRepository().getSnapshot();
      expect(after.transactions.length).toBe(before.transactions.length);
      expect(after.dailyEarnings.length).toBe(1);
      expect(after.transactions.filter((t) => t.link?.kind === 'TRANSFER')).toHaveLength(2);
      // Re-applying the same commit (a retried save) is idempotent: upsert by id.
      fresh.getRepository().commit({ reason: 'RETRY', transactions: { upsert: after.transactions.filter((t) => t.source === 'ADDED') } });
      expect(fresh.getRepository().getSnapshot().transactions.length).toBe(before.transactions.length);
    } finally {
      vi.unstubAllGlobals();
      vi.resetModules();
    }
  });

  it('U. two users never see each other’s records', () => {
    world('user-a@jurnl.test');
    saveDailyEarnings(earnings());
    const aCount = getRepository().listDailyEarnings().length;
    setRepositoryUserId('user-b@jurnl.test');
    resetRepositoryForDev();
    expect(getRepository().userId).toBe('user-b@jurnl.test');
    expect(getRepository().listDailyEarnings()).toHaveLength(0);
    expect(getRepository().listTransactions().some((t) => t.link?.kind === 'DAILY_EARNINGS')).toBe(false);
    setRepositoryUserId('user-a@jurnl.test');
    expect(getRepository().listDailyEarnings()).toHaveLength(aCount);
  });

  it('V. manual and stale balances are never presented as bank-confirmed', () => {
    const s = getRepository().getSnapshot();
    const old = { ...s.accounts.find((a) => a.account_id === 'bank')!, as_of: addDays(TODAY, -20), updated_at: `${addDays(TODAY, -20)}T00:00:00.000Z` };
    getRepository().commit({ reason: 'TEST', accounts: { upsert: [old] } });
    const s2 = getRepository().getSnapshot();
    const pos = computeLedgerPositions(s2.accounts, s2.creditAttributes, s2.transactions, TODAY).positions;
    expect(pos.every((p) => p.basis !== 'BANK_CONFIRMED')).toBe(true);
    expect(balanceBasis({ is_manual: false, is_connected: true })).toBe('NOT_VERIFIED');
    // Seeded sample accounts read SAMPLE until the user enters their own balance.
    expect(balanceBasis({ account_id: 'acct-checking', is_manual: true, is_connected: false })).toBe('SAMPLE');
    expect(balanceBasis({ account_id: 'acct-checking', is_manual: true, is_connected: false, balance_entered_by_user: true })).toBe('ENTERED_BY_YOU');
    expect(pos.find((p) => p.account_id === 'bank')).toMatchObject({ freshness: 'OLDER', daysSinceUpdate: 20 });
  });

  it('X. rounding and currency precision are consistent', () => {
    expect(sumCents([0.1, 0.2])).toBe(0.3);
    expect(sumCents(Array.from({ length: 100 }, () => 0.01))).toBe(1);
    expect(toCents(1.005)).toBe(1.01);
    expect(ceilCents(10.001)).toBe(10.01);
    expect(ceilCents(10)).toBe(10);
    expect(parseMoneyInput('12.345')).toBeNull();
    expect(parseMoneyInput('1,250.50')).toBe(1250.5);
    for (let i = 0; i < 30; i += 1) recordExpense({ merchant: 'COFFEE', amount: 3.3, account_id: 'cash', category: 'FOOD', occurred_on: TODAY });
    expect(held('cash')).toBe(1);
  });

  it('Y. month-end and leap-year schedules keep their day', () => {
    const jan31 = '2027-01-31' as CalendarDate;
    expect(nextOccurrenceAfter(jan31, 'MONTHLY', 31)).toBe('2027-02-28');
    expect(nextOccurrenceAfter('2027-02-28' as CalendarDate, 'MONTHLY', 31)).toBe('2027-03-31');
    expect(nextOccurrenceAfter('2028-01-31' as CalendarDate, 'MONTHLY', 31)).toBe('2028-02-29');
    expect(nextOccurrenceAfter('2028-02-29' as CalendarDate, 'ANNUAL', 29)).toBe('2029-02-28');
    expect(nextOccurrenceAfter('2031-02-28' as CalendarDate, 'ANNUAL', 29)).toBe('2032-02-29');
    expect(nextOccurrenceAfter('2026-11-30' as CalendarDate, 'QUARTERLY', 30)).toBe('2027-02-28');
    expect(occurrencesThrough('2027-01-31' as CalendarDate, 'MONTHLY', '2027-05-31' as CalendarDate, 31)).toEqual(['2027-01-31', '2027-02-28', '2027-03-31', '2027-04-30', '2027-05-31']);
    // A bill paid on Feb 28 (anchored to the 31st) returns to Mar 31.
    const r = createBillOrSubscription({ name: 'RENT', amount: 900, cadence: 'MONTHLY', next_due_date: '2027-01-31' as CalendarDate, kind: 'BILL', account_id: 'bank' });
    const ob = r.ok ? r.value : null!;
    markObligationPaid(ob, { amount: 900, account_id: 'bank', paid_on: '2027-01-30' as CalendarDate });
    const feb = getRepository().getSnapshot().obligations.find((o) => o.obligation_id === ob.obligation_id)!;
    expect(feb.next_due_date).toBe('2027-02-28');
    markObligationPaid(feb, { amount: 900, account_id: 'bank', paid_on: '2027-02-27' as CalendarDate });
    expect(getRepository().getSnapshot().obligations.find((o) => o.obligation_id === ob.obligation_id)!.next_due_date).toBe('2027-03-31');
  });

  it('Z. one event is counted once across income, transfers, payments and the ledger', () => {
    saveDailyEarnings(earnings());
    recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 150, occurred_on: TODAY });
    recordTransfer({ from_account_id: 'ride', to_account_id: 'visa', amount: 45, occurred_on: TODAY });
    recordExpense({ merchant: 'GROCER', amount: 65, account_id: 'visa', category: 'GROCERIES', occurred_on: TODAY });
    recordExpense({ merchant: 'LUNCH', amount: 12.45, account_id: 'cash', category: 'FOOD', occurred_on: TODAY });
    const s = getRepository().getSnapshot();
    const t = flowTotals(s.transactions, s.accounts, TODAY, TODAY, TODAY);
    expect(t).toMatchObject({ income: 195, spending: 77.45, transfers: 150, cardPayments: 45 });
    const sum = summarizePositions(computeLedgerPositions(s.accounts, s.creditAttributes, s.transactions, TODAY).positions);
    // Owned money: start 840, + 195 earned, − 45 card payment, − 12.45 cash lunch. Transfers and the card purchase do not change it.
    expect(sum.ownedAssets).toBe(977.55);
    expect(sum.owed).toBe(420);
    expect(sum.netWorth).toBe(557.55);
  });
});
