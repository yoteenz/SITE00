import { describe, expect, it } from 'vitest';
import { getTodayKey, parseCalendarDate, daysUntil } from '../src/projects/jurnl/data/foundation/dates';

const ZONES = ['America/Los_Angeles', 'America/New_York', 'UTC', 'Asia/Kolkata', 'Australia/Sydney'] as const;

describe('JURNL timezone edge cases', () => {
  it('getTodayKey is stable per timezone for fixed instant', () => {
    const instant = new Date('2026-10-06T02:30:00.000Z');
    const keys = ZONES.map((tz) => getTodayKey(instant, tz));
    expect(new Set(keys).size).toBeGreaterThan(1);
    keys.forEach((k) => expect(parseCalendarDate(k)).toBe(k));
  });

  it('calendar date boundaries do not shift on parse', () => {
    const d = parseCalendarDate('2026-12-31T23:59:59.999Z');
    expect(d).toBe('2026-12-31');
  });

  it('daysUntil respects UTC calendar math', () => {
    expect(daysUntil('2026-10-01' as never, '2026-10-02' as never)).toBe(1);
    expect(daysUntil('2026-12-31' as never, '2027-01-01' as never)).toBe(1);
  });
});
