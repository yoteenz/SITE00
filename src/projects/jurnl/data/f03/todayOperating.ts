/**
 * F03 TODAY — the daily operating reading. Derived only (no persistence): every line traces to a ledger entry, an
 * account, a bill, a card term or a set-aside. Counts are computed, never written as fixed text.
 */

import { isActivityEntry } from '../banking/activity';
import { addDays, compareCalendarDates, formatRelativeDate, getTodayKey, type CalendarDate } from '../foundation/dates';
import { computeSafeToSpend, type SafeToSpendBreakdown } from '../f09/safeToSpend';
import { getSetupDraft } from '../f02/setupDraft';
import { getRepository } from '../repository/deviceRepository';
import { computeLedgerPositions, summarizePositions, sumCents, toCents, type AccountPosition, type MoneySummary } from '../ledger/accounting';
import { formatMoney } from '../home/currency';
import { activeReservations } from '../f07/reservations';
import { earningsPeriods, type EarningsTotals } from '../f06/dailyEarnings';
import { allCardFacts } from '../f12/creditStore';
import { paymentSafety, type SafetyState } from '../f12/creditGuidance';

export type TodayBill = { obligation_id: string; name: string; due_date: CalendarDate; remaining: number; reserved: number; stillNeeded: number; kind: 'BILL' | 'SUBSCRIPTION'; overdue: boolean };
export type TodayCard = { account_id: string; name: string; due_date: CalendarDate | null; remaining: number | null; state: SafetyState; line: string };
export type TodayAction = { id: string; label: string; route: string; query?: Record<string, string> };

export type TodayOperating = {
  sts: SafeToSpendBreakdown;
  summary: MoneySummary;
  positions: AccountPosition[];
  setAsideTotal: number;
  billsThisWeek: TodayBill[];
  billsNeedingMoney: TodayBill[];
  overdueBills: TodayBill[];
  cards: TodayCard[];
  earned: { today: EarningsTotals; week: EarningsTotals };
  recentIncome: { id: string; label: string; date: CalendarDate | null; amount: number }[];
  /** Short fact for the TODAY slip, or null when nothing needs attention. */
  attention: string | null;
  actions: TodayAction[];
};

const money = (n: number) => formatMoney(n);

export function computeTodayOperating(today: CalendarDate = getTodayKey()): TodayOperating {
  const snap = getRepository().getSnapshot();
  const sts = computeSafeToSpend(getSetupDraft(), snap.transactions);
  const { positions } = computeLedgerPositions(snap.accounts, snap.creditAttributes, snap.transactions, today);
  const summary = summarizePositions(positions);
  const weekEnd = addDays(today, 7);
  const bills: TodayBill[] = sts.billLines.map((l) => ({
    obligation_id: l.obligation_id,
    name: l.name,
    due_date: l.due_date,
    remaining: l.remaining,
    reserved: l.reserved,
    stillNeeded: toCents(Math.max(0, l.remaining - l.reserved)),
    kind: l.kind,
    overdue: compareCalendarDates(l.due_date, today) < 0,
  }));
  // One row per bill (its current occurrence) for attention lists.
  const firstPerBill = bills.filter((b, i) => bills.findIndex((x) => x.obligation_id === b.obligation_id) === i);
  const billsThisWeek = firstPerBill.filter((b) => compareCalendarDates(b.due_date, weekEnd) <= 0);
  const billsNeedingMoney = firstPerBill.filter((b) => b.stillNeeded > 0 && compareCalendarDates(b.due_date, addDays(today, 14)) <= 0);
  const overdueBills = firstPerBill.filter((b) => b.overdue);
  const cards: TodayCard[] = allCardFacts(today).map((f) => {
    const s = paymentSafety(f, today);
    return { account_id: f.account.account_id, name: f.account.display_name, due_date: f.dueDate, remaining: f.remainingMinimum, state: s.state, line: s.line };
  });
  const records = getRepository().listDailyEarnings();
  const periods = earningsPeriods(records, today);
  const recentIncome = snap.transactions
    .filter((t) => isActivityEntry(t) && t.txn_class === 'INCOME')
    .slice(0, 3)
    .map((t) => ({ id: t.id, label: t.merchant, date: t.occurred_on ?? null, amount: t.amount }));

  let attention: string | null = null;
  const pastDueCard = cards.find((c) => c.state === 'PAST_DUE');
  const soonCard = cards.find((c) => c.state === 'DUE_SOON');
  if (pastDueCard) attention = 'CARD PAYMENT PAST DUE';
  else if (overdueBills.length) attention = `${overdueBills.length} ${overdueBills.length === 1 ? 'BILL IS' : 'BILLS ARE'} OVERDUE`;
  else if (billsThisWeek.length) attention = `${billsThisWeek.length} ${billsThisWeek.length === 1 ? 'BILL' : 'BILLS'} DUE THIS WEEK`;
  else if (sts.transfersToConfirm > 0) attention = `${sts.transfersToConfirm} ${sts.transfersToConfirm === 1 ? 'TRANSFER' : 'TRANSFERS'} TO CONFIRM`;
  else if (soonCard && soonCard.due_date) attention = `CARD DUE ${formatRelativeDate(soonCard.due_date, today)}`;

  const actions: TodayAction[] = [];
  if (!records.some((r) => r.status === 'RECORDED' && r.work_date === today)) actions.push({ id: 'earnings', label: 'ADD TODAY’S EARNINGS', route: 'income', query: { add: 'earnings' } });
  const needs = billsNeedingMoney[0];
  if (needs) actions.push({ id: 'set-aside', label: `SET ASIDE ${money(needs.stillNeeded)} FOR ${needs.name}`, route: `upcoming/${needs.obligation_id}` });
  const card = pastDueCard ?? soonCard;
  if (card && card.remaining) actions.push({ id: 'card', label: `PAY ${card.name} — ${money(card.remaining)} MINIMUM LEFT`, route: `credit/${card.account_id}` });
  const short = sts.accountShortfalls[0];
  if (short) actions.push({ id: 'shortfall', label: `MOVE MONEY: ${short.name} IS ${money(short.short)} SHORT FOR BILLS`, route: 'money/places', query: { move: '', to: short.account_id } });
  if (sts.transfersToConfirm > 0 || sts.inTransit > 0) actions.push({ id: 'transfers', label: sts.transfersToConfirm > 0 ? 'CONFIRM WHAT HAPPENED TO A TRANSFER' : `MARK MONEY IN TRANSIT AS ARRIVED (${money(sts.inTransit)})`, route: 'money/places' });
  actions.push({ id: 'spend', label: 'RECORD SPENDING', route: 'activity', query: { record: 'spending' } });

  return {
    sts,
    summary,
    positions,
    setAsideTotal: sumCents(activeReservations(snap.reservations).map((r) => r.amount)),
    billsThisWeek,
    billsNeedingMoney,
    overdueBills,
    cards,
    earned: { today: periods.today, week: periods.week },
    recentIncome,
    attention,
    actions,
  };
}
