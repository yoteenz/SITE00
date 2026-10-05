/** Map DB profile row (snake_case or camelCase) to app shape (camelCase). Shared by profile and admin APIs. */
export function fromProfileRow(row: Record<string, unknown>): Record<string, unknown> {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    firstName: row.first_name ?? row.firstName,
    lastName: row.last_name ?? row.lastName,
    phoneNumber: row.phone_number ?? row.phoneNumber,
    birthday: row.birthday,
    facebook: row.facebook,
    instagram: row.instagram,
    youtube: row.youtube,
    tiktok: row.tiktok,
    twitter: row.twitter,
    profileImage: row.profile_image ?? row.profileImage,
    membershipType: row.membership_type ?? row.membershipType,
    subscriptionTier: row.subscription_tier ?? row.subscriptionTier,
    stripeCustomerId: row.stripe_customer_id ?? row.stripeCustomerId,
    stripeDefaultPaymentMethodId:
      row.stripe_default_payment_method_id ?? row.stripeDefaultPaymentMethodId,
    stripeSubscriptionId: row.stripe_subscription_id ?? row.stripeSubscriptionId,
    autoRenewMembership: row.auto_renew_membership ?? row.autoRenewMembership,
    subscriptionEndDate: row.subscription_period_end ?? row.subscriptionEndDate,
    subscriptionPurchasedAt: row.subscription_purchased_at ?? row.subscriptionPurchasedAt,
    stripeSubscriptionStatus: row.stripe_subscription_status ?? row.stripeSubscriptionStatus,
    lastPaymentFailureAt: row.last_payment_failure_at ?? row.lastPaymentFailureAt,
    currentTierName: row.current_tier_name ?? row.currentTierName ?? row.tier,
    defaultAddress: row.default_address,
    shippingAddress: row.shipping_address,
    savedAddresses: row.saved_addresses,
    referralCode: row.referral_code,
    giftCardBalance: row.gift_card_balance,
    hasMadeFirstPurchase: row.has_made_first_purchase,
    loyaltyPoints: row.loyalty_points,
    unlockedDiscounts: row.unlocked_discounts,
    voucherList: row.voucher_list,
    voucherHistory: row.voucher_history,
    digitalCashHistory: row.digital_cash_history,
    slayTicketBalance: row.slay_ticket_balance ?? 0,
    welcomeDiscountTiersCreditedByPeriod: row.welcome_discount_tiers_credited_by_period,
    notificationNewsletter:
      (row.notification_newsletter as boolean | null | undefined) ??
      (row.notificationNewsletter as boolean | null | undefined) ??
      true,
    notificationSales:
      (row.notification_sales as boolean | null | undefined) ??
      (row.notificationSales as boolean | null | undefined) ??
      true,
    notificationOrderTracking:
      (row.notification_order_tracking as boolean | null | undefined) ??
      (row.notificationOrderTracking as boolean | null | undefined) ??
      true,
    userSubmittedReviews: row.user_submitted_reviews ?? row.userSubmittedReviews ?? [],
    affiliateSubmittedContent: row.affiliate_submitted_content ?? row.affiliateSubmittedContent ?? {},
    signedOrderForms: row.signed_order_forms ?? row.signedOrderForms ?? [],
    reviewSupplementalOverlay: row.review_supplemental_overlay ?? row.reviewSupplementalOverlay ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
