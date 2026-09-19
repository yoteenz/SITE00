/**
 * Campaign Board live week calendar tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  formatNdxTodayDateLabel,
  getISOWeekNumber,
  resolveCampaignBoardWeekCalendar,
  resolveTodayCampaignDayShortId,
} from '../src/site00/utils/campaignBoardWeekCalendar';

const ROOT = process.cwd();

describe('campaignBoardWeekCalendar', () => {
  it('builds seven Mon–Sun days for a fixed reference week', () => {
    const cal = resolveCampaignBoardWeekCalendar(new Date(2026, 7, 26)); // Aug 26 2026 = Wed
    expect(cal.days).toHaveLength(7);
    expect(cal.days[0]?.letter).toBe('M');
    expect(cal.days[0]?.month).toBe('8');
    expect(cal.days[0]?.day).toBe('24');
    expect(cal.days[2]?.active).toBe(true);
    expect(cal.dateRangeLabel).toMatch(/AUG 24 — AUG 30/);
    expect(cal.weekLabel).toMatch(/^WEEK \d{2}$/);
  });

  it('marks today active and exposes todayId', () => {
    const at = new Date(2026, 7, 28);
    const cal = resolveCampaignBoardWeekCalendar(at);
    const active = cal.days.filter((d) => d.active);
    expect(active).toHaveLength(1);
    expect(cal.todayId).toBe(active[0]?.id);
  });

  it('resolveTodayCampaignDayShortId matches weekday id', () => {
    expect(resolveTodayCampaignDayShortId(new Date(2026, 7, 26))).toBe('wed');
    expect(resolveTodayCampaignDayShortId(new Date(2026, 7, 24))).toBe('mon');
  });

  it('ISO week number for mid-August 2026', () => {
    expect(getISOWeekNumber(new Date(2026, 7, 26))).toBeGreaterThan(30);
  });
});

describe('overview mobile today date', () => {
  it('formats today label in uppercase month day', () => {
    expect(formatNdxTodayDateLabel(new Date(2026, 7, 26))).toBe('AUG 26');
  });

  it('OverviewMobileHomeScreen uses live today date hook', () => {
    const src = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/OverviewFounderWorkspaceBoard.tsx'),
      'utf8',
    );
    expect(src).toContain('useCampaignBoardWeekCalendar');
    expect(src).toContain('formatNdxTodayDateLabel');
    expect(src).toContain('todayDateLabel');
    expect(src).not.toContain('>May 24<');
  });
});

describe('campaign board mobile screen uses live calendar', () => {
  it('MobileCampaignBoardScreen imports live week hook and schedule cells', () => {
    const src = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'),
      'utf8',
    );
    expect(src).toContain('useCampaignBoardWeekCalendar');
    expect(src).toContain('formatCampaignScheduleDayLabel');
    expect(src).toContain('site00-fws-mobile-campaign__schedule-cell');
    expect(src).not.toContain('NDX_CAMPAIGN_BOARD_WEEK');
    expect(src).not.toContain('week.weekLabel');
  });
});
