import type { DigitalFoundationCommercialConfig } from './types.js';

/** Founder-review defaults — not immutable commercial terms. */
export function defaultDigitalFoundationCommercialConfig(): DigitalFoundationCommercialConfig {
  return {
    base_price_minor: 50_000,
    base_currency: 'USD',
    base_min_business_days: 2,
    base_max_business_days: 3,
    base_service_version: 'df-v1-base',
    quote_expiry_days: 14,
    terms_version: 'df-terms-v1',
    foundation_credit_amount_minor: 20_000,
    foundation_credit_validity_days: 30,
    expedited_premium_minor: null,
    third_party_cost_notice:
      'Domain registration, Google Workspace, Microsoft 365, and other provider subscriptions are typically paid directly to those providers unless explicitly included in your quote.',
  };
}
