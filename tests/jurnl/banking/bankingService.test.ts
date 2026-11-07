/**
 * Connected banking service against a disposable Postgres (real migrations, real SQL functions, real RLS) and a
 * scripted provider with SYNTHETIC data. Covers the provider sandbox test list that does not need provider
 * credentials; the same flows run against Plaid's sandbox in scripts/jurnl/banking/plaid-sandbox-validation.ts.
 */
import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { ProviderError } from '../../../api/_lib/jurnlBanking/provider';
import { completeReconnect, createLinkToken, disconnectItem, exchangePublicToken, handleWebhook, runItemSync } from '../../../api/_lib/jurnlBanking/bankingService';
import { TokenVault, redactSecrets } from '../../../api/_lib/jurnlBanking/tokenVault';
import { checkPayoutCardCatalog, PAYOUT_CARD_TARGETS } from '../../../api/_lib/jurnlBanking/institutionCatalog';
import { acct, bankingHarness, createUser, txn } from './harness';

const checking = acct({ provider_account_id: 'chk', name: 'Synthetic Checking', type: 'depository', subtype: 'checking', mask: '0001', current_balance: 1200, available_balance: 1150 });
const card = acct({ provider_account_id: 'cc', name: 'Synthetic Card', type: 'credit', subtype: 'credit card', mask: '0009', current_balance: 310.4, available_balance: 1689.6, credit_limit: 2000 });

function twoPageItem() {
  return {
    institution_id: 'ins_synthetic_1',
    institution_name: 'SYNTHETIC BANK',
    accounts: [checking, card],
    pages: [
      ['', { added: [txn({ provider_transaction_id: 't1', provider_account_id: 'chk', amount: 42.1, date: '2026-11-01', merchant_name: 'Synthetic Grocer', pfc_primary: 'FOOD_AND_DRINK', pfc_detailed: 'FOOD_AND_DRINK_GROCERIES' })], modified: [], removed: [], nextCursor: 'c1', hasMore: true }],
      ['c1', { added: [txn({ provider_transaction_id: 't2', provider_account_id: 'cc', amount: 18, date: '2026-11-02', pending: true, merchant_name: 'Synthetic Cafe' })], modified: [], removed: [], nextCursor: 'c2', hasMore: false }],
    ] as [string, Parameters<typeof Map.prototype.set>[1]][],
  };
}

async function connected() {
  const h = await bankingHarness();
  const user = await createUser(h.db, 'founder@example.test');
  const pub = h.provider.addItem('item-A', twoPageItem() as never);
  const r = await exchangePublicToken(h.deps, user, pub);
  return { ...h, user, itemId: r.itemId, result: r };
}

const count = async (h: Awaited<ReturnType<typeof connected>>, sql: string, p: unknown[] = []) => Number((await h.db.query<{ n: number }>(sql, p)).rows[0].n);

