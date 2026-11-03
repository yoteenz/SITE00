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
};

export const DEFAULT_JURNL_SETTINGS: JurnlSettings = {
  displayCurrency: 'USD',
  timezone: 'UTC',
  locale: 'en-US',
  safeToSpendBuffer: '',
  defaultAccountDisplayName: null,
  notificationsEnabled: false,
};
