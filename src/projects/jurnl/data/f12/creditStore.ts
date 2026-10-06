import { useSyncExternalStore } from 'react';
import { creditAccounts, type JurnlAccountRecord } from '../foundation/accounts';
import type { JurnlCreditAttributes } from '../foundation/creditAttributes';
import { creditLimitFor, creditUsedBalance, creditUtilizationPercent } from '../foundation/creditAttributes';
import { getTodayKey, type CalendarDate } from '../foundation/dates';
import { getRepository } from '../repository/deviceRepository';

export function useCreditAccounts(): JurnlAccountRecord[] {
  return useSyncExternalStore((cb) => getRepository().subscribe(cb), () => creditAccounts(), () => []);
}

export function creditAttributesFor(accountId: string): JurnlCreditAttributes | null {
  return getRepository().getCreditAttributes(accountId);
}

export function upsertCreditTerms(accountId: string, patch: Partial<Omit<JurnlCreditAttributes, 'account_id' | 'updated_at'>>): JurnlCreditAttributes {
  const existing = getRepository().getCreditAttributes(accountId);
  const now = new Date().toISOString();
  const next: JurnlCreditAttributes = {
    account_id: accountId,
    credit_limit: patch.credit_limit ?? existing?.credit_limit ?? null,
    current_balance: patch.current_balance ?? existing?.current_balance ?? null,
    minimum_payment: patch.minimum_payment ?? existing?.minimum_payment ?? null,
    payment_due_day: patch.payment_due_day ?? existing?.payment_due_day ?? null,
    statement_day: patch.statement_day ?? existing?.statement_day ?? null,
    apr: patch.apr ?? existing?.apr ?? null,
    updated_at: now,
  };
  return getRepository().upsertCreditAttributes(next);
}

export function creditSummary(account: JurnlAccountRecord) {
  const attrs = creditAttributesFor(account.account_id);
  const limit = creditLimitFor(account, attrs);
  const used = creditUsedBalance(account, attrs);
  const util = creditUtilizationPercent(account, attrs);
  const minPay = attrs?.minimum_payment ?? null;
  const dueDay = attrs?.payment_due_day ?? null;
  return { attrs, limit, used, util, minPay, dueDay };
}

/** Next calendar due date from day-of-month (manual terms only). */
export function nextPaymentDueDate(dueDay: number | null, today: CalendarDate = getTodayKey()): CalendarDate | null {
  if (dueDay == null || dueDay < 1 || dueDay > 28) return null;
  const [y, m, d] = today.split('-').map(Number);
  const day = Math.min(dueDay, 28);
  if (d <= day) return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}` as CalendarDate;
  const nextMonth = m === 12 ? 1 : m + 1;
  const nextYear = m === 12 ? y + 1 : y;
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}` as CalendarDate;
}

export function creditPaymentProjections(today: CalendarDate = getTodayKey()) {
  const items: { account_id: string; label: string; amount: number; due_date: CalendarDate }[] = [];
  for (const acct of creditAccounts()) {
    const { minPay, dueDay } = creditSummary(acct);
    const due = nextPaymentDueDate(dueDay, today);
    if (!due || minPay == null || minPay <= 0) continue;
    items.push({
      account_id: acct.account_id,
      label: `${acct.display_name} PAYMENT`,
      amount: minPay,
      due_date: due,
    });
  }
  return items;
}
