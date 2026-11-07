/**
 * Plaid implementation of BankingProvider (official `plaid` Node SDK, pinned 49.0.0).
 *
 * Read-only: Link, item, accounts (cached balances), transactions/sync, item/remove, institutions/search and webhook
 * verification. No payment, transfer, or real-time balance endpoint is called. Credentials travel only in the
 * PLAID-CLIENT-ID / PLAID-SECRET request headers (never in a body, URL or log line).
 */
import crypto from 'node:crypto';
import {
  Configuration,
  CountryCode,
  PlaidApi,
  PlaidEnvironments,
  Products,
  type AccountBase,
  type LinkTokenCreateRequest,
  type Transaction,
} from 'plaid';
import {
  ProviderError,
  type BankingProvider,
  type LinkSessionInput,
  type ProviderAccount,
  type ProviderEnvironment,
  type ProviderInstitution,
  type ProviderItemInfo,
  type ProviderSyncPage,
  type ProviderTransaction,
  type WebhookVerification,
} from './provider.js';

export type PlaidProviderConfig = {
  clientId: string;
  /** Real secret, or a placeholder when an outbound proxy injects the PLAID-SECRET header. */
  secret: string;
  environment: ProviderEnvironment;
  /** Products requested at Link. Transactions is required; Auth is opt-in (see ENV guide). */
  products: Products[];
  optionalProducts: Products[];
  clientName: string;
  daysRequested: number;
};

/** Maps a Plaid error code to a connection-health kind. Unknown codes stay PROVIDER_ERROR (never guessed). */
export function classifyPlaidError(code: string | null | undefined, type: string | null | undefined, status?: number): ProviderError {
  const c = code ?? '';
  if (c === 'ITEM_LOGIN_REQUIRED' || c === 'PENDING_EXPIRATION' || c === 'INVALID_UPDATED_USERNAME' || c === 'ITEM_LOCKED' || c === 'USER_SETUP_REQUIRED' || c === 'MFA_NOT_SUPPORTED' || c === 'INSUFFICIENT_CREDENTIALS')
    return new ProviderError('REAUTH_REQUIRED', c, false);
  if (c === 'ACCESS_NOT_GRANTED' || c === 'USER_PERMISSION_REVOKED' || c === 'USER_ACCOUNT_REVOKED' || c === 'ITEM_CONCURRENTLY_DELETED')
    return new ProviderError('PERMISSION_REVOKED', c, false);
  if (c === 'INSTITUTION_DOWN' || c === 'INSTITUTION_NOT_RESPONDING' || c === 'INSTITUTION_NOT_AVAILABLE' || c === 'INSTITUTION_NO_LONGER_SUPPORTED' || c === 'INSTITUTION_REGISTRATION_REQUIRED')
    return new ProviderError('INSTITUTION_UNAVAILABLE', c, c !== 'INSTITUTION_NO_LONGER_SUPPORTED');
  if (type === 'RATE_LIMIT_EXCEEDED' || c.endsWith('RATE_LIMIT') || c === 'RATE_LIMIT' || status === 429) return new ProviderError('RATE_LIMITED', c || 'RATE_LIMIT', true);
  if (c === 'TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION') return new ProviderError('MUTATION_DURING_PAGINATION', c, true);
  if (c === 'PRODUCT_NOT_READY') return new ProviderError('PRODUCT_NOT_READY', c, true);
  if (c === 'INVALID_ACCESS_TOKEN' || c === 'INVALID_PUBLIC_TOKEN' || c === 'ITEM_NOT_FOUND') return new ProviderError('INVALID_TOKEN', c, false);
  if (c === 'INVALID_API_KEYS' || c === 'MISSING_FIELDS' || c === 'INVALID_FIELD' || type === 'INVALID_INPUT') return new ProviderError('INVALID_CREDENTIALS_CONFIG', c, false);
  if (c === 'INSTITUTION_NOT_FOUND' || c === 'INVALID_INSTITUTION') return new ProviderError('NOT_FOUND', c, false);
  return new ProviderError('PROVIDER_ERROR', c || null, Boolean(status && status >= 500));
}

function toProviderError(e: unknown): ProviderError {
  if (e instanceof ProviderError) return e;
  const ax = e as { response?: { status?: number; data?: { error_code?: string; error_type?: string } }; code?: string };
  if (ax?.response?.data?.error_code || ax?.response?.status) {
    return classifyPlaidError(ax.response?.data?.error_code, ax.response?.data?.error_type, ax.response?.status);
  }
  if (ax?.code === 'ECONNRESET' || ax?.code === 'ETIMEDOUT' || ax?.code === 'ECONNREFUSED' || ax?.code === 'ENOTFOUND')
    return new ProviderError('INSTITUTION_UNAVAILABLE', ax.code, true, 'PROVIDER_UNREACHABLE');
  return new ProviderError('PROVIDER_ERROR', null, false);
}

