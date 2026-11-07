/**
 * Provider-neutral banking boundary (read-only aggregation).
 *
 * Money never talks to Plaid directly. Every aggregator (Plaid today; a second approved provider later) implements
 * BankingProvider, and every response is mapped into these shapes before it reaches the store or the ledger. No
 * method here can move money: there is no payment, transfer, or credential-change operation on this interface.
 */

export type ProviderId = 'PLAID';
export type ProviderEnvironment = 'sandbox' | 'production';

/** What an aggregator can return for one account. Null means "the provider did not supply it" — never zero. */
export type ProviderAccount = {
  provider_account_id: string;
  persistent_account_id: string | null;
  name: string;
  official_name: string | null;
  mask: string | null;
  /** Provider account type, as delivered (Plaid: depository | credit | loan | investment | other). */
  type: string;
  subtype: string | null;
  iso_currency_code: string | null;
  unofficial_currency_code: string | null;
  current_balance: number | null;
  available_balance: number | null;
  credit_limit: number | null;
  /** When the provider says the balance was last updated, else when we received it. */
  balance_as_of: string;
};

/**
 * One provider transaction exactly as delivered. `amount` keeps the provider sign convention
 * (Plaid: positive = money out of the account, negative = money in).
 */
export type ProviderTransaction = {
  provider_transaction_id: string;
  provider_account_id: string;
  pending: boolean;
  pending_transaction_id: string | null;
  amount: number;
  iso_currency_code: string | null;
  unofficial_currency_code: string | null;
  date: string;
  authorized_date: string | null;
  name: string | null;
  merchant_name: string | null;
  merchant_entity_id: string | null;
  counterparty_names: string[] | null;
  pfc_primary: string | null;
  pfc_detailed: string | null;
  pfc_confidence: string | null;
  payment_channel: string | null;
  transaction_code: string | null;
};

export type ProviderSyncPage = {
  added: ProviderTransaction[];
  modified: ProviderTransaction[];
  removed: { provider_transaction_id: string; provider_account_id: string | null }[];
  nextCursor: string;
  hasMore: boolean;
};

export type ProviderItemInfo = {
  institution_id: string | null;
  institution_name: string | null;
  products: string[];
  consent_expires_at: string | null;
  error_code: string | null;
};

export type ProviderInstitution = {
  institution_id: string;
  name: string;
  products: string[];
  country_codes: string[];
  oauth: boolean;
  /** Provider-reported health per product, when supplied (e.g. transactions_updates HEALTHY / DEGRADED / DOWN). */
  status: Record<string, string | null> | null;
};

/**
 * Normalized provider failure. `kind` drives connection health; `providerCode` is kept for support logs only and is
 * never shown in everyday screens.
 */
export type ProviderErrorKind =
  | 'REAUTH_REQUIRED'
  | 'PERMISSION_REVOKED'
  | 'INSTITUTION_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'INVALID_CREDENTIALS_CONFIG'
  | 'INVALID_TOKEN'
  | 'MUTATION_DURING_PAGINATION'
  | 'PRODUCT_NOT_READY'
  | 'NOT_FOUND'
  | 'PROVIDER_ERROR';

export class ProviderError extends Error {
  constructor(
    readonly kind: ProviderErrorKind,
    readonly providerCode: string | null,
    readonly retryable: boolean,
    message?: string,
  ) {
    super(message ?? kind);
    this.name = 'ProviderError';
  }
}

export type LinkSessionInput = {
  /** Stable, non-identifying client user id (the JURNL auth user id). Never an email. */
  clientUserId: string;
  /** NEW: first connection. UPDATE: reconnect an existing Item (requires its access token). */
  mode: 'NEW' | 'UPDATE';
  accessToken?: string;
  webhookUrl: string | null;
  redirectUri: string | null;
  /** Lets the user add accounts newly opened at an already connected institution (update mode only). */
  accountSelection?: boolean;
};

export type WebhookVerification =
  | { verified: true; payload: Record<string, unknown>; bodySha256: string }
  | { verified: false; reason: string; bodySha256: string };

export interface BankingProvider {
  readonly id: ProviderId;
  readonly environment: ProviderEnvironment;
  createLinkSession(input: LinkSessionInput): Promise<{ linkToken: string; expiration: string }>;
  exchangePublicToken(publicToken: string): Promise<{ accessToken: string; providerItemId: string }>;
  getItem(accessToken: string): Promise<ProviderItemInfo>;
  /** Cached balances included with the connection (no per-call balance fee). */
  getAccounts(accessToken: string): Promise<ProviderAccount[]>;
  syncTransactions(accessToken: string, cursor: string | null): Promise<ProviderSyncPage>;
  /** Revokes the provider's access (the provider stops billing and deletes the token on its side). */
  removeItem(accessToken: string): Promise<void>;
  searchInstitutions(query: string): Promise<ProviderInstitution[]>;
  verifyWebhook(rawBody: string, headers: Record<string, string | string[] | undefined>): Promise<WebhookVerification>;
}
