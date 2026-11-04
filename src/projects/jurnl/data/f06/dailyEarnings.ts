/**
 * F06 daily earnings — one end-of-day entry per income source.
 *
 * One save = one JurnlDailyEarnings record (the single source record) + at most two linked ledger legs in F04:
 *   DIGITAL leg: INCOME into the receiving digital account, for the digital money received.
 *   CASH leg:    INCOME into the cash location, for cash tips.
 * Both legs carry link { kind: DAILY_EARNINGS, id: earnings_id }. Editing rewrites those same legs (no new income);
 * deleting removes them. Money is recorded as received instantly — no pending payout is created.
 *
 * Tips modes (never counted twice):
 *   INCLUDED (A): digital earnings already include digital tips → digital received = digital earnings.
 *   SEPARATE (B): digital earnings exclude digital tips        → digital received = digital earnings + digital tips.
 */

import { useSyncExternalStore } from 'react';
import type { JurnlAccountRecord } from '../foundation/accounts';
import type { DailyEarningsRevision, EarningsSourceKind, JurnlDailyEarnings, TipsMode } from '../foundation/dailyEarnings';
import { addDays, compareCalendarDates, formatCalendarDate, getMonthKey, getTodayKey, isCalendarDate, type CalendarDate } from '../foundation/dates';
import type { LedgerEntry } from '../home/moneyTypes';
import { accountNature, sumCents, toCents } from '../ledger/accounting';
import { applyOp, buildEntry, money, type OpResult } from '../ledger/ledgerOps';
import { cachedRepoView } from '../repository/cachedRepoView';
import { getRepository } from '../repository/deviceRepository';
import { newEntityId } from '../repository/ids';

export type DailyEarningsInput = {
  work_date: CalendarDate;
  income_source: string;
  source_kind: EarningsSourceKind;
  tips_mode: TipsMode;
  digital_earnings: number;
  digital_tips: number;
  cash_tips: number;
  digital_account_id: string | null;
  cash_account_id: string | null;
  notes?: string;
};

export type EarningsBreakdown = {
  /** Money that landed in the digital account. */
  digitalReceived: number;
  /** Cash in hand. */
  cashReceived: number;
  /** Everything earned that day: digital received + cash. */
  totalEarned: number;
  /** Earnings before any tips. */
  baseEarnings: number;
  tipsTotal: number;
};

export const EARNINGS_SOURCE_PRESETS: readonly { label: string; kind: EarningsSourceKind }[] = [
  { label: 'UBER', kind: 'RIDESHARE' },
  { label: 'LYFT', kind: 'RIDESHARE' },
  { label: 'DELIVERY', kind: 'DELIVERY' },
  { label: 'HOURLY JOB', kind: 'HOURLY' },
  { label: 'HOME HEALTHCARE', kind: 'HOME_HEALTHCARE' },
  { label: 'OTHER WORK', kind: 'OTHER' },
];

export function earningsBreakdown(input: Pick<DailyEarningsInput, 'tips_mode' | 'digital_earnings' | 'digital_tips' | 'cash_tips'>): EarningsBreakdown {
  const de = toCents(Math.max(0, input.digital_earnings));
  const dt = toCents(Math.max(0, input.digital_tips));
  const ct = toCents(Math.max(0, input.cash_tips));
  const digitalReceived = input.tips_mode === 'INCLUDED' ? de : toCents(de + dt);
  const baseEarnings = input.tips_mode === 'INCLUDED' ? toCents(Math.max(0, de - dt)) : de;
  return {
    digitalReceived,
    cashReceived: ct,
    totalEarned: toCents(digitalReceived + ct),
    baseEarnings,
    tipsTotal: toCents(dt + ct),
  };
}

function sameSource(a: string, b: string) {
  return a.trim().toUpperCase() === b.trim().toUpperCase();
}

/** The active record for a work date and source, if one exists (one per day per source). */
export function findEarningsFor(records: JurnlDailyEarnings[], workDate: CalendarDate, source: string, excludeId?: string): JurnlDailyEarnings | null {
  return records.find((r) => r.status === 'RECORDED' && r.work_date === workDate && sameSource(r.income_source, source) && r.earnings_id !== excludeId) ?? null;
}

