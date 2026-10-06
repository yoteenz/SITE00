/**
 * JURNL analytics (Wave 5) — allow-listed events, no raw financial payloads.
 */
import { trackActivity } from '../../../../utils/activity';

const ALLOWED = new Set([
  'jurnl_route_viewed',
  'jurnl_setup_completed',
  'jurnl_quick_add_opened',
  'jurnl_quick_add_completed',
  'jurnl_plan_created',
  'jurnl_goal_created',
  'jurnl_purchase_created',
  'jurnl_trip_created',
  'jurnl_record_added',
  'jurnl_ask_opened',
  'jurnl_ask_completed',
  'jurnl_error_shown',
]);

const FORBIDDEN_KEYS = /amount|balance|merchant|account_number|password|token|secret|prompt|transaction/i;

export function sanitizeJurnlAnalyticsPayload(payload?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!payload) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (FORBIDDEN_KEYS.test(k)) continue;
    if (typeof v === 'number' && (k.includes('value') || k.includes('money'))) continue;
    out[k] = typeof v === 'string' ? v.slice(0, 120) : v;
  }
  return out;
}

export function trackJurnlEvent(event: string, payload?: Record<string, unknown>): void {
  if (!ALLOWED.has(event)) return;
  trackActivity(event, sanitizeJurnlAnalyticsPayload(payload));
}

export function isAllowedJurnlAnalyticsEvent(event: string): boolean {
  return ALLOWED.has(event);
}
