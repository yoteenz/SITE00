/**
 * Canonical account registry (W0.4). F05 owns persistence; all families reference account_id.
 */

import type { CurrencyCode } from '../home/currency';
import type { AccountType } from './categories';
import type { CalendarDate } from './dates';
import type { SetupDraft } from '../f02/setupDraft';
import { cachedRepoView } from '../repository/cachedRepoView';
import { getRepository } from '../repository/deviceRepository';

export type AccountStatus = 'ACTIVE' | 'ARCHIVED';

export type JurnlAccountRecord = {
  account_id: string;
  user_id: string;
  institution_id: string | null;
  display_name: string;
  account_type: AccountType;
  subtype: string | null;
  currency: CurrencyCode;
  balance: number;
  available_balance: number;
  credit_limit: number | null;
  is_manual: boolean;
  is_connected: boolean;
  connection_id: string | null;
  status: AccountStatus;
  include_in_safe_to_spend: boolean;
  include_in_net_worth: boolean;
  include_in_spending: boolean;
  masked_identifier: string | null;
  as_of: CalendarDate | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  /**
   * Marks a card-based asset account that receives rideshare / gig payouts (e.g. an UBER or LYFT card). Purely a
   * preference flag: the account's accounting nature still comes from `account_type` (a payout card set up as a
   * CREDIT_CARD stays a liability). Each payout card is its own account; JURNL never merges two of them.
   */
  is_payout_card?: boolean;
};

export function accountTypeFromSetupKind(kind: SetupDraft['accountKind']): AccountType {
  if (kind === 'CHECKING') return 'CHECKING';
  if (kind === 'SAVINGS') return 'SAVINGS';
  if (kind === 'CARD') return 'CREDIT_CARD';
  return 'OTHER';
}

export function listActiveAccounts(): JurnlAccountRecord[] {
  return getRepository().listAccounts().filter((a) => a.status === 'ACTIVE');
}

export function spendingAccounts(): JurnlAccountRecord[] {
  return listActiveAccounts().filter((a) => a.include_in_spending);
}

export function creditAccounts(): JurnlAccountRecord[] {
  return cachedRepoView('accounts.creditAccounts', () =>
    listActiveAccounts().filter((a) => a.account_type === 'CREDIT_CARD' || a.account_type === 'LOAN'),
  );
}

export function safeToSpendEligibleAccounts(): JurnlAccountRecord[] {
  return listActiveAccounts().filter((a) => a.include_in_safe_to_spend);
}

export function accountById(id: string): JurnlAccountRecord | null {
  return listActiveAccounts().find((a) => a.account_id === id) ?? null;
}

/** Active accounts as stable-id options (canonical). */
export function accountIdOptions(filter: (a: JurnlAccountRecord) => boolean = () => true): { id: string; label: string; account: JurnlAccountRecord }[] {
  return listActiveAccounts()
    .filter(filter)
    .map((a) => ({ id: a.account_id, label: a.display_name, account: a }));
}

export function accountDisplayOptions(): { id: string; label: string }[] {
  return spendingAccounts().map((a) => ({ id: a.display_name, label: a.display_name }));
}