export function validateDailyEarnings(input: DailyEarningsInput, accounts: JurnlAccountRecord[], today: CalendarDate): string | null {
  if (!isCalendarDate(input.work_date)) return 'ENTER THE WORK DATE AS YYYY-MM-DD.';
  if (compareCalendarDates(input.work_date, today) > 0) return 'THE WORK DATE CANNOT BE IN THE FUTURE.';
  if (!input.income_source.trim()) return 'CHOOSE WHERE THIS MONEY CAME FROM.';
  for (const v of [input.digital_earnings, input.digital_tips, input.cash_tips]) {
    if (!Number.isFinite(v) || v < 0) return `AMOUNTS MUST BE ${money(0)} OR MORE.`;
  }
  const b = earningsBreakdown(input);
  if (b.totalEarned <= 0) return `ENTER AT LEAST ONE AMOUNT ABOVE ${money(0)}.`;
  if (input.tips_mode === 'INCLUDED' && toCents(input.digital_tips) > toCents(input.digital_earnings)) {
    return 'DIGITAL TIPS CANNOT BE MORE THAN DIGITAL EARNINGS WHEN THE EARNINGS ALREADY INCLUDE TIPS.';
  }
  if (b.digitalReceived > 0) {
    const acct = accounts.find((a) => a.account_id === input.digital_account_id && a.status === 'ACTIVE');
    if (!acct) return 'CHOOSE THE ACCOUNT THAT RECEIVED THE DIGITAL MONEY.';
    if (accountNature(acct.account_type) === 'LIABILITY') return `${acct.display_name} IS A CREDIT ACCOUNT. EARNINGS CAN ONLY GO INTO AN ACCOUNT THAT HOLDS MONEY.`;
  }
  if (b.cashReceived > 0) {
    const acct = accounts.find((a) => a.account_id === input.cash_account_id && a.status === 'ACTIVE');
    if (!acct) return 'CHOOSE WHERE THE CASH TIPS ARE KEPT. ADD A CASH POCKET IN MONEY IF YOU HAVE NONE.';
    if (accountNature(acct.account_type) === 'LIABILITY') return `${acct.display_name} IS A CREDIT ACCOUNT. CASH TIPS NEED A POCKET THAT HOLDS MONEY.`;
  }
  return null;
}

function revision(action: DailyEarningsRevision['action'], b: EarningsBreakdown): DailyEarningsRevision {
  return { at: new Date().toISOString(), action, total_earned: b.totalEarned, digital_received: b.digitalReceived, cash_received: b.cashReceived };
}

/**
 * Builds the atomic commit for a new or edited daily earnings record. `existingId` edits that record in place: its
 * legs are rewritten, never duplicated, so balances move by the difference only.
 */
export function buildDailyEarnings(
  parts: { accounts: JurnlAccountRecord[]; transactions: LedgerEntry[]; dailyEarnings: JurnlDailyEarnings[] },
  input: DailyEarningsInput,
  today: CalendarDate,
  existingId?: string,
): OpResult<JurnlDailyEarnings> {
  const existing = existingId ? parts.dailyEarnings.find((r) => r.earnings_id === existingId && r.status === 'RECORDED') ?? null : null;
  if (existingId && !existing) return { ok: false, error: 'THIS DAY WAS REMOVED. ADD IT AGAIN.' };
  const error = validateDailyEarnings(input, parts.accounts, today);
  if (error) return { ok: false, error };
  const clash = findEarningsFor(parts.dailyEarnings, input.work_date, input.income_source, existing?.earnings_id);
  if (clash) {
    return { ok: false, error: `${clash.income_source} EARNINGS FOR ${formatCalendarDate(input.work_date)} ARE ALREADY RECORDED. OPEN THAT DAY TO CHANGE IT.` };
  }
  const b = earningsBreakdown(input);
  const id = existing?.earnings_id ?? newEntityId('earn');
  const source = input.income_source.trim().toUpperCase();
  const priorLegs = parts.transactions.filter((t) => t.link?.kind === 'DAILY_EARNINGS' && t.link.id === id);
  const legs: LedgerEntry[] = [];
  if (b.digitalReceived > 0) {
    const account = parts.accounts.find((a) => a.account_id === input.digital_account_id)!;
    legs.push(
      buildEntry({
        id: priorLegs.find((t) => t.link?.leg === 'DIGITAL')?.id,
        merchant: `${source} EARNINGS`,
        amount: b.digitalReceived,
        direction: 'INCOME',
        account,
        txn_class: 'INCOME',
        category: 'INCOME',
        occurred_on: input.work_date,
        memo: input.tips_mode === 'INCLUDED' ? `INCLUDES ${money(input.digital_tips)} DIGITAL TIPS` : `${money(input.digital_earnings)} EARNINGS + ${money(input.digital_tips)} DIGITAL TIPS`,
        origin_family: 'F06',
        link: { kind: 'DAILY_EARNINGS', id, leg: 'DIGITAL' },
      }),
    );
  }
  if (b.cashReceived > 0) {
    const account = parts.accounts.find((a) => a.account_id === input.cash_account_id)!;
    legs.push(
      buildEntry({
        id: priorLegs.find((t) => t.link?.leg === 'CASH')?.id,
        merchant: `${source} CASH TIPS`,
        amount: b.cashReceived,
        direction: 'INCOME',
        account,
        txn_class: 'INCOME',
        category: 'INCOME',
        occurred_on: input.work_date,
        memo: 'CASH TIPS',
        origin_family: 'F06',
        link: { kind: 'DAILY_EARNINGS', id, leg: 'CASH' },
      }),
    );
  }
  const keep = new Set(legs.map((l) => l.id));
  const remove = priorLegs.filter((t) => !keep.has(t.id)).map((t) => t.id);
  const now = new Date().toISOString();
  const record: JurnlDailyEarnings = {
    earnings_id: id,
    work_date: input.work_date,
    income_source: source,
    source_kind: input.source_kind,
    tips_mode: input.tips_mode,
    digital_earnings: toCents(input.digital_earnings),
    digital_tips: toCents(input.digital_tips),
    cash_tips: toCents(input.cash_tips),
    digital_account_id: b.digitalReceived > 0 ? input.digital_account_id : null,
    cash_account_id: b.cashReceived > 0 ? input.cash_account_id : null,
    notes: (input.notes ?? '').trim().toUpperCase(),
    status: 'RECORDED',
    ledger_entry_ids: legs.map((l) => l.id),
    revisions: [...(existing?.revisions ?? []), revision(existing ? 'EDITED' : 'CREATED', b)],
    created_at: existing?.created_at ?? now,
    updated_at: now,
    deleted_at: null,
  };
  return {
    ok: true,
    commit: { reason: existing ? 'DAILY_EARNINGS_EDITED' : 'DAILY_EARNINGS_RECORDED', dailyEarnings: { upsert: [record] }, transactions: { upsert: legs, remove } },
    value: record,
  };
}

