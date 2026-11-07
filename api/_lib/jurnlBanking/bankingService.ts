/**
 * Connected banking service (read-only aggregation): connect, sync, reconnect, disconnect, webhooks.
 *
 * Rules this file enforces:
 *   - The provider access token is decrypted only inside a provider call and never leaves this module.
 *   - Transactions Sync pages are fetched completely, then applied with the cursor in ONE database transaction.
 *     A failed page, a failed write, or a concurrent sync never advances the cursor.
 *   - A webhook is only a hint to sync from the stored cursor. Its body never writes transactions, so duplicate and
 *     out-of-order deliveries cannot double-apply or reorder data.
 *   - Provider revocation is reported only when the provider confirmed it.
 */
import { ProviderError, type BankingProvider, type ProviderAccount, type ProviderTransaction } from './provider.js';
import { CursorMovedError, ItemDisconnectedError, type BankItemRow, type BankItemStatus, type BankStore, type SyncTrigger } from './store.js';
import { redactSecrets, type TokenVault } from './tokenVault.js';

export type BankingLog = (event: string, data: Record<string, unknown>) => void;

export type BankingDeps = {
  provider: BankingProvider;
  store: BankStore;
  vault: TokenVault;
  webhookUrl: string | null;
  redirectUri: string | null;
  log?: BankingLog;
  /** Max provider pages per sync run (guards a runaway loop). */
  maxPages?: number;
  sleep?: (ms: number) => Promise<void>;
};

export class BankingServiceError extends Error {
  constructor(
    readonly code: string,
    readonly httpStatus: number,
    message?: string,
  ) {
    super(message ?? code);
  }
}

const log = (deps: BankingDeps, event: string, data: Record<string, unknown>) => {
  if (!deps.log) return;
  // Defense in depth: a log payload is stringified through the redactor before it is emitted.
  deps.log(event, JSON.parse(redactSecrets(JSON.stringify(data))) as Record<string, unknown>);
};

export function statusForProviderError(e: ProviderError): BankItemStatus {
  switch (e.kind) {
    case 'REAUTH_REQUIRED':
      return 'NEEDS_REAUTH';
    case 'PERMISSION_REVOKED':
      return 'PERMISSION_REVOKED';
    case 'INSTITUTION_UNAVAILABLE':
      return 'INSTITUTION_UNAVAILABLE';
    case 'INVALID_TOKEN':
      return 'NEEDS_REAUTH';
    default:
      return 'SYNC_ERROR';
  }
}

async function ownedItem(deps: BankingDeps, userId: string, itemId: string): Promise<BankItemRow> {
  const item = await deps.store.getItem(itemId);
  if (!item || item.user_id !== userId) throw new BankingServiceError('ITEM_NOT_FOUND', 404);
  return item;
}

async function tokenFor(deps: BankingDeps, item: BankItemRow): Promise<string> {
  const sealed = await deps.store.getSecret(item.item_id);
  if (!sealed) throw new BankingServiceError('ITEM_TOKEN_MISSING', 409);
  return deps.vault.open(sealed, item.item_id);
}

// ── Link ────────────────────────────────────────────────────────────────────

export async function createLinkToken(deps: BankingDeps, userId: string, opts: { itemId?: string | null } = {}) {
  if (opts.itemId) {
    const item = await ownedItem(deps, userId, opts.itemId);
    if (item.status === 'DISCONNECTED') throw new BankingServiceError('ITEM_DISCONNECTED', 409);
    const accessToken = await tokenFor(deps, item);
    const session = await deps.provider.createLinkSession({
      clientUserId: userId,
      mode: 'UPDATE',
      accessToken,
      webhookUrl: deps.webhookUrl,
      redirectUri: deps.redirectUri,
      accountSelection: item.new_accounts_available,
    });
    return { ...session, mode: 'UPDATE' as const, itemId: item.item_id };
  }
  const session = await deps.provider.createLinkSession({ clientUserId: userId, mode: 'NEW', webhookUrl: deps.webhookUrl, redirectUri: deps.redirectUri });
  return { ...session, mode: 'NEW' as const, itemId: null };
}