describe('connect (link token → server-side exchange → first sync)', () => {
  it('creates one Item, stores only an encrypted token, imports balances + every page, advances the cursor', async () => {
    const h = await connected();
    expect(h.result.sync).toMatchObject({ ran: true, added: 2, pages: 2 });
    const secret = await h.db.query<{ ciphertext: string }>('select ciphertext from public.jurnl_bank_item_secrets where item_id=$1', [h.itemId]);
    expect(secret.rows[0].ciphertext).not.toContain('access-sandbox');
    expect(await count(h, 'select count(*)::int n from public.jurnl_bank_accounts where item_id=$1', [h.itemId])).toBe(2);
    expect(await count(h, 'select count(*)::int n from public.jurnl_bank_transactions where item_id=$1', [h.itemId])).toBe(2);
    const item = await h.store.getItem(h.itemId);
    expect(item).toMatchObject({ status: 'ACTIVE', sync_cursor: 'c2' });
    const bal = await h.db.query<{ current_balance: string; credit_limit: string | null }>(`select current_balance, credit_limit from public.jurnl_bank_accounts where provider_account_id='cc'`);
    expect(Number(bal.rows[0].current_balance)).toBe(310.4);
    expect(Number(bal.rows[0].credit_limit)).toBe(2000);
  });

  it('multiple accounts per institution: checking and credit card under one Item', async () => {
    const h = await connected();
    const accounts = await h.store.forUser(h.user, null).listAccounts();
    expect(accounts.map((a) => a.type).sort()).toEqual(['credit', 'depository']);
  });

  it('failed connection (bad public token): nothing is stored', async () => {
    const h = await bankingHarness();
    const user = await createUser(h.db, 'x@example.test');
    await expect(exchangePublicToken(h.deps, user, 'public-sandbox-unknown')).rejects.toMatchObject({ kind: 'INVALID_TOKEN' });
    expect((await h.db.query('select 1 from public.jurnl_bank_items')).rows).toHaveLength(0);
  });

  it('exchanging the same Item twice does not duplicate it; a second login to the same accounts is removed at the provider', async () => {
    const h = await connected();
    const again = await exchangePublicToken(h.deps, h.user, [...h.provider.publicTokens.entries()].find(([, v]) => v === 'item-A')![0]);
    expect(again.itemId).toBe(h.itemId);
    const pub2 = h.provider.addItem('item-A-dup', twoPageItem() as never);
    const dup = await exchangePublicToken(h.deps, h.user, pub2);
    expect(dup.duplicateOf).toBe(h.itemId);
    expect(h.provider.items.get('item-A-dup')!.removed).toBe(true);
    expect(await count(h, 'select count(*)::int n from public.jurnl_bank_items')).toBe(1);
  });

  it('link tokens come from the server; update mode needs the user’s own Item', async () => {
    const h = await connected();
    expect((await createLinkToken(h.deps, h.user)).mode).toBe('NEW');
    expect((await createLinkToken(h.deps, h.user, { itemId: h.itemId })).mode).toBe('UPDATE');
    const stranger = await createUser(h.db, 'stranger@example.test');
    await expect(createLinkToken(h.deps, stranger, { itemId: h.itemId })).rejects.toMatchObject({ code: 'ITEM_NOT_FOUND' });
  });
});

