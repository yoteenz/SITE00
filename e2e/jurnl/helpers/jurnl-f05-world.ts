/**
 * Synthetic worlds for the F05 MONEY motion pilot (no real data). APPROVED mirrors the reference composition's four
 * places (names and amounts are inputs, not baked into any asset): BANK ACCOUNT $1,260 · RIDESHARE CARD $840 (payout
 * debit) · CASH ON HAND $350 · CREDIT CARD owes $780 of $2,000, minimum $35 due in 5 days.
 *
 * CAROUSEL adds what the four collections read, as the records the app's own sheets write (same shapes as
 * ledgerOps.buildTransfer / buildExpense and obligationLifecycle.buildCreateObligation, which the Playwright loader
 * cannot import): an $80 transfer in transit (RIDESHARE CARD → BANK ACCOUNT), $60 pending (BANK → CASH), $200
 * scheduled for tomorrow (BANK → RIDESHARE), three bills ($90 + $15 + $75 within 30 days), a goal with $120 set
 * aside, an expected $780 paycheck in 5 days and two recorded purchases ($42.50 + $38).
 */
import type { JurnlAccountRecord } from '../../../src/projects/jurnl/data/foundation/accounts';
import { addDays, getTodayKey } from '../../../src/projects/jurnl/data/foundation/dates';
import type { JurnlGoal } from '../../../src/projects/jurnl/data/foundation/goals';
import type { JurnlIncomeSource } from '../../../src/projects/jurnl/data/foundation/income';
import type { JurnlObligation } from '../../../src/projects/jurnl/data/foundation/obligations';
import type { LedgerEntry } from '../../../src/projects/jurnl/data/home/moneyTypes';
import { acct, financialWorld } from './jurnl-financial-world';

const TODAY = getTodayKey();

export type F05WorldKind = 'approved' | 'none' | 'one' | 'many' | 'carousel';

function card(id: string, owed: number, limit: number, min: number) {
  const now = new Date().toISOString();
  return {
    account_id: id,
    credit_limit: limit,
    current_balance: owed,
    minimum_payment: min,
    payment_due_day: null,
    statement_day: null,
    apr: 24.9,
    statement_balance: owed,
    statement_closing_date: addDays(TODAY, -10),
    payment_due_date: addDays(TODAY, 5),
    carries_interest_balance: false,
    terms_entered_at: now,
    updated_at: now,
  };
}

export function f05Accounts(kind: F05WorldKind): JurnlAccountRecord[] {
  const approved = [
    acct('bank', 'BANK ACCOUNT', 'CHECKING', 1260),
    acct('ride', 'RIDESHARE CARD', 'DEBIT_CARD', 840, { is_payout_card: true }),
    acct('cash', 'CASH ON HAND', 'CASH', 350),
    acct('visa', 'CREDIT CARD', 'CREDIT_CARD', 780, { credit_limit: 2000, available_balance: 1220, include_in_safe_to_spend: false }),
  ];
  if (kind === 'none') return [];
  if (kind === 'carousel') return approved;
  if (kind === 'one') return [approved[0]!];
  if (kind === 'many')
    return [
      ...approved,
      acct('save', 'EMERGENCY SAVINGS', 'SAVINGS', 2400, { include_in_safe_to_spend: false }),
      acct('long', 'NEIGHBOURHOOD CREDIT UNION EVERYDAY CHECKING', 'CHECKING', 95.5),
      acct('loan', 'CAR LOAN', 'LOAN', 6400, { include_in_safe_to_spend: false }),
    ];
  return approved;
}

type LegSettlement = NonNullable<LedgerEntry['settlement']>;

function leg(id: string, p: { merchant: string; amount: number; direction: 'INCOME' | 'EXPENSE'; account: JurnlAccountRecord; txn_class: 'TRANSFER' | 'EXPENSE'; category: string; occurred_on: string; link?: LedgerEntry['link']; counterparty?: string; settlement?: LegSettlement }, at: string): LedgerEntry {
  return {
    id,
    merchant: p.merchant,
    amount: p.amount,
    direction: p.direction,
    when: p.occurred_on,
    account: p.account.display_name,
    account_id: p.account.account_id,
    category: p.category,
    status: p.settlement != null && p.settlement !== 'SETTLED' ? 'PENDING' : 'CLEARED',
    recurring: false,
    memo: '',
    source: 'ADDED',
    related: null,
    txn_class: p.txn_class,
    occurred_on: p.occurred_on,
    recorded_at: at,
    confirmation: 'RECORDED_BY_YOU',
    origin_family: p.txn_class === 'TRANSFER' ? 'F05' : 'F04',
    link: p.link ?? null,
    obligation_id: null,
    occurrence_date: null,
    counterparty_account_id: p.counterparty ?? null,
    ...(p.settlement ? { settlement: p.settlement, settlement_history: [{ at, state: p.settlement, action: 'RECORDED' as const }] } : {}),
  } as LedgerEntry;
}

