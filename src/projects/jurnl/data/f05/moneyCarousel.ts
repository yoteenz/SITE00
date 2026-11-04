/**
 * F05 MONEY parent carousel — the four collections, read from their canonical owners only.
 *
 *   01 ACCOUNTS     F05 positions (computeMoneyParentReading)
 *   02 TRANSFERS    #1706 settlement model (transferViews): in transit · pending · scheduled · recent
 *   03 COMMITMENTS  F09 Safe to Spend parts (bills, card minimums + unsent transfers, held back) and F14 goal set-asides
 *   04 OUTLOOK      F09 Safe to Spend (30 days) · F06 next expected income · F15 forecast · F04 recorded spending
 *
 * Nothing here writes, and nothing invents a value: a panel with no data says so (kind 'none'); a panel that only
 * leads somewhere says what it opens (kind 'link'). Labels name what the number is.
 */

import { addDays, daysUntil, formatRelativeDate, getTodayKey, type CalendarDate } from '../foundation/dates';
import { computeSafeToSpend, nextExpectedIncome } from '../f09/safeToSpend';
import { listGoals } from '../f14/goalsStore';
import { flowTotals } from '../ledger/accounting';
import { getRepository } from '../repository/deviceRepository';
import { computeMoneyParentReading, type MoneyParentReading, type MoneyParentTransfer } from './moneyParentReading';

export type CollectionId = 'accounts' | 'transfers' | 'commitments' | 'outlook';
export const COLLECTIONS: { id: CollectionId; label: string }[] = [
  { id: 'accounts', label: 'ACCOUNTS' },
  { id: 'transfers', label: 'TRANSFERS' },
  { id: 'commitments', label: 'COMMITMENTS' },
  { id: 'outlook', label: 'OUTLOOK' },
];

export type PanelValue =
  | { kind: 'amount'; amount: number; caption: string }
  | { kind: 'none'; text: string; caption: string }
  | { kind: 'link'; caption: string };

export type PanelDestination =
  | { kind: 'route'; route: string; query?: Record<string, string> }
  | { kind: 'transfer'; linkId: string }
  | { kind: 'period' };

export type CarouselPanel = {
  id: string;
  title: [string] | [string, string];
  value: PanelValue;
  /** Paper art id (decoration; never carries data). */
  art: string;
  dest: PanelDestination;
  /** Full plain-language description for assistive technology. */
  aria: string;
};

const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
const sum = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) * 100) / 100;
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function transferDest(group: MoneyParentTransfer[]): PanelDestination {
  // One unfinished transfer: open it (the existing step sheet). Several, or none: the places list, whose
  // "NOT FINISHED" panel lists every open transfer (#1706).
  return group.length === 1 ? { kind: 'transfer', linkId: group[0]!.linkId } : { kind: 'route', route: 'money/places' };
}

export function transfersCollection(r: MoneyParentReading, today: CalendarDate, fmt = money): CarouselPanel[] {
  const inTransit = r.transfers.filter((t) => t.state === 'IN_TRANSIT' || t.state === 'RETURNING');
  const pending = r.transfers.filter((t) => t.state === 'PENDING' || t.state === 'NEEDS_RECONCILIATION');
  const scheduled = r.transfers.filter((t) => t.state === 'SCHEDULED');
  const returning = inTransit.filter((t) => t.state === 'RETURNING').length;
  const next = [...scheduled].map((t) => ({ t, date: transferDate(t) })).filter((x) => x.date).sort((a, b) => (a.date! < b.date! ? -1 : 1))[0];
  const inTransitAmount = sum(inTransit.map((t) => t.amount));
  const pendingAmount = sum(pending.map((t) => t.amount));
  const scheduledAmount = sum(scheduled.map((t) => t.amount));
  return [
    {
      id: 'in_transit',
      title: ['IN TRANSIT'],
      value: inTransit.length ? { kind: 'amount', amount: inTransitAmount, caption: returning ? 'FAILED · COMING BACK' : inTransit.length === 1 ? 'LEFT, NOT ARRIVED' : `${plural(inTransit.length, 'TRANSFER', 'TRANSFERS')} · NOT ARRIVED` } : { kind: 'none', text: 'NONE', caption: 'NOTHING IN TRANSIT' },
      art: 'transfers_in_transit',
      dest: transferDest(inTransit),
      aria: inTransit.length ? `IN TRANSIT: ${fmt(inTransitAmount)} LEFT AN ACCOUNT AND HAS NOT ARRIVED. NOT AVAILABLE ANYWHERE YET.` : 'IN TRANSIT: NOTHING IN TRANSIT.',
    },
    {
      id: 'pending',
      title: ['PENDING'],
      value: pending.length ? { kind: 'amount', amount: pendingAmount, caption: 'AWAITING CONFIRMATION' } : { kind: 'none', text: 'NONE', caption: 'NOTHING PENDING' },
      art: 'transfers_pending',
      dest: transferDest(pending),
      aria: pending.length ? `PENDING: ${fmt(pendingAmount)} STARTED OR SUBMITTED, NOT TAKEN FROM THE ACCOUNT YET. AWAITING CONFIRMATION.` : 'PENDING: NOTHING PENDING.',
    },
    {
      id: 'scheduled',
      title: ['SCHEDULED'],
      value: scheduled.length ? { kind: 'amount', amount: scheduledAmount, caption: next?.date ? formatRelativeDate(next.date, today) : 'PLANNED' } : { kind: 'none', text: 'NONE', caption: 'NOTHING PLANNED' },
      art: 'transfers_scheduled',
      dest: transferDest(scheduled),
      aria: scheduled.length ? `SCHEDULED: ${fmt(scheduledAmount)} PLANNED. NO MONEY HAS MOVED.` : 'SCHEDULED: NOTHING PLANNED.',
    },
    {
      id: 'recent',
      title: ['RECENT', 'TRANSFERS'],
      value: { kind: 'link', caption: 'VIEW HISTORY' },
      art: 'transfers_recent',
      dest: { kind: 'route', route: 'activity' },
      aria: 'RECENT TRANSFERS: OPENS ACTIVITY, WHERE EVERY RECORDED TRANSFER IS LISTED.',
    },
  ];
}