// ── Connect (public token exchange, server side only) ──────────────────────

export type ExchangeResult = { itemId: string; status: BankItemStatus; duplicateOf: string | null; sync: SyncOutcome };

export async function exchangePublicToken(deps: BankingDeps, userId: string, publicToken: string): Promise<ExchangeResult> {
  if (!publicToken || typeof publicToken !== 'string') throw new BankingServiceError('PUBLIC_TOKEN_REQUIRED', 400);
  const { accessToken, providerItemId } = await deps.provider.exchangePublicToken(publicToken);

  const existing = await deps.store.findItemByProviderId(deps.provider.id, deps.provider.environment, providerItemId);
  if (existing) {
    if (existing.user_id !== userId) throw new BankingServiceError('ITEM_OWNED_BY_ANOTHER_USER', 409);
    return { itemId: existing.item_id, status: existing.status, duplicateOf: null, sync: { ran: false, reason: 'ALREADY_CONNECTED' } };
  }

  const info = await deps.provider.getItem(accessToken);
  const accounts = await deps.provider.getAccounts(accessToken);

  // Duplicate institution login: same institution and at least one same account (mask + type). Plaid bills per Item,
  // so the second Item is removed at the provider and the existing connection is kept.
  if (info.institution_id) {
    const sameInstitution = (await deps.store.findItemsByInstitution(userId, info.institution_id, deps.provider.environment)).filter((i) => i.status !== 'DISCONNECTED');
    if (sameInstitution.length) {
      const known = await deps.store.listAccountsForItems(sameInstitution.map((i) => i.item_id));
      const keys = new Set(known.map((a) => `${a.type}|${a.subtype}|${a.mask}`));
      const overlap = accounts.some((a) => a.mask && keys.has(`${a.type}|${a.subtype}|${a.mask}`));
      if (overlap) {
        await deps.provider.removeItem(accessToken);
        log(deps, 'bank.exchange.duplicate', { userId, institution: info.institution_id });
        return { itemId: sameInstitution[0].item_id, status: sameInstitution[0].status, duplicateOf: sameInstitution[0].item_id, sync: { ran: false, reason: 'DUPLICATE_INSTITUTION' } };
      }
    }
  }

  const item = await deps.store.insertItem({
    user_id: userId,
    provider: deps.provider.id,
    provider_env: deps.provider.environment,
    provider_item_id: providerItemId,
    institution_id: info.institution_id,
    institution_name: info.institution_name,
    products: info.products,
    consent_expires_at: info.consent_expires_at,
  });
  await deps.store.putSecret(item.item_id, userId, deps.vault.seal(accessToken, item.item_id));
  log(deps, 'bank.exchange.connected', { userId, itemId: item.item_id, institution: info.institution_id, accounts: accounts.length });

  const sync = await runItemSync(deps, item.item_id, 'INITIAL', { accountsHint: accounts });
  const after = await deps.store.getItem(item.item_id);
  return { itemId: item.item_id, status: after?.status ?? item.status, duplicateOf: null, sync };
}

// ── Sync ────────────────────────────────────────────────────────────────────

export type SyncOutcome =
  | { ran: true; added: number; modified: number; removed: number; pages: number }
  | { ran: false; reason: 'ALREADY_CONNECTED' | 'DUPLICATE_INSTITUTION' | 'DISCONNECTED' | 'NEEDS_USER_ACTION' | 'SUPERSEDED' | 'NOT_READY' | 'FAILED'; status?: BankItemStatus; errorCode?: string | null };

