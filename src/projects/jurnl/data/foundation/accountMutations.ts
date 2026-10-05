import { getTodayKey, type CalendarDate } from './dates';
import type { JurnlAccountRecord } from './accounts';
import type { AccountType } from './categories';
import { getRepository } from '../repository/deviceRepository';

export function createManualAccount(displayName: string, accountType: AccountType, balance: number, asOf: CalendarDate | null = getTodayKey()): JurnlAccountRecord {
  const now = new Date().toISOString();
  const account: JurnlAccountRecord = {
    account_id: `acct-${Date.now()}`,
    user_id: getRepository().userId,
    institution_id: null,
    display_name: displayName.trim().toUpperCase(),
    account_type: accountType,
    subtype: null,
    currency: 'USD',
    balance,
    available_balance: balance,
    credit_limit: accountType === 'CREDIT_CARD' ? Math.max(balance, 1000) : null,
    is_manual: true,
    is_connected: false,
    connection_id: null,
    status: 'ACTIVE',
    include_in_safe_to_spend: accountType !== 'CREDIT_CARD',
    include_in_net_worth: true,
    include_in_spending: true,
    masked_identifier: null,
    as_of: asOf,
    created_at: now,
    updated_at: now,
    archived_at: null,
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