describe('incremental sync, modifications, removals, pending → posted', () => {
  it('modified and removed rows update in place; nothing is duplicated', async () => {
    const h = await connected();
    h.provider.items.get('item-A')!.pages.set('c2', {
      added: [txn({ provider_transaction_id: 't2-posted', provider_account_id: 'cc', amount: 18.75, date: '2026-11-03', pending_transaction_id: 't2', merchant_name: 'Synthetic Cafe' })],
      modified: [txn({ provider_transaction_id: 't1', provider_account_id: 'chk', amount: 41.9, date: '2026-11-01', merchant_name: 'Synthetic Grocer' })],
      removed: [{ provider_transaction_id: 't2', provider_account_id: 'cc' }],
      nextCursor: 'c3',
      hasMore: false,
    });
    const r = await runItemSync(h.deps, h.itemId, 'WEBHOOK');
    expect(r).toMatchObject({ ran: true, added: 1, modified: 1, removed: 1 });
    const rows = await h.db.query<{ provider_transaction_id: string; amount: string; provider_state: string; revision: number }>('select provider_transaction_id, amount, provider_state, revision from public.jurnl_bank_transactions order by provider_transaction_id');
    expect(rows.rows.map((x) => [x.provider_transaction_id, Number(x.amount), x.provider_state])).toEqual([
      ['t1', 41.9, 'ACTIVE'],
      ['t2', 18, 'REMOVED'],
      ['t2-posted', 18.75, 'ACTIVE'],
    ]);
    expect(rows.rows.find((x) => x.provider_transaction_id === 't1')!.revision).toBe(2);
  });

  it('TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION restarts from the original cursor (no partial batch)', async () => {
    const h = await bankingHarness();
    const user = await createUser(h.db, 'p@example.test');
    const pub = h.provider.addItem('item-B', twoPageItem() as never);
    h.provider.syncFailures.push(new ProviderError('MUTATION_DURING_PAGINATION', 'TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION', true));
    const r = await exchangePublicToken(h.deps, user, pub);
    expect(r.sync).toMatchObject({ ran: true, added: 2 });
    expect(h.provider.calls.filter((c) => c === 'sync:')).toHaveLength(2);
  });

  it('rate limit: one retry, then a SYNC_ERROR that keeps the cursor', async () => {
    const h = await connected();
    h.provider.items.get('item-A')!.pages.set('c2', { added: [txn({ provider_transaction_id: 't9', provider_account_id: 'chk', amount: 1, date: '2026-11-05' })], modified: [], removed: [], nextCursor: 'c3', hasMore: false });
    h.provider.syncFailures.push(new ProviderError('RATE_LIMITED', 'RATE_LIMIT_EXCEEDED', true), new ProviderError('RATE_LIMITED', 'RATE_LIMIT_EXCEEDED', true));
    const r = await runItemSync(h.deps, h.itemId, 'MANUAL');
    expect(r).toMatchObject({ ran: false, reason: 'FAILED', status: 'SYNC_ERROR' });
    expect((await h.store.getItem(h.itemId))!.sync_cursor).toBe('c2');
    const ok = await runItemSync(h.deps, h.itemId, 'MANUAL');
    expect(ok).toMatchObject({ ran: true, added: 1 });
  });

  it('provider outage → INSTITUTION_UNAVAILABLE; nothing is lost and the next sync resumes', async () => {
    const h = await connected();
    h.provider.syncFailures.push(new ProviderError('INSTITUTION_UNAVAILABLE', 'INSTITUTION_DOWN', true));
    expect(await runItemSync(h.deps, h.itemId, 'MANUAL')).toMatchObject({ status: 'INSTITUTION_UNAVAILABLE' });
    expect((await h.store.getItem(h.itemId))!.status).toBe('INSTITUTION_UNAVAILABLE');
    expect(await runItemSync(h.deps, h.itemId, 'MANUAL')).toMatchObject({ ran: true });
    expect((await h.store.getItem(h.itemId))!.status).toBe('ACTIVE');
  });

  it('transactions not ready yet: balances import, the Item stays ACTIVE, the cursor is not invented', async () => {
    const h = await bankingHarness();
    const user = await createUser(h.db, 'n@example.test');
    const pub = h.provider.addItem('item-N', twoPageItem() as never);
    h.provider.syncFailures.push(new ProviderError('PRODUCT_NOT_READY', 'PRODUCT_NOT_READY', true));
    const r = await exchangePublicToken(h.deps, user, pub);
    expect(r.sync).toMatchObject({ ran: false, reason: 'NOT_READY' });
    expect(await count(h as never, 'select count(*)::int n from public.jurnl_bank_accounts')).toBe(2);
    expect((await h.store.getItem(r.itemId))!.status).toBe('ACTIVE');
  });

  it('concurrent syncs: the second one is SUPERSEDED, never applied twice', async () => {
    const h = await connected();
    h.provider.items.get('item-A')!.pages.set('c2', { added: [txn({ provider_transaction_id: 't7', provider_account_id: 'chk', amount: 7, date: '2026-11-05' })], modified: [], removed: [], nextCursor: 'c3', hasMore: false });
    const [a, b] = await Promise.all([runItemSync(h.deps, h.itemId, 'MANUAL'), runItemSync(h.deps, h.itemId, 'WEBHOOK')]);
    expect([a, b].filter((x) => x.ran)).toHaveLength(1);
    expect([a, b].some((x) => !x.ran && x.reason === 'SUPERSEDED')).toBe(true);
    expect(await count(h, `select count(*)::int n from public.jurnl_bank_transactions where provider_transaction_id='t7'`)).toBe(1);
  });
});

