import { describe, expect, it, beforeEach } from 'vitest';
import {
  compareCalendarDates,
  formatRelativeDate,
  getTodayKey,
  isPastDue,
  parseCalendarDate,
  resolveRecurringOccurrence,
} from '../src/projects/jurnl/data/foundation/dates';
import { normalizeCategory } from '../src/projects/jurnl/data/foundation/categories';
import { JURNL_FAMILY_REGISTRY, JURNL_PRODUCT_DISCOVERY_EDGES } from '../src/projects/jurnl/data/foundation/familyRegistry';
import { computeSafeToSpend } from '../src/projects/jurnl/data/f09/safeToSpend';
import { EMPTY_SETUP, patchSetup, resetSetup } from '../src/projects/jurnl/data/f02/setupDraft';
import { readFileSync } from 'node:fs';
import { getRepository, resetRepositoryForDev, setRepositoryUserId } from '../src/projects/jurnl/data/repository/deviceRepository';

describe('JURNL wave 0 foundations', () => {
  beforeEach(() => {
    setRepositoryUserId('test-user-wave0');
    resetRepositoryForDev();
    resetSetup();
  });

  it('parses calendar dates without timezone shift', () => {
    const d = parseCalendarDate('2024-02-29');
    expect(d).toBe('2024-02-29');
    expect(formatRelativeDate(d!, '2024-02-28' as typeof d)).toBe('TOMORROW');
  });

  it('compares month and year boundaries', () => {
    expect(compareCalendarDates('2026-01-31' as never, '2026-02-01' as never)).toBeLessThan(0);
    expect(isPastDue('2026-01-01' as never, getTodayKey(new Date('2026-10-05T12:00:00Z')))).toBe(true);
  });

  it('resolves monthly recurrence across month end', () => {
    const next = resolveRecurringOccurrence({ type: 'MONTHLY', anchor: '2026-01-31' as never }, '2026-02-15' as never);
    expect(next).toBe('2026-02-28');
  });

  it('normalizes categories to one catalog', () => {
    expect(normalizeCategory('GROCERIES')).toBe('FOOD');
    expect(normalizeCategory('CLOTHING')).toBe('CLOTHING');
  });

  it('registers sixteen families with routes', () => {
    expect(JURNL_FAMILY_REGISTRY).toHaveLength(16);
    expect(JURNL_FAMILY_REGISTRY.map((f) => f.family_id)).toEqual([
      'F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'F08', 'F09', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16',
    ]);
  });

  it('marks setup obligations partial instead of silently zeroing safe-to-spend upcoming', () => {
    patchSetup({
      ...EMPTY_SETUP,
      started: true,
      accounts: 'NAMED',
      cadence: 'MONTHLY',
      amount: '3200',
      obligations: [{ name: 'RENT', cadence: 'MONTHLY' }],
    });
    const result = computeSafeToSpend(getRepository().getSnapshot().setup);
    expect(result.setupObligationCount).toBe(1);
    expect(result.unknownUpcoming).toBe(true);
    expect(result.completeness).toBe('PARTIAL');
    expect(result.upcoming).toBe(0);
  });

  it('persists setup through the repository adapter', () => {
    patchSetup({ started: true, household: 'JUST_ME' });
    expect(getRepository().getSnapshot().setup.household).toBe('JUST_ME');
    expect(readFileSync('src/projects/jurnl/data/f02/setupDraft.ts', 'utf8')).not.toMatch(/sessionStorage/);
  });

  it('lists discovery edges for every non-nav family parent', () => {
    const targets = new Set(JURNL_PRODUCT_DISCOVERY_EDGES.map((e) => e.to));
    for (const id of ['F06.00', 'F07.00', 'F09.00', 'F10.00', 'F11.00', 'F13.00', 'F14.00', 'F15.00', 'F16.00']) {
      expect(targets.has(id)).toBe(true);
    }
  });
});
