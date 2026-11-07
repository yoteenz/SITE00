/**
 * Test harness for connected banking.
 *
 *   freshDb()        a disposable PGlite Postgres with the Supabase platform shim and EVERY JURNL migration applied
 *                    (the same SQL that would run on a hosted project; RLS enforced for role `authenticated`).
 *   ScriptedProvider a deterministic BankingProvider with SYNTHETIC data, for unit and acceptance tests. It is never
 *                    used at runtime and never presented as a real connection; the live provider path is the Plaid
 *                    adapter, exercised against Plaid's sandbox by scripts/jurnl/banking/plaid-sandbox-validation.ts.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { ProviderError, type BankingProvider, type LinkSessionInput, type ProviderAccount, type ProviderInstitution, type ProviderItemInfo, type ProviderSyncPage, type ProviderTransaction, type WebhookVerification } from '../../../api/_lib/jurnlBanking/provider';
import { SqlBankStore, type SqlExecutor } from '../../../api/_lib/jurnlBanking/store';
import { TokenVault } from '../../../api/_lib/jurnlBanking/tokenVault';
import type { BankingDeps } from '../../../api/_lib/jurnlBanking/bankingService';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');

export function jurnlMigrationFiles(): string[] {
  return fs
    .readdirSync(path.join(ROOT, 'supabase/migrations'))
    .filter((f) => f.includes('jurnl') && f.endsWith('.sql'))
    .sort();
}

export async function freshDb(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(fs.readFileSync(path.join(HERE, 'supabaseShim.sql'), 'utf8'));
  for (const f of jurnlMigrationFiles()) await db.exec(fs.readFileSync(path.join(ROOT, 'supabase/migrations', f), 'utf8'));
  return db;
}

export function executor(db: PGlite): SqlExecutor {
  const wrap = (q: { query: PGlite['query'] }): SqlExecutor => ({
    query: async (sql, params) => (await q.query(sql, params as unknown[])) as { rows: never[] },
    transaction: async (fn) => db.transaction(async (tx) => fn(wrap(tx as unknown as { query: PGlite['query'] }))),
  });
  return wrap(db);
}

export async function createUser(db: PGlite, email: string): Promise<string> {
  const id = crypto.randomUUID();
  await db.query('insert into auth.users (id, email) values ($1, $2)', [id, email]);
  return id;
}

/** Runs SQL as an end user (role authenticated + JWT claims), exactly how PostgREST runs a user's request. */
export async function asUser<T>(db: PGlite, userId: string, fn: (q: (sql: string, params?: unknown[]) => Promise<{ rows: T[] }>) => Promise<unknown>): Promise<unknown> {
  return db.transaction(async (tx) => {
    await tx.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: userId, role: 'authenticated' })]);
    await tx.query('set local role authenticated');
    return fn((sql, params) => tx.query(sql, params) as Promise<{ rows: T[] }>);
  });
}

export function testVault(): TokenVault {
  return new TokenVault({ version: 1, key: crypto.randomBytes(32) });
}

// ── Scripted synthetic provider ─────────────────────────────────────────────

export type ScriptedItem = {
  institution_id: string;
  institution_name: string;
  accounts: ProviderAccount[];
  /** Pages returned by successive syncs, keyed by the cursor they start from ('' = initial). */
  pages: Map<string, ProviderSyncPage>;
  error: ProviderError | null;
  removed: boolean;
};

let seq = 0;
export const txn = (p: Partial<ProviderTransaction> & Pick<ProviderTransaction, 'provider_transaction_id' | 'provider_account_id' | 'amount' | 'date'>): ProviderTransaction => ({
  pending: false,
  pending_transaction_id: null,
  iso_currency_code: 'USD',
  unofficial_currency_code: null,
  authorized_date: null,
  name: null,
  merchant_name: null,
  merchant_entity_id: null,
  counterparty_names: null,
  pfc_primary: null,
  pfc_detailed: null,
  pfc_confidence: null,
  payment_channel: 'online',
  transaction_code: null,
  ...p,
});

export const acct = (p: Partial<ProviderAccount> & Pick<ProviderAccount, 'provider_account_id' | 'name' | 'type'>): ProviderAccount => ({
  persistent_account_id: null,
  official_name: null,
  mask: null,
  subtype: null,
  iso_currency_code: 'USD',
  unofficial_currency_code: null,
  current_balance: null,
  available_balance: null,
  credit_limit: null,
  balance_as_of: '2026-11-07T08:00:00.000Z',
  ...p,
});

