import type { DigitalFoundationArtifact, DigitalFoundationQuote } from './types.js';

/** G-02 — withhold proposal/pricing from the client until founder commercial release. */
export function shouldWithholdClientQuoteFromClient(
  artifact: DigitalFoundationArtifact,
  quote: DigitalFoundationQuote | null | undefined,
): boolean {
  if (!quote) return false;
  if (artifact.payment_state === 'PAID') return false;
  if (artifact.project_state !== 'NOT_STARTED') return false;
  if (artifact.completion_state === 'COMPLETE') return false;
  if (quote.status === 'PAID' || quote.status === 'ACCEPTED') return false;
  return !quote.founder_commercial_ready;
}
