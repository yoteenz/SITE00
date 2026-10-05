/** Repository contract (W0.3). Device adapter today; server adapter later without family rewrites. */

import type { SetupDraft } from '../f02/setupDraft';
import type { LedgerEntry } from '../home/moneyTypes';
import type { JurnlAccountRecord } from '../foundation/accounts';

export const REPOSITORY_SCHEMA_VERSION = 1;

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
  | 'SAFE_TO_SPEND_RECALCULATED';

export type RepositoryEvent = { type: RepositoryEventType; at: string; entityId?: string };

export type RepositorySnapshot = {
  schemaVersion: number;
  userId: string;
  setup: SetupDraft;
  accounts: JurnlAccountRecord[];
  transactions: LedgerEntry[];
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
  clearAddedTransactions(): void;
  onEvent(cb: (event: RepositoryEvent) => void): () => void;
}

export type RepositoryReadStatus = 'idle' | 'loading' | 'ready' | 'error' | 'offline';