function transferDate(t: MoneyParentTransfer): CalendarDate | null {
  const legs = getRepository().listTransactions().filter((e) => e.link?.id === t.linkId);
  return (legs.find((l) => l.link?.leg === 'OUT') ?? legs[0])?.occurred_on ?? null;
}

/** Breakdown of COMMITTED (the band figure) into the three commitment panels; savings is a part of held back. */
export function commitmentParts() {
  const sts = computeSafeToSpend();
  const heldBack = Math.round((sts.protected + sts.safetyBuffer + sts.assigned + sts.goalReserved + sts.purchaseReserved + sts.tripReserved) * 100) / 100;
  const upcomingPayments = Math.round((sts.cardPayments + sts.committedTransfers) * 100) / 100;
  return { bills: sts.upcoming, upcomingPayments, cardMinimums: sts.cardPayments, transfersNotSent: sts.committedTransfers, heldBack, goals: sts.goalReserved, committed: Math.round((sts.upcoming + upcomingPayments + heldBack) * 100) / 100, sts };
}

export function commitmentsCollection(r: MoneyParentReading, fmt = money): CarouselPanel[] {
  const p = commitmentParts();
  const obligations = getRepository().listObligations().filter((o) => o.status !== 'ARCHIVED');
  const goals = listGoals().filter((g) => g.status === 'ACTIVE');
  return [
    {
      id: 'bills',
      title: ['BILLS +', 'SUBSCRIPTIONS'],
      value: obligations.length ? { kind: 'amount', amount: p.bills, caption: 'NEXT 30 DAYS' } : { kind: 'none', text: 'NONE', caption: 'NO BILLS ADDED' },
      art: 'commitments_bills',
      dest: { kind: 'route', route: 'upcoming' },
      aria: obligations.length ? `BILLS AND SUBSCRIPTIONS: ${fmt(p.bills)} STILL DUE IN THE NEXT 30 DAYS.` : 'BILLS AND SUBSCRIPTIONS: NO BILLS ADDED.',
    },
    {
      id: 'savings',
      title: ['SAVINGS'],
      // Money earmarked for F14 goals. It stays in its accounts: nothing has been moved.
      value: goals.length ? { kind: 'amount', amount: p.goals, caption: 'SET ASIDE FOR GOALS' } : { kind: 'none', text: 'NONE', caption: 'NO GOALS YET' },
      art: 'commitments_savings',
      dest: { kind: 'route', route: 'goals' },
      aria: goals.length ? `SAVINGS: ${fmt(p.goals)} SET ASIDE FOR GOALS. STILL IN YOUR ACCOUNTS, NOT MOVED.` : 'SAVINGS: NO GOALS YET.',
    },
    {
      id: 'upcoming',
      title: ['UPCOMING', 'PAYMENTS'],
      value: { kind: 'amount', amount: p.upcomingPayments, caption: 'NEXT 30 DAYS' },
      art: 'commitments_upcoming',
      dest: { kind: 'route', route: 'upcoming' },
      aria: `UPCOMING PAYMENTS: ${fmt(p.upcomingPayments)}: ${fmt(p.cardMinimums)} IN CARD MINIMUMS DUE IN 30 DAYS${p.transfersNotSent > 0 ? ` AND ${fmt(p.transfersNotSent)} IN TRANSFERS NOT SENT YET` : ''}.`,
    },
    {
      id: 'reserved',
      title: ['RESERVED'],
      value: r.cashSource === 'MOCK' ? { kind: 'none', text: '—', caption: 'ADD A PLACE FIRST' } : { kind: 'amount', amount: r.committed, caption: 'TOTAL COMMITTED' },
      art: 'commitments_reserved',
      dest: { kind: 'period' },
      aria: r.cashSource === 'MOCK' ? 'RESERVED: NOT KNOWN UNTIL YOU ADD A PLACE.' : `RESERVED: ${fmt(r.committed)} TOTAL COMMITTED: BILLS, CARD MINIMUMS, UNSENT TRANSFERS AND MONEY HELD BACK. THE SAME AS COMMITTED ABOVE.`,
    },
  ];
}