/** Removes a day's legs and marks the record DELETED (kept for history). Balances return to what they were. */
export function buildDeleteDailyEarnings(parts: { transactions: LedgerEntry[]; dailyEarnings: JurnlDailyEarnings[] }, id: string): OpResult<JurnlDailyEarnings> {
  const record = parts.dailyEarnings.find((r) => r.earnings_id === id && r.status === 'RECORDED');
  if (!record) return { ok: false, error: 'THIS DAY WAS ALREADY REMOVED.' };
  const legs = parts.transactions.filter((t) => t.link?.kind === 'DAILY_EARNINGS' && t.link.id === id).map((t) => t.id);
  const now = new Date().toISOString();
  const b = earningsBreakdown(record);
  const next: JurnlDailyEarnings = {
    ...record,
    status: 'DELETED',
    deleted_at: now,
    updated_at: now,
    ledger_entry_ids: [],
    revisions: [...record.revisions, { ...revision('DELETED', b) }],
  };
  return { ok: true, commit: { reason: 'DAILY_EARNINGS_DELETED', dailyEarnings: { upsert: [next] }, transactions: { remove: legs } }, value: next };
}

export type EarningsTotals = { days: number; total: number; digital: number; cash: number; tips: number };

/** Monday-start week containing `date`. */
export function weekStart(date: CalendarDate): CalendarDate {
  const dow = new Date(`${date}T00:00:00.000Z`).getUTCDay();
  return addDays(date, -((dow + 6) % 7));
}

export function earningsTotals(records: JurnlDailyEarnings[], from: CalendarDate, through: CalendarDate): EarningsTotals {
  const inRange = records.filter((r) => r.status === 'RECORDED' && compareCalendarDates(r.work_date, from) >= 0 && compareCalendarDates(r.work_date, through) <= 0);
  const parts = inRange.map((r) => ({ r, b: earningsBreakdown(r) }));
  return {
    days: new Set(inRange.map((r) => r.work_date)).size,
    total: sumCents(parts.map((p) => p.b.totalEarned)),
    digital: sumCents(parts.map((p) => p.b.digitalReceived)),
    cash: sumCents(parts.map((p) => p.b.cashReceived)),
    tips: sumCents(parts.map((p) => p.b.tipsTotal)),
  };
}

export function earningsPeriods(records: JurnlDailyEarnings[], today: CalendarDate) {
  const month = getMonthKey(today);
  return {
    today: earningsTotals(records, today, today),
    week: earningsTotals(records, weekStart(today), addDays(weekStart(today), 6)),
    month: earningsTotals(records, `${month}-01` as CalendarDate, `${month}-31` as CalendarDate),
  };
}

// ─── Repository wrappers ─────────────────────────────────────────────────────

function subscribe(listener: () => void) {
  return getRepository().subscribe(listener);
}

export function listDailyEarnings(): JurnlDailyEarnings[] {
  return cachedRepoView('f06.dailyEarnings', () =>
    [...getRepository().listDailyEarnings()]
      .filter((r) => r.status === 'RECORDED')
      .sort((a, b) => (a.work_date === b.work_date ? b.updated_at.localeCompare(a.updated_at) : b.work_date.localeCompare(a.work_date))),
  );
}

export function useDailyEarnings(): JurnlDailyEarnings[] {
  return useSyncExternalStore(subscribe, listDailyEarnings, listDailyEarnings);
}

export function dailyEarningsById(id: string): JurnlDailyEarnings | null {
  return getRepository().listDailyEarnings().find((r) => r.earnings_id === id) ?? null;
}

export function saveDailyEarnings(input: DailyEarningsInput, existingId?: string, today: CalendarDate = getTodayKey()): OpResult<JurnlDailyEarnings> {
  const s = getRepository().getSnapshot();
  return applyOp(buildDailyEarnings({ accounts: s.accounts, transactions: s.transactions, dailyEarnings: s.dailyEarnings }, input, today, existingId));
}

export function deleteDailyEarnings(id: string): OpResult<JurnlDailyEarnings> {
  const s = getRepository().getSnapshot();
  return applyOp(buildDeleteDailyEarnings({ transactions: s.transactions, dailyEarnings: s.dailyEarnings }, id));
}
