/** Canonical user settings (W1.1). Owned by GS.SETTINGS; persisted in repository snapshot. */

import type { CurrencyCode } from '../home/currency';

export type JurnlSettings = {
  displayCurrency: CurrencyCode;
  timezone: string;
  locale: string;
  safeToSpendBuffer: string;
  defaultAccountDisplayName: string | null;
  notificationsEnabled: boolean;
};

export const DEFAULT_JURNL_SETTINGS: JurnlSettings = {
  displayCurrency: 'USD',
  timezone: 'UTC',
  locale: 'en-US',
  safeToSpendBuffer: '',
  defaultAccountDisplayName: null,
  notificationsEnabled: false,
};
