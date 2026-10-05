import type { AccessRequirement, ExistingLocationPlatform } from './types';

/** Where Shopify behavior may live — diagnostic taxonomy (not automated detection yet). */
export type ShopifyBehaviorSurface =
  | 'THEME'
  | 'APP'
  | 'DISCOUNT_CONFIGURATION'
  | 'SHOPIFY_FUNCTION'
  | 'CUSTOM_APP'
  | 'CART_LOGIC'
  | 'CHECKOUT_LOGIC'
  | 'PRODUCT_VARIANT_CONFIGURATION'
  | 'METAFIELD_METAOBJECT'
  | 'UNKNOWN';

export const SHOPIFY_BEHAVIOR_SURFACES: ShopifyBehaviorSurface[] = [
  'THEME',
  'APP',
  'DISCOUNT_CONFIGURATION',
  'SHOPIFY_FUNCTION',
  'CUSTOM_APP',
  'CART_LOGIC',
  'CHECKOUT_LOGIC',
  'PRODUCT_VARIANT_CONFIGURATION',
  'METAFIELD_METAOBJECT',
  'UNKNOWN',
];

/** Recommended delegated access — never primary account password. */
export function shopifyAccessRequirements(): AccessRequirement[] {
  const base = (partial: Omit<AccessRequirement, 'platform' | 'status' | 'connected_at' | 'revoked_at'>): AccessRequirement => ({
    platform: 'SHOPIFY',
    status: 'NOT_REQUESTED',
    connected_at: null,
    revoked_at: null,
    ...partial,
  });
  return [
    base({
      access_type: 'COLLABORATOR',
      permission_scope: 'Staff collaborator with theme + apps visibility (no owner password).',
      required_or_optional: 'REQUIRED',
      purpose: 'Inspect theme, apps, and discount configuration safely.',
      read_only_supported: true,
      write_required: false,
      temporary_supported: true,
      instructions:
        'In Shopify Admin: Settings → Users → Add staff. Grant theme and app access appropriate to the scope we confirm after diagnosis. We never ask for your primary login password.',
    }),
    base({
      access_type: 'THEME_DEVELOPMENT',
      permission_scope: 'Theme editor / development theme access when changes are approved.',
      required_or_optional: 'OPTIONAL',
      purpose: 'Implement approved fixes on a development or duplicate theme before production.',
      read_only_supported: false,
      write_required: true,
      temporary_supported: true,
      instructions: 'We prefer changes on a duplicate or development theme, then publish after QA — not direct production edits by default.',
    }),
    base({
      access_type: 'GITHUB_REPOSITORY',
      permission_scope: 'Read-only repo access when theme code is version-controlled.',
      required_or_optional: 'OPTIONAL',
      purpose: 'Trace custom Liquid/JS tied to promotions or cart rules.',
      read_only_supported: true,
      write_required: false,
      temporary_supported: true,
      instructions: 'Invite SITE 00 as a collaborator with read-only access if your theme lives in GitHub.',
    }),
    base({
      access_type: 'CUSTOM_APP_API',
      permission_scope: 'Custom app with scoped Admin API (when relevant apps/functions exist).',
      required_or_optional: 'OPTIONAL',
      purpose: 'Inspect Shopify Functions, discount apps, or custom cart logic via API.',
      read_only_supported: true,
      write_required: false,
      temporary_supported: true,
      instructions: 'Only if your stack uses a custom app — we will specify minimal scopes after intake review.',
    }),
  ];
}

export function isShopifyPlatform(platform: ExistingLocationPlatform | null): boolean {
  return platform === 'SHOPIFY';
}

/** Example QA matrix template for promotional/cart issues (not hard-coded to every case). */
export const SHOPIFY_PROMOTION_QA_TEMPLATE: string[] = [
  'CART BELOW MINIMUM',
  'CART ABOVE MINIMUM',
  'ELIGIBLE SAMPLE',
  'RESTRICTED SAMPLE',
  'PROMO STACKING',
  'QUALIFYING ITEM REMOVED',
  'DISCOUNT CODE PRESENT',
  'CART DRAWER',
  'FULL CART',
  'ACCELERATED CHECKOUT',
  'MOBILE',
  'DESKTOP',
];
