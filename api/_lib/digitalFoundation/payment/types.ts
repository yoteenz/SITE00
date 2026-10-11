export type PaymentSurfaceKind = 'STRIPE_HOSTED_CHECKOUT' | 'STRIPE_EMBEDDED_CHECKOUT' | 'OTHER_APPROVED_PROVIDER';

export type CreateCheckoutInput = {
  artifact_id: string;
  quote_id: string;
  quote_version: number;
  lead_id: string;
  referral_source_id: string | null;
  service_type: string;
  amount_minor: number;
  currency: string;
  success_url: string;
  cancel_url: string;
  line_description: string;
};

export type CreateCheckoutResult =
  | { ok: true; provider: PaymentSurfaceKind; session_id: string; url: string }
  | { ok: false; code: 'PAYMENT_NOT_CONFIGURED' | 'PROVIDER_ERROR'; message: string };

export interface FoundationPaymentAdapter {
  readonly kind: PaymentSurfaceKind;
  readonly configured: boolean;
  createHostedCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult>;
}
