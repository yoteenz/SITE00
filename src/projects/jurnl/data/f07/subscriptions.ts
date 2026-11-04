/**
 * F07 SUBSCRIPTIONS view over canonical obligations (kind SUBSCRIPTION). No separate store.
 *
 * Different billing frequencies are never summed as if they were monthly: each subscription is converted to a monthly
 * equivalent and an annual equivalent with exact factors (weekly × 52 / 12, every 2 weeks × 26 / 12, quarterly / 3,
 * yearly / 12), and totals say "ESTIMATED" whenever cadences are mixed.
 */

import { addDays, compareCalendarDates, type CalendarDate, type RecurrenceType } from '../foundation/dates';
import type { JurnlObligation } from '../foundation/obligations';
import { sumCents, toCents } from '../ledger/accounting';

export type SubscriptionView = 'ACTIVE' | 'UPCOMING' | 'PAUSED' | 'CANCELLED';

export const SUBSCRIPTION_VIEW_LABEL: Record<SubscriptionView, string> = {
  ACTIVE: 'ACTIVE',
  UPCOMING: 'RENEWING SOON',
  PAUSED: 'PAUSED',
  CANCELLED: 'STOPPED TRACKING',
};

/** Days ahead that count as "renewing soon". */
export const SUBSCRIPTION_SOON_DAYS = 7;

const MONTHLY_FACTOR: Partial<Record<RecurrenceType, number>> = { WEEKLY: 52 / 12, BIWEEKLY: 26 / 12, MONTHLY: 1, QUARTERLY: 1 / 3, ANNUAL: 1 / 12 };
const ANNUAL_FACTOR: Partial<Record<RecurrenceType, number>> = { WEEKLY: 52, BIWEEKLY: 26, MONTHLY: 12, QUARTERLY: 4, ANNUAL: 1 };

/** Monthly equivalent, or null for one-time / irregular charges (they have no monthly cost). */
export function monthlyEquivalent(amount: number, cadence: RecurrenceType): number | null {
  const f = MONTHLY_FACTOR[cadence];
  return f == null ? null : toCents(amount * f);
}

export function annualEquivalent(amount: number, cadence: RecurrenceType): number | null {
  const f = ANNUAL_FACTOR[cadence];
  return f == null ? null : toCents(amount * f);
}

export function isSubscription(o: JurnlObligation): boolean {
  return o.kind === 'SUBSCRIPTION';
}

export function subscriptionsIn(obligations: JurnlObligation[], view: SubscriptionView, today: CalendarDate): JurnlObligation[] {
  const subs = obligations.filter(isSubscription);
  const soon = addDays(today, SUBSCRIPTION_SOON_DAYS);
  const list =
    view === 'ACTIVE' ? subs.filter((o) => o.status === 'ACTIVE')
    : view === 'UPCOMING' ? subs.filter((o) => o.status === 'ACTIVE' && compareCalendarDates(o.next_due_date, soon) <= 0)
    : view === 'PAUSED' ? subs.filter((o) => o.status === 'PAUSED')
    : subs.filter((o) => o.status === 'CANCELLED' || o.status === 'ARCHIVED');
  return [...list].sort((a, b) => compareCalendarDates(a.next_due_date, b.next_due_date));
}

export type SubscriptionTotals = {
  count: number;
  monthly: number;
  annual: number;
  /** True when more than one billing frequency is mixed into the totals. */
  mixedCadence: boolean;
  byCadence: { cadence: RecurrenceType; count: number }[];
  nextRenewal: { obligation: JurnlObligation; date: CalendarDate } | null;
};

/** Totals for ACTIVE subscriptions only. Paused and stopped ones are excluded. */
export function subscriptionTotals(obligations: JurnlObligation[]): SubscriptionTotals {
  const active = obligations.filter((o) => isSubscription(o) && o.status === 'ACTIVE');
  const cadences = new Map<RecurrenceType, number>();
  for (const o of active) cadences.set(o.cadence, (cadences.get(o.cadence) ?? 0) + 1);
  const next = [...active].sort((a, b) => compareCalendarDates(a.next_due_date, b.next_due_date))[0] ?? null;
  return {
    count: active.length,
    monthly: sumCents(active.map((o) => monthlyEquivalent(o.amount, o.cadence) ?? 0)),
    annual: sumCents(active.map((o) => annualEquivalent(o.amount, o.cadence) ?? 0)),
    mixedCadence: cadences.size > 1,
    byCadence: [...cadences.entries()].map(([cadence, count]) => ({ cadence, count })),
    nextRenewal: next ? { obligation: next, date: next.next_due_date } : null,
  };
}
