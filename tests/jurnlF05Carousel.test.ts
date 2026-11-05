/**
 * P0.JURNL.F05-MONEY.PARENT-FOUR-PANEL-CAROUSEL — the four collections read their canonical owners only.
 * Synthetic world (tests/helpers/jurnlFinancialWorld.ts).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { commitmentParts, computeMoneyCarousel, COLLECTIONS } from '../src/projects/jurnl/data/f05/moneyCarousel';
import { f05BoardType, F05_PAPER_VALUE_ROW_SUB_PX, panelNameFont, paperRhythm, PANEL_TITLE_LINES } from '../src/projects/jurnl/runtime/screens/f05/CarouselPanelPaper';
import { F05_COMPOSITION as C } from '../src/projects/jurnl/runtime/screens/f05/f05Composition';
import { computeMoneyParentReading } from '../src/projects/jurnl/data/f05/moneyParentReading';
import { computeSafeToSpend, nextExpectedIncome } from '../src/projects/jurnl/data/f09/safeToSpend';
import { createBillOrSubscription } from '../src/projects/jurnl/data/f07/obligationLifecycle';
import { createGoal, setGoalAside } from '../src/projects/jurnl/data/f14/goalsStore';
import { createIncomeSource } from '../src/projects/jurnl/data/f06/incomeStore';
import { recordExpense, recordTransfer, recordTransferStep } from '../src/projects/jurnl/data/ledger/ledgerOps';
import { upsertCreditTerms } from '../src/projects/jurnl/data/f12/creditStore';
import { addDays } from '../src/projects/jurnl/data/foundation/dates';
import { getRepository } from '../src/projects/jurnl/data/repository/deviceRepository';
import { TODAY, acct, world } from './helpers/jurnlFinancialWorld';
import { f05Accounts, f05World } from '../e2e/jurnl/helpers/jurnl-f05-world';
import { buildExpense, buildTransfer } from '../src/projects/jurnl/data/ledger/ledgerOps';
import { buildCreateObligation } from '../src/projects/jurnl/data/f07/obligationLifecycle';
import { importSnapshotForUser, setRepositoryUserId } from '../src/projects/jurnl/data/repository/deviceRepository';
import type { RepositorySnapshot } from '../src/projects/jurnl/data/repository/types';

const fmt = (n: number) => `USD ${n}`;
const read = () => computeMoneyCarousel(TODAY, fmt);
const panel = (coll: 'transfers' | 'commitments' | 'outlook', id: string) => read()[coll].find((p) => p.id === id)!;

function approved() {
  world({
    user: 'f05-carousel@jurnl.test',
    accounts: [
      acct('bank', 'BANK ACCOUNT', 'CHECKING', 1260),
      acct('ride', 'RIDESHARE CARD', 'DEBIT_CARD', 840, { is_payout_card: true }),
      acct('cash', 'CASH ON HAND', 'CASH', 350),
      acct('visa', 'CREDIT CARD', 'CREDIT_CARD', 780, { credit_limit: 2000, include_in_safe_to_spend: false }),
    ],
  });
  upsertCreditTerms('visa', { credit_limit: 2000, current_balance: 780, minimum_payment: 35, payment_due_date: addDays(TODAY, 5), statement_closing_date: addDays(TODAY, -10) });
}

describe('Four collections, fixed', () => {
  it('ACCOUNTS · TRANSFERS · COMMITMENTS · OUTLOOK, four panels each', () => {
    approved();
    expect(COLLECTIONS.map((c) => c.id)).toEqual(['accounts', 'transfers', 'commitments', 'outlook']);
    const c = read();
    expect([c.transfers.length, c.commitments.length, c.outlook.length]).toEqual([4, 4, 4]);
  });
});

describe('Collection 02 — transfers follow the #1706 settlement model', () => {
  beforeEach(() => approved());

  it('nothing in progress: honest empty panels, no invented amounts', () => {
    const t = read().transfers;
    expect(t.map((p) => [p.id, p.value.kind])).toEqual([['in_transit', 'none'], ['pending', 'none'], ['scheduled', 'none'], ['recent', 'link']]);
    expect(t[0]!.value).toMatchObject({ text: 'NONE', caption: 'NOTHING MOVING' });
  });

  it('in transit, pending and scheduled sum their own states; balances follow the ledger', () => {
    const a = recordTransfer({ from_account_id: 'ride', to_account_id: 'bank', amount: 80, occurred_on: TODAY, start: 'IN_TRANSIT' });
    recordTransfer({ from_account_id: 'bank', to_account_id: 'cash', amount: 60, occurred_on: TODAY, start: 'PENDING' });
    recordTransfer({ from_account_id: 'bank', to_account_id: 'ride', amount: 200, occurred_on: addDays(TODAY, 1), start: 'SCHEDULED' });
    const t = read().transfers;
    expect(t[0]!.value).toEqual({ kind: 'amount', amount: 80, caption: 'LEFT, NOT ARRIVED' });
    expect(t[1]!.value).toEqual({ kind: 'amount', amount: 60, caption: 'AWAITING CONFIRMATION' });
    expect(t[2]!.value).toEqual({ kind: 'amount', amount: 200, caption: 'TOMORROW' });
    // one transfer in a group opens that transfer's step sheet
    expect(t[0]!.dest).toEqual({ kind: 'transfer', linkId: a.ok ? a.value.linkId : '' });
    // the destination is not credited while in transit; scheduled and pending moved nothing
    const r = computeMoneyParentReading(TODAY);
    expect(r.accounts.find((x) => x.account_id === 'bank')!.amount).toBe(1260);
    expect(r.accounts.find((x) => x.account_id === 'ride')!.amount).toBe(760);
    expect(r.accounts.find((x) => x.account_id === 'cash')!.amount).toBe(350);
    // arrival removes it from the panel (the ledger moved it)
    recordTransferStep(a.ok ? a.value.linkId : '', 'RECEIVED');
    expect(read().transfers[0]!.value.kind).toBe('none');
  });
});

describe('Collection 03 — commitments: one reservation engine, nothing counted twice', () => {
  beforeEach(() => approved());

  it('bills + upcoming payments + held back = COMMITTED (the band figure); savings is part of held back', () => {
    createBillOrSubscription({ name: 'PHONE', amount: 90, cadence: 'MONTHLY', next_due_date: addDays(TODAY, 6), kind: 'BILL', account_id: 'bank' });
    createBillOrSubscription({ name: 'STREAMING', amount: 15, cadence: 'MONTHLY', next_due_date: addDays(TODAY, 12), kind: 'SUBSCRIPTION', account_id: 'bank' });
    const g = createGoal({ title: 'TRIP FUND', target_amount: 1000, target_date: null });
    setGoalAside(g.goal_id, 120);
    const p = commitmentParts();
    const r = computeMoneyParentReading(TODAY);
    const sts = computeSafeToSpend();
    expect(p.bills).toBe(sts.upcoming);
    expect(p.upcomingPayments).toBe(sts.cardPayments + sts.committedTransfers);
    expect(p.goals).toBe(120);
    expect(p.heldBack).toBeGreaterThanOrEqual(p.goals);
    expect(p.committed).toBeCloseTo(r.committed, 2);
    const c = read().commitments;
    expect(c.map((x) => x.id)).toEqual(['bills', 'savings', 'upcoming', 'reserved']);
    expect(c[0]!.value).toMatchObject({ kind: 'amount', amount: sts.upcoming, caption: 'NEXT 30 DAYS' });
    expect(c[1]!.value).toMatchObject({ kind: 'amount', amount: 120, caption: 'SET ASIDE FOR GOALS' });
    expect(c[1]!.aria).toContain('NOT MOVED');
    expect(c[2]!.value).toMatchObject({ kind: 'amount', amount: 35, caption: 'NEXT 30 DAYS' });
    expect(c[2]!.aria).toContain('IN CARD MINIMUMS DUE IN 30 DAYS');
    expect(c[3]!.value).toMatchObject({ kind: 'amount', amount: r.committed, caption: 'TOTAL COMMITTED' });
    // a goal set-aside moves no money: balances are unchanged
    expect(r.held).toBe(2450);
  });

  it('no bills and no goals: said plainly', () => {
    const c = read().commitments;
    expect(c[0]!.value).toMatchObject({ kind: 'none', caption: 'NO BILLS ADDED' });
    expect(c[1]!.value).toMatchObject({ kind: 'none', caption: 'NO GOALS YET' });
  });
});

describe('Collection 04 — outlook', () => {
  beforeEach(() => approved());

  it('Safe to Spend is F09 (30 days); next income is F06 expected income, never added to money held', () => {
    const r = computeMoneyParentReading(TODAY);
    expect(panel('outlook', 'safe_to_spend').value).toMatchObject({ kind: 'amount', amount: computeSafeToSpend().value, caption: 'NEXT 30 DAYS' });
    expect(panel('outlook', 'next_income').value).toMatchObject({ kind: 'none', text: 'NOT SET', caption: 'ADD A DATE' });
    expect(panel('outlook', 'next_income').dest).toEqual({ kind: 'route', route: 'income', query: { add: 'expected' } });
    createIncomeSource({ source_name: 'PAYCHECK', amount: 780, cadence: 'MONTHLY', next_due_date: addDays(TODAY, 5), account_id: 'bank' });
    expect(nextExpectedIncome(TODAY)).toMatchObject({ amount: 780 });
    expect(panel('outlook', 'next_income').value).toMatchObject({ kind: 'amount', amount: 780, caption: 'IN 5 DAYS' });
    expect(panel('outlook', 'next_income').aria).toContain('EXPECTED, NOT RECEIVED');
    expect(computeMoneyParentReading(TODAY).held).toBe(r.held);
    expect(computeSafeToSpend().value).toBe(r.available);
  });

  it('spending is the recorded spending of the last 30 days; forecast opens F15', () => {
    expect(panel('outlook', 'insights').value).toMatchObject({ kind: 'none', caption: 'NO RECORDS' });
    recordExpense({ merchant: 'GROCER', amount: 42.5, account_id: 'bank', category: 'GROCERIES', occurred_on: TODAY });
    expect(panel('outlook', 'insights').value).toMatchObject({ kind: 'amount', amount: 42.5, caption: 'LAST 30 DAYS' });
    expect(panel('outlook', 'insights').aria).toContain('RECORDED IN THE LAST 30 DAYS');
    expect(panel('outlook', 'forecast').dest).toEqual({ kind: 'route', route: 'ahead' });
  });
});

describe('Read-only', () => {
  it('reading the carousel changes no record, and the module never writes', () => {
    approved();
    const before = JSON.stringify(getRepository().getSnapshot());
    read();
    read();
    expect(JSON.stringify(getRepository().getSnapshot())).toBe(before);
    const src = readFileSync(path.resolve('src/projects/jurnl/data/f05/moneyCarousel.ts'), 'utf8');
    expect(src).not.toMatch(/\b(recordTransfer|recordTransferStep|createGoal|setGoalAside|createBillOrSubscription|createManualAccount|setAccountBalance)\s*\(|\.commit\(|localStorage/);
  });
});

describe('The E2E carousel world is what the app itself records', () => {
  // The Playwright loader cannot import the ledger builders, so the E2E world writes the same records literally.
  // This guard keeps the two identical (ids and timestamps aside).
  const strip = (x: Record<string, unknown>) => {
    const { id: _id, recorded_at: _r, settlement_history: h, obligation_id: _o, created_at: _c, updated_at: _u, ...rest } = x as Record<string, unknown> & { settlement_history?: { state: string; action: string }[] };
    return { ...rest, ...(h ? { settlement_history: h.map((e) => ({ state: e.state, action: e.action })) } : {}) };
  };
  it('transfer legs, purchases and bills match the builders', () => {
    const w = f05World('carousel');
    const accounts = f05Accounts('carousel');
    const built: Record<string, unknown>[] = [];
    const entries: never[] = [];
    for (const [from, to, amount, on, start] of [['ride', 'bank', 80, TODAY, 'IN_TRANSIT'], ['bank', 'cash', 60, TODAY, 'PENDING'], ['bank', 'ride', 200, addDays(TODAY, 1), 'SCHEDULED']] as const) {
      const r = buildTransfer(accounts, entries, { from_account_id: from, to_account_id: to, amount, occurred_on: on, start, allowDuplicate: true });
      if (!r.ok) throw new Error(r.error);
      built.push(...r.value.legs.map((l) => ({ ...l, link: { ...l.link!, id: 'L' } })));
    }
    for (const e of [{ merchant: 'GROCER', amount: 42.5, account_id: 'bank', category: 'GROCERIES', occurred_on: TODAY }, { merchant: 'FUEL', amount: 38, account_id: 'ride', category: 'TRANSPORT', occurred_on: addDays(TODAY, -1) }]) {
      const r = buildExpense(accounts, e);
      if (!r.ok) throw new Error(r.error);
      built.push(r.value);
    }
    const literal = w.snapshot.transactions.map((l) => ({ ...l, link: l.link ? { ...l.link, id: 'L' } : null }));
    expect(literal.map((x) => strip(x as unknown as Record<string, unknown>))).toEqual(built.map(strip));
    const bills = [['PHONE', 90, 6, 'BILL'], ['STREAMING', 15, 12, 'SUBSCRIPTION'], ['INSURANCE', 75, 20, 'BILL']] as const;
    const builtBills = bills.map(([name, amount, d, kind]) => {
      const r = buildCreateObligation({ name, amount, cadence: 'MONTHLY', next_due_date: addDays(TODAY, d), kind, account_id: 'bank' });
      if (!r.ok) throw new Error(r.error);
      return strip(r.value as unknown as Record<string, unknown>);
    });
    expect(w.snapshot.obligations.map((o) => strip(o as unknown as Record<string, unknown>))).toEqual(builtBills);
  });

  it('read through the carousel, the world gives the figures the E2E suite asserts', () => {
    const w = f05World('carousel');
    setRepositoryUserId(w.snapshot.userId);
    importSnapshotForUser(w.snapshot.userId, w.snapshot as unknown as RepositorySnapshot);
    const c = computeMoneyCarousel(TODAY, fmt);
    const v = (coll: 'transfers' | 'commitments' | 'outlook', id: string) => c[coll].find((p) => p.id === id)!.value;
    expect([v('transfers', 'in_transit'), v('transfers', 'pending'), v('transfers', 'scheduled')].map((x) => (x.kind === 'amount' ? x.amount : null))).toEqual([80, 60, 200]);
    expect([v('commitments', 'bills'), v('commitments', 'savings'), v('commitments', 'upcoming')].map((x) => (x.kind === 'amount' ? x.amount : null))).toEqual([180, 120, 35]);
    expect(v('commitments', 'reserved')).toMatchObject({ kind: 'amount', amount: c.reading.committed });
    expect(c.reading.committed).toBe(180 + 35 + 120);
    expect(v('outlook', 'next_income')).toMatchObject({ kind: 'amount', amount: 780 });
    expect(v('outlook', 'insights')).toMatchObject({ kind: 'amount', amount: 80.5 });
    expect(c.reading.held).toBe(1217.5 + 722 + 350);
  });
});

describe('Panel paper rhythm', () => {
  it('adds 4px to the bills + subscriptions panel title only', () => {
    const bills = read().commitments.find((p) => p.id === 'bills')!;
    const savings = read().commitments.find((p) => p.id === 'savings')!;
    expect(panelNameFont(bills)).toMatch(/\+ 4px\)$/);
    expect(panelNameFont(savings)).not.toContain('+ 4px');
  });

  it('subtracts one extra screen px from paper value row type', () => {
    expect(f05BoardType(46, F05_PAPER_VALUE_ROW_SUB_PX)).toBe('calc(46px - var(--f05-type-nudge, 0px) - 1px)');
  });

  it('reserves two title lines so one-line and two-line panels share amount and caption rows', () => {
    const h = 292;
    const one = paperRhythm(1, h);
    const two = paperRhythm(2, h);
    expect(one.amountTop).toBe(two.amountTop);
    expect(one.captionTop).toBe(two.captionTop);
    expect(one.amountTop).toBe(C.panel.nameTop + PANEL_TITLE_LINES * C.card.namePitch + C.panel.amountGap);
  });
});
