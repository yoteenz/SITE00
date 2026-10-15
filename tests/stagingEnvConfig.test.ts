import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildEnvVarGroups,
  detectStripeKeyMode,
  effectivePublicAppOrigin,
  extractSupabaseProjectRefFromUrl,
  isSupabaseIsolationVerifiedForStaging,
  resolveConfiguredPublicAppOrigin,
  SITE00_STAGING_FRONTEND_ORIGIN,
  SITE00_STAGING_SUPABASE_PROJECT_REF,
} from '../api/_lib/digitalFoundation/stagingEnvConfig.js';

beforeEach(() => {
  vi.unstubAllEnvs();
});

describe('staging env config', () => {
  it('parses Supabase project ref from URL', () => {
    expect(extractSupabaseProjectRefFromUrl(`https://${SITE00_STAGING_SUPABASE_PROJECT_REF}.supabase.co`)).toBe(
      SITE00_STAGING_SUPABASE_PROJECT_REF,
    );
  });

  it('detects Stripe test mode from prefix only', () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_abc');
    expect(detectStripeKeyMode()).toBe('test');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_abc');
    expect(detectStripeKeyMode()).toBe('live');
  });

  it('falls back to production marketing origin when public app origin unset', () => {
    expect(resolveConfiguredPublicAppOrigin()).toBeNull();
    expect(effectivePublicAppOrigin()).toBe('https://site00.com');
  });

  it('uses configured HTTPS public origin', () => {
    vi.stubEnv('SITE00_PUBLIC_APP_ORIGIN', SITE00_STAGING_FRONTEND_ORIGIN);
    expect(effectivePublicAppOrigin()).toBe(SITE00_STAGING_FRONTEND_ORIGIN);
  });

  it('groups Stripe aliases as one satisfied requirement', () => {
    vi.stubEnv('SITE00_STRIPE_SECRET_KEY', 'sk_test_x');
    const stripe = buildEnvVarGroups().find((g) => g.id === 'stripe_secret');
    expect(stripe?.satisfied).toBe(true);
    expect(stripe?.present_names).toContain('SITE00_STRIPE_SECRET_KEY');
    expect(stripe?.status).toBe('UNVERIFIED');
  });

  it('returns false for isolation when SUPABASE_URL is unset', () => {
    expect(isSupabaseIsolationVerifiedForStaging()).toBe(false);
  });
});