export async function runItemSync(deps: BankingDeps, itemId: string, trigger: SyncTrigger, opts: { accountsHint?: ProviderAccount[] } = {}): Promise<SyncOutcome> {
  const item = await deps.store.getItem(itemId);
  if (!item || item.status === 'DISCONNECTED') return { ran: false, reason: 'DISCONNECTED' };
  if ((item.status === 'NEEDS_REAUTH' || item.status === 'PERMISSION_REVOKED') && trigger !== 'RECONNECT') {
    return { ran: false, reason: 'NEEDS_USER_ACTION', status: item.status };
  }
  const accessToken = await tokenFor(deps, item);
  const eventId = await deps.store.startSyncEvent(item.item_id, item.user_id, trigger, item.sync_cursor);
  await deps.store.updateItem(item.item_id, { status: 'SYNCING' });
  const maxPages = deps.maxPages ?? 100;
  const sleep = deps.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));
  let pages = 0;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const added: ProviderTransaction[] = [];
    const modified: ProviderTransaction[] = [];
    const removed: { provider_transaction_id: string }[] = [];
    let cursor = item.sync_cursor;
    pages = 0;
    try {
      let hasMore = true;
      while (hasMore) {
        if (pages >= maxPages) throw new ProviderError('PROVIDER_ERROR', 'PAGE_LIMIT', true);
        const page = await deps.provider.syncTransactions(accessToken, cursor);
        pages += 1;
        added.push(...page.added);
        modified.push(...page.modified);
        removed.push(...page.removed.map((r) => ({ provider_transaction_id: r.provider_transaction_id })));
        cursor = page.nextCursor;
        hasMore = page.hasMore;
      }
      const accounts = opts.accountsHint ?? (await deps.provider.getAccounts(accessToken));
      const counts = await deps.store.applySync({
        itemId: item.item_id,
        cursorBefore: item.sync_cursor,
        cursorAfter: cursor ?? '',
        accounts,
        added,
        modified,
        removed,
        syncEventId: eventId,
      });
      log(deps, 'bank.sync.ok', { itemId, trigger, pages, ...counts });
      return { ran: true, ...counts, pages };
    } catch (e) {
      if (e instanceof CursorMovedError) {
        await deps.store.finishSyncEvent(eventId, 'SUPERSEDED', 'CURSOR_MOVED', pages);
        return { ran: false, reason: 'SUPERSEDED' };
      }
      if (e instanceof ItemDisconnectedError) {
        await deps.store.finishSyncEvent(eventId, 'SUPERSEDED', 'ITEM_DISCONNECTED', pages);
        return { ran: false, reason: 'DISCONNECTED' };
      }
      const pe = e instanceof ProviderError ? e : new ProviderError('PROVIDER_ERROR', null, false, redactSecrets(String((e as Error)?.message ?? e)));
      // Plaid: restart the whole pagination from the cursor we started with.
      if (pe.kind === 'MUTATION_DURING_PAGINATION' && attempt < 3) continue;
      if (pe.kind === 'RATE_LIMITED' && attempt < 2) {
        await sleep(1000);
        continue;
      }
      if (pe.kind === 'PRODUCT_NOT_READY') {
        // Transactions are still being prepared: keep balances, wait for the provider's webhook.
        if (opts.accountsHint) {
          try {
            await deps.store.applySync({ itemId: item.item_id, cursorBefore: item.sync_cursor, cursorAfter: item.sync_cursor ?? '', accounts: opts.accountsHint, added: [], modified: [], removed: [], syncEventId: null });
          } catch {
            /* balances are retried on the next sync */
          }
        }
        await deps.store.updateItem(item.item_id, { status: 'ACTIVE' });
        await deps.store.finishSyncEvent(eventId, 'FAILED', 'PRODUCT_NOT_READY', pages);
        return { ran: false, reason: 'NOT_READY' };
      }
      const status = statusForProviderError(pe);
      await deps.store.updateItem(item.item_id, { status, last_error_code: pe.providerCode ?? pe.kind, last_error_at: new Date().toISOString() });
      await deps.store.finishSyncEvent(eventId, 'FAILED', pe.providerCode ?? pe.kind, pages);
      log(deps, 'bank.sync.failed', { itemId, trigger, kind: pe.kind, code: pe.providerCode });
      return { ran: false, reason: 'FAILED', status, errorCode: pe.providerCode ?? pe.kind };
    }
  }
  return { ran: false, reason: 'FAILED' };
}