describe('expired consent, reconnection, disconnect', () => {
  it('ITEM_LOGIN_REQUIRED → NEEDS_REAUTH; reconnect keeps the same Item, accounts and history and resumes from the cursor', async () => {
    const h = await connected();
    h.provider.items.get('item-A')!.error = new ProviderError('REAUTH_REQUIRED', 'ITEM_LOGIN_REQUIRED', false);
    expect(await runItemSync(h.deps, h.itemId, 'MANUAL')).toMatchObject({ status: 'NEEDS_REAUTH' });
    expect(await runItemSync(h.deps, h.itemId, 'WEBHOOK')).toMatchObject({ reason: 'NEEDS_USER_ACTION' });
    // The user completes Link update mode.
    h.provider.items.get('item-A')!.error = null;
    h.provider.items.get('item-A')!.pages.set('c2', { added: [txn({ provider_transaction_id: 't3', provider_account_id: 'chk', amount: 3, date: '2026-11-06' })], modified: [], removed: [], nextCursor: 'c3', hasMore: false });
    const r = await completeReconnect(h.deps, h.user, h.itemId);
    expect(r).toMatchObject({ status: 'ACTIVE', sync: { ran: true, added: 1 } });
    expect(await count(h, 'select count(*)::int n from public.jurnl_bank_items')).toBe(1);
    expect(await count(h, 'select count(*)::int n from public.jurnl_bank_transactions')).toBe(3);
  });

  it('disconnect: provider revocation first; a provider failure removes nothing locally', async () => {
    const h = await connected();
    h.provider.removeFailure = new ProviderError('INSTITUTION_UNAVAILABLE', 'INTERNAL_SERVER_ERROR', true);
    const fail = await disconnectItem(h.deps, h.user, h.itemId, false);
    expect(fail).toMatchObject({ ok: false, providerRevoked: false });
    expect((await h.store.getItem(h.itemId))!.status).toBe('ACTIVE');
    expect(await h.store.getSecret(h.itemId)).not.toBeNull();
    const ok = await disconnectItem(h.deps, h.user, h.itemId, false);
    expect(ok).toMatchObject({ ok: true, providerRevoked: true, providerNote: 'REVOKED' });
    expect(h.provider.items.get('item-A')!.removed).toBe(true);
    expect(await h.store.getSecret(h.itemId)).toBeNull();
    expect((await h.store.getItem(h.itemId))!.status).toBe('DISCONNECTED');
    expect(await count(h, 'select count(*)::int n from public.jurnl_bank_transactions')).toBe(2);
    expect(await runItemSync(h.deps, h.itemId, 'WEBHOOK')).toMatchObject({ reason: 'DISCONNECTED' });
  });

  it('disconnect with deletion removes imported transactions; another user cannot disconnect it', async () => {
    const h = await connected();
    const stranger = await createUser(h.db, 's@example.test');
    await expect(disconnectItem(h.deps, stranger, h.itemId, true)).rejects.toMatchObject({ code: 'ITEM_NOT_FOUND' });
    const ok = await disconnectItem(h.deps, h.user, h.itemId, true);
    expect(ok).toMatchObject({ ok: true, transactionsDeleted: 2 });
  });
});

describe('webhooks', () => {
  const body = (code: string, extra: object = {}) => JSON.stringify({ webhook_type: 'TRANSACTIONS', webhook_code: code, item_id: 'item-A', environment: 'sandbox', ...extra }, null, 2);

  it('an unverified webhook is recorded and refused; nothing syncs', async () => {
    const h = await connected();
    h.provider.webhookValid = false;
    const r = await handleWebhook(h.deps, body('SYNC_UPDATES_AVAILABLE'), {});
    expect(r.httpStatus).toBe(401);
    const rec = await h.db.query<{ verified: boolean; status: string }>('select verified, status from public.jurnl_bank_webhook_events');
    expect(rec.rows[0]).toMatchObject({ verified: false, status: 'REJECTED' });
  });

  it('SYNC_UPDATES_AVAILABLE syncs from the stored cursor; a duplicate delivery is ignored', async () => {
    const h = await connected();
    h.provider.items.get('item-A')!.pages.set('c2', { added: [txn({ provider_transaction_id: 't5', provider_account_id: 'chk', amount: 5, date: '2026-11-05' })], modified: [], removed: [], nextCursor: 'c3', hasMore: false });
    const b = body('SYNC_UPDATES_AVAILABLE');
    expect((await handleWebhook(h.deps, b, {})).body).toMatchObject({ ok: true });
    expect((await handleWebhook(h.deps, b, {})).body).toMatchObject({ duplicate: true });
    expect(await count(h, `select count(*)::int n from public.jurnl_bank_transactions where provider_transaction_id='t5'`)).toBe(1);
  });

  it('out-of-order webhooks cannot reorder or double-apply data (a webhook is only a hint)', async () => {
    const h = await connected();
    h.provider.items.get('item-A')!.pages.set('c2', { added: [txn({ provider_transaction_id: 't6', provider_account_id: 'chk', amount: 6, date: '2026-11-05' })], modified: [], removed: [], nextCursor: 'c3', hasMore: false });
    await handleWebhook(h.deps, body('DEFAULT_UPDATE', { new_transactions: 1 }), {});
    await handleWebhook(h.deps, body('INITIAL_UPDATE', { new_transactions: 9 }), {});
    await handleWebhook(h.deps, body('SYNC_UPDATES_AVAILABLE', { initial_update_complete: true }), {});
    expect(await count(h, 'select count(*)::int n from public.jurnl_bank_transactions')).toBe(3);
    expect((await h.store.getItem(h.itemId))!.sync_cursor).toBe('c3');
  });

  it('ITEM ERROR / PERMISSION REVOKED / NEW_ACCOUNTS_AVAILABLE update health; unknown items are ignored', async () => {
    const h = await connected();
    await handleWebhook(h.deps, JSON.stringify({ webhook_type: 'ITEM', webhook_code: 'ERROR', item_id: 'item-A', error: { error_code: 'ITEM_LOGIN_REQUIRED' } }), {});
    expect((await h.store.getItem(h.itemId))!.status).toBe('NEEDS_REAUTH');
    await handleWebhook(h.deps, JSON.stringify({ webhook_type: 'ITEM', webhook_code: 'USER_PERMISSION_REVOKED', item_id: 'item-A' }), {});
    expect((await h.store.getItem(h.itemId))!.status).toBe('PERMISSION_REVOKED');
    await handleWebhook(h.deps, JSON.stringify({ webhook_type: 'ITEM', webhook_code: 'NEW_ACCOUNTS_AVAILABLE', item_id: 'item-A' }), {});
    expect((await h.store.getItem(h.itemId))!.new_accounts_available).toBe(true);
    expect((await handleWebhook(h.deps, JSON.stringify({ webhook_type: 'TRANSACTIONS', webhook_code: 'SYNC_UPDATES_AVAILABLE', item_id: 'item-unknown' }), {})).body).toMatchObject({ ignored: true });
  });
});

