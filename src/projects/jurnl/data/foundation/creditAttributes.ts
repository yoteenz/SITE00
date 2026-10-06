/** F12 credit attributes (DD.CREDIT_ATTRIBUTES) keyed by canonical account_id. */

import type { JurnlAccountRecord } from './accounts';

export type JurnlCreditAttributes = {
  account_id: string;
  credit_limit: number | null;
  current_balance: number | null;
  minimum_payment: number | null;
  payment_due_day: number | null;
  statement_day: number | null;
  apr: number | null;
  updated_at: string;
};

export function creditUsedBalance(account: JurnlAccountRecord, attrs: JurnlCreditAttributes | null): number {
  if (attrs?.current_balance != null && Number.isFinite(attrs.current_balance)) return Math.max(0, attrs.current_balance);
  if (account.credit_limit != null && account.credit_limit > 0) {
    const used = account.credit_limit - account.available_balance;
    return Math.max(0, used);
  }
  return Math.max(0, account.balance);
}

export function creditLimitFor(account: JurnlAccountRecord, attrs: JurnlCreditAttributes | null): number | null {
  const limit = attrs?.credit_limit ?? account.credit_limit;
  return limit != null && limit > 0 ? limit : null;
}

export function creditUtilizationRatio(account: JurnlAccountRecord, attrs: JurnlCreditAttributes | null): number | null {
  const limit = creditLimitFor(account, attrs);
  if (limit == null || limit <= 0) return null;
  const used = creditUsedBalance(account, attrs);
  return used / limit;
}

export function creditUtilizationPercent(account: JurnlAccountRecord, attrs: JurnlCreditAttributes | null): number | null {
  const ratio = creditUtilizationRatio(account, attrs);
  return ratio == null ? null : Math.round(ratio * 100);
}
