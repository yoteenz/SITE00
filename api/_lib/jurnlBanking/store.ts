/**
 * Banking persistence. One interface, two implementations:
 *   - SupabaseBankStore: hosted Supabase (service role for API writes; the user's JWT for user reads so RLS applies).
 *   - SqlBankStore: any Postgres executor (PGlite disposable databases in tests and local runs). Same SQL functions,
 *     same RLS: user reads run as role `authenticated` with the user's claims.
 * The cursor only advances inside jurnl_bank_apply_sync (one transaction with the rows it describes).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProviderAccount, ProviderEnvironment, ProviderId, ProviderTransaction } from './provider.js';
import type { SealedToken } from './tokenVault.js';

export type BankItemStatus = 'ACTIVE' | 'SYNCING' | 'NEEDS_REAUTH' | 'PERMISSION_REVOKED' | 'INSTITUTION_UNAVAILABLE' | 'SYNC_ERROR' | 'DISCONNECTED';
export type SyncTrigger = 'INITIAL' | 'WEBHOOK' | 'MANUAL' | 'RECONNECT' | 'SCHEDULED';

export type BankItemRow = {
  item_id: string;
  user_id: string;
  provider: ProviderId;
  provider_env: ProviderEnvironment;
  provider_item_id: string;
  institution_id: string | null;
  institution_name: string | null;
  status: BankItemStatus;
  products: string[];
  consent_granted_at: string;
  consent_expires_at: string | null;
  sync_cursor: string | null;
  last_sync_started_at: string | null;
  last_successful_sync_at: string | null;
  last_balance_at: string | null;
  last_webhook_at: string | null;
  last_error_code: string | null;
  last_error_at: string | null;
  new_accounts_available: boolean;
  disconnected_at: string | null;
  provider_revoked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BankAccountRow = ProviderAccount & {
  bank_account_id: string;
  user_id: string;
  item_id: string;
  status: 'ACTIVE' | 'NOT_RETURNED' | 'DISCONNECTED';
  updated_at: string;
};

export type BankTransactionRow = ProviderTransaction & {
  bank_transaction_id: string;
  user_id: string;
  item_id: string;
  provider_state: 'ACTIVE' | 'REMOVED';
  revision: number;
  first_seen_at: string;
  last_changed_at: string;
  removed_at: string | null;
};

export type ItemPatch = Partial<
  Pick<
    BankItemRow,
    | 'status'
    | 'institution_id'
    | 'institution_name'
    | 'products'
    | 'consent_expires_at'
    | 'last_sync_started_at'
    | 'last_webhook_at'
    | 'last_error_code'
    | 'last_error_at'
    | 'new_accounts_available'
  >
>;

export class CursorMovedError extends Error {
  constructor() {
    super('CURSOR_MOVED');
  }
}
export class ItemDisconnectedError extends Error {
  constructor() {
    super('ITEM_DISCONNECTED');
  }
}

export type ApplySyncInput = {
  itemId: string;
  cursorBefore: string | null;
  cursorAfter: string;
  accounts: ProviderAccount[];
  added: ProviderTransaction[];
  modified: ProviderTransaction[];
  removed: { provider_transaction_id: string }[];
  syncEventId: number | null;
};

export interface BankUserReader {
  listItems(): Promise<BankItemRow[]>;
  listAccounts(): Promise<BankAccountRow[]>;
  /** Rows changed after `since` (ISO), or every row when null. Removed rows are included (provider_state REMOVED). */
  listTransactions(since: string | null): Promise<BankTransactionRow[]>;
}