export function outlookCollection(r: MoneyParentReading, today: CalendarDate, fmt = money): CarouselPanel[] {
  const income = nextExpectedIncome(today);
  const snap = getRepository().getSnapshot();
  const spent = flowTotals(snap.transactions, snap.accounts, addDays(today, -29), today, today).spending;
  const anySpending = spent > 0;
  const days = income ? daysUntil(today, income.date) : null;
  const when = days == null ? '' : days === 0 ? 'TODAY' : days === 1 ? 'TOMORROW' : `IN ${days} DAYS`;
  return [
    {
      id: 'safe_to_spend',
      title: ['SAFE TO', 'SPEND'],
      value: r.cashSource === 'MOCK' ? { kind: 'none', text: '—', caption: 'ADD A PLACE FIRST' } : { kind: 'amount', amount: r.available, caption: 'NEXT 30 DAYS' },
      art: 'outlook_safe_to_spend',
      dest: { kind: 'route', route: 'safe' },
      aria: r.cashSource === 'MOCK' ? 'SAFE TO SPEND: NOT KNOWN UNTIL YOU ADD A PLACE.' : `SAFE TO SPEND: ${fmt(r.available)} FOR THE NEXT 30 DAYS.`,
    },
    {
      id: 'next_income',
      title: ['NEXT', 'INCOME'],
      // expected, not received: the title says NEXT, the caption says when, the description says EXPECTED
      value: !income ? { kind: 'none', text: 'NOT SET', caption: 'ADD A DATE' } : income.amount == null ? { kind: 'none', text: 'NOT SET', caption: when } : { kind: 'amount', amount: income.amount, caption: when },
      art: 'outlook_next_income',
      dest: income ? { kind: 'route', route: 'income' } : { kind: 'route', route: 'income', query: { add: 'expected' } },
      aria: !income ? 'NEXT INCOME: NO DATE RECORDED. OPENS INCOME TO ADD ONE.' : `NEXT INCOME: ${income.name}, ${when}${income.amount != null ? `, ${fmt(income.amount)} EXPECTED, NOT RECEIVED` : ', AMOUNT NOT SET'}.`,
    },
    {
      id: 'forecast',
      title: ['30-DAY', 'OUTLOOK'],
      value: { kind: 'link', caption: 'VIEW FORECAST' },
      art: 'outlook_forecast',
      dest: { kind: 'route', route: 'ahead' },
      aria: '30-DAY OUTLOOK: OPENS AHEAD, THE 30-DAY FORECAST.',
    },
    {
      id: 'insights',
      title: ['SPENDING', 'INSIGHTS'],
      value: anySpending ? { kind: 'amount', amount: spent, caption: 'LAST 30 DAYS' } : { kind: 'none', text: 'NONE', caption: 'NOTHING RECORDED' },
      art: 'outlook_insights',
      dest: { kind: 'route', route: 'activity' },
      aria: anySpending ? `SPENDING: ${fmt(spent)} RECORDED IN THE LAST 30 DAYS. OPENS ACTIVITY.` : 'SPENDING: NOTHING RECORDED IN THE LAST 30 DAYS. OPENS ACTIVITY.',
    },
  ];
}

export function computeMoneyCarousel(today: CalendarDate = getTodayKey(), fmt = money) {
  const reading = computeMoneyParentReading(today);
  return {
    reading,
    transfers: transfersCollection(reading, today, fmt),
    commitments: commitmentsCollection(reading, fmt),
    outlook: outlookCollection(reading, today, fmt),
  };
}