/** After the user completes Link update mode: the Item keeps its id, history and cursor; sync resumes from it. */
export async function completeReconnect(deps: BankingDeps, userId: string, itemId: string) {
  const item = await ownedItem(deps, userId, itemId);
  if (item.status === 'DISCONNECTED') throw new BankingServiceError('ITEM_DISCONNECTED', 409);
  const accessToken = await tokenFor(deps, item);
  const info = await deps.provider.getItem(accessToken);
  if (info.error_code) {
    const pe = new ProviderError('REAUTH_REQUIRED', info.error_code, false);
    await deps.store.updateItem(itemId, { status: statusForProviderError(pe), last_error_code: info.error_code, last_error_at: new Date().toISOString() });
    return { status: statusForProviderError(pe), sync: { ran: false, reason: 'NEEDS_USER_ACTION' } as SyncOutcome };
  }
  await deps.store.updateItem(itemId, { status: 'ACTIVE', consent_expires_at: info.consent_expires_at, last_error_code: null, new_accounts_available: false });
  const sync = await runItemSync(deps, itemId, 'RECONNECT');
  const after = await deps.store.getItem(itemId);
  return { status: after?.status ?? 'ACTIVE', sync };
}

// ── Disconnect ──────────────────────────────────────────────────────────────

export type DisconnectResult =
  | { ok: true; providerRevoked: true; providerNote: 'REVOKED' | 'ALREADY_REMOVED_AT_PROVIDER'; accountsMarked: number; transactionsDeleted: number }
  | { ok: false; providerRevoked: false; code: 'PROVIDER_UNREACHABLE' | 'PROVIDER_ERROR'; message: string };

export async function disconnectItem(deps: BankingDeps, userId: string, itemId: string, deleteImported: boolean): Promise<DisconnectResult> {
  const item = await ownedItem(deps, userId, itemId);
  if (item.status === 'DISCONNECTED') {
    return { ok: true, providerRevoked: true, providerNote: 'REVOKED', accountsMarked: 0, transactionsDeleted: 0 };
  }
  let note: 'REVOKED' | 'ALREADY_REMOVED_AT_PROVIDER' = 'REVOKED';
  const sealed = await deps.store.getSecret(item.item_id);
  if (sealed) {
    try {
      await deps.provider.removeItem(deps.vault.open(sealed, item.item_id));
    } catch (e) {
      const pe = e instanceof ProviderError ? e : new ProviderError('PROVIDER_ERROR', null, false);
      if (pe.kind === 'INVALID_TOKEN') {
        note = 'ALREADY_REMOVED_AT_PROVIDER';
      } else {
        // Nothing is removed locally: keeping the token is what lets the next attempt revoke access for real.
        log(deps, 'bank.disconnect.partial', { itemId, kind: pe.kind, code: pe.providerCode });
        return { ok: false, providerRevoked: false, code: pe.kind === 'INSTITUTION_UNAVAILABLE' ? 'PROVIDER_UNREACHABLE' : 'PROVIDER_ERROR', message: 'ACCESS WAS NOT REMOVED. TRY AGAIN.' };
      }
    }
  } else {
    note = 'ALREADY_REMOVED_AT_PROVIDER';
  }
  const r = await deps.store.disconnect(item.item_id, true, deleteImported);
  log(deps, 'bank.disconnect.ok', { itemId, deleteImported, note });
  return { ok: true, providerRevoked: true, providerNote: note, accountsMarked: r.accounts_marked, transactionsDeleted: r.transactions_deleted };
}

// ── Webhooks ────────────────────────────────────────────────────────────────

export type WebhookResult = { httpStatus: number; body: Record<string, unknown> };

