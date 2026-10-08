import { createHmac, timingSafeEqual } from 'node:crypto';
import * as mem from '../memoryStore.js';

function webhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || process.env.SITE00_STRIPE_WEBHOOK_SECRET?.trim() || null;
}

export function verifyStripeSignature(rawBody: string, signatureHeader: string | undefined): boolean {
  const secret = webhookSecret();
  if (!secret) return false;
  if (!signatureHeader) return false;
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => {
      const [k, v] = p.split('=');
      return [k.trim(), v];
    }),
  ) as Record<string, string>;
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  const payload = `${t}.${rawBody}`;
  const expected = createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
  try {
    return timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

type StripeEvent = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
};

export async function processDigitalFoundationStripeEvent(event: StripeEvent): Promise<{ ok: true; duplicate?: boolean }> {
  const s = mem.getDfMemoryState();
  if (s.stripeProcessedEventIds.has(event.id)) {
    return { ok: true, duplicate: true };
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const obj = event.data.object;
      const metadata = (obj.metadata ?? {}) as Record<string, string>;
      const artifactId = metadata.artifact_id;
      const quoteId = metadata.quote_id;
      const paymentStatus = String(obj.payment_status ?? '');
      if (artifactId && quoteId && paymentStatus === 'paid') {
        const { confirmPaymentFromWebhook } = await import('../service.js');
        await confirmPaymentFromWebhook({
          artifact_id: artifactId,
          quote_id: quoteId,
          stripe_event_id: event.id,
          session_id: String(obj.id ?? ''),
        });
      }
      break;
    }
    case 'payment_intent.succeeded': {
      const obj = event.data.object;
      const metadata = (obj.metadata ?? {}) as Record<string, string>;
      if (metadata.artifact_id && metadata.quote_id) {
        const { confirmPaymentFromWebhook } = await import('../service.js');
        await confirmPaymentFromWebhook({
          artifact_id: metadata.artifact_id,
          quote_id: metadata.quote_id,
          stripe_event_id: event.id,
          session_id: String(obj.id ?? ''),
        });
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const obj = event.data.object;
      const metadata = (obj.metadata ?? {}) as Record<string, string>;
      if (metadata.artifact_id) {
        const { recordPaymentFailure } = await import('../service.js');
        recordPaymentFailure(metadata.artifact_id, { event_id: event.id, reason: String(obj.last_payment_error ?? '') });
      }
      break;
    }
    case 'charge.refunded': {
      const obj = event.data.object;
      const metadata = (obj.metadata ?? {}) as Record<string, string>;
      if (metadata.artifact_id) {
        const { recordRefund } = await import('../service.js');
        recordRefund(metadata.artifact_id, { event_id: event.id });
      }
      break;
    }
    default:
      break;
  }

  s.stripeProcessedEventIds.add(event.id);
  return { ok: true };
}

/** Vitest / local simulation without Stripe signature. */
export async function simulateStripeCheckoutCompleted(input: {
  artifact_id: string;
  quote_id: string;
  event_id?: string;
}): Promise<void> {
  const { confirmPaymentFromWebhook } = await import('../service.js');
  await confirmPaymentFromWebhook({
    artifact_id: input.artifact_id,
    quote_id: input.quote_id,
    stripe_event_id: input.event_id ?? `evt_sim_${Date.now()}`,
    session_id: 'cs_sim',
  });
}
