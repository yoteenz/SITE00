/**
 * Accounting invariants A–L for connected banking (pure ledger functions; synthetic values only).
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { applyBankPull, type BankPull } from '../../../src/projects/jurnl/data/banking/ingest';
import { importAndReconcile, rereconcile } from '../../../src/projects/jurnl/data/banking/bankLedger';
import { isActivityEntry } from '../../../src/projects/jurnl/data/banking/activity';
import { connectionHealth } from '../../../src/projects/jurnl/data/banking/health';
import { computeLedgerPositions, flowTotals } from '../../../src/projects/jurnl/data/ledger/accounting';
import { setRepositoryDataMode } from '../../../src/projects/jurnl/data/repository/dataMode';
import { emptySnapshotForUser, importSnapshotForUser } from '../../../src/projects/jurnl/data/repository/deviceRepository';
import { bankFactsFor } from '../../../src/projects/jurnl/data/f09/safeToSpend';
import { MOCK_ENTRIES } from '../../../src/projects/jurnl/data/home/mockScenario';
import type { BankAccountView, BankItemView, BankTransactionView } from '../../../src/projects/jurnl/data/banking/types';
import type { RepositorySnapshot } from '../../../src/projects/jurnl/data/repository/types';
import type { LedgerEntry } from '../../../src/projects/jurnl/data/home/moneyTypes';
import type { CalendarDate } from '../../../src/projects/jurnl/data/foundation/dates';

const T0 = '2026-11-07T09:00:00.000Z';
const item = (id: string, name: string, p: Partial<BankItemView> = {}): BankItemView => ({
  item_id: id, provider: 'PLAID', provider_env: 'sandbox', institution_id: `ins-${id}`, institution_name: name, status: 'ACTIVE', products: ['transactions'],
  consent_granted_at: T0, consent_expires_at: null, last_sync_started_at: T0, last_successful_sync_at: T0, last_balance_at: T0, last_webhook_at: null,
  last_error_code: null, last_error_at: null, new_accounts_available: false, disconnected_at: null, provider_revoked_at: null, created_at: T0, updated_at: T0, ...p,
});
const account = (itemId: string, id: string, type: string, subtype: string, p: Partial<BankAccountView> = {}): BankAccountView => ({
  bank_account_id: `${itemId}-${id}`, item_id: itemId, provider_account_id: id, persistent_account_id: null, name: id.toUpperCase(), official_name: null, mask: id.slice(-4),
  type, subtype, iso_currency_code: 'USD', unofficial_currency_code: null, current_balance: 0, available_balance: 0, credit_limit: null, balance_as_of: T0, status: 'ACTIVE', updated_at: T0, ...p,
});
let rev = 0;
const tx = (itemId: string, acct: string, id: string, amount: number, date: string, p: Partial<BankTransactionView> = {}): BankTransactionView => ({
  item_id: itemId, provider_account_id: acct, provider_transaction_id: id, pending: false, pending_transaction_id: null, amount, iso_currency_code: 'USD', unofficial_currency_code: null,
  date, authorized_date: null, name: null, merchant_name: null, merchant_entity_id: null, counterparty_names: null, pfc_primary: null, pfc_detailed: null, pfc_confidence: null,
  payment_channel: 'online', transaction_code: null, provider_state: 'ACTIVE', revision: 1, first_seen_at: T0, last_changed_at: `2026-11-07T09:00:${String(++rev % 60).padStart(2, '0')}.000Z`, removed_at: null, ...p,
});

const CHK = item('bank', 'SYNTHETIC BANK');
const PAY = item('pay', 'SYNTHETIC PAYOUT CARD');
const CARD = item('card', 'SYNTHETIC CARD CO');
const accounts = [
  account('bank', 'chk0001', 'depository', 'checking', { current_balance: 1500, available_balance: 1450 }),
  account('pay', 'pay0002', 'depository', 'prepaid', { current_balance: 300, available_balance: 300 }),
  account('card', 'cc0003', 'credit', 'credit card', { current_balance: 420, available_balance: 1580, credit_limit: 2000 }),
];

let snap: RepositorySnapshot;
const pull = (transactions: BankTransactionView[], extra: Partial<BankPull> = {}): BankPull => ({ items: [CHK, PAY, CARD], accounts, transactions, pulledAt: T0, ...extra });

/** Imports + reconciles and folds the commit back into `snap` (what repository.commit does). */
function apply(p: BankPull) {
  const { commit } = importAndReconcile(snap, p);
  const up = <T>(list: T[], items: T[] | undefined, key: (t: T) => string) => {
    const m = new Map(list.map((x) => [key(x), x]));
    for (const i of items ?? []) m.set(key(i), i);
    return [...m.values()];
  };
  snap = { ...snap, accounts: up(snap.accounts, commit.accounts.upsert, (a) => a.account_id), transactions: up(snap.transactions, commit.transactions.upsert, (t) => t.id), reservations: up(snap.reservations, commit.reservations.upsert, (r) => r.reservation_id), bank: commit.bank };
  return commit;
}
const acctId = (provId: string) => snap.bank!.accountLinks[Object.keys(snap.bank!.accountLinks).find((k) => k.endsWith(`:${provId}`))!];
const imported = () => snap.transactions.filter((e) => e.source === 'IMPORTED');
const totals = () => flowTotals(snap.transactions, snap.accounts, '2026-10-01' as CalendarDate, '2026-11-30' as CalendarDate, '2026-11-07' as CalendarDate);
const added = (p: Partial<LedgerEntry> & Pick<LedgerEntry, 'id' | 'amount' | 'direction' | 'account_id'>): LedgerEntry => ({
  merchant: 'ENTRY', when: '2026-11-05', account: '', category: 'OTHER', status: 'CLEARED', recurring: false, memo: '', source: 'ADDED', related: null, occurred_on: '2026-11-05' as CalendarDate, recorded_at: '2026-11-05T12:00:00.000Z', ...p,
});

