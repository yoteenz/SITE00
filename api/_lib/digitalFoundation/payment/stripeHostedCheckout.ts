import type { CreateCheckoutInput, CreateCheckoutResult, FoundationPaymentAdapter } from './types.js';

function stripeSecret(): string | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim() || process.env.SITE00_STRIPE_SECRET_KEY?.trim();
  return key || null;
}

function formEncode(data: Record<string, string | number>): string {
  return Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
}

export function createStripeHostedCheckoutAdapter(): FoundationPaymentAdapter {
  const secret = stripeSecret();
  return {
    kind: 'STRIPE_HOSTED_CHECKOUT',
    configured: Boolean(secret),
    async createHostedCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
      if (!secret) {
        return { ok: false, code: 'PAYMENT_NOT_CONFIGURED', message: 'Stripe secret key not configured (test mode expected).' };
      }
      const body = formEncode({
        mode: 'payment',
        success_url: input.success_url,
        cancel_url: input.cancel_url,
        'line_items[0][price_data][currency]': input.currency.toLowerCase(),
        'line_items[0][price_data][unit_amount]': input.amount_minor,
        'line_items[0][price_data][product_data][name]': input.line_description,
        'line_items[0][quantity]': 1,
        'metadata[artifact_id]': input.artifact_id,
        'metadata[quote_id]': input.quote_id,
        'metadata[quote_version]': input.quote_version,
        'metadata[lead_id]': input.lead_id,
        'metadata[referral_source_id]': input.referral_source_id ?? '',
        'metadata[service_type]': input.service_type,
      });

      const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });
      const json = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };
      if (!res.ok || !json.id || !json.url) {
        return {
          ok: false,
          code: 'PROVIDER_ERROR',
          message: json.error?.message ?? `Stripe HTTP ${res.status}`,
        };
      }
      return { ok: true, provider: 'STRIPE_HOSTED_CHECKOUT', session_id: json.id, url: json.url };
    },
  };
}

/** Test-mode simulation when Stripe is not configured (never marks paid from redirect). */
export function createSimulatedCheckoutAdapter(): FoundationPaymentAdapter {
  return {
    kind: 'STRIPE_HOSTED_CHECKOUT',
    configured: true,
    async createHostedCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
      const session_id = `cs_test_sim_${input.artifact_id.slice(0, 8)}`;
      const url = `${input.success_url}${input.success_url.includes('?') ? '&' : '?'}simulated_checkout=1&session_id=${session_id}`;
      return { ok: true, provider: 'STRIPE_HOSTED_CHECKOUT', session_id, url };
    },
  };
}

function createFailClosedCheckoutAdapter(): FoundationPaymentAdapter {
  return {
    kind: 'STRIPE_HOSTED_CHECKOUT',
    configured: false,
    async createHostedCheckout() {
      return {
        ok: false,
        code: 'PAYMENT_NOT_CONFIGURED',
        message: 'Stripe is not configured for production checkout.',
      };
    },
  };
}

export function getFoundationPaymentAdapter(): FoundationPaymentAdapter {
  const forceSim =
    process.env.SITE00_DIGITAL_FOUNDATION_STRIPE_SIM === '1' ||
    process.env.VITEST === 'true' ||
    process.env.NODE_ENV === 'test';
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  const stripe = createStripeHostedCheckoutAdapter();
  if (stripe.configured) return stripe;
  if (isProduction && !forceSim) {
    return createFailClosedCheckoutAdapter();
  }
  if (forceSim) {
    return createSimulatedCheckoutAdapter();
  }
  return createSimulatedCheckoutAdapter();
}
