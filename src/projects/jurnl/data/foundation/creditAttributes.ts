/** F12 credit attributes (DD.CREDIT_ATTRIBUTES) keyed by canonical account_id. */

import type { JurnlAccountRecord } from './accounts';
import type { CalendarDate } from './dates';

export type JurnlCreditAttributes = {
  account_id: string;
  credit_limit: number | null;
  current_balance: number | null;
  minimum_payment: number | null;
  payment_due_day: number | null;
  statement_day: number | null;
  apr: number | null;
  updated_at: string;
  /** Balance on the last statement (distinct from the current balance owed). */
  statement_balance?: number | null;
  /** Date the last statement closed (distinct from the payment due date). */
  statement_closing_date?: CalendarDate | null;
  /** Exact next payment due date when known; otherwise derived from `payment_due_day`. */
  payment_due_date?: CalendarDate | null;
  promo_apr?: number | null;
  promo_apr_end_date?: CalendarDate | null;
  /** True when the user says they carried a balance from the previous statement (grace period may not apply). */
  carries_interest_balance?: boolean | null;
  /** Usual account to pay this card from. */
  payment_account_id?: string | null;
  /** When the user last entered or confirmed these card numbers (ISO). Manual — never bank-verified in this build. */
  terms_entered_at?: string | null;
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