export async function handleWebhook(deps: BankingDeps, rawBody: string, headers: Record<string, string | string[] | undefined>): Promise<WebhookResult> {
  const v = await deps.provider.verifyWebhook(rawBody, headers);
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    parsed = {};
  }
  const webhookType = typeof parsed.webhook_type === 'string' ? parsed.webhook_type : null;
  const webhookCode = typeof parsed.webhook_code === 'string' ? parsed.webhook_code : null;
  const providerItemId = typeof parsed.item_id === 'string' ? parsed.item_id : null;

  const rec = await deps.store.recordWebhook({
    provider: deps.provider.id,
    provider_env: deps.provider.environment,
    body_sha256: v.bodySha256,
    webhook_type: webhookType,
    webhook_code: webhookCode,
    provider_item_id: providerItemId,
    verified: v.verified,
    status: v.verified ? 'RECEIVED' : 'REJECTED',
  });
  if (!v.verified) {
    log(deps, 'bank.webhook.rejected', { reason: v.reason });
    return { httpStatus: 401, body: { error: 'WEBHOOK_NOT_VERIFIED' } };
  }
  if (rec.duplicate) return { httpStatus: 200, body: { ok: true, duplicate: true } };

  const item = providerItemId ? await deps.store.findItemByProviderId(deps.provider.id, deps.provider.environment, providerItemId) : null;
  if (!item || item.status === 'DISCONNECTED') {
    await deps.store.finishWebhook(rec.id, 'IGNORED', item ? 'ITEM_DISCONNECTED' : 'ITEM_UNKNOWN');
    return { httpStatus: 200, body: { ok: true, ignored: true } };
  }
  await deps.store.updateItem(item.item_id, { last_webhook_at: new Date().toISOString() });

  try {
    if (webhookType === 'TRANSACTIONS') {
      if (['SYNC_UPDATES_AVAILABLE', 'INITIAL_UPDATE', 'HISTORICAL_UPDATE', 'DEFAULT_UPDATE', 'TRANSACTIONS_REMOVED'].includes(webhookCode ?? '')) {
        await runItemSync(deps, item.item_id, 'WEBHOOK');
        await deps.store.finishWebhook(rec.id, 'PROCESSED', null);
      } else await deps.store.finishWebhook(rec.id, 'IGNORED', null);
    } else if (webhookType === 'ITEM') {
      const err = parsed.error as { error_code?: string; error_type?: string } | null | undefined;
      if (webhookCode === 'ERROR' && err?.error_code) {
        const pe = new ProviderError(err.error_code === 'ITEM_LOGIN_REQUIRED' ? 'REAUTH_REQUIRED' : 'PROVIDER_ERROR', err.error_code, false);
        await deps.store.updateItem(item.item_id, { status: statusForProviderError(pe), last_error_code: err.error_code, last_error_at: new Date().toISOString() });
      } else if (webhookCode === 'PENDING_EXPIRATION' || webhookCode === 'PENDING_DISCONNECT') {
        const at = typeof parsed.consent_expiration_time === 'string' ? parsed.consent_expiration_time : null;
        await deps.store.updateItem(item.item_id, { consent_expires_at: at });
      } else if (webhookCode === 'USER_PERMISSION_REVOKED' || webhookCode === 'USER_ACCOUNT_REVOKED') {
        await deps.store.updateItem(item.item_id, { status: 'PERMISSION_REVOKED', last_error_code: webhookCode, last_error_at: new Date().toISOString() });
      } else if (webhookCode === 'LOGIN_REPAIRED') {
        await deps.store.updateItem(item.item_id, { status: 'ACTIVE', last_error_code: null });
        await runItemSync(deps, item.item_id, 'WEBHOOK');
      } else if (webhookCode === 'NEW_ACCOUNTS_AVAILABLE') {
        await deps.store.updateItem(item.item_id, { new_accounts_available: true });
      }
      await deps.store.finishWebhook(rec.id, 'PROCESSED', null);
    } else {
      await deps.store.finishWebhook(rec.id, 'IGNORED', null);
    }
  } catch (e) {
    await deps.store.finishWebhook(rec.id, 'FAILED', e instanceof ProviderError ? e.kind : 'PROCESSING_FAILED');
    // 200: the delivery was received and recorded; the item's own status shows the failure and the next sync retries.
    return { httpStatus: 200, body: { ok: true, processed: false } };
  }
  return { httpStatus: 200, body: { ok: true } };
}
