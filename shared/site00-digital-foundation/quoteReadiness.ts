import type {
  DigitalFoundationArtifact,
  DigitalFoundationQuote,
  QuoteAcceptanceRecord,
} from './types.js';

export type QuotePayabilityCode =
  | 'QUOTE_MISSING'
  | 'QUOTE_NOT_ACCEPTED'
  | 'ACCEPTANCE_VERSION_MISMATCH'
  | 'QUOTE_EXPIRED'
  | 'QUOTE_SUPERSEDED'
  | 'MANUAL_REVIEW_PENDING'
  | 'CUSTOM_PRICING_PENDING'
  | 'ARTIFACT_STATE_INVALID';

export type QuotePayability = { ok: true } | { ok: false; code: QuotePayabilityCode; message: string };

export function assessQuotePayability(input: {
  artifact: DigitalFoundationArtifact;
  quote: DigitalFoundationQuote | null;
  acceptance: QuoteAcceptanceRecord | null;
  now?: Date;
}): QuotePayability {
  const now = input.now ?? new Date();
  const { artifact, quote, acceptance } = input;

  if (!quote) {
    return { ok: false, code: 'QUOTE_MISSING', message: 'Quote is not ready.' };
  }
  if (quote.status === 'SUPERSEDED' || quote.status === 'EXPIRED') {
    return { ok: false, code: 'QUOTE_SUPERSEDED', message: 'Quote is no longer current.' };
  }
  if (new Date(quote.expires_at).getTime() < now.getTime()) {
    return { ok: false, code: 'QUOTE_EXPIRED', message: 'Quote has expired.' };
  }
  if (quote.status !== 'ACCEPTED') {
    return { ok: false, code: 'QUOTE_NOT_ACCEPTED', message: 'Quote must be accepted before checkout.' };
  }
  if (!acceptance || acceptance.quote_version !== quote.quote_version) {
    return {
      ok: false,
      code: 'ACCEPTANCE_VERSION_MISMATCH',
      message: 'Accepted quote version does not match the current quote.',
    };
  }
  if (artifact.state !== 'AWAITING_PAYMENT') {
    return { ok: false, code: 'ARTIFACT_STATE_INVALID', message: 'Checkout is not allowed in the current project state.' };
  }

  const manualLines = quote.selected_addons.filter((l) => l.requires_manual_review);
  if (manualLines.length > 0 && !quote.founder_commercial_ready) {
    return {
      ok: false,
      code: 'MANUAL_REVIEW_PENDING',
      message: 'Manual review services require founder confirmation before checkout.',
    };
  }

  const pendingCustom = quote.selected_addons.some(
    (l) => l.addon_id === 'CUSTOM_FOUNDATION_WORK' && l.line_total_minor <= 0,
  );
  if (pendingCustom && !quote.founder_commercial_ready) {
    return {
      ok: false,
      code: 'CUSTOM_PRICING_PENDING',
      message: 'Custom work pricing is pending founder review.',
    };
  }

  return { ok: true };
}
