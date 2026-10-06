import { describe, expect, it, vi } from 'vitest';
import { resolveJurnlProductionConfig, jurnlProductionFailClosed } from '../src/projects/jurnl/data/production/productionConfig';
import { isAllowedJurnlAnalyticsEvent, sanitizeJurnlAnalyticsPayload, trackJurnlEvent } from '../src/projects/jurnl/data/analytics/jurnlAnalytics';

vi.mock('../src/utils/activity', () => ({
  trackActivity: vi.fn(),
}));

describe('JURNL production config', () => {
  it('design-preview stays on device plane', () => {
    const cfg = resolveJurnlProductionConfig('design-preview');
    expect(cfg.dataPlane).toBe('DEVICE');
    expect(jurnlProductionFailClosed('design-preview')).toBe(false);
  });

  it('production without server flag is unconfigured (fail closed)', () => {
    const cfg = resolveJurnlProductionConfig('production');
    expect(cfg.dataPlane).toBe('UNCONFIGURED');
    expect(jurnlProductionFailClosed('production')).toBe(true);
  });
});

describe('JURNL analytics privacy', () => {
  it('strips forbidden financial keys', () => {
    const out = sanitizeJurnlAnalyticsPayload({
      route: 'today',
      balance: 100,
      purchase_amount: 50,
      familyId: 'F09',
    });
    expect(out?.route).toBe('today');
    expect(out?.familyId).toBe('F09');
    expect(out).not.toHaveProperty('balance');
    expect(out).not.toHaveProperty('purchase_amount');
  });

  it('allow-lists events only', () => {
    trackJurnlEvent('jurnl_route_viewed', { route: 'today' });
    trackJurnlEvent('jurnl_secret_leak', { route: 'today' });
    expect(isAllowedJurnlAnalyticsEvent('jurnl_route_viewed')).toBe(true);
    expect(isAllowedJurnlAnalyticsEvent('jurnl_secret_leak')).toBe(false);
  });
});
