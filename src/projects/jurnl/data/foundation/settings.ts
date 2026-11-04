/** Canonical user settings (W1.1). Owned by GS.SETTINGS; persisted in repository snapshot. */

import type { CurrencyCode } from '../home/currency';

export type JurnlSettings = {
  displayCurrency: CurrencyCode;
  timezone: string;
  locale: string;
  safeToSpendBuffer: string;
  defaultAccountDisplayName: string | null;
  notificationsEnabled: boolean;
  /**
   * Usual account per money purpose (purpose id → account_id). Preferences only: they pre-select an account and
   * never block another choice. Missing entries fall back to the default role map in data/ledger/purposes.ts.
   */
  purposeAccounts?: Partial<Record<string, string>>;
  /** Credit utilization target the user chose (percent, e.g. 30). Null until chosen. Not a credit-score promise. */
  utilizationTargetPct?: number | null;
  /** F05 DOT 01: the user's order of their places (account ids). Display preference only; never touches balances. */
  accountOrder?: string[];
  /** F05 DOT 01: the last time the user confirmed a place's balance against the real one (account id → record). */
  accountReconciliation?: Partial<Record<string, { on: string; balance: number }>>;
  /** F05 DOT 01: review issues the user marked resolved (account id → issue id → date). */
  accountReviewResolved?: Partial<Record<string, Partial<Record<string, string>>>>;
  /** F05 DOT 01: audit trail of entries the user reversed or marked duplicate (newest first, bounded). */
  ledgerAudit?: { at: string; action: 'REVERSED' | 'MARKED_DUPLICATE'; reason: string; entry: Record<string, unknown> }[];
};

export const DEFAULT_JURNL_SETTINGS: JurnlSettings = {
  displayCurrency: 'USD',
  timezone: 'UTC',
  locale: 'en-US',
  safeToSpendBuffer: '',
  defaultAccountDisplayName: null,
  notificationsEnabled: false,
};