export interface BankStore {
  forUser(userId: string, accessToken: string | null): BankUserReader;
  findItemByProviderId(provider: ProviderId, env: ProviderEnvironment, providerItemId: string): Promise<BankItemRow | null>;
  findItemsByInstitution(userId: string, institutionId: string, env: ProviderEnvironment): Promise<BankItemRow[]>;
  getItem(itemId: string): Promise<BankItemRow | null>;
  /** Service-level read (duplicate-institution detection). */
  listAccountsForItems(itemIds: string[]): Promise<BankAccountRow[]>;
  insertItem(row: Pick<BankItemRow, 'user_id' | 'provider' | 'provider_env' | 'provider_item_id' | 'institution_id' | 'institution_name' | 'products' | 'consent_expires_at'>): Promise<BankItemRow>;
  updateItem(itemId: string, patch: ItemPatch): Promise<void>;
  putSecret(itemId: string, userId: string, sealed: SealedToken): Promise<void>;
  getSecret(itemId: string): Promise<SealedToken | null>;
  startSyncEvent(itemId: string, userId: string, trigger: SyncTrigger, cursorBefore: string | null): Promise<number>;
  finishSyncEvent(syncEventId: number, status: 'FAILED' | 'SUPERSEDED', errorCode: string | null, pages: number): Promise<void>;
  applySync(input: ApplySyncInput): Promise<{ added: number; modified: number; removed: number }>;
  disconnect(itemId: string, providerRevoked: boolean, deleteImported: boolean): Promise<{ accounts_marked: number; transactions_deleted: number }>;
  recordWebhook(row: { provider: ProviderId; provider_env: ProviderEnvironment; body_sha256: string; webhook_type: string | null; webhook_code: string | null; provider_item_id: string | null; verified: boolean; status: 'RECEIVED' | 'REJECTED' }): Promise<{ id: number; duplicate: boolean }>;
  finishWebhook(id: number, status: 'PROCESSED' | 'IGNORED' | 'FAILED', errorCode: string | null): Promise<void>;
}

const num = (v: unknown): number | null => (v == null ? null : Number(v));

function normalizeAccount(r: Record<string, unknown>): BankAccountRow {
  return {
    ...(r as unknown as BankAccountRow),
    current_balance: num(r.current_balance),
    available_balance: num(r.available_balance),
    credit_limit: num(r.credit_limit),
    balance_as_of: r.balance_as_of ? new Date(String(r.balance_as_of)).toISOString() : '',
    updated_at: new Date(String(r.updated_at)).toISOString(),
  };
}