export class ScriptedProvider implements BankingProvider {
  readonly id = 'PLAID' as const;
  readonly environment = 'sandbox' as const;
  readonly items = new Map<string, ScriptedItem>();
  /** public token → provider item id (what the user "chose" in Link). */
  readonly publicTokens = new Map<string, string>();
  readonly calls: string[] = [];
  /** One-shot failures injected for the next syncTransactions calls. */
  readonly syncFailures: ProviderError[] = [];
  removeFailure: ProviderError | null = null;
  webhookValid = true;
  institutions: ProviderInstitution[] = [];

  addItem(providerItemId: string, item: Omit<ScriptedItem, 'pages' | 'error' | 'removed'> & { pages?: [string, ProviderSyncPage][] }): string {
    this.items.set(providerItemId, { ...item, pages: new Map(item.pages ?? []), error: null, removed: false });
    const pub = `public-sandbox-${++seq}`;
    this.publicTokens.set(pub, providerItemId);
    return pub;
  }

  /** The access token encodes the item id so the test can see which item a call used (it is still opaque to JURNL). */
  private item(accessToken: string): ScriptedItem {
    const id = accessToken.replace(/^access-sandbox-/, '');
    const it = this.items.get(id);
    if (!it || it.removed) throw new ProviderError('INVALID_TOKEN', 'ITEM_NOT_FOUND', false);
    if (it.error) throw it.error;
    return it;
  }

  async createLinkSession(input: LinkSessionInput) {
    this.calls.push(`link:${input.mode}`);
    return { linkToken: `link-sandbox-${++seq}`, expiration: new Date(Date.now() + 4 * 3600_000).toISOString() };
  }

  async exchangePublicToken(publicToken: string) {
    this.calls.push('exchange');
    const id = this.publicTokens.get(publicToken);
    if (!id) throw new ProviderError('INVALID_TOKEN', 'INVALID_PUBLIC_TOKEN', false);
    return { accessToken: `access-sandbox-${id}`, providerItemId: id };
  }

  async getItem(accessToken: string): Promise<ProviderItemInfo> {
    const id = accessToken.replace(/^access-sandbox-/, '');
    const it = this.items.get(id);
    if (!it || it.removed) throw new ProviderError('INVALID_TOKEN', 'ITEM_NOT_FOUND', false);
    return { institution_id: it.institution_id, institution_name: it.institution_name, products: ['transactions'], consent_expires_at: null, error_code: it.error?.providerCode ?? null };
  }

  async getAccounts(accessToken: string) {
    this.calls.push('accounts');
    return this.item(accessToken).accounts.map((a) => ({ ...a }));
  }

  async syncTransactions(accessToken: string, cursor: string | null): Promise<ProviderSyncPage> {
    this.calls.push(`sync:${cursor ?? ''}`);
    const it = this.item(accessToken);
    const f = this.syncFailures.shift();
    if (f) throw f;
    return it.pages.get(cursor ?? '') ?? { added: [], modified: [], removed: [], nextCursor: cursor ?? 'c0', hasMore: false };
  }

  async removeItem(accessToken: string) {
    this.calls.push('remove');
    if (this.removeFailure) {
      const f = this.removeFailure;
      this.removeFailure = null;
      throw f;
    }
    this.item(accessToken).removed = true;
  }

  async searchInstitutions(query: string) {
    this.calls.push(`search:${query}`);
    return this.institutions.filter((i) => i.name.toLowerCase().includes(query.toLowerCase().split(' ')[0]));
  }

  async verifyWebhook(rawBody: string): Promise<WebhookVerification> {
    const bodySha256 = crypto.createHash('sha256').update(rawBody, 'utf8').digest('hex');
    if (!this.webhookValid) return { verified: false, reason: 'BAD_SIGNATURE', bodySha256 };
    return { verified: true, payload: JSON.parse(rawBody) as Record<string, unknown>, bodySha256 };
  }
}

export async function bankingHarness() {
  const db = await freshDb();
  const store = new SqlBankStore(executor(db));
  const provider = new ScriptedProvider();
  const vault = testVault();
  const logs: string[] = [];
  const deps: BankingDeps = { provider, store, vault, webhookUrl: null, redirectUri: null, log: (e, d) => logs.push(`${e} ${JSON.stringify(d)}`), sleep: async () => {} };
  return { db, store, provider, vault, deps, logs };
}
