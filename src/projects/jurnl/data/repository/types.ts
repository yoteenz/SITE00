/** Repository contract (W0.3). Device adapter today; server adapter later without family rewrites. */

import type { SetupDraft } from '../f02/setupDraft';
import type { LedgerEntry } from '../home/moneyTypes';
import type { JurnlAccountRecord } from '../foundation/accounts';
import type { ConsentRecord } from '../foundation/consent';
import type { JurnlSettings } from '../foundation/settings';

export const REPOSITORY_SCHEMA_VERSION = 2;

export type RepositoryEventType =
  | 'ACCOUNT_CREATED'
  | 'ACCOUNT_UPDATED'
  | 'TRANSACTION_CREATED'
  | 'TRANSACTION_UPDATED'
  | 'TRANSACTION_DELETED'
  | 'INCOME_CREATED'
  | 'BILL_CREATED'
  | 'BILL_UPDATED'
  | 'BUDGET_UPDATED'
  | 'OBLIGATION_CREATED'
  | 'PURCHASE_CREATED'
  | 'TRIP_CREATED'
  | 'DEBT_UPDATED'
  | 'GOAL_UPDATED'
  | 'SETUP_COMPLETED'
  | 'DISPLAY_CURRENCY_CHANGED'
  | 'SAFE_TO_SPEND_RECALCULATED'
  | 'SETTING_CHANGED'
  | 'CONSENT_GRANTED'
  | 'CONSENT_REVOKED';

export type RepositoryEvent = { type: RepositoryEventType; at: string; entityId?: string };

export type RepositorySnapshot = {
  schemaVersion: number;
  userId: string;
  setup: SetupDraft;
  accounts: JurnlAccountRecord[];
  transactions: LedgerEntry[];
  settings: JurnlSettings;
  consent: ConsentRecord[];
  updatedAt: string;
};

export type RepositoryListener = () => void;

export interface JurnlRepository {
  readonly kind: 'DEVICE' | 'SERVER';
  readonly userId: string;
  getStatus(): RepositoryReadStatus;
  subscribe(listener: RepositoryListener): () => void;
  getSnapshot(): RepositorySnapshot;
  patchSetup(patch: Partial<SetupDraft>): void;
  resetSetup(): void;
  listAccounts(): JurnlAccountRecord[];
  upsertAccount(account: JurnlAccountRecord): void;
  listTransactions(): LedgerEntry[];
  appendTransaction(entry: Omit<LedgerEntry, 'id' | 'source' | 'status' | 'related' | 'recurring' | 'memo'> & { memo?: string }): LedgerEntry;
  updateTransaction(id: string, patch: Partial<Pick<LedgerEntry, 'merchant' | 'amount' | 'direction' | 'when' | 'account' | 'category' | 'memo'>>): LedgerEntry | null;
  deleteTransaction(id: string): boolean;
  clearAddedTransactions(): void;
  getSettings(): JurnlSettings;
  patchSettings(patch: Partial<JurnlSettings>): JurnlSettings;
  getConsent(): ConsentRecord[];
  patchConsent(type: ConsentRecord['consent_type'], granted: boolean, source: string): ConsentRecord[];
  onEvent(cb: (event: RepositoryEvent) => void): () => void;
}

export type RepositoryReadStatus = 'idle' | 'loading' | 'ready' | 'error' | 'offline';