describe('token security', () => {
  it('the access token never appears in logs, responses or the item rows', async () => {
    const h = await connected();
    const items = await h.store.forUser(h.user, null).listItems();
    const everything = JSON.stringify({ items, logs: h.logs, result: h.result });
    expect(everything).not.toMatch(/access-sandbox-/);
    expect(redactSecrets('{"access_token":"access-sandbox-abc123","secret":"s3cr3t"}')).toBe('{"access_token":"[REDACTED]","secret":"[REDACTED]"}');
  });

  it('AES-256-GCM: a tampered ciphertext or a token moved to another item will not open; rotation keeps old tokens readable', () => {
    const k1 = { version: 1, key: crypto.randomBytes(32) };
    const v1 = new TokenVault(k1);
    const sealed = v1.seal('access-sandbox-xyz', 'item-1');
    expect(v1.open(sealed, 'item-1')).toBe('access-sandbox-xyz');
    expect(() => v1.open(sealed, 'item-2')).toThrow();
    expect(() => v1.open({ ...sealed, ciphertext: Buffer.from('nope').toString('base64') }, 'item-1')).toThrow();
    const v2 = new TokenVault({ version: 2, key: crypto.randomBytes(32) }, k1);
    expect(v2.open(sealed, 'item-1')).toBe('access-sandbox-xyz');
    expect(v2.seal('t', 'i').key_version).toBe(2);
  });
});

describe('payout card catalog checks (listing ≠ connectivity)', () => {
  it('reports what the provider lists and never claims connectivity', async () => {
    const h = await bankingHarness();
    h.provider.institutions = [{ institution_id: 'ins_from_provider_1', name: 'Branch', products: ['transactions', 'auth'], country_codes: ['US'], oauth: false, status: null }];
    const uber = await checkPayoutCardCatalog(h.provider, PAYOUT_CARD_TARGETS[0]);
    expect(uber).toMatchObject({ verdict: 'LISTED_WITH_TRANSACTIONS', connectivity: 'UNVERIFIED' });
    expect(uber.candidates[0].institution_id).toBe('ins_from_provider_1');
    const lyft = await checkPayoutCardCatalog(h.provider, PAYOUT_CARD_TARGETS[1]);
    expect(lyft).toMatchObject({ verdict: 'NOT_LISTED', connectivity: 'UNAVAILABLE_MANUAL' });
  });
});
