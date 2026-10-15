/**
 * Non-secret staging / Digital Foundation environment interpretation for founder readiness.
 */

export const SITE00_PRODUCTION_SUPABASE_PROJECT_REF = 'hyycomvcaqxxvyrfupes';
export const SITE00_STAGING_SUPABASE_PROJECT_REF = 'soocqbyjkxeubfjnuwvf';

export const SITE00_STAGING_FRONTEND_ORIGIN = 'https://carefree-luck-staging.up.railway.app';
export const SITE00_STAGING_API_ORIGIN = 'https://reliable-creation-staging.up.railway.app';

export type IntegrationStatusLabel = 'READY' | 'ACTION_REQUIRED' | 'BLOCKED' | 'UNVERIFIED';

export type EnvVarGroup = {
  id: string;
  primary: string;
  aliases: string[];
  purpose: string;
  required: boolean;
  /** At least one name in primary + aliases is set. */
  satisfied: boolean;
  /** Names that are set (presence only). */
  present_names: string[];
  status: IntegrationStatusLabel;
  note?: string;
};

export type StripeKeyMode = 'test' | 'live' | 'missing' | 'unrecognized';

export function extractSupabaseProjectRefFromUrl(url: string | undefined | null): string | null {
  const raw = url?.trim();
  if (!raw) return null;
  try {
    const host = new URL(raw.replace(/\/$/, '')).hostname;
    const m = host.match(/^([a-z0-9]+)\.supabase\.co$/i);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}

export function resolveStripeSecretRaw(): string | undefined {
  return process.env.STRIPE_SECRET_KEY?.trim() || process.env.SITE00_STRIPE_SECRET_KEY?.trim() || undefined;
}

export function detectStripeKeyMode(): StripeKeyMode {
  const key = resolveStripeSecretRaw();
  if (!key) return 'missing';
  if (key.startsWith('sk_test_')) return 'test';
  if (key.startsWith('sk_live_')) return 'live';
  return 'unrecognized';
}

export function resolveConfiguredPublicAppOrigin(): string | null {
  const raw =
    process.env.SITE00_PUBLIC_APP_ORIGIN?.trim() || process.env.VITE_SITE00_PUBLIC_ORIGIN?.trim() || undefined;
  if (!raw || !/^https:\/\//i.test(raw)) return null;
  return raw.replace(/\/$/, '');
}

export function effectivePublicAppOrigin(): string {
  return resolveConfiguredPublicAppOrigin() ?? 'https://site00.com';
}

export function publicOriginUsesProductionDefault(): boolean {
  return resolveConfiguredPublicAppOrigin() === null;
}

export function isSupabaseIsolationVerifiedForStaging(): boolean {
  const ref = extractSupabaseProjectRefFromUrl(process.env.SUPABASE_URL);
  if (!ref) return false;
  if (ref === SITE00_PRODUCTION_SUPABASE_PROJECT_REF) return false;
  return ref === SITE00_STAGING_SUPABASE_PROJECT_REF;
}

function envPresent(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

function groupStatus(satisfied: boolean, required: boolean): IntegrationStatusLabel {
  if (satisfied) return 'READY';
  return required ? 'ACTION_REQUIRED' : 'UNVERIFIED';
}

export function buildEnvVarGroups(): EnvVarGroup[] {
  const stripeSecret = resolveStripeSecretRaw();
  const stripeWebhook = Boolean(
    process.env.STRIPE_WEBHOOK_SECRET?.trim() || process.env.SITE00_STRIPE_WEBHOOK_SECRET?.trim(),
  );
  const resendWebhook = Boolean(
    process.env.RESEND_WEBHOOK_SECRET?.trim() || process.env.SITE00_RESEND_WEBHOOK_SECRET?.trim(),
  );
  const publicOrigin = resolveConfiguredPublicAppOrigin();
  const stripeMode = detectStripeKeyMode();

  const stripeSecretNames = ['STRIPE_SECRET_KEY', 'SITE00_STRIPE_SECRET_KEY'].filter(envPresent);
  const stripeWebhookNames = ['STRIPE_WEBHOOK_SECRET', 'SITE00_STRIPE_WEBHOOK_SECRET'].filter(envPresent);
  const resendWebhookNames = ['RESEND_WEBHOOK_SECRET', 'SITE00_RESEND_WEBHOOK_SECRET'].filter(envPresent);
  const publicOriginNames = ['SITE00_PUBLIC_APP_ORIGIN', 'VITE_SITE00_PUBLIC_ORIGIN'].filter(envPresent);

  return [
    {
      id: 'founder_test_mode',
      primary: 'SITE00_DF_FOUNDER_TEST_MODE',
      aliases: [],
      purpose: 'Gates synthetic E2E clients and test-only sends',
      required: true,
      satisfied: envPresent('SITE00_DF_FOUNDER_TEST_MODE'),
      present_names: envPresent('SITE00_DF_FOUNDER_TEST_MODE') ? ['SITE00_DF_FOUNDER_TEST_MODE'] : [],
      status: envPresent('SITE00_DF_FOUNDER_TEST_MODE') ? 'READY' : 'BLOCKED',
    },
    {
      id: 'founder_allowlist',
      primary: 'SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST',
      aliases: [],
      purpose: 'Server-side cap on outbound test email recipients',
      required: true,
      satisfied: envPresent('SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST'),
      present_names: envPresent('SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST')
        ? ['SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST']
        : [],
      status: envPresent('SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST') ? 'READY' : 'ACTION_REQUIRED',
    },
    {
      id: 'transactional_send',
      primary: 'SITE00_DF_TRANSACTIONAL_EMAIL_SEND',
      aliases: [],
      purpose: 'Master switch for Resend dispatch (keep off until founder approves send)',
      required: false,
      satisfied: envPresent('SITE00_DF_TRANSACTIONAL_EMAIL_SEND'),
      present_names: envPresent('SITE00_DF_TRANSACTIONAL_EMAIL_SEND') ? ['SITE00_DF_TRANSACTIONAL_EMAIL_SEND'] : [],
      status: envPresent('SITE00_DF_TRANSACTIONAL_EMAIL_SEND') ? 'UNVERIFIED' : 'READY',
      note: envPresent('SITE00_DF_TRANSACTIONAL_EMAIL_SEND')
        ? 'Flag is ON — still allowlist-gated; E2E send not verified in this sprint'
        : 'Email sending disabled (expected for staging prep)',
    },
    {
      id: 'resend_api',
      primary: 'RESEND_API_KEY',
      aliases: [],
      purpose: 'Resend provider credential (server-only)',
      required: false,
      satisfied: envPresent('RESEND_API_KEY'),
      present_names: envPresent('RESEND_API_KEY') ? ['RESEND_API_KEY'] : [],
      status: groupStatus(envPresent('RESEND_API_KEY'), false),
      note: 'Credential present ≠ delivery verified',
    },
    {
      id: 'resend_webhook',
      primary: 'RESEND_WEBHOOK_SECRET',
      aliases: ['SITE00_RESEND_WEBHOOK_SECRET'],
      purpose: 'Verify Resend webhook signatures (DELIVERED/BOUNCED)',
      required: false,
      satisfied: resendWebhook,
      present_names: resendWebhookNames,
      status: groupStatus(resendWebhook, false),
    },
    {
      id: 'transactional_from',
      primary: 'SITE00_DF_TRANSACTIONAL_FROM',
      aliases: [],
      purpose: 'Verified sender identity for FNDATN emails',
      required: false,
      satisfied: envPresent('SITE00_DF_TRANSACTIONAL_FROM'),
      present_names: envPresent('SITE00_DF_TRANSACTIONAL_FROM') ? ['SITE00_DF_TRANSACTIONAL_FROM'] : [],
      status: groupStatus(envPresent('SITE00_DF_TRANSACTIONAL_FROM'), false),
    },
    {
      id: 'transactional_reply_to',
      primary: 'SITE00_DF_TRANSACTIONAL_REPLY_TO',
      aliases: [],
      purpose: 'Reply-To header for client replies',
      required: false,
      satisfied: envPresent('SITE00_DF_TRANSACTIONAL_REPLY_TO'),
      present_names: envPresent('SITE00_DF_TRANSACTIONAL_REPLY_TO') ? ['SITE00_DF_TRANSACTIONAL_REPLY_TO'] : [],
      status: groupStatus(envPresent('SITE00_DF_TRANSACTIONAL_REPLY_TO'), false),
    },
    {
      id: 'df_persist',
      primary: 'SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE',
      aliases: [],
      purpose: 'Durable DF storage in Supabase (exact name only; value must be 1)',
      required: false,
      satisfied: process.env.SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE === '1',
      present_names:
        process.env.SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE === '1'
          ? ['SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE']
          : [],
      status:
        process.env.SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE === '1'
          ? 'UNVERIFIED'
          : 'ACTION_REQUIRED',
      note:
        process.env.SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE === '1'
          ? 'Persistence flag on — schema + RLS must be verified before E2E'
          : 'Off — API uses in-memory store; restarts lose test clients',
    },
    {
      id: 'stripe_secret',
      primary: 'STRIPE_SECRET_KEY',
      aliases: ['SITE00_STRIPE_SECRET_KEY'],
      purpose: 'Stripe Checkout (use TEST keys on staging)',
      required: false,
      satisfied: Boolean(stripeSecret),
      present_names: stripeSecretNames,
      status: !stripeSecret
        ? 'ACTION_REQUIRED'
        : stripeMode === 'test'
          ? 'UNVERIFIED'
          : stripeMode === 'live'
            ? 'BLOCKED'
            : 'UNVERIFIED',
      note: stripeSecret
        ? `Key mode detected: ${stripeMode} (prefix only, value never logged)`
        : 'Set one Stripe secret variable (TEST recommended)',
    },
    {
      id: 'stripe_webhook',
      primary: 'STRIPE_WEBHOOK_SECRET',
      aliases: ['SITE00_STRIPE_WEBHOOK_SECRET'],
      purpose: 'Verify Stripe webhook signatures',
      required: false,
      satisfied: stripeWebhook,
      present_names: stripeWebhookNames,
      status: groupStatus(stripeWebhook, false),
    },
    {
      id: 'public_app_origin',
      primary: 'SITE00_PUBLIC_APP_ORIGIN',
      aliases: ['VITE_SITE00_PUBLIC_ORIGIN'],
      purpose: 'Invitation, intake, portal, and checkout return URLs in emails/API',
      required: false,
      satisfied: Boolean(publicOrigin),
      present_names: publicOriginNames,
      status: publicOrigin ? 'UNVERIFIED' : 'ACTION_REQUIRED',
      note: publicOrigin
        ? `Configured origin: ${publicOrigin}`
        : `Unset — API falls back to https://site00.com (wrong for staging)`,
    },
    {
      id: 'supabase_url',
      primary: 'SUPABASE_URL',
      aliases: [],
      purpose: 'API database + auth backend (must be staging project on staging API)',
      required: true,
      satisfied: envPresent('SUPABASE_URL'),
      present_names: envPresent('SUPABASE_URL') ? ['SUPABASE_URL'] : [],
      status: isSupabaseIsolationVerifiedForStaging()
        ? 'READY'
        : envPresent('SUPABASE_URL')
          ? 'BLOCKED'
          : 'BLOCKED',
      note: (() => {
        const ref = extractSupabaseProjectRefFromUrl(process.env.SUPABASE_URL);
        if (!ref) return 'Cannot parse project ref from SUPABASE_URL';
        if (ref === SITE00_PRODUCTION_SUPABASE_PROJECT_REF) return 'Points at production Supabase — do not use for staging E2E';
        if (ref === SITE00_STAGING_SUPABASE_PROJECT_REF) return `Staging project ref ${ref}`;
        return `Unexpected project ref ${ref}`;
      })(),
    },
  ];
}
