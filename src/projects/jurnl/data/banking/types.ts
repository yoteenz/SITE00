/**
 * Connected-banking shapes on the client (read-only aggregation). These mirror the server API, which never returns a
 * provider access token. Everything JURNL decides about an imported transaction (category, transfer matches, the
 * user's corrections) lives in BankLedgerState inside the user's snapshot — never in the provider's own record.
 */
import type { TxnClass } from '../foundation/categories';
import type { BankMatchKind, BankMatchStatus } from '../home/moneyTypes';

export type BankConnectionStatus = 'ACTIVE' | 'SYNCING' | 'NEEDS_REAUTH' | 'PERMISSION_REVOKED' | 'INSTITUTION_UNAVAILABLE' | 'SYNC_ERROR' | 'DISCONNECTED';

export type BankItemView = {
  item_id: string;
  provider: 'PLAID';
  provider_env: 'sandbox' | 'production';
  institution_id: string | null;
  institution_name: string | null;
  status: BankConnectionStatus;
  products: string[];
  consent_granted_at: string;
  consent_expires_at: string | null;
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

export type BankAccountView = {
  bank_account_id: string;
  item_id: string;
  provider_account_id: string;
  persistent_account_id: string | null;
  name: string;
  official_name: string | null;
  mask: string | null;
  type: string;
  subtype: string | null;
  iso_currency_code: string | null;
  unofficial_currency_code: string | null;
  current_balance: number | null;
  available_balance: number | null;
  credit_limit: number | null;
  balance_as_of: string;
  status: 'ACTIVE' | 'NOT_RETURNED' | 'DISCONNECTED';
  updated_at: string;
};

export type BankTransactionView = {
  item_id: string;
  provider_account_id: string;
  provider_transaction_id: string;
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
  provider_state: 'ACTIVE' | 'REMOVED';
  revision: number;
  first_seen_at: string;
  last_changed_at: string;
  removed_at: string | null;
};

/** A correction the user made to one imported transaction. Re-sync never touches it. */
export type ImportOverride = {
  merchant?: string;
  category?: string;
  category_detail?: string | null;
  txn_class?: TxnClass;
  /** The user says this is (true) / is not (false) money moving between their own accounts. */
  internal_transfer?: boolean;
  rideshare_earnings?: boolean;
  refund?: boolean;
  /** The user says this duplicates another JURNL entry (that one counts; this one does not). */
  duplicate_of?: string | null;
  at: string;
};

export type ClassificationRule = {
  rule_id: string;
  enabled: boolean;
  /** Every given condition must hold. Text matches are case-insensitive "contains". */
  match: { text?: string; account_id?: string; direction?: 'IN' | 'OUT'; pfc_detailed?: string };
  set: { category?: string; category_detail?: string | null; txn_class?: TxnClass; internal_transfer?: boolean; rideshare_earnings?: boolean };
  created_at: string;
  /** Created from the user's correction of this entry (shown in "rule results"). */
  source_entry_id?: string | null;
};

/** One reconciliation decision. Auto matches need corroborating evidence beyond an equal amount. */
export type MatchDecision = {
  match_id: string;
  kind: BankMatchKind;
  status: BankMatchStatus;
  /** JURNL ledger entry ids involved (imported and / or recorded by the user). */
  entry_ids: string[];
  /** For bill and earnings matches: the obligation occurrence or daily earnings record. */
  target: { obligation_id?: string; occurrence_date?: string; earnings_id?: string; reservation_ids?: string[] } | null;
  /** Which entry carries the event once (the others stop counting). */
  counted_by: string | null;
  signals: string[];
  decided_at: string;
};

export type BankConnectionSummary = Pick<BankItemView, 'item_id' | 'institution_name' | 'status' | 'last_successful_sync_at' | 'last_balance_at' | 'consent_expires_at' | 'provider_env' | 'disconnected_at'>;

export type BankLedgerState = {
  /** Highest provider `last_changed_at` already applied (incremental pulls). */
  watermark: string | null;
  lastPulledAt: string | null;
  /** provider account key (`item_id:provider_account_id`) → JURNL account id. Survives reconnects. */
  accountLinks: Record<string, string>;
  /** Root import key → the user's correction. */
  overrides: Record<string, ImportOverride>;
  rules: ClassificationRule[];
  matches: MatchDecision[];
  /** Last known connection states (shown offline; the server stays the authority). */
  connections: BankConnectionSummary[];
};

export const EMPTY_BANK_STATE: BankLedgerState = { watermark: null, lastPulledAt: null, accountLinks: {}, overrides: {}, rules: [], matches: [], connections: [] };

export const importKey = (itemId: string, providerTransactionId: string) => `bank:${itemId}:${providerTransactionId}`;
export const accountKey = (itemId: string, providerAccountId: string) => `${itemId}:${providerAccountId}`;