beforeEach(() => {
  setRepositoryDataMode('PRODUCTION');
  snap = emptySnapshotForUser('user-1');
});

describe('J · no preview fixtures in a new real account', () => {
  it('production and sandbox snapshots start empty; preview data is refused on import', () => {
    expect(snap.transactions).toHaveLength(0);
    expect(snap.accounts).toHaveLength(0);
    expect(snap.dataMode).toBe('PRODUCTION');
    expect(snap.transactions.some((t) => MOCK_ENTRIES.some((m) => m.id === t.id))).toBe(false);
    expect(importSnapshotForUser('user-1', { ...snap, dataMode: 'DESIGN_PREVIEW', transactions: [...MOCK_ENTRIES] })).toBe(false);
    setRepositoryDataMode('PROVIDER_SANDBOX');
    const sb = emptySnapshotForUser('user-2');
    expect(sb).toMatchObject({ dataMode: 'PROVIDER_SANDBOX', transactions: [], accounts: [] });
  });
});

describe('A · no duplicate imported transactions', () => {
  it('re-applying the same pull (and overlapping pulls) changes nothing', () => {
    const rows = [tx('bank', 'chk0001', 't1', 12.5, '2026-11-02', { merchant_name: 'SYNTHETIC GROCER' }), tx('card', 'cc0003', 't2', 30, '2026-11-03')];
    apply(pull(rows));
    const first = JSON.stringify(imported());
    apply(pull(rows));
    apply(pull([rows[1]]));
    expect(imported()).toHaveLength(2);
    expect(JSON.stringify(imported())).toBe(first);
  });

  it('pending → posted stays ONE entry (posted names its pending one); spending counts it once at the posted amount', () => {
    apply(pull([tx('card', 'cc0003', 'p1', 40, '2026-11-04', { pending: true, merchant_name: 'SYNTHETIC CAFE' })]));
    const id = imported()[0].id;
    apply(pull([tx('card', 'cc0003', 'p1', 40, '2026-11-04', { provider_state: 'REMOVED', revision: 2 }), tx('card', 'cc0003', 'p1-posted', 42.3, '2026-11-05', { pending_transaction_id: 'p1', merchant_name: 'SYNTHETIC CAFE' })]));
    expect(imported()).toHaveLength(1);
    const e = imported()[0];
    expect(e.id).toBe(id);
    expect(e.import).toMatchObject({ provider_transaction_id: 'p1-posted', root_transaction_id: 'p1', pending: false, provider_state: 'ACTIVE' });
    expect(e.import!.history.map((h) => h.change)).toEqual(['ADDED', 'POSTED']);
    expect(totals().spending).toBe(42.3);
  });

  it('a provider removal is never silently dropped: kept as REMOVED history, not counted', () => {
    apply(pull([tx('bank', 'chk0001', 'r1', 9.99, '2026-11-02')]));
    apply(pull([tx('bank', 'chk0001', 'r1', 9.99, '2026-11-02', { provider_state: 'REMOVED', revision: 2 })]));
    expect(imported()[0].import!.provider_state).toBe('REMOVED');
    expect(isActivityEntry(imported()[0])).toBe(false);
    expect(totals().spending).toBe(0);
  });
});

