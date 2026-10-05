/**
 * Payment provider abstraction — fulfillment depends on commercial events, not Stripe shapes.
 * P0 audit: types only; no provider SDK wiring.
 */

export type PaymentProviderId = 'STRIPE' | 'PAYPAL' | 'INVOICE' | 'MANUAL' | 'UNKNOWN';

export type PaymentProvider = {
  id: PaymentProviderId;
  displayName: string;
  supportsSubscriptions: boolean;
  supportsOneTime: boolean;
  supportsMilestones: boolean;
};

export type CheckoutSession = {
  sessionId: string;
  provider: PaymentProviderId;
  serviceId: string;
  packageId: string | null;
  clientId: string | null;
  amountCents: number | null;
  currency: 'USD';
  mode: 'PAYMENT' | 'SUBSCRIPTION' | 'SETUP';
  status: 'OPEN' | 'COMPLETE' | 'EXPIRED';
  successCommercialEvent: 'PAYMENT_CONFIRMED' | 'SUBSCRIPTION_STARTED';
};

export type PaymentRecord = {
  paymentId: string;
  provider: PaymentProviderId;
  providerPaymentRef: string | null;
  engagementId: string | null;
  projectId: string | null;
  subscriptionOrOrderId: string;
  amountCents: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED';
  confirmedAt: string | null;
};

export type SubscriptionRecord = {
  subscriptionId: string;
  provider: PaymentProviderId;
  providerSubscriptionRef: string | null;
  planId: string;
  clientId: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'PAST_DUE';
  billingCadence: 'MONTHLY' | 'ANNUAL';
  currentPeriodStart: string;
  currentPeriodEnd: string;
};

/** Simulated payment today (marketing confirm-payment, client-production activate) maps here until Stripe. */
export type CommercialActivationEvent = {
  type: 'PAYMENT_CONFIRMED' | 'SUBSCRIPTION_STARTED';
  payment: PaymentRecord | null;
  subscription: SubscriptionRecord | null;
  source: 'MARKETING_ENGAGEMENT' | 'SITE00_PROJECT' | 'ADMIN_EVOLVE_PLAN' | 'MANUAL';
};
