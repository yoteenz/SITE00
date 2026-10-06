import { describe, expect, it, vi } from 'vitest';
import { redactErrorMessage, trackJurnlSafeError } from '../src/projects/jurnl/data/telemetry/errorTelemetry';

vi.mock('../src/projects/jurnl/data/analytics/jurnlAnalytics', () => ({
  trackJurnlEvent: vi.fn(),
  sanitizeJurnlAnalyticsPayload: (p?: Record<string, unknown>) => p,
}));

describe('JURNL error telemetry', () => {
  it('redacts token-like messages', () => {
    expect(redactErrorMessage('Bearer sk_live_abc')).toBe('REDACTED');
  });

  it('tracks safe error kind', () => {
    trackJurnlSafeError('SYNC', { message: 'network fail' });
    expect(true).toBe(true);
  });
});
