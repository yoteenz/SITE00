import { getTodayKey, type CalendarDate } from './dates';
import type { JurnlAccountRecord } from './accounts';
import type { AccountType } from './categories';
import { getRepository } from '../repository/deviceRepository';
import { newEntityId } from '../repository/ids';

export type ManualAccountOptions = {
  /** Credit cards / loans: the limit the user entered. Null when unknown (utilization then says so). */
  creditLimit?: number | null;
  /** Card-based asset account that receives rideshare / gig payouts. */
  isPayoutCard?: boolean;
};

/**
 * Creates a manual money location. For assets `balance` is money held; for credit cards and loans it is the amount owed.
 */
export function createManualAccount(
  displayName: string,
  accountType: AccountType,
  balance: number,
  asOf: CalendarDate | null = getTodayKey(),
  options: ManualAccountOptions = {},
): JurnlAccountRecord {
  const now = new Date().toISOString();
  const liability = accountType === 'CREDIT_CARD' || accountType === 'LOAN';
  const limit = options.creditLimit === undefined ? (accountType === 'CREDIT_CARD' ? Math.max(balance, 1000) : null) : options.creditLimit;
  const account: JurnlAccountRecord = {
    account_id: newEntityId('acct'),
    user_id: getRepository().userId,
    institution_id: null,
    display_name: displayName.trim().toUpperCase(),
    account_type: accountType,
    subtype: null,
    currency: 'USD',
    balance,
    // Assets: available = held. Liabilities: available = credit left (never counted as money held).
    available_balance: liability && limit != null ? Math.max(0, limit - balance) : balance,
    credit_limit: limit,
    is_manual: true,
    is_connected: false,
    connection_id: null,
    status: 'ACTIVE',
    include_in_safe_to_spend: !liability,
    include_in_net_worth: true,
    include_in_spending: true,
    masked_identifier: null,
    as_of: asOf,
    created_at: now,
    updated_at: now,
    archived_at: null,
    is_payout_card: options.isPayoutCard && !liability ? true : undefined,
  };
  getRepository().upsertAccount(account);
  return account;
}

export function archiveAccount(accountId: string): boolean {
  const snap = getRepository().getSnapshot();
  const target = snap.accounts.find((a) => a.account_id === accountId);
  if (!target) return false;
  getRepository().upsertAccount({ ...target, status: 'ARCHIVED', archived_at: new Date().toISOString() });
  return true;
}
