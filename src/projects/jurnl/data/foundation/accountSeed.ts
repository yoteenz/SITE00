import type { SetupDraft } from '../f02/setupDraft';
import { accountTypeFromSetupKind, type JurnlAccountRecord } from './accounts';

export function seedAccountsFromSetup(draft: SetupDraft, userId: string): JurnlAccountRecord[] {
  const now = new Date().toISOString();
  const defaults: JurnlAccountRecord[] = [
    mockAccount('acct-checking', userId, 'CHECKING', 'CHECKING', 8420, now),
    mockAccount('acct-card', userId, 'CARD', 'CREDIT_CARD', 0, now, { include_in_safe_to_spend: false, credit_limit: 5000 }),
  ];
  if (draft.accountName.trim() && draft.accountKind) {
    const kind = accountTypeFromSetupKind(draft.accountKind);
    defaults.unshift({
      ...mockAccount(`acct-setup`, userId, draft.accountName.trim().toUpperCase(), kind, 0, now),
      is_manual: true,
    });
  }
  return defaults;
}

function mockAccount(
  id: string,
  userId: string,
  label: string,
  type: JurnlAccountRecord['account_type'],
  balance: number,
  now: string,
  extra: Partial<JurnlAccountRecord> = {},
): JurnlAccountRecord {
  return {
    account_id: id,
    user_id: userId,
    institution_id: null,
    display_name: label,
    account_type: type,
    subtype: null,
    currency: 'USD',
    balance,
    available_balance: balance,
    credit_limit: null,
    is_manual: type !== 'CREDIT_CARD',
    is_connected: false,
    connection_id: null,
    status: 'ACTIVE',
    include_in_safe_to_spend: type !== 'CREDIT_CARD',
    include_in_net_worth: true,
    include_in_spending: true,
    masked_identifier: null,
    as_of: null,
    created_at: now,
    updated_at: now,
    archived_at: null,
    ...extra,
  };
}
