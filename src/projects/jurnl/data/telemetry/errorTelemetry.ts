/**
 * Production-safe error telemetry (functional closure). Never logs secrets or raw financial payloads.
 */
import { sanitizeJurnlAnalyticsPayload, trackJurnlEvent } from '../analytics/jurnlAnalytics';

export type JurnlErrorKind =
  | 'AUTH'
  | 'SESSION_EXPIRED'
  | 'SYNC'
  | 'PERSISTENCE'
  | 'ASK_JURNL'
  | 'UPLOAD'
  | 'ROUTE'
  | 'MUTATION'
  | 'UNKNOWN';

const FORBIDDEN_IN_MESSAGE = /password|token|secret|bearer|authorization|apikey|sk_|service_role/i;

export function redactErrorMessage(message: string): string {
  if (FORBIDDEN_IN_MESSAGE.test(message)) return 'REDACTED';
  return message.slice(0, 120);
}

export function trackJurnlSafeError(kind: JurnlErrorKind, detail?: Record<string, unknown>): void {
  const payload = sanitizeJurnlAnalyticsPayload({
    kind,
    ...(detail ?? {}),
  });
  if (detail?.message && typeof detail.message === 'string') {
    payload!.message = redactErrorMessage(detail.message);
  }
  trackJurnlEvent('jurnl_error_shown', payload);
}
