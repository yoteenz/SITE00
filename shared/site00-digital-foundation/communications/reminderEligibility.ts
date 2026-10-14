import type { DigitalFoundationArtifactPayload } from '../types.js';

export type ReminderKind = 'INTAKE_INCOMPLETE' | 'QUOTE_UNPAID';

export type ReminderEligibility = { eligible: boolean; reasons: string[] };

/**
 * Incomplete intake reminder — does not encode timing cadence (founder-configurable elsewhere).
 * Caller supplies `now` and optional `lastReminderSentAt` for duplicate suppression.
 */
export function intakeIncompleteReminderEligibility(
  payload: DigitalFoundationArtifactPayload,
  opts: { lastReminderSentAt: string | null; now: Date },
): ReminderEligibility {
  const reasons: string[] = [];
  const intake = payload.artifact.intake_state;
  if (intake === 'COMPLETE') reasons.push('INTAKE_ALREADY_COMPLETE');
  if (payload.artifact.state === 'ARCHIVED') reasons.push('ARTIFACT_ARCHIVED');
  if (!payload.lead.contact_email?.trim()) reasons.push('NO_RECIPIENT');
  if (opts.lastReminderSentAt) reasons.push('REMINDER_ALREADY_SENT');
  return { eligible: reasons.length === 0, reasons };
}

/**
 * Unpaid / expiring quote reminder — timing policy must be supplied by scheduler; this gate is state-only.
 */
export function quoteUnpaidReminderEligibility(
  payload: DigitalFoundationArtifactPayload,
  opts: { lastReminderSentAt: string | null; quoteExpiresAt: string | null; now: Date },
): ReminderEligibility {
  const reasons: string[] = [];
  if (!payload.quote) reasons.push('NO_QUOTE');
  if (payload.artifact.payment_state === 'PAID') reasons.push('ALREADY_PAID');
  if (payload.quote?.status === 'EXPIRED') reasons.push('QUOTE_EXPIRED');
  if (payload.quote?.status === 'PAID') reasons.push('QUOTE_PAID');
  if (!payload.lead.contact_email?.trim()) reasons.push('NO_RECIPIENT');
  if (opts.lastReminderSentAt) reasons.push('REMINDER_ALREADY_SENT');
  if (opts.quoteExpiresAt && new Date(opts.quoteExpiresAt).getTime() < opts.now.getTime()) {
    reasons.push('QUOTE_EXPIRED');
  }
  return { eligible: reasons.length === 0, reasons };
}