/** The records the TRANSFERS, COMMITMENTS and OUTLOOK collections read. */
function carouselRecords(accounts: JurnlAccountRecord[]) {
  const now = new Date().toISOString();
  const byId = (id: string) => accounts.find((a) => a.account_id === id)!;
  const tx: LedgerEntry[] = [];
  // the two legs of a transfer, settled as buildTransfer records each start state
  const transfer = (linkId: string, from: string, to: string, amount: number, occurred_on: string, start: 'IN_TRANSIT' | 'PENDING' | 'SCHEDULED') => {
    const out: LegSettlement = start === 'IN_TRANSIT' ? 'SETTLED' : start;
    const inn: LegSettlement = start === 'IN_TRANSIT' ? 'PENDING' : start;
    const F = byId(from);
    const T = byId(to);
    tx.push(leg(`tx-${linkId}-out`, { merchant: `TRANSFER TO ${T.display_name}`, amount, direction: 'EXPENSE', account: F, txn_class: 'TRANSFER', category: 'TRANSFER', occurred_on, link: { kind: 'TRANSFER', id: linkId, leg: 'OUT' }, counterparty: to, settlement: out }, now));
    tx.push(leg(`tx-${linkId}-in`, { merchant: `TRANSFER FROM ${F.display_name}`, amount, direction: 'INCOME', account: T, txn_class: 'TRANSFER', category: 'TRANSFER', occurred_on, link: { kind: 'TRANSFER', id: linkId, leg: 'IN' }, counterparty: from, settlement: inn }, now));
    return linkId;
  };
  const links = {
    inTransit: transfer('xfer-e2e-transit', 'ride', 'bank', 80, TODAY, 'IN_TRANSIT'),
    pending: transfer('xfer-e2e-pending', 'bank', 'cash', 60, TODAY, 'PENDING'),
    scheduled: transfer('xfer-e2e-scheduled', 'bank', 'ride', 200, addDays(TODAY, 1), 'SCHEDULED'),
  };
  tx.push(leg('tx-e2e-grocer', { merchant: 'GROCER', amount: 42.5, direction: 'EXPENSE', account: byId('bank'), txn_class: 'EXPENSE', category: 'GROCERIES', occurred_on: TODAY }, now));
  tx.push(leg('tx-e2e-fuel', { merchant: 'FUEL', amount: 38, direction: 'EXPENSE', account: byId('ride'), txn_class: 'EXPENSE', category: 'TRANSPORT', occurred_on: addDays(TODAY, -1) }, now));
  const bill = (id: string, name: string, amount: number, inDays: number, kind: 'BILL' | 'SUBSCRIPTION'): JurnlObligation => {
    const next = addDays(TODAY, inDays);
    return { obligation_id: id, name, amount, currency: 'USD', cadence: 'MONTHLY', next_due_date: next, kind, account_id: 'bank', status: 'ACTIVE', skipped_once: false, created_at: now, updated_at: now, archived_at: null, anchor_day: Number(next.slice(8, 10)), category: null, trial_end_date: null, notes: '', price_history: [], occurrence_log: [], linked_card_account_id: null } as JurnlObligation;
  };
  const obligations = [bill('obl-e2e-phone', 'PHONE', 90, 6, 'BILL'), bill('obl-e2e-streaming', 'STREAMING', 15, 12, 'SUBSCRIPTION'), bill('obl-e2e-insurance', 'INSURANCE', 75, 20, 'BILL')];
  const goals: JurnlGoal[] = [
    { goal_id: 'goal-trip', title: 'TRIP FUND', target_amount: 1000, set_aside_amount: 120, target_date: null, horizon: null, meaning: '', linked_plan_id: null, status: 'ACTIVE', created_at: now, updated_at: now, completed_at: null, archived_at: null },
  ];
  const paycheck: JurnlIncomeSource = {
    income_id: 'inc-paycheck',
    source_name: 'PAYCHECK',
    amount: 780,
    currency: 'USD',
    cadence: 'MONTHLY',
    next_due_date: addDays(TODAY, 5),
    account_id: 'bank',
    status: 'EXPECTED',
    linked_transaction_id: null,
    is_estimated: false,
    notes: '',
    created_at: now,
    updated_at: now,
    archived_at: null,
  };
  return { tx, obligations, goals, paycheck, links };
}

export function f05World(kind: F05WorldKind = 'approved') {
  const base = financialWorld();
  const accounts = f05Accounts(kind);
  const cards = accounts.filter((a) => a.account_type === 'CREDIT_CARD').map((a) => card(a.account_id, a.balance, a.credit_limit ?? 2000, 35));
  if (kind === 'carousel') {
    const r = carouselRecords(accounts);
    return {
      ...base,
      links: r.links,
      snapshot: { ...base.snapshot, accounts, creditAttributes: cards, transactions: r.tx, obligations: r.obligations, goals: r.goals, incomeSources: [...base.snapshot.incomeSources, r.paycheck] },
    };
  }
  return { ...base, snapshot: { ...base.snapshot, accounts, creditAttributes: cards, transactions: [], obligations: [] } };
}
