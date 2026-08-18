/** Profile fields clients must never set via PATCH /api/profile (Stripe webhooks + admin only). */
export const PROFILE_PRIVILEGED_BODY_KEYS = [
  'role',
  'membershipType',
  'membership_type',
  'subscriptionTier',
  'subscription_tier',
  'subscriptionEndDate',
  'subscription_end_date',
  'subscriptionPurchasedAt',
  'subscription_purchased_at',
  'subscriptionPeriodEnd',
  'subscription_period_end',
  'autoRenewMembership',
  'auto_renew_membership',
  'currentTierName',
  'current_tier_name',
  'tier',
  'loyaltyPoints',
  'loyalty_points',
  'giftCardBalance',
  'gift_card_balance',
  'hasMadeFirstPurchase',
  'has_made_first_purchase',
  'unlockedDiscounts',
  'unlocked_discounts',
  'voucherList',
  'voucher_list',
  'voucherHistory',
  'voucher_history',
  'digitalCashHistory',
  'digital_cash_history',
  'slayTicketBalance',
  'slay_ticket_balance',
  'welcomeDiscountTiersCreditedByPeriod',
  'welcome_discount_tiers_credited_by_period',
  'stripeCustomerId',
  'stripeDefaultPaymentMethodId',
  'stripeSubscriptionId',
  'stripeSubscriptionStatus',
  'stripe_customer_id',
  'stripe_default_payment_method_id',
  'stripe_subscription_id',
  'stripe_subscription_status',
  'lastPaymentFailureAt',
  'last_payment_failure_at',
] as const;

export function stripPrivilegedProfileBody(body: Record<string, unknown>): Record<string, unknown> {
  const out = { ...body };
  for (const k of PROFILE_PRIVILEGED_BODY_KEYS) {
    delete out[k];
  }
  return out;
}