describe('B · no double-counted rideshare income', () => {
  it('a payout the user already recorded as daily earnings is counted once, through the earnings record', () => {
    apply(pull([]));
    const pay = acctId('pay0002');
    snap = { ...snap, transactions: [added({ id: 'leg-digital', amount: 182.4, direction: 'INCOME', account_id: pay, txn_class: 'INCOME', link: { kind: 'DAILY_EARNINGS', id: 'de-1', leg: 'DIGITAL' }, occurred_on: '2026-11-05' as CalendarDate })] };
    apply(pull([tx('pay', 'pay0002', 'u1', -182.4, '2026-11-05', { counterparty_names: ['UBER'], name: 'UBER EARNINGS', pfc_primary: 'INCOME' })]));
    const payout = imported()[0];
    expect(payout.category_detail).toBe('RIDESHARE PAYOUT');
    expect(payout.bank_match).toMatchObject({ kind: 'EARNINGS_PAYOUT', superseded: true, counted_by: 'leg-digital' });
    expect(totals().income).toBe(182.4);
  });

  it('without a manual record the payout is income at its NET amount (gross is never fabricated)', () => {
    apply(pull([tx('pay', 'pay0002', 'u2', -95, '2026-11-05', { counterparty_names: ['LYFT'] })]));
    expect(totals().income).toBe(95);
    expect(imported()[0].category_detail).toBe('RIDESHARE PAYOUT');
  });
});

describe('C · no income created by internal transfers', () => {
  it('checking → payout card: both legs matched as ONE transfer, neither income nor spending', () => {
    apply(pull([tx('bank', 'chk0001', 'x-out', 250, '2026-11-03', { name: 'ONLINE TRANSFER TO CARD', pfc_primary: 'TRANSFER_OUT', pfc_detailed: 'TRANSFER_OUT_ACCOUNT_TRANSFER' }), tx('pay', 'pay0002', 'x-in', -250, '2026-11-04', { name: 'TRANSFER FROM CHECKING', pfc_primary: 'TRANSFER_IN', pfc_detailed: 'TRANSFER_IN_ACCOUNT_TRANSFER' })]));
    const m = snap.bank!.matches.find((x) => x.kind === 'TRANSFER')!;
    expect(m.status).toBe('AUTO_MATCHED');
    expect(imported().every((e) => e.txn_class === 'TRANSFER' && e.link?.kind === 'TRANSFER')).toBe(true);
    expect(totals()).toMatchObject({ income: 0, spending: 0, transfers: 250 });
  });

  it('equal amounts alone are NOT auto-matched (suggested for confirmation instead)', () => {
    apply(pull([tx('bank', 'chk0001', 'e-out', 60, '2026-11-03', { name: 'SYNTHETIC STORE' }), tx('pay', 'pay0002', 'e-in', -60, '2026-11-03', { name: 'DEPOSIT' })]));
    const m = snap.bank!.matches.find((x) => x.kind === 'TRANSFER')!;
    expect(m.status).toBe('SUGGESTED');
    expect(imported().some((e) => e.link?.kind === 'TRANSFER')).toBe(false);
  });

  it('the user’s decision is final: confirm links the legs, reject never re-suggests', () => {
    apply(pull([tx('bank', 'chk0001', 'e-out', 60, '2026-11-03', { name: 'SYNTHETIC STORE' }), tx('pay', 'pay0002', 'e-in', -60, '2026-11-03', { name: 'DEPOSIT' })]));
    const m = snap.bank!.matches.find((x) => x.kind === 'TRANSFER')!;
    const rejected = rereconcile(snap, { ...snap.bank!, matches: snap.bank!.matches.map((x) => (x.match_id === m.match_id ? { ...x, status: 'REJECTED' as const } : x)) });
    expect(rejected.bank.matches.filter((x) => x.match_id === m.match_id && x.status === 'SUGGESTED')).toHaveLength(0);
    const confirmed = rereconcile(snap, { ...snap.bank!, matches: snap.bank!.matches.map((x) => (x.match_id === m.match_id ? { ...x, status: 'CONFIRMED' as const } : x)) });
    expect(confirmed.transactions.upsert.filter((e) => e.link?.kind === 'TRANSFER')).toHaveLength(2);
  });
});

