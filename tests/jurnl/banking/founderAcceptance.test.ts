/**
 * FULL MONEY ACCEPTANCE SCENARIO (sprint §36) — 33 deterministic steps, synthetic values only.
 *
 * What is real here: the JURNL server banking service (link token, server-side exchange, encrypted token vault,
 * Transactions Sync with atomic cursor, webhooks, reconnect, disconnect), the Postgres schema + RLS + SQL functions
 * (disposable PGlite database with every JURNL migration), the client import / classification / reconciliation, the
 * device repository in PRODUCTION data mode, Safe to Spend, and the revision-based server snapshot.
 * What is synthetic: the institutions and their transactions (ScriptedProvider), and the auth user rows (steps 1–3
 * model Supabase Auth's user record; they do NOT exercise a real Supabase Auth server or real email delivery).
 * This is not live banking verification.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PGlite } from '@electric-sql/pglite';
import { completeReconnect, disconnectItem, exchangePublicToken, handleWebhook, runItemSync } from '../../../api/_lib/jurnlBanking/bankingService';
import { listActiveInternalGrants, resetInternalGrantStoreForTests, upsertInternalGrant } from '../../../api/_lib/jurnlEntitlements/internalGrantStore';
import { resolveJurnlEntitlementsForPrincipal } from '../../../api/_lib/jurnlEntitlements/resolveJurnlEntitlements';
import { JURNL_MONETIZATION_CONTRACT } from '../../../api/_lib/jurnlEntitlements/jurnlProject';
import { hasActiveFounderFull } from '../../../shared/site00-monetization/internalGrants';
import { importAndReconcile, rereconcile } from '../../../src/projects/jurnl/data/banking/bankLedger';
import { connectionHealth } from '../../../src/projects/jurnl/data/banking/health';
import { isActivityEntry } from '../../../src/projects/jurnl/data/banking/activity';
import { setRepositoryDataMode } from '../../../src/projects/jurnl/data/repository/dataMode';
import { emptySnapshotForUser, getRepository, importSnapshotForUser, markSnapshotSynced, peekDeviceSnapshot, purgeDeviceCacheForUser, setRepositoryUserId } from '../../../src/projects/jurnl/data/repository/deviceRepository';
import { decideHydrate } from '../../../src/projects/jurnl/data/repository/deviceServerMerge';
import { computeSafeToSpend } from '../../../src/projects/jurnl/data/f09/safeToSpend';
import { saveDailyEarnings } from '../../../src/projects/jurnl/data/f06/dailyEarnings';
import { buildSetAside } from '../../../src/projects/jurnl/data/f07/reservations';
import { computeLedgerPositions, flowTotals } from '../../../src/projects/jurnl/data/ledger/accounting';
import { isSupabaseUserEmailConfirmed } from '../../../src/utils/supabase';
import type { RepositorySnapshot } from '../../../src/projects/jurnl/data/repository/types';
import type { CalendarDate } from '../../../src/projects/jurnl/data/foundation/dates';
import type { LedgerEntry } from '../../../src/projects/jurnl/data/home/moneyTypes';
import { acct, asUser, bankingHarness, txn } from './harness';

type H = Awaited<ReturnType<typeof bankingHarness>>;
let h: H;
let db: PGlite;
let founderId = '';
const items: Record<'checking' | 'payout' | 'card', string> = { checking: '', payout: '', card: '' };
const TODAY = '2026-11-07';
const d = (n: number) => `2026-11-0${n}` as CalendarDate;

async function pullIntoLedger() {
  const reader = h.store.forUser(founderId, null);
  const [itemsRows, accountRows, txRows] = await Promise.all([reader.listItems(), reader.listAccounts(), reader.listTransactions(null)]);
  const { commit, report } = importAndReconcile(getRepository().getSnapshot(), {
    items: itemsRows.map(({ sync_cursor: _c, ...rest }) => rest) as never,
    accounts: accountRows as never,
    transactions: txRows as never,
    pulledAt: new Date().toISOString(),
  });
  getRepository().commit(commit);
  return report;
}
const snap = () => getRepository().getSnapshot();
const imported = () => snap().transactions.filter((e) => e.source === 'IMPORTED' && e.import?.provider_state === 'ACTIVE');
const byProvider = (id: string) => snap().transactions.find((e) => e.import?.provider_transaction_id === id)!;
const linked = (prov: string) => snap().accounts.find((a) => a.connection?.provider_account_id === prov)!;
const totals = () => flowTotals(snap().transactions, snap().accounts, '2026-11-01' as CalendarDate, '2026-11-30' as CalendarDate, TODAY as CalendarDate);
const putSnapshot = (s: RepositorySnapshot, rev: number) =>
  asUser(db, founderId, (q) => q(`select * from public.jurnl_put_snapshot($1::jsonb, 5, 'PRODUCTION', $2)`, [JSON.stringify({ ...s, syncBase: undefined }), rev])) as Promise<{ rows: { revision: number }[] }>;
const getSnapshot = async () => {
  const r = (await asUser(db, founderId, (q) => q('select snapshot, revision from public.jurnl_user_snapshots'))) as { rows: { snapshot: RepositorySnapshot; revision: number }[] };
  return r.rows[0] ? { snapshot: r.rows[0].snapshot, revision: Number(r.rows[0].revision) } : null;
};
let beforeSignOut: { transactions: LedgerEntry[]; accounts: unknown; sts: number } | null = null;
let serverRevision = 0;

beforeAll(async () => {
  vi.useFakeTimers({ toFake: ['Date'], now: new Date(`${TODAY}T12:00:00.000Z`) });
  setRepositoryDataMode('PRODUCTION');
  resetInternalGrantStoreForTests();
  h = await bankingHarness();
  db = h.db;
});
afterAll(() => {
  vi.useRealTimers();
  setRepositoryDataMode('DESIGN_PREVIEW');
});

describe('FOUNDER ACCEPTANCE — 33 steps (synthetic values; not live banking)', () => {
  it('01 founder registers (auth user record created in the disposable database)', async () => {
    const r = await db.query<{ id: string }>(`insert into auth.users (id, email) values (gen_random_uuid(), 'founder@example.test') returning id`);
    founderId = r.rows[0].id;
    expect(founderId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('02 founder verifies email (confirmed timestamp set; an unconfirmed user is refused sign-in)', async () => {
    expect(isSupabaseUserEmailConfirmed({ email: 'founder@example.test', email_confirmed_at: null } as never)).toBe(false);
    await db.query('update auth.users set email_confirmed_at = now() where id = $1', [founderId]);
    const u = await db.query<{ email_confirmed_at: string }>('select email_confirmed_at from auth.users where id=$1', [founderId]);
    expect(isSupabaseUserEmailConfirmed({ email: 'founder@example.test', email_confirmed_at: u.rows[0].email_confirmed_at } as never)).toBe(true);
  });

  it('03 founder signs in → a REAL account starts empty (no sample data)', () => {
    setRepositoryUserId(founderId);
    importSnapshotForUser(founderId, emptySnapshotForUser(founderId));
    expect(snap()).toMatchObject({ dataMode: 'PRODUCTION', transactions: [], accounts: [] });
    getRepository().patchSetup({ started: true, accounts: 'CONNECTED', cadence: 'WEEKLY', amount: '900' } as never);
  });

  it('04 founder receives the correct founder entitlement (server-side grant, not a client flag)', async () => {
    expect(hasActiveFounderFull(await listActiveInternalGrants(JURNL_MONETIZATION_CONTRACT.projectId, founderId), JURNL_MONETIZATION_CONTRACT.projectId)).toBe(false);
    await upsertInternalGrant({ grant_type: 'FOUNDER_FULL', principal_id: founderId, project_id: JURNL_MONETIZATION_CONTRACT.projectId, granted_by: founderId, reason: 'ACCEPTANCE FIXTURE' });
    const ent = await resolveJurnlEntitlementsForPrincipal(JURNL_MONETIZATION_CONTRACT, founderId, founderId);
    expect(ent.authorization.source).toBe('SERVER_VERIFIED');
    expect(ent.authorization.internalGrants?.active).toContain('FOUNDER_FULL');
    expect(ent.authorization.subscriptionState).not.toBe('ACTIVE');
  });

  it('05 founder connects checking', async () => {
    const pub = h.provider.addItem('item-checking', {
      institution_id: 'ins_synthetic_bank',
      institution_name: 'SYNTHETIC BANK',
      accounts: [acct({ provider_account_id: 'chk', name: 'Everyday Checking', type: 'depository', subtype: 'checking', mask: '1111', current_balance: 2410, available_balance: 2385.5 })],
      pages: [['', { added: [txn({ provider_transaction_id: 'c-power', provider_account_id: 'chk', amount: 64.25, date: d(2), name: 'SYNTHETIC GAS & ELECTRIC', pfc_primary: 'RENT_AND_UTILITIES' })], modified: [], removed: [], nextCursor: 'k1', hasMore: false }]],
    });
    const r = await exchangePublicToken(h.deps, founderId, pub);
    items.checking = r.itemId;
    expect(r).toMatchObject({ status: 'ACTIVE', sync: { ran: true } });
  });

  it('06 founder connects the rideshare payout card', async () => {
    const pub = h.provider.addItem('item-payout', {
      institution_id: 'ins_synthetic_payout',
      institution_name: 'SYNTHETIC PAYOUT CARD',
      accounts: [acct({ provider_account_id: 'pay', name: 'Driver Payout Card', type: 'depository', subtype: 'prepaid', mask: '2222', current_balance: 310, available_balance: 310 })],
      pages: [['', { added: [txn({ provider_transaction_id: 'p-uber', provider_account_id: 'pay', amount: -146.8, date: d(5), name: 'UBER INSTANT PAY', counterparty_names: ['Uber'], pfc_primary: 'INCOME' })], modified: [], removed: [], nextCursor: 'k1', hasMore: false }]],
    });
    items.payout = (await exchangePublicToken(h.deps, founderId, pub)).itemId;
  });

  it('07 founder connects a credit card', async () => {
    const pub = h.provider.addItem('item-card', {
      institution_id: 'ins_synthetic_card',
      institution_name: 'SYNTHETIC CARD CO',
      accounts: [acct({ provider_account_id: 'cc', name: 'Rewards Card', type: 'credit', subtype: 'credit card', mask: '3333', current_balance: 512.3, available_balance: 1487.7, credit_limit: 2000 })],
      pages: [['', { added: [], modified: [], removed: [], nextCursor: 'k1', hasMore: false }]],
    });
    items.card = (await exchangePublicToken(h.deps, founderId, pub)).itemId;
    expect(new Set(Object.values(items)).size).toBe(3);
  });

  it('08 JURNL imports account balances (as of the provider timestamp)', async () => {
    await pullIntoLedger();
    expect(linked('chk')).toMatchObject({ is_connected: true, available_balance: 2385.5, connection: { status: 'ACTIVE' } });
    expect(linked('cc')).toMatchObject({ account_type: 'CREDIT_CARD', balance: 512.3, credit_limit: 2000 });
    expect(linked('pay').account_type).toBe('DEBIT_CARD');
  });

  it('09 JURNL imports transactions', () => {
    expect(imported().map((e) => e.import!.provider_transaction_id).sort()).toEqual(['c-power', 'p-uber']);
  });

  it('10 JURNL identifies the rideshare payout', () => {
    expect(byProvider('p-uber')).toMatchObject({ direction: 'INCOME', txn_class: 'INCOME', category_detail: 'RIDESHARE PAYOUT', classification: { basis: 'KNOWN_PAYER' } });
  });

  it('11 founder adds cash tips (daily earnings: the digital payout already recorded + cash tips into Cash on Hand)', () => {
    getRepository().upsertAccount({ ...linked('pay'), account_id: 'cash-on-hand', display_name: 'CASH ON HAND', account_type: 'CASH', is_manual: true, is_connected: false, connection: undefined, connection_id: null, masked_identifier: null, balance: 40, available_balance: 40, balance_entered_by_user: true, include_in_safe_to_spend: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    const r = saveDailyEarnings({ work_date: d(5), income_source: 'UBER', source_kind: 'RIDESHARE', tips_mode: 'INCLUDED', digital_earnings: 146.8, digital_tips: 0, cash_tips: 22, digital_account_id: linked('pay').account_id, cash_account_id: 'cash-on-hand' }, undefined, TODAY as CalendarDate);
    expect(r.ok).toBe(true);
    const re = rereconcile(snap(), snap().bank!);
    getRepository().commit(re);
    // The payout and the recorded earnings are ONE income event (B).
    expect(byProvider('p-uber').bank_match).toMatchObject({ kind: 'EARNINGS_PAYOUT', superseded: true });
    expect(totals().income).toBe(146.8 + 22);
  });

  it('12 founder records a cash purchase (manual; no bank involved)', () => {
    getRepository().commit({ reason: 'TEST', transactions: { upsert: [{ id: 'cash-buy', merchant: 'FARMERS MARKET', amount: 15, direction: 'EXPENSE', when: d(6), occurred_on: d(6), account: 'CASH ON HAND', account_id: 'cash-on-hand', category: 'FOOD', txn_class: 'EXPENSE', status: 'CLEARED', recurring: false, memo: '', source: 'ADDED', related: null, recorded_at: new Date().toISOString() }] } });
    const cash = computeLedgerPositions(snap().accounts, [], snap().transactions, TODAY as CalendarDate).positions.find((p) => p.account_id === 'cash-on-hand')!;
    expect(cash.held).toBe(40 + 22 - 15);
  });

  it('13 JURNL imports a grocery transaction (card purchase)', async () => {
    h.provider.items.get('item-card')!.pages.set('k1', { added: [txn({ provider_transaction_id: 'g-1', provider_account_id: 'cc', amount: 73.4, date: d(6), merchant_name: 'Synthetic Grocer', pfc_primary: 'FOOD_AND_DRINK', pfc_detailed: 'FOOD_AND_DRINK_GROCERIES' })], modified: [], removed: [], nextCursor: 'k2', hasMore: false });
    await handleWebhook(h.deps, JSON.stringify({ webhook_type: 'TRANSACTIONS', webhook_code: 'SYNC_UPDATES_AVAILABLE', item_id: 'item-card' }), {});
    await pullIntoLedger();
    expect(byProvider('g-1')).toMatchObject({ txn_class: 'CREDIT_PURCHASE', category: 'FOOD', category_detail: 'GROCERIES' });
  });

  it('14 JURNL imports a checking → rideshare-card transfer', async () => {
    h.provider.items.get('item-checking')!.pages.set('k1', { added: [txn({ provider_transaction_id: 'x-out', provider_account_id: 'chk', amount: 200, date: d(6), name: 'ONLINE TRANSFER TO DRIVER CARD 2222', pfc_primary: 'TRANSFER_OUT', pfc_detailed: 'TRANSFER_OUT_ACCOUNT_TRANSFER' })], modified: [], removed: [], nextCursor: 'k2', hasMore: false });
    h.provider.items.get('item-payout')!.pages.set('k1', { added: [txn({ provider_transaction_id: 'x-in', provider_account_id: 'pay', amount: -200, date: d(6), name: 'TRANSFER FROM CHECKING 1111', pfc_primary: 'TRANSFER_IN', pfc_detailed: 'TRANSFER_IN_ACCOUNT_TRANSFER' })], modified: [], removed: [], nextCursor: 'k2', hasMore: false });
    await runItemSync(h.deps, items.checking, 'WEBHOOK');
    await runItemSync(h.deps, items.payout, 'WEBHOOK');
    await pullIntoLedger();
    expect(byProvider('x-out')).toBeTruthy();
    expect(byProvider('x-in')).toBeTruthy();
  });

  it('15 JURNL matches both transfer legs (one movement; no income, no spending)', () => {
    const m = snap().bank!.matches.find((x) => x.kind === 'TRANSFER' && x.status === 'AUTO_MATCHED')!;
    expect(m.signals).toContain('BANK_SAYS_TRANSFER');
    expect(byProvider('x-out')).toMatchObject({ txn_class: 'TRANSFER', link: { kind: 'TRANSFER', leg: 'OUT' } });
    expect(byProvider('x-in')).toMatchObject({ txn_class: 'TRANSFER', link: { kind: 'TRANSFER', leg: 'IN' } });
    expect(totals().income).toBe(146.8 + 22);
  });

  it('16 JURNL imports a credit-card payment', async () => {
    h.provider.items.get('item-checking')!.pages.set('k2', { added: [txn({ provider_transaction_id: 'cp-out', provider_account_id: 'chk', amount: 120, date: d(7), name: 'SYNTHETIC CARD CO CREDIT CARD PAYMENT', pfc_primary: 'LOAN_PAYMENTS', pfc_detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' })], modified: [], removed: [], nextCursor: 'k3', hasMore: false });
    h.provider.items.get('item-card')!.pages.set('k2', { added: [txn({ provider_transaction_id: 'cp-in', provider_account_id: 'cc', amount: -120, date: d(7), name: 'PAYMENT THANK YOU' })], modified: [], removed: [], nextCursor: 'k3', hasMore: false });
    h.provider.items.get('item-card')!.accounts[0] = { ...h.provider.items.get('item-card')!.accounts[0], current_balance: 465.7, available_balance: 1534.3 };
    await runItemSync(h.deps, items.checking, 'WEBHOOK');
    await runItemSync(h.deps, items.card, 'WEBHOOK');
    await pullIntoLedger();
    expect(byProvider('cp-out')).toBeTruthy();
  });

  it('17 JURNL reconciles the checking outflow and the liability reduction as ONE payment', () => {
    expect(snap().bank!.matches.find((x) => x.kind === 'CARD_PAYMENT')!.status).toBe('AUTO_MATCHED');
    expect(byProvider('cp-out').txn_class).toBe('CREDIT_PAYMENT');
    expect(byProvider('cp-in').txn_class).toBe('CREDIT_PAYMENT');
    const t = totals();
    expect(t.spending).toBe(64.25 + 73.4 + 15);
    expect(t.cardPayments).toBe(120);
    expect(linked('cc').balance).toBe(465.7);
  });

  it('18 founder adds a monthly subscription (price and cadence shown)', () => {
    getRepository().upsertObligation({ obligation_id: 'obl-stream', name: 'SYNTHETIC STREAMING', amount: 15.99, currency: 'USD', cadence: 'MONTHLY', next_due_date: '2026-11-20' as CalendarDate, kind: 'SUBSCRIPTION', account_id: linked('cc').account_id, status: 'ACTIVE', skipped_once: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), archived_at: null });
    expect(getRepository().listObligations().find((o) => o.obligation_id === 'obl-stream')).toMatchObject({ amount: 15.99, cadence: 'MONTHLY', kind: 'SUBSCRIPTION' });
  });

  it('19 founder adds an upcoming bill', () => {
    getRepository().upsertObligation({ obligation_id: 'obl-rent', name: 'SYNTHETIC RENT', amount: 900, currency: 'USD', cadence: 'MONTHLY', next_due_date: '2026-11-12' as CalendarDate, kind: 'BILL', account_id: linked('chk').account_id, status: 'ACTIVE', skipped_once: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), archived_at: null });
    const sts = computeSafeToSpend();
    expect(sts.billLines.find((l) => l.obligation_id === 'obl-rent')).toMatchObject({ remaining: 900, reserved: 0 });
  });

  let stsBeforeReserve = 0;
  it('20 founder reserves money for the bill (no bank movement is fabricated)', () => {
    stsBeforeReserve = computeSafeToSpend().value;
    const s = snap();
    const positions = computeLedgerPositions(s.accounts, s.creditAttributes, s.transactions, TODAY as CalendarDate).positions;
    const r = buildSetAside(s.accounts, positions, s.reservations, { target: { kind: 'OBLIGATION', id: 'obl-rent', occurrence_date: '2026-11-12' as CalendarDate, name: 'SYNTHETIC RENT', cap: 900 }, account_id: linked('chk').account_id, amount: 300 });
    expect(r.ok).toBe(true);
    if (r.ok) getRepository().commit(r.commit);
    expect(snap().transactions.filter((t) => t.source === 'ADDED' && t.merchant.includes('RENT'))).toHaveLength(0);
  });

  it('21 Safe to Spend recalculates (reserved money is not deducted twice; bank facts are dated)', () => {
    const sts = computeSafeToSpend();
    expect(sts.reservedForPayments).toBe(300);
    expect(sts.value).toBe(stsBeforeReserve);
    expect(sts.bank.connectedAccounts).toBe(2);
    expect(sts.bank.lastBankSync).not.toBeNull();
    expect(sts.cashSource).toBe('ACCOUNTS');
    // cash = checking available (provider) + payout card available (provider) + cash on hand (manual)
    expect(sts.cash).toBe(2385.5 + 310 + (40 + 22 - 15));
  });

  it('22 the provider sends a modified pending transaction', async () => {
    h.provider.items.get('item-card')!.pages.set('k3', { added: [txn({ provider_transaction_id: 'pend-1', provider_account_id: 'cc', amount: 38, date: d(7), pending: true, merchant_name: 'Synthetic Pharmacy' })], modified: [], removed: [], nextCursor: 'k4', hasMore: false });
    h.provider.items.get('item-card')!.pages.set('k4', { added: [], modified: [txn({ provider_transaction_id: 'pend-1', provider_account_id: 'cc', amount: 41.5, date: d(7), pending: true, merchant_name: 'Synthetic Pharmacy' })], removed: [], nextCursor: 'k5', hasMore: false });
    h.provider.items.get('item-card')!.pages.set('k5', { added: [txn({ provider_transaction_id: 'post-1', provider_account_id: 'cc', amount: 41.5, date: d(7), pending: false, pending_transaction_id: 'pend-1', merchant_name: 'Synthetic Pharmacy' })], modified: [], removed: [{ provider_transaction_id: 'pend-1', provider_account_id: 'cc' }], nextCursor: 'k6', hasMore: false });
    await runItemSync(h.deps, items.card, 'WEBHOOK');
    await pullIntoLedger();
    await runItemSync(h.deps, items.card, 'WEBHOOK');
    await pullIntoLedger();
    expect(byProvider('pend-1')).toMatchObject({ amount: 41.5, status: 'PENDING' });
  });

  it('23 JURNL reconciles it without double counting (pending → posted on one record)', async () => {
    await runItemSync(h.deps, items.card, 'WEBHOOK');
    await pullIntoLedger();
    const rows = snap().transactions.filter((e) => e.import?.root_transaction_id === 'pend-1');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ amount: 41.5, status: 'CLEARED', import: { provider_transaction_id: 'post-1' } });
    expect(totals().spending).toBe(64.25 + 73.4 + 15 + 41.5);
  });

  it('24 founder edits a transaction category', async () => {
    const { correctImportedTransaction } = await import('../../../src/projects/jurnl/data/banking/bankLedger');
    const e = byProvider('post-1');
    expect(correctImportedTransaction(e.id, { category: 'HEALTH', category_detail: 'PHARMACY' })).toBe(true);
    expect(byProvider('post-1')).toMatchObject({ category: 'HEALTH', classification: { basis: 'YOUR_CORRECTION' } });
  });

  it('25 sync runs again (the provider revises the same transaction)', async () => {
    h.provider.items.get('item-card')!.pages.set('k6', { added: [], modified: [txn({ provider_transaction_id: 'post-1', provider_account_id: 'cc', amount: 41.5, date: d(7), merchant_name: 'SYNTHETIC PHARMACY #12' })], removed: [], nextCursor: 'k7', hasMore: false });
    await runItemSync(h.deps, items.card, 'SCHEDULED');
    await pullIntoLedger();
    expect(byProvider('post-1').import!.original.merchant_name).toBe('SYNTHETIC PHARMACY #12');
  });

  it('26 the user override remains intact (K) and nothing was duplicated (A)', () => {
    expect(byProvider('post-1')).toMatchObject({ category: 'HEALTH', category_detail: 'PHARMACY', classification: { basis: 'YOUR_CORRECTION' } });
    const ids = snap().transactions.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('27 founder signs out (the snapshot is saved to the server first; the device cache is purged)', async () => {
    const s = snap();
    const r = await putSnapshot(s, 0);
    serverRevision = Number(r.rows[0].revision);
    markSnapshotSynced(founderId, serverRevision);
    beforeSignOut = { transactions: s.transactions, accounts: s.accounts, sts: computeSafeToSpend().value };
    expect(purgeDeviceCacheForUser(founderId)).toMatchObject({ purged: true });
    expect(peekDeviceSnapshot(founderId)).toBeNull();
    setRepositoryUserId('preview-guest');
  });

  it('28 founder signs in again (revision-based hydrate chooses the server copy)', async () => {
    const pulled = await getSnapshot();
    const decision = decideHydrate({ ok: true, snapshot: pulled!.snapshot, revision: pulled!.revision }, peekDeviceSnapshot(founderId), 'PRODUCTION', founderId);
    expect(decision.action).toBe('USE_SERVER');
    setRepositoryUserId(founderId);
    if (decision.action === 'USE_SERVER') importSnapshotForUser(founderId, { ...decision.snapshot, dataMode: 'PRODUCTION', syncBase: { revision: decision.revision, dirty: false, reconciledAt: null } });
  });

  it('29 records restore correctly', () => {
    expect(snap().transactions).toEqual(beforeSignOut!.transactions);
    expect(snap().accounts).toEqual(beforeSignOut!.accounts);
    expect(computeSafeToSpend().value).toBe(beforeSignOut!.sts);
  });

  it('30 founder opens another browser (a new device: no local copy at all)', () => {
    purgeDeviceCacheForUser(founderId, { force: true });
    setRepositoryUserId('preview-guest');
    expect(peekDeviceSnapshot(founderId)).toBeNull();
  });

  it('31 the same server-backed financial state loads; a stale device can never overwrite it', async () => {
    const pulled = await getSnapshot();
    const decision = decideHydrate({ ok: true, snapshot: pulled!.snapshot, revision: pulled!.revision }, null, 'PRODUCTION', founderId);
    expect(decision.action).toBe('USE_SERVER');
    setRepositoryUserId(founderId);
    if (decision.action === 'USE_SERVER') importSnapshotForUser(founderId, { ...decision.snapshot, dataMode: 'PRODUCTION' });
    expect(snap().transactions).toEqual(beforeSignOut!.transactions);
    await expect(putSnapshot({ ...snap(), transactions: [] }, serverRevision - 1)).rejects.toMatchObject({ code: 'JR409' });
  });

  it('32 founder disconnects an institution (provider access revoked; history kept)', async () => {
    const r = await disconnectItem(h.deps, founderId, items.card, false);
    expect(r).toMatchObject({ ok: true, providerRevoked: true });
    await pullIntoLedger();
  });

  it('33 JURNL reflects the real connection status accurately', async () => {
    const cardItem = (await h.store.forUser(founderId, null).listItems()).find((i) => i.item_id === items.card)!;
    expect(connectionHealth(cardItem).state).toBe('DISCONNECTED');
    expect(linked('cc')).toMatchObject({ is_connected: false, connection: { status: 'DISCONNECTED' } });
    expect(snap().transactions.filter((e) => e.import?.item_id === items.card).length).toBeGreaterThan(0);
    const others = (await h.store.forUser(founderId, null).listItems()).filter((i) => i.item_id !== items.card);
    expect(others.map((i) => connectionHealth(i).state)).toEqual(['UP_TO_DATE', 'UP_TO_DATE']);
    // A disconnected institution cannot sync and cannot be reconnected without a new Link.
    expect(await runItemSync(h.deps, items.card, 'WEBHOOK')).toMatchObject({ reason: 'DISCONNECTED' });
    await expect(completeReconnect(h.deps, founderId, items.card)).rejects.toMatchObject({ code: 'ITEM_DISCONNECTED' });
    // The disconnected card's imported history still counts (it really happened); the payout matched to the daily
    // earnings record stays counted once, through that record.
    expect(snap().transactions.filter((e) => e.import?.item_id === items.card && e.import.provider_state === 'ACTIVE').every(isActivityEntry)).toBe(true);
    expect(isActivityEntry(byProvider('p-uber'))).toBe(false);
  });
});