function isoDate(v: unknown): string | null {
  if (v == null) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

function normalizeTxn(r: Record<string, unknown>): BankTransactionRow {
  return {
    ...(r as unknown as BankTransactionRow),
    amount: Number(r.amount),
    date: isoDate(r.date) ?? '',
    authorized_date: isoDate(r.authorized_date),
    first_seen_at: new Date(String(r.first_seen_at)).toISOString(),
    last_changed_at: new Date(String(r.last_changed_at)).toISOString(),
    removed_at: r.removed_at ? new Date(String(r.removed_at)).toISOString() : null,
  };
}

function normalizeItem(r: Record<string, unknown>): BankItemRow {
  const out = { ...(r as unknown as BankItemRow) };
  for (const k of ['consent_granted_at', 'consent_expires_at', 'last_sync_started_at', 'last_successful_sync_at', 'last_balance_at', 'last_webhook_at', 'last_error_at', 'disconnected_at', 'provider_revoked_at', 'created_at', 'updated_at'] as const) {
    const v = r[k];
    (out as Record<string, unknown>)[k] = v == null ? null : new Date(String(v)).toISOString();
  }
  return out;
}

const ITEM_PUBLIC_COLUMNS =
  'item_id, user_id, provider, provider_env, provider_item_id, institution_id, institution_name, status, products, consent_granted_at, consent_expires_at, sync_cursor, last_sync_started_at, last_successful_sync_at, last_balance_at, last_webhook_at, last_error_code, last_error_at, new_accounts_available, disconnected_at, provider_revoked_at, created_at, updated_at';

function accountsJson(accounts: ProviderAccount[]): string {
  return JSON.stringify(accounts);
}

// ─────────────────────────────────────────────────────────────────────────────
// SQL implementation (PGlite / node-postgres style executor)
// ─────────────────────────────────────────────────────────────────────────────

export type SqlExecutor = {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
  transaction<T>(fn: (tx: SqlExecutor) => Promise<T>): Promise<T>;
};

function sqlState(e: unknown): string | null {
  const err = e as { code?: string; message?: string };
  return err?.code ?? null;
}

export class SqlBankStore implements BankStore {
  constructor(private readonly db: SqlExecutor) {}

  private async asService<T>(fn: (tx: SqlExecutor) => Promise<T>): Promise<T> {
    return this.db.transaction(async (tx) => {
      await tx.query('set local role service_role');
      return fn(tx);
    });
  }

  forUser(userId: string): BankUserReader {
    const run = <T>(fn: (tx: SqlExecutor) => Promise<T>) =>
      this.db.transaction(async (tx) => {
        await tx.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: userId, role: 'authenticated' })]);
        await tx.query('set local role authenticated');
        return fn(tx);
      });
    return {
      listItems: () => run(async (tx) => (await tx.query(`select ${ITEM_PUBLIC_COLUMNS} from public.jurnl_bank_items order by created_at`)).rows.map(normalizeItem)),
      listAccounts: () => run(async (tx) => (await tx.query('select * from public.jurnl_bank_accounts order by created_at')).rows.map(normalizeAccount)),
      listTransactions: (since) =>
        run(async (tx) =>
          (
            await tx.query(
              since
                ? 'select * from public.jurnl_bank_transactions where last_changed_at > $1 order by last_changed_at, provider_transaction_id'
                : 'select * from public.jurnl_bank_transactions order by last_changed_at, provider_transaction_id',
              since ? [since] : [],
            )
          ).rows.map(normalizeTxn),
        ),
    };
  }

  findItemByProviderId(provider: ProviderId, env: ProviderEnvironment, providerItemId: string) {
    return this.asService(async (tx) => {
      const r = await tx.query(`select ${ITEM_PUBLIC_COLUMNS} from public.jurnl_bank_items where provider=$1 and provider_env=$2 and provider_item_id=$3`, [provider, env, providerItemId]);
      return r.rows[0] ? normalizeItem(r.rows[0]) : null;
    });
  }

  findItemsByInstitution(userId: string, institutionId: string, env: ProviderEnvironment) {
    return this.asService(async (tx) =>
      (await tx.query(`select ${ITEM_PUBLIC_COLUMNS} from public.jurnl_bank_items where user_id=$1 and institution_id=$2 and provider_env=$3 order by created_at`, [userId, institutionId, env])).rows.map(normalizeItem),
    );
  }

  getItem(itemId: string) {
    return this.asService(async (tx) => {
      const r = await tx.query(`select ${ITEM_PUBLIC_COLUMNS} from public.jurnl_bank_items where item_id=$1`, [itemId]);
      return r.rows[0] ? normalizeItem(r.rows[0]) : null;
    });
  }

  listAccountsForItems(itemIds: string[]) {
    if (!itemIds.length) return Promise.resolve([]);
    return this.asService(async (tx) => (await tx.query('select * from public.jurnl_bank_accounts where item_id = any($1::uuid[])', [itemIds])).rows.map(normalizeAccount));
  }

  insertItem(row: Parameters<BankStore['insertItem']>[0]) {
    return this.asService(async (tx) => {
      const r = await tx.query(
        `insert into public.jurnl_bank_items (user_id, provider, provider_env, provider_item_id, institution_id, institution_name, products, consent_expires_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8) returning ${ITEM_PUBLIC_COLUMNS}`,
        [row.user_id, row.provider, row.provider_env, row.provider_item_id, row.institution_id, row.institution_name, row.products, row.consent_expires_at],
      );
      return normalizeItem(r.rows[0]);
    });
  }

  updateItem(itemId: string, patch: ItemPatch) {
    const keys = Object.keys(patch) as (keyof ItemPatch)[];
    if (!keys.length) return Promise.resolve();
    return this.asService(async (tx) => {
      const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
      await tx.query(`update public.jurnl_bank_items set ${sets}, updated_at = now() where item_id = $1`, [itemId, ...keys.map((k) => patch[k])]);
    });
  }

  putSecret(itemId: string, userId: string, s: SealedToken) {
    return this.asService(async (tx) => {
      await tx.query(
        `insert into public.jurnl_bank_item_secrets (item_id, user_id, key_version, iv, ciphertext, auth_tag) values ($1,$2,$3,$4,$5,$6)
         on conflict (item_id) do update set key_version=excluded.key_version, iv=excluded.iv, ciphertext=excluded.ciphertext, auth_tag=excluded.auth_tag, rotated_at=now()`,
        [itemId, userId, s.key_version, s.iv, s.ciphertext, s.auth_tag],
      );
    });
  }

  getSecret(itemId: string) {
    return this.asService(async (tx) => {
      const r = await tx.query<SealedToken>('select key_version, iv, ciphertext, auth_tag from public.jurnl_bank_item_secrets where item_id=$1', [itemId]);
      return r.rows[0] ?? null;
    });
  }

  startSyncEvent(itemId: string, userId: string, trigger: SyncTrigger, cursorBefore: string | null) {
    return this.asService(async (tx) => {
      await tx.query(`update public.jurnl_bank_items set last_sync_started_at = now(), updated_at = now() where item_id=$1`, [itemId]);
      const r = await tx.query<{ sync_event_id: number }>(
        'insert into public.jurnl_bank_sync_events (user_id, item_id, trigger, cursor_before) values ($1,$2,$3,$4) returning sync_event_id',
        [userId, itemId, trigger, cursorBefore],
      );
      return Number(r.rows[0].sync_event_id);
    });
  }

  finishSyncEvent(id: number, status: 'FAILED' | 'SUPERSEDED', errorCode: string | null, pages: number) {
    return this.asService(async (tx) => {
      await tx.query('update public.jurnl_bank_sync_events set status=$2, error_code=$3, pages=$4, finished_at=now() where sync_event_id=$1', [id, status, errorCode, pages]);
    });
  }

  async applySync(i: ApplySyncInput) {
    try {
      return await this.asService(async (tx) => {
        const r = await tx.query<{ added: number; modified: number; removed: number }>(
          'select * from public.jurnl_bank_apply_sync($1::uuid, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb, $8)',
          [i.itemId, i.cursorBefore, i.cursorAfter, accountsJson(i.accounts), JSON.stringify(i.added), JSON.stringify(i.modified), JSON.stringify(i.removed), i.syncEventId],
        );
        return r.rows[0];
      });
    } catch (e) {
      if (sqlState(e) === 'JR409') throw new CursorMovedError();
      if (sqlState(e) === 'JR410') throw new ItemDisconnectedError();
      throw e;
    }
  }

  disconnect(itemId: string, providerRevoked: boolean, deleteImported: boolean) {
    return this.asService(async (tx) => {
      const r = await tx.query<{ accounts_marked: number; transactions_deleted: number }>('select * from public.jurnl_bank_disconnect($1::uuid, $2, $3)', [itemId, providerRevoked, deleteImported]);
      return r.rows[0];
    });
  }

  recordWebhook(row: Parameters<BankStore['recordWebhook']>[0]) {
    return this.asService(async (tx) => {
      const r = await tx.query<{ webhook_event_id: number }>(
        `insert into public.jurnl_bank_webhook_events (provider, provider_env, body_sha256, webhook_type, webhook_code, provider_item_id, verified, status)
         values ($1,$2,$3,$4,$5,$6,$7,$8) on conflict (provider, provider_env, body_sha256) do nothing returning webhook_event_id`,
        [row.provider, row.provider_env, row.body_sha256, row.webhook_type, row.webhook_code, row.provider_item_id, row.verified, row.status],
      );
      if (r.rows[0]) return { id: Number(r.rows[0].webhook_event_id), duplicate: false };
      const existing = await tx.query<{ webhook_event_id: number }>('select webhook_event_id from public.jurnl_bank_webhook_events where provider=$1 and provider_env=$2 and body_sha256=$3', [row.provider, row.provider_env, row.body_sha256]);
      return { id: Number(existing.rows[0]?.webhook_event_id ?? 0), duplicate: true };
    });
  }

  finishWebhook(id: number, status: 'PROCESSED' | 'IGNORED' | 'FAILED', errorCode: string | null) {
    return this.asService(async (tx) => {
      await tx.query('update public.jurnl_bank_webhook_events set status=$2, error_code=$3, processed_at=now() where webhook_event_id=$1', [id, status, errorCode]);
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Supabase implementation (hosted)
// ─────────────────────────────────────────────────────────────────────────────

function check<T>(r: { data: T | null; error: { message: string; code?: string } | null }): T {
  if (r.error) {
    const e = new Error(r.error.message) as Error & { code?: string };
    e.code = r.error.code;
    throw e;
  }
  return r.data as T;
}

export class SupabaseBankStore implements BankStore {
  constructor(
    private readonly service: SupabaseClient,
    private readonly userClient: (accessToken: string) => SupabaseClient,
  ) {}

  forUser(_userId: string, accessToken: string | null): BankUserReader {
    if (!accessToken) throw new Error('USER_TOKEN_REQUIRED');
    const sb = this.userClient(accessToken);
    return {
      listItems: async () => check(await sb.from('jurnl_bank_items').select(ITEM_PUBLIC_COLUMNS).order('created_at')).map((r) => normalizeItem(r as Record<string, unknown>)),
      listAccounts: async () => check(await sb.from('jurnl_bank_accounts').select('*').order('created_at')).map((r) => normalizeAccount(r as Record<string, unknown>)),
      listTransactions: async (since) => {
        let q = sb.from('jurnl_bank_transactions').select('*').order('last_changed_at').order('provider_transaction_id');
        if (since) q = q.gt('last_changed_at', since);
        return check(await q).map((r) => normalizeTxn(r as Record<string, unknown>));
      },
    };
  }

  async findItemByProviderId(provider: ProviderId, env: ProviderEnvironment, providerItemId: string) {
    const rows = check(await this.service.from('jurnl_bank_items').select(ITEM_PUBLIC_COLUMNS).eq('provider', provider).eq('provider_env', env).eq('provider_item_id', providerItemId).limit(1));
    return rows[0] ? normalizeItem(rows[0] as Record<string, unknown>) : null;
  }

  async findItemsByInstitution(userId: string, institutionId: string, env: ProviderEnvironment) {
    return check(await this.service.from('jurnl_bank_items').select(ITEM_PUBLIC_COLUMNS).eq('user_id', userId).eq('institution_id', institutionId).eq('provider_env', env).order('created_at')).map((r) =>
      normalizeItem(r as Record<string, unknown>),
    );
  }

  async getItem(itemId: string) {
    const rows = check(await this.service.from('jurnl_bank_items').select(ITEM_PUBLIC_COLUMNS).eq('item_id', itemId).limit(1));
    return rows[0] ? normalizeItem(rows[0] as Record<string, unknown>) : null;
  }

  async listAccountsForItems(itemIds: string[]) {
    if (!itemIds.length) return [];
    return check(await this.service.from('jurnl_bank_accounts').select('*').in('item_id', itemIds)).map((r) => normalizeAccount(r as Record<string, unknown>));
  }

  async insertItem(row: Parameters<BankStore['insertItem']>[0]) {
    const data = check(await this.service.from('jurnl_bank_items').insert(row).select(ITEM_PUBLIC_COLUMNS).single());
    return normalizeItem(data as unknown as Record<string, unknown>);
  }

  async updateItem(itemId: string, patch: ItemPatch) {
    if (!Object.keys(patch).length) return;
    check(await this.service.from('jurnl_bank_items').update({ ...patch, updated_at: new Date().toISOString() }).eq('item_id', itemId));
  }

  async putSecret(itemId: string, userId: string, s: SealedToken) {
    check(await this.service.from('jurnl_bank_item_secrets').upsert({ item_id: itemId, user_id: userId, ...s, rotated_at: new Date().toISOString() }));
  }

  async getSecret(itemId: string) {
    const rows = check(await this.service.from('jurnl_bank_item_secrets').select('key_version, iv, ciphertext, auth_tag').eq('item_id', itemId).limit(1));
    return (rows[0] as SealedToken | undefined) ?? null;
  }

  async startSyncEvent(itemId: string, userId: string, trigger: SyncTrigger, cursorBefore: string | null) {
    check(await this.service.from('jurnl_bank_items').update({ last_sync_started_at: new Date().toISOString() }).eq('item_id', itemId));
    const data = check(await this.service.from('jurnl_bank_sync_events').insert({ user_id: userId, item_id: itemId, trigger, cursor_before: cursorBefore }).select('sync_event_id').single());
    return Number((data as unknown as { sync_event_id: number }).sync_event_id);
  }

  async finishSyncEvent(id: number, status: 'FAILED' | 'SUPERSEDED', errorCode: string | null, pages: number) {
    check(await this.service.from('jurnl_bank_sync_events').update({ status, error_code: errorCode, pages, finished_at: new Date().toISOString() }).eq('sync_event_id', id));
  }

  async applySync(i: ApplySyncInput) {
    const r = await this.service.rpc('jurnl_bank_apply_sync', {
      p_item_id: i.itemId,
      p_cursor_before: i.cursorBefore,
      p_cursor_after: i.cursorAfter,
      p_accounts: i.accounts,
      p_added: i.added,
      p_modified: i.modified,
      p_removed: i.removed,
      p_sync_event_id: i.syncEventId,
    });
    if (r.error?.code === 'JR409') throw new CursorMovedError();
    if (r.error?.code === 'JR410') throw new ItemDisconnectedError();
    const rows = check(r) as { added: number; modified: number; removed: number }[];
    return rows[0];
  }

  async disconnect(itemId: string, providerRevoked: boolean, deleteImported: boolean) {
    const rows = check(await this.service.rpc('jurnl_bank_disconnect', { p_item_id: itemId, p_provider_revoked: providerRevoked, p_delete_imported: deleteImported })) as {
      accounts_marked: number;
      transactions_deleted: number;
    }[];
    return rows[0];
  }

  async recordWebhook(row: Parameters<BankStore['recordWebhook']>[0]) {
    const r = await this.service.from('jurnl_bank_webhook_events').insert(row).select('webhook_event_id').single();
    if (r.error?.code === '23505') {
      const existing = check(await this.service.from('jurnl_bank_webhook_events').select('webhook_event_id').eq('provider', row.provider).eq('provider_env', row.provider_env).eq('body_sha256', row.body_sha256).limit(1));
      return { id: Number((existing[0] as { webhook_event_id: number } | undefined)?.webhook_event_id ?? 0), duplicate: true };
    }
    const data = check(r) as { webhook_event_id: number };
    return { id: Number(data.webhook_event_id), duplicate: false };
  }

  async finishWebhook(id: number, status: 'PROCESSED' | 'IGNORED' | 'FAILED', errorCode: string | null) {
    check(await this.service.from('jurnl_bank_webhook_events').update({ status, error_code: errorCode, processed_at: new Date().toISOString() }).eq('webhook_event_id', id));
  }
}
