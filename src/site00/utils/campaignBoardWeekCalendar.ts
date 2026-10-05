/**
 * Campaign Board week calendar — live local dates for mobile/desktop presentation.
 * Reference snapshot constants in ndxCampaignBoardMobileReference.ts remain for VR lineage only.
 */

export type CampaignBoardDayCell = {
  id: string;
  letter: string;
  month: string;
  day: string;
  active: boolean;
  /** Local calendar date (midnight). */
  date: Date;
};

export type CampaignBoardWeekCalendar = {
  weekLabel: string;
  dateRangeLabel: string;
  days: CampaignBoardDayCell[];
  todayId: string;
};

const DAY_IDS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

function startOfWeekMondayLocal(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = d.getDay();
  const offset = weekday === 0 ? -6 : 1 - weekday;
  d.setDate(d.getDate() + offset);
  return d;
}

function sameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Uppercase month + day for campaign header (e.g. AUG 24). */
function formatMonthDayUpper(date: Date): string {
  const parts = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).split(' ');
  const month = (parts[0] ?? '').replace('.', '').toUpperCase();
  const day = parts[1] ?? '';
  return `${month} ${day}`;
}

/** Uppercase month + day for NDX headers (e.g. AUG 26). */
export function formatNdxTodayDateLabel(at: Date = new Date()): string {
  return formatMonthDayUpper(at);
}

/** ISO week number (Monday-based). */
export function getISOWeekNumber(date: Date): number {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

export function resolveCampaignBoardWeekCalendar(at: Date = new Date()): CampaignBoardWeekCalendar {
  const monday = startOfWeekMondayLocal(at);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const weekLabel = `WEEK ${String(getISOWeekNumber(at)).padStart(2, '0')}`;
  const dateRangeLabel = `${formatMonthDayUpper(monday)} — ${formatMonthDayUpper(sunday)}`;

  const days: CampaignBoardDayCell[] = DAY_IDS.map((dayId, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const isoKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return {
      id: `${dayId}-${isoKey}`,
      letter: DAY_LETTERS[index]!,
      month: String(date.getMonth() + 1),
      day: String(date.getDate()),
      active: sameLocalDay(date, at),
      date,
    };
  });

  const todayId = days.find((d) => d.active)?.id ?? days[0]!.id;

  return { weekLabel, dateRangeLabel, days, todayId };
}

/** Desktop day selector id (mon | tue | …) for the current local date. */
export function resolveTodayCampaignDayShortId(at: Date = new Date()): string {
  const today = resolveCampaignBoardWeekCalendar(at).days.find((d) => d.active);
  return today?.id.split('-')[0] ?? 'mon';
}

/** Uppercase weekday + month day for schedule cells (e.g. MON / MAY 24). */
export function formatCampaignScheduleDayLabel(date: Date): { weekday: string; monthDay: string } {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const monthDay = formatMonthDayUpper(date);
  return { weekday, monthDay };
}

/** Format created date for status card (e.g. MAY 24, 2025). */
export function formatCampaignCreatedLabel(date: Date): string {
  const month = date.toLocaleDateString('en-US', { month: 'short' }).replace('.', '').toUpperCase();
  return `${month} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Short hub chip label e.g. Mon 25 */
export function formatCampaignBoardHubDayLabel(date: Date): string {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  return `${weekday} ${date.getDate()}`;
}