function mapAccount(a: AccountBase, receivedAt: string): ProviderAccount {
  return {
    provider_account_id: a.account_id,
    persistent_account_id: a.persistent_account_id ?? null,
    name: a.name,
    official_name: a.official_name ?? null,
    mask: a.mask ?? null,
    type: String(a.type),
    subtype: a.subtype ? String(a.subtype) : null,
    iso_currency_code: a.balances.iso_currency_code ?? null,
    unofficial_currency_code: a.balances.unofficial_currency_code ?? null,
    current_balance: a.balances.current ?? null,
    available_balance: a.balances.available ?? null,
    credit_limit: a.balances.limit ?? null,
    balance_as_of: a.balances.last_updated_datetime ?? receivedAt,
  };
}

export function mapPlaidTransaction(t: Transaction): ProviderTransaction {
  return {
    provider_transaction_id: t.transaction_id,
    provider_account_id: t.account_id,
    pending: t.pending,
    pending_transaction_id: t.pending_transaction_id ?? null,
    amount: t.amount,
    iso_currency_code: t.iso_currency_code ?? null,
    unofficial_currency_code: t.unofficial_currency_code ?? null,
    date: t.date,
    authorized_date: t.authorized_date ?? null,
    name: t.name ?? null,
    merchant_name: t.merchant_name ?? null,
    merchant_entity_id: t.merchant_entity_id ?? null,
    counterparty_names: t.counterparties?.length ? t.counterparties.map((c) => c.name) : null,
    pfc_primary: t.personal_finance_category?.primary ?? null,
    pfc_detailed: t.personal_finance_category?.detailed ?? null,
    pfc_confidence: t.personal_finance_category?.confidence_level ?? null,
    payment_channel: t.payment_channel ? String(t.payment_channel) : null,
    transaction_code: t.transaction_code ? String(t.transaction_code) : null,
  };
}

type CachedKey = { key: crypto.KeyObject; expiredAt: number | null; fetchedAt: number };

export class PlaidProvider implements BankingProvider {
  readonly id = 'PLAID' as const;
  readonly environment: ProviderEnvironment;
  readonly client: PlaidApi;
  private readonly cfg: PlaidProviderConfig;
  private readonly keys = new Map<string, CachedKey>();

  constructor(cfg: PlaidProviderConfig, client?: PlaidApi) {
    this.cfg = cfg;
    this.environment = cfg.environment;
    this.client =
      client ??
      new PlaidApi(
        new Configuration({
          basePath: cfg.environment === 'production' ? PlaidEnvironments.production : PlaidEnvironments.sandbox,
          baseOptions: { headers: { 'PLAID-CLIENT-ID': cfg.clientId, 'PLAID-SECRET': cfg.secret, 'Plaid-Version': '2020-09-14' }, timeout: 30_000 },
        }),
      );
  }

  async createLinkSession(input: LinkSessionInput) {
    const req: LinkTokenCreateRequest = {
      client_name: this.cfg.clientName,
      language: 'en',
      country_codes: [CountryCode.Us],
      user: { client_user_id: input.clientUserId },
      ...(input.webhookUrl ? { webhook: input.webhookUrl } : {}),
      ...(input.redirectUri ? { redirect_uri: input.redirectUri } : {}),
    };
    if (input.mode === 'UPDATE') {
      if (!input.accessToken) throw new ProviderError('INVALID_TOKEN', null, false, 'UPDATE_MODE_NEEDS_ITEM');
      req.access_token = input.accessToken;
      if (input.accountSelection) req.update = { account_selection_enabled: true };
    } else {
      req.products = this.cfg.products;
      if (this.cfg.optionalProducts.length) req.optional_products = this.cfg.optionalProducts;
      req.transactions = { days_requested: this.cfg.daysRequested };
    }
    try {
      const { data } = await this.client.linkTokenCreate(req);
      return { linkToken: data.link_token, expiration: data.expiration };
    } catch (e) {
      throw toProviderError(e);
    }
  }

  async exchangePublicToken(publicToken: string) {
    try {
      const { data } = await this.client.itemPublicTokenExchange({ public_token: publicToken });
      return { accessToken: data.access_token, providerItemId: data.item_id };
    } catch (e) {
      throw toProviderError(e);
    }
  }

  async getItem(accessToken: string): Promise<ProviderItemInfo> {
    try {
      const { data } = await this.client.itemGet({ access_token: accessToken });
      return {
        institution_id: data.item.institution_id ?? null,
        institution_name: data.item.institution_name ?? null,
        products: (data.item.products ?? data.item.billed_products ?? []).map(String),
        consent_expires_at: data.item.consent_expiration_time ?? null,
        error_code: data.item.error?.error_code ?? null,
      };
    } catch (e) {
      throw toProviderError(e);
    }
  }

  async getAccounts(accessToken: string): Promise<ProviderAccount[]> {
    try {
      const { data } = await this.client.accountsGet({ access_token: accessToken });
      const at = new Date().toISOString();
      return data.accounts.map((a) => mapAccount(a, at));
    } catch (e) {
      throw toProviderError(e);
    }
  }

