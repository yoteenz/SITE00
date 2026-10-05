import { createHash, timingSafeEqual } from 'node:crypto';
import type { CourtesyDiscountType, ExistingLocationQuote, ServiceCourtesyCodeRecord } from './types';

export function normalizeCourtesyCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export function hashCourtesyCode(raw: string): string {
  return createHash('sha256').update(normalizeCourtesyCode(raw)).digest('hex');
}

export function codesMatch(raw: string, record: ServiceCourtesyCodeRecord): boolean {
  const a = Buffer.from(hashCourtesyCode(raw));
  const b = Buffer.from(record.code_hash);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export type CourtesyValidationResult =
  | { ok: true; discount_cents: number; final_total_cents: number }
  | { ok: false; reason: string };

export function validateCourtesyForQuote(
  record: ServiceCourtesyCodeRecord,
  quote: ExistingLocationQuote,
  opts: { clientEmail: string | null; clientUserId: string | null; now?: Date },
): CourtesyValidationResult {
  const now = opts.now ?? new Date();
  if (!record.active) return { ok: false, reason: 'CODE_INACTIVE' };
  if (record.redemptions_used >= record.max_redemptions) return { ok: false, reason: 'REDEMPTION_LIMIT' };
  if (new Date(record.valid_from) > now) return { ok: false, reason: 'NOT_YET_VALID' };
  if (record.expires_at && new Date(record.expires_at) < now) return { ok: false, reason: 'EXPIRED' };
  if (record.eligible_email && opts.clientEmail?.toLowerCase() !== record.eligible_email.toLowerCase()) {
    return { ok: false, reason: 'EMAIL_RESTRICTED' };
  }
  if (record.eligible_client_id && opts.clientUserId !== record.eligible_client_id) {
    return { ok: false, reason: 'CLIENT_RESTRICTED' };
  }

  const discount = computeCourtesyDiscount(record.discount_type, record.discount_value, quote);
  const finalTotal = Math.max(0, quote.subtotal_cents - discount);
  return { ok: true, discount_cents: discount, final_total_cents: finalTotal };
}

export function computeCourtesyDiscount(
  type: CourtesyDiscountType,
  value: number,
  quote: ExistingLocationQuote,
): number {
  switch (type) {
    case 'PERCENT_100':
    case 'FULL_CASE_COMP':
      return quote.subtotal_cents;
    case 'FIXED_AMOUNT':
      return Math.min(quote.subtotal_cents, Math.round(value));
    case 'DIAGNOSIS_ONLY':
      return Math.min(quote.subtotal_cents, quote.diagnosis_fee_cents);
    case 'LABOR_ONLY':
      return Math.min(
        quote.subtotal_cents,
        quote.line_items.filter((l) => l.code !== 'DIAGNOSIS').reduce((s, l) => s + l.amount_cents, 0),
      );
    case 'SPECIFIC_SERVICE':
      return Math.min(quote.subtotal_cents, Math.round(value));
    default:
      return 0;
  }
}
