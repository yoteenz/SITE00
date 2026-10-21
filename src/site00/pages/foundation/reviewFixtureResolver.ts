import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import type { ReviewBootstrapBundle } from './digitalFoundationReviewBootstrap';
import type { DfReviewEntry } from './digitalFoundationReviewRegistry';

export function reviewFixtureForEntry(
  entry: DfReviewEntry | undefined,
  bundle: ReviewBootstrapBundle | null,
  fallbacks: {
    quote?: ClientDigitalFoundationPayload | null;
    paid?: ClientDigitalFoundationPayload | null;
    paidToken?: string;
    postIntake?: ClientDigitalFoundationPayload | null;
    proposalReady?: ClientDigitalFoundationPayload | null;
    paymentFailure?: ClientDigitalFoundationPayload | null;
    complete?: ClientDigitalFoundationPayload | null;
    completeToken?: string;
  },
): { token: string; payload: ClientDigitalFoundationPayload } | null {
  if (!entry?.fixtureContract) return null;
  const key = entry.fixtureContract as keyof ReviewBootstrapBundle['fixtures'];
  const fromBundle = bundle?.fixtures?.[key];
  if (fromBundle?.payload) return { token: fromBundle.token, payload: fromBundle.payload };

  switch (entry.fixtureContract) {
    case 'A_BASE':
      return fallbacks.quote ? { token: '', payload: fallbacks.quote } : null;
    case 'J_PAYMENT_SUCCESS':
      return fallbacks.paid ? { token: fallbacks.paidToken ?? '', payload: fallbacks.paid } : null;
    case 'J_SIGNATURE_APPROVAL':
      return fromBundle?.payload ? { token: fromBundle.token, payload: fromBundle.payload } : null;
    case 'INTAKE_SUBMITTED':
      return fallbacks.postIntake ? { token: '', payload: fallbacks.postIntake } : null;
    case 'PROPOSAL_READY':
      return fallbacks.proposalReady ? { token: '', payload: fallbacks.proposalReady } : null;
    case 'K_PAYMENT_FAILURE':
      return fallbacks.paymentFailure ? { token: '', payload: fallbacks.paymentFailure } : null;
    case 'M_COMPLETE_CREDIT':
      return fallbacks.complete ? { token: fallbacks.completeToken ?? '', payload: fallbacks.complete } : null;
    default:
      return null;
  }
}