describe('D · card payments are one liability payment, not purchases', () => {
  it('checking OUT + card IN → CARD_PAYMENT; no spending, card owed comes from the card provider', () => {
    apply(pull([tx('bank', 'chk0001', 'cp-out', 150, '2026-11-04', { name: 'SYNTHETIC CARD CO PAYMENT', pfc_primary: 'LOAN_PAYMENTS', pfc_detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' }), tx('card', 'cc0003', 'cp-in', -150, '2026-11-05', { name: 'PAYMENT THANK YOU' })]));
    expect(snap.bank!.matches.find((x) => x.kind === 'CARD_PAYMENT')!.status).toBe('AUTO_MATCHED');
    expect(imported().every((e) => e.txn_class === 'CREDIT_PAYMENT')).toBe(true);
    expect(totals()).toMatchObject({ spending: 0, income: 0, refunds: 0, cardPayments: 150 });
    const card = computeLedgerPositions(snap.accounts, [], snap.transactions, '2026-11-07' as CalendarDate).positions.find((p) => p.account_id === acctId('cc0003'))!;
    expect(card.owed).toBe(420);
  });
});

describe('E · no duplicate bill + matched posted expense', () => {
  it('an imported payment that pays a tracked bill marks it paid; the outflow is counted once', () => {
    snap = { ...snap, obligations: [{ obligation_id: 'obl-power', name: 'SYNTHETIC POWER', amount: 88.2, currency: 'USD', cadence: 'MONTHLY', next_due_date: '2026-11-06' as CalendarDate, kind: 'BILL', account_id: null, status: 'ACTIVE', skipped_once: false, created_at: T0, updated_at: T0, archived_at: null }] };
    apply(pull([tx('bank', 'chk0001', 'bill-1', 88.2, '2026-11-06', { name: 'SYNTHETIC POWER AUTOPAY BILL' })]));
    const e = imported()[0];
    expect(e).toMatchObject({ obligation_id: 'obl-power', occurrence_date: '2026-11-06' });
    expect(totals().spending).toBe(88.2);
  });

  it('a purchase recorded by hand (or from a receipt) that the bank also reports is counted once', () => {
    apply(pull([]));
    const card = acctId('cc0003');
    snap = { ...snap, transactions: [added({ id: 'manual-1', merchant: 'SYNTHETIC GROCER', amount: 54.1, direction: 'EXPENSE', account_id: card, txn_class: 'CREDIT_PURCHASE', occurred_on: '2026-11-05' as CalendarDate })] };
    apply(pull([tx('card', 'cc0003', 'g1', 54.1, '2026-11-05', { merchant_name: 'Synthetic Grocer', pfc_detailed: 'FOOD_AND_DRINK_GROCERIES' })]));
    const manual = snap.transactions.find((t) => t.id === 'manual-1')!;
    expect(manual.bank_match).toMatchObject({ kind: 'MANUAL_DUPLICATE', superseded: true });
    expect(totals().spending).toBe(54.1);
  });
});

describe('F · no double-reserved funds', () => {
  it('money set aside for a bill the bank shows paid is used once, not again on re-sync', () => {
    snap = { ...snap, obligations: [{ obligation_id: 'obl-net', name: 'SYNTHETIC INTERNET', amount: 60, currency: 'USD', cadence: 'MONTHLY', next_due_date: '2026-11-06' as CalendarDate, kind: 'BILL', account_id: null, status: 'ACTIVE', skipped_once: false, created_at: T0, updated_at: T0, archived_at: null }] };
    apply(pull([]));
    const chk = acctId('chk0001');
    snap = { ...snap, reservations: [{ reservation_id: 'res-1', target_kind: 'OBLIGATION', target_id: 'obl-net', occurrence_date: '2026-11-06' as CalendarDate, account_id: chk, amount: 60, status: 'ACTIVE', history: [], created_at: T0, updated_at: T0 }] };
    const rows = [tx('bank', 'chk0001', 'net-1', 60, '2026-11-06', { name: 'SYNTHETIC INTERNET' })];
    apply(pull(rows));
    expect(snap.reservations.find((r) => r.reservation_id === 'res-1')).toMatchObject({ status: 'APPLIED', amount: 0 });
    const histLen = snap.reservations[0].history.length;
    apply(pull(rows));
    expect(snap.reservations[0].history.length).toBe(histLen);
  });
});

describe('G · no stale balances presented as guaranteed current', () => {
  it('an old balance or a connection that needs attention is flagged with its date', () => {
    apply(pull([], { accounts: [account('bank', 'chk0001', 'depository', 'checking', { available_balance: 900, current_balance: 950, balance_as_of: '2026-11-04T09:00:00.000Z' })], items: [item('bank', 'SYNTHETIC BANK', { status: 'NEEDS_REAUTH' })] }));
    const facts = bankFactsFor(snap.accounts, snap.transactions, new Date(T0));
    expect(facts.staleAccounts).toHaveLength(1);
    expect(facts.limitations[0]).toMatch(/NEEDS RECONNECTING.*2026-11-04/);
    expect(connectionHealth({ status: 'ACTIVE', last_successful_sync_at: '2026-11-05T00:00:00.000Z', consent_expires_at: null, institution_name: 'X' }, new Date(T0)).state).toBe('DELAYED');
  });

  it('a null provider balance is unknown, never zero; pending not reflected is said, never subtracted on a guess', () => {
    apply(pull([], { accounts: [account('bank', 'chk0001', 'depository', 'checking', { available_balance: null, current_balance: 700 })] }));
    const facts = bankFactsFor(snap.accounts, snap.transactions, new Date(T0));
    expect(facts.pendingNotReflected).toHaveLength(1);
    expect(snap.accounts[0].balance).toBe(700);
  });
});

describe('H · nothing completed without evidence', () => {
  it('a pending imported transaction is PENDING / not bank-confirmed until the provider posts it', () => {
    apply(pull([tx('bank', 'chk0001', 'h1', 20, '2026-11-06', { pending: true })]));
    expect(imported()[0]).toMatchObject({ status: 'PENDING', confirmation: 'PENDING_CONFIRMATION', settlement: 'PENDING' });
  });

  it('a manual transfer the bank has not reported stays as the user recorded it (not marked completed)', () => {
    apply(pull([]));
    const chk = acctId('chk0001');
    snap = { ...snap, transactions: [added({ id: 'mt-out', amount: 75, direction: 'EXPENSE', account_id: chk, txn_class: 'TRANSFER', link: { kind: 'TRANSFER', id: 'mt', leg: 'OUT' }, settlement: 'PENDING' })] };
    apply(pull([]));
    const leg = snap.transactions.find((t) => t.id === 'mt-out')!;
    expect(leg.settlement).toBe('PENDING');
    expect(leg.bank_match ?? null).toBeNull();
  });
});

describe('K · the user’s corrections survive every sync', () => {
  it('category corrections and rules are re-applied after the provider modifies the transaction', () => {
    apply(pull([tx('card', 'cc0003', 'k1', 33, '2026-11-02', { merchant_name: 'SYNTHETIC PHARMACY' })]));
    const e = imported()[0];
    const key = `bank:card:k1`;
    const fixed = rereconcile(snap, { ...snap.bank!, overrides: { [key]: { category: 'HEALTH', at: T0 } } });
    snap = { ...snap, transactions: snap.transactions.map((t) => fixed.transactions.upsert.find((u) => u.id === t.id) ?? t), bank: fixed.bank };
    expect(imported()[0]).toMatchObject({ category: 'HEALTH', classification: { basis: 'YOUR_CORRECTION' } });
    apply(pull([tx('card', 'cc0003', 'k1', 33.5, '2026-11-02', { merchant_name: 'SYNTHETIC PHARMACY #2', revision: 2 })]));
    const after = imported()[0];
    expect(after.id).toBe(e.id);
    expect(after).toMatchObject({ category: 'HEALTH', amount: 33.5, classification: { basis: 'YOUR_CORRECTION' } });
    expect(after.import!.original.merchant_name).toBe('SYNTHETIC PHARMACY #2');
  });
});

describe('L · no loss of imported history on reconnection', () => {
  it('a re-linked institution (new Item, same persistent account) reuses the same JURNL account; history stays attached', () => {
    const a1 = account('bank', 'chk0001', 'depository', 'checking', { persistent_account_id: 'persist-1', available_balance: 500, current_balance: 500 });
    apply(pull([tx('bank', 'chk0001', 'l1', 10, '2026-11-01')], { accounts: [a1], items: [CHK] }));
    const jurnlId = acctId('chk0001');
    // Disconnected, then connected again: the provider issues a new Item and new account ids.
    const reItem = item('bank2', 'SYNTHETIC BANK');
    const a2 = account('bank2', 'chk-new', 'depository', 'checking', { persistent_account_id: 'persist-1', available_balance: 480, current_balance: 480 });
    apply(pull([tx('bank2', 'chk-new', 'l2', 20, '2026-11-06')], { accounts: [a2], items: [item('bank', 'SYNTHETIC BANK', { status: 'DISCONNECTED' }), reItem] }));
    expect(snap.accounts.filter((a) => a.connection)).toHaveLength(1);
    expect(snap.bank!.accountLinks['bank2:chk-new']).toBe(jurnlId);
    expect(imported().map((e) => e.account_id)).toEqual([jurnlId, jurnlId]);
  });
});

describe('cash withdrawals and Cash on Hand', () => {
  it('an ATM withdrawal is a transfer into cash (suggested), never discretionary spending', () => {
    apply(pull([tx('bank', 'chk0001', 'atm1', 100, '2026-11-05', { name: 'ATM WITHDRAWAL 123 MAIN', pfc_primary: 'TRANSFER_OUT', pfc_detailed: 'TRANSFER_OUT_WITHDRAWAL' })]));
    expect(imported()[0]).toMatchObject({ txn_class: 'TRANSFER', category_detail: 'CASH WITHDRAWAL' });
    expect(snap.bank!.matches.find((m) => m.kind === 'CASH_WITHDRAWAL')).toMatchObject({ status: 'SUGGESTED' });
    expect(totals().spending).toBe(0);
  });
});

describe('balances: imported entries never move a connected balance', () => {
  it('position = provider balance; a user entry counts only if recorded after that balance', () => {
    apply(pull([tx('bank', 'chk0001', 'b1', 99, '2026-11-06')]));
    const chk = acctId('chk0001');
    const pos = () => computeLedgerPositions(snap.accounts, [], snap.transactions, '2026-11-07' as CalendarDate).positions.find((p) => p.account_id === chk)!;
    expect(pos().held).toBe(1450);
    snap = { ...snap, transactions: [...snap.transactions, added({ id: 'before', amount: 5, direction: 'EXPENSE', account_id: chk, recorded_at: '2026-11-07T08:00:00.000Z', occurred_on: '2026-11-07' as CalendarDate })] };
    expect(pos().held).toBe(1450);
    snap = { ...snap, transactions: [...snap.transactions, added({ id: 'after', amount: 5, direction: 'EXPENSE', account_id: chk, recorded_at: '2026-11-07T10:00:00.000Z', occurred_on: '2026-11-07' as CalendarDate })] };
    expect(pos().held).toBe(1445);
    expect(pos().basis).toBe('BANK_CONFIRMED');
  });

  it('ingestion is pure: the input snapshot is not mutated', () => {
    const before = JSON.stringify(snap);
    applyBankPull(snap, pull([tx('bank', 'chk0001', 'p1', 1, '2026-11-01')]));
    expect(JSON.stringify(snap)).toBe(before);
  });
});
