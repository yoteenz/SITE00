/**
 * Canonical JURNL date contract (W0.1). Calendar dates are timezone-safe strings YYYY-MM-DD.
 * Timestamps are ISO-8601 UTC. Display layers use relative labels without shifting date-only values.
 */

export type CalendarDate = string & { readonly __brand: 'CalendarDate' };
export type MonthKey = string & { readonly __brand: 'MonthKey' };
export type DayKey = string & { readonly __brand: 'DayKey' };

export type DateSource = 'USER' | 'IMPORT' | 'SYSTEM' | 'ESTIMATED' | 'LEGACY_DISPLAY';
export type RecurrenceType = 'NONE' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'ANNUAL' | 'IRREGULAR';

export type JurnlDateFields = {
  calendar_date?: CalendarDate | null;
  timestamp?: string | null;
  timezone?: string | null;
  due_date?: CalendarDate | null;
  posted_at?: string | null;
  expected_at?: string | null;
  start_date?: CalendarDate | null;
  end_date?: CalendarDate | null;
  recurrence?: RecurrenceType;
  period?: MonthKey | null;
  month_key?: MonthKey | null;
  day_key?: DayKey | null;
  is_estimated?: boolean;
  source?: DateSource;
  updated_at?: string | null;
};

const CAL_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isCalendarDate(value: string): value is CalendarDate {
  const m = CAL_RE.exec(value);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

export function parseCalendarDate(input: string | null | undefined): CalendarDate | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (isCalendarDate(trimmed)) return trimmed;
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    const day = trimmed.slice(0, 10);
    return isCalendarDate(day) ? day : null;
  }
  return null;
}

export function formatCalendarDate(date: CalendarDate, locale = 'en-US'): string {
  const [y, mo, d] = date.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(Date.UTC(y, mo - 1, d))).toUpperCase();
}

export function getTodayKey(now = new Date(), timeZone = 'UTC'): CalendarDate {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const y = parts.find((p) => p.type === 'year')!.value;
  const m = parts.find((p) => p.type === 'month')!.value;
  const d = parts.find((p) => p.type === 'day')!.value;
  return `${y}-${m}-${d}` as CalendarDate;
}

export function getMonthKey(date: CalendarDate): MonthKey {
  return date.slice(0, 7) as MonthKey;
}

export function getDayKey(date: CalendarDate): DayKey {
  return date as unknown as DayKey;
}

export function compareCalendarDates(a: CalendarDate, b: CalendarDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function daysUntil(from: CalendarDate, to: CalendarDate): number {
  const a = Date.parse(`${from}T00:00:00.000Z`);
  const b = Date.parse(`${to}T00:00:00.000Z`);
  return Math.round((b - a) / 86_400_000);
}

export function isPastDue(due: CalendarDate, today: CalendarDate): boolean {
  return compareCalendarDates(due, today) < 0;
}

export function isDueToday(due: CalendarDate, today: CalendarDate): boolean {
  return due === today;
}

export function isUpcoming(due: CalendarDate, today: CalendarDate): boolean {
  return compareCalendarDates(due, today) > 0;
}

export function startOfPeriod(month: MonthKey): CalendarDate {
  return `${month}-01` as CalendarDate;
}

export function endOfPeriod(month: MonthKey): CalendarDate {
  const [y, mo] = month.split('-').map(Number);
  const last = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  return `${month}-${String(last).padStart(2, '0')}` as CalendarDate;
}

export type RecurrenceRule = { type: RecurrenceType; anchor: CalendarDate };

export function resolveRecurringOccurrence(rule: RecurrenceRule, after: CalendarDate): CalendarDate | null {
  if (rule.type === 'NONE' || rule.type === 'IRREGULAR') return null;
  const anchor = rule.anchor;
  if (compareCalendarDates(after, anchor) < 0) return anchor;
  if (rule.type === 'WEEKLY') {
    const step = 7;
    let n = daysUntil(anchor, after);
    const k = Math.ceil(n / step);
    return addDays(anchor, k * step);
  }
  if (rule.type === 'BIWEEKLY') {
    const step = 14;
    let n = daysUntil(anchor, after);
    const k = Math.ceil(n / step);
    return addDays(anchor, k * step);
  }
  if (rule.type === 'MONTHLY') {
    const [, , d] = anchor.split('-').map(Number);
    let cy = Number(after.slice(0, 4));
    let cm = Number(after.slice(5, 7));
    let candidate = calendarFromParts(cy, cm, d);
    if (compareCalendarDates(candidate, after) <= 0) {
      cm += 1;
      if (cm > 12) {
        cm = 1;
        cy += 1;
      }
      candidate = calendarFromParts(cy, cm, d);
    }
    return candidate;
  }
  if (rule.type === 'ANNUAL') {
    const [, mo, d] = anchor.split('-').map(Number);
    let cy = Number(after.slice(0, 4));
    let candidate = calendarFromParts(cy, mo, d);
    if (compareCalendarDates(candidate, after) <= 0) candidate = calendarFromParts(cy + 1, mo, d);
    return candidate;
  }
  return null;
}

function calendarFromParts(y: number, mo: number, d: number): CalendarDate {
  const last = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const day = Math.min(d, last);
  return `${y}-${String(mo).padStart(2, '0')}-${String(day).padStart(2, '0')}` as CalendarDate;
}

function addDays(date: CalendarDate, days: number): CalendarDate {
  const t = Date.parse(`${date}T00:00:00.000Z`) + days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10) as CalendarDate;
}

export function sortByDate<T>(items: T[], pick: (item: T) => CalendarDate | null | undefined): T[] {
  return [...items].sort((a, b) => {
    const da = pick(a);
    const db = pick(b);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return compareCalendarDates(da, db);
  });
}

const WEEKDAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;

export function formatRelativeDate(date: CalendarDate, today: CalendarDate): string {
  const delta = daysUntil(today, date);
  if (delta === 0) return 'TODAY';
  if (delta === -1) return 'YESTERDAY';
  if (delta === 1) return 'TOMORROW';
  if (delta >= -6 && delta <= 6) {
    const dow = new Date(`${date}T00:00:00.000Z`).getUTCDay();
    return WEEKDAYS[dow]!;
  }
  return formatCalendarDate(date);
}

/** Maps legacy display strings (MOCK ledger) to a calendar anchor for sorting only. */
export function normalizeDateInput(input: string, today: CalendarDate): CalendarDate | null {
  const iso = parseCalendarDate(input);
  if (iso) return iso;
  const u = input.trim().toUpperCase();
  if (u === 'TODAY') return today;
  if (u === 'YESTERDAY') return addDays(today, -1);
  if (u === 'TOMORROW') return addDays(today, 1);
  const idx = WEEKDAYS.indexOf(u as (typeof WEEKDAYS)[number]);
  if (idx >= 0) {
    const nowDow = new Date(`${today}T00:00:00.000Z`).getUTCDay();
    let back = (nowDow - idx + 7) % 7;
    if (back === 0 && u !== 'TODAY') back = 7;
    return addDays(today, -back);
  }
  return null;
}