  async syncTransactions(accessToken: string, cursor: string | null): Promise<ProviderSyncPage> {
    try {
      const { data } = await this.client.transactionsSync({
        access_token: accessToken,
        ...(cursor ? { cursor } : {}),
        count: 500,
        options: { include_personal_finance_category: true },
      });
      return {
        added: data.added.map(mapPlaidTransaction),
        modified: data.modified.map(mapPlaidTransaction),
        removed: data.removed.map((r) => ({ provider_transaction_id: r.transaction_id, provider_account_id: r.account_id ?? null })),
        nextCursor: data.next_cursor,
        hasMore: data.has_more,
      };
    } catch (e) {
      throw toProviderError(e);
    }
  }

  async removeItem(accessToken: string) {
    try {
      await this.client.itemRemove({ access_token: accessToken });
    } catch (e) {
      throw toProviderError(e);
    }
  }

  async searchInstitutions(query: string): Promise<ProviderInstitution[]> {
    try {
      const { data } = await this.client.institutionsSearch({
        query,
        country_codes: [CountryCode.Us],
        options: { include_optional_metadata: true },
      });
      return data.institutions.map((i) => ({
        institution_id: i.institution_id,
        name: i.name,
        products: i.products.map(String),
        country_codes: i.country_codes.map(String),
        oauth: i.oauth,
        status: i.status
          ? {
              item_logins: i.status.item_logins?.status ? String(i.status.item_logins.status) : null,
              transactions_updates: i.status.transactions_updates?.status ? String(i.status.transactions_updates.status) : null,
            }
          : null,
      }));
    } catch (e) {
      throw toProviderError(e);
    }
  }

  /**
   * Plaid webhook verification (docs: "Webhook verification"): the Plaid-Verification header is an ES256 JWT whose
   * key comes from /webhook_verification_key/get; `iat` must be within 5 minutes; the `request_body_sha256` claim
   * must equal the SHA-256 of the exact raw request body.
   */
  async verifyWebhook(rawBody: string, headers: Record<string, string | string[] | undefined>): Promise<WebhookVerification> {
    const bodySha256 = crypto.createHash('sha256').update(rawBody, 'utf8').digest('hex');
    const header = headers['plaid-verification'];
    const jwt = Array.isArray(header) ? header[0] : header;
    if (!jwt) return { verified: false, reason: 'MISSING_SIGNATURE', bodySha256 };
    const parts = jwt.split('.');
    if (parts.length !== 3) return { verified: false, reason: 'MALFORMED_SIGNATURE', bodySha256 };
    let head: { alg?: string; kid?: string };
    let claims: { iat?: number; request_body_sha256?: string };
    try {
      head = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
      claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    } catch {
      return { verified: false, reason: 'MALFORMED_SIGNATURE', bodySha256 };
    }
    if (head.alg !== 'ES256' || !head.kid) return { verified: false, reason: 'UNEXPECTED_ALGORITHM', bodySha256 };
    let key: CachedKey | undefined = this.keys.get(head.kid);
    if (!key) {
      try {
        const { data } = await this.client.webhookVerificationKeyGet({ key_id: head.kid });
        const jwk = { kty: data.key.kty, crv: data.key.crv, x: data.key.x, y: data.key.y };
        key = { key: crypto.createPublicKey({ key: jwk, format: 'jwk' }), expiredAt: data.key.expired_at ?? null, fetchedAt: Date.now() };
        this.keys.set(head.kid, key);
      } catch {
        return { verified: false, reason: 'KEY_UNAVAILABLE', bodySha256 };
      }
    }
    if (key.expiredAt != null && key.expiredAt * 1000 < Date.now()) return { verified: false, reason: 'KEY_EXPIRED', bodySha256 };
    const ok = crypto.verify('sha256', Buffer.from(`${parts[0]}.${parts[1]}`), { key: key.key, dsaEncoding: 'ieee-p1363' }, Buffer.from(parts[2], 'base64url'));
    if (!ok) return { verified: false, reason: 'BAD_SIGNATURE', bodySha256 };
    if (typeof claims.iat !== 'number' || Math.abs(Date.now() / 1000 - claims.iat) > 5 * 60) return { verified: false, reason: 'STALE_SIGNATURE', bodySha256 };
    const claimed = Buffer.from(String(claims.request_body_sha256 ?? ''), 'utf8');
    const actual = Buffer.from(bodySha256, 'utf8');
    if (claimed.length !== actual.length || !crypto.timingSafeEqual(claimed, actual)) return { verified: false, reason: 'BODY_MISMATCH', bodySha256 };
    try {
      return { verified: true, payload: JSON.parse(rawBody) as Record<string, unknown>, bodySha256 };
    } catch {
      return { verified: false, reason: 'BODY_NOT_JSON', bodySha256 };
    }
  }
}

export function plaidProductsFromEnv(env: NodeJS.ProcessEnv = process.env): { products: Products[]; optionalProducts: Products[] } {
  const auth = (env.JURNL_PLAID_AUTH ?? 'off').toLowerCase();
  const products: Products[] = [Products.Transactions];
  const optionalProducts: Products[] = [];
  if (auth === 'required') products.push(Products.Auth);
  else if (auth === 'optional') optionalProducts.push(Products.Auth);
  return { products, optionalProducts };
}
