/** Derived upcoming view (F07). No separate persistence owner. */

import { compareCalendarDates, getTodayKey, parseCalendarDate, type CalendarDate } from './dates';
import type { JurnlIncomeSource } from './income';
import type { JurnlObligation } from './obligations';

export type UpcomingDirection = 'MONEY_IN' | 'MONEY_OUT';

export type UpcomingProjectionItem = {
  upcoming_id: string;
  source_domain: 'INCOME' | 'OBLIGATION';
  source_id: string;
  direction: UpcomingDirection;
  label: string;
  amount: number;
  currency: 'USD';
  due_date: CalendarDate;
  status: 'OVERDUE' | 'DUE_TODAY' | 'UPCOMING';
  recurrence: string;
  owner_family_id: 'F06' | 'F07';
  is_estimated: boolean;
};

export type UpcomingBucket = 'OVERDUE' | 'TODAY' | 'THIS_WEEK' | 'LATER';

export function projectUpcoming(income: JurnlIncomeSource[], obligations: JurnlObligation[], today: CalendarDate = getTodayKey()): UpcomingProjectionItem[] {
  const items: UpcomingProjectionItem[] = [];
  for (const src of income) {
    if (src.status === 'ARCHIVED' || src.status === 'PAUSED' || src.status === 'RECEIVED') continue;
    items.push(projectIncome(src, today));
  }
  for (const ob of obligations) {
    if (ob.status !== 'ACTIVE') continue;
    items.push(projectObligation(ob, today));
  }
  return items.sort((a, b) => compareCalendarDates(a.due_date, b.due_date));
}

function statusFor(due: CalendarDate, today: CalendarDate): UpcomingProjectionItem['status'] {
  const cmp = compareCalendarDates(due, today);
  if (cmp < 0) return 'OVERDUE';
  if (cmp === 0) return 'DUE_TODAY';
  return 'UPCOMING';
}

function projectIncome(src: JurnlIncomeSource, today: CalendarDate): UpcomingProjectionItem {
  return {
    upcoming_id: `up-inc-${src.income_id}`,
    source_domain: 'INCOME',
    source_id: src.income_id,
    direction: 'MONEY_IN',
    label: src.source_name,
    amount: src.amount,
    currency: 'USD',
    due_date: src.next_due_date,
    status: statusFor(src.next_due_date, today),
    recurrence: src.cadence,
    owner_family_id: 'F06',
    is_estimated: src.is_estimated,
  };
}

function projectObligation(ob: JurnlObligation, today: CalendarDate): UpcomingProjectionItem {
  return {
    upcoming_id: `up-obl-${ob.obligation_id}`,
    source_domain: 'OBLIGATION',
    source_id: ob.obligation_id,
    direction: 'MONEY_OUT',
    label: ob.name,
    amount: ob.amount,
    currency: 'USD',
    due_date: ob.next_due_date,
    status: statusFor(ob.next_due_date, today),
    recurrence: ob.cadence,
    owner_family_id: 'F07',
    is_estimated: ob.amount <= 0,
  };
}

export function bucketFor(item: UpcomingProjectionItem, today: CalendarDate = getTodayKey()): UpcomingBucket {
  if (item.status === 'OVERDUE') return 'OVERDUE';
  if (item.status === 'DUE_TODAY') return 'TODAY';
  const due = parseCalendarDate(item.due_date);
  if (!due) return 'LATER';
  const diffDays = Math.floor((Date.parse(`${due}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) / 86400000);
  if (diffDays <= 7) return 'THIS_WEEK';
  return 'LATER';
}

export function groupUpcoming(items: UpcomingProjectionItem[]): Record<UpcomingBucket, UpcomingProjectionItem[]> {
  const groups: Record<UpcomingBucket, UpcomingProjectionItem[]> = { OVERDUE: [], TODAY: [], THIS_WEEK: [], LATER: [] };
  for (const item of items) groups[bucketFor(item)].push(item);
  return groups;
}
