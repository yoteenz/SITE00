/**
 * Provider inventory (repository truth on 2026-10-08) and the provider-neutral implementation contract.
 *
 * Nothing here sends email. The only implementation is a dry-run provider that records what would be sent and always
 * reports NOT_SENT. A real provider adapter is added later by COMPOSER, behind this contract, with founder approval.
 */

import type { ConsentClass, EmailAssetClass, EmailFamilyId, EmailId, PersonalizationLevel, PreferenceCategory } from './types.js';

export type ProviderFinding = { readonly area: string; readonly finding: string; readonly paths: readonly string[]; readonly verdict: 'EXISTS' | 'EXISTS_RENDER_ONLY' | 'EXISTS_NOT_MOUNTED' | 'STUB_ONLY' | 'NOT_IN_REPO' | 'ABSENT' };

export const PROVIDER_INVENTORY: readonly ProviderFinding[] = [
  {
    area: 'JURNL email delivery',
    finding: 'No JURNL email is sent today. The shipped app mounts JURNL in design-preview mode, whose auth adapter is device-local and simulates verification and reset links.',
    paths: ['src/site00/projectRuntime/ProjectRuntimeRoute.tsx', 'src/projects/jurnl/runtime/state/adapters.ts'],
    verdict: 'ABSENT',
  },
  {
    area: 'Supabase Auth (JURNL production adapter)',
    finding: 'signUp, auth.resend({ type: "signup" }) and resetPasswordForEmail would make Supabase send its own "Confirm signup" and "Reset password" emails. The adapter exists but is never mounted. No emailRedirectTo / redirectTo is passed; PASSWORD_RECOVERY is not handled; changeEmail is stubbed.',
    paths: ['src/projects/jurnl/runtime/state/supabaseAuthAdapter.ts', 'src/projects/jurnl/runtime/state/store.tsx'],
    verdict: 'EXISTS_NOT_MOUNTED',
  },
  {
    area: 'Supabase email templates / SMTP',
    finding: 'Auth email templates, sender and SMTP are configured in the Supabase dashboard; there is no supabase/config.toml or template file in this repository, so their current content cannot be verified from source.',
    paths: ['supabase/migrations (no auth email config)'],
    verdict: 'NOT_IN_REPO',
  },
  {
    area: 'SITE 00 email registry (studio product, not JURNL)',
    finding: 'shared/site00-email renders the SITE 00 template pack (families, archetypes, compositions, fixtures). api/_lib/email/sendEmail.ts renders and logs; when EMAIL_PROVIDER is unset it records "not-configured", and when set it only marks the send queued — no provider call exists. Idempotency is in memory.',
    paths: ['shared/site00-email/', 'api/_lib/email/sendEmail.ts', 'shared/site00-email/sendLog.ts'],
    verdict: 'EXISTS_RENDER_ONLY',
  },
  {
    area: 'Resend / SendGrid',
    finding: 'Catalogue entries for the SITE 00 Evolve marketing OS with StubEmailAdapter (no send implementation); credentials RESEND_API_KEY / SENDGRID_API_KEY not wired to any send path.',
    paths: ['api/_lib/site00Evolve/providers/registry.ts', 'api/_lib/site00Evolve/providers/adapters/index.ts'],
    verdict: 'STUB_ONLY',
  },
  {
    area: 'Postmark / Mailgun / SES / SMTP / nodemailer / marketing platform',
    finding: 'Not present in dependencies or code.',
    paths: ['package.json'],
    verdict: 'ABSENT',
  },
  {
    area: 'Email preview tooling',
    finding: 'SITE 00 admin has an email pack gallery and template detail pages rendering shared/site00-email (site00/debug/email-pack). JURNL has none.',
    paths: ['src/site00/admin/pages/debug/EmailPackGalleryPage.tsx', 'src/site00/admin/pages/debug/EmailTemplateDetailPage.tsx', 'src/routes/Site00AdminRoutes.tsx'],
    verdict: 'EXISTS',
  },
  {
    area: 'JURNL server persistence (trigger input)',
    finding: 'GET/PUT /api/jurnl/repository stores each user’s snapshot (consent, settings, money data) in jurnl_user_snapshots, keyed by Supabase auth user id — the natural input for server-side triggers. Reachable in production mode only.',
    paths: ['api/jurnl/repository.ts', 'supabase/migrations/20261006103000_jurnl_production_persistence.sql', 'server/routes.ts'],
    verdict: 'EXISTS_NOT_MOUNTED',
  },
];

export const PROVIDER_DECISION = [
  'No provider is introduced or replaced in this sprint.',
  'Auth emails (A02, A08) stay with Supabase Auth; the JURNL authority will be applied through Supabase custom templates or a Send Email Hook once approved.',
  'Lifecycle mail (A01, A03–A07) needs a delivery provider chosen by the founder later; it plugs in behind the EmailProvider contract (provider-contract.md).',
  'JURNL email stays separate from the SITE 00 email registry: same idempotency and send-log ideas, different product, different families.',
] as const;

/* ── Provider-neutral implementation contract ─────────────────────────────── */

export type EmailDefinition = {
  readonly id: EmailId;
  readonly family: EmailFamilyId;
  readonly consentClass: ConsentClass;
  readonly preferenceCategory: PreferenceCategory;
  readonly personalization: PersonalizationLevel;
  readonly templateVersion: string;
};

export type EmailRecipient = {
  /** Supabase auth user id. */
  readonly userId: string;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly firstName?: string;
  readonly timezone?: string;
  readonly locale?: string;
};

/** Live values for L3–L5. Strings are already formatted for display (currency, dates). */
export type EmailPayload = {
  readonly state: string;
  readonly values: Readonly<Record<string, string | number | readonly Record<string, string>[]>>;
  readonly links: Readonly<Record<string, string>>;
  /** Present only for fixtures; delivery refuses any payload that carries it. */
  readonly fixture?: 'DEMO_ONLY';
  /** As-of time of the financial values (P2 / P3). */
  readonly asOf?: string;
};

export type EmailAssetSet = {
  readonly lineageGroup: string;
  readonly assets: readonly { readonly slot: string; readonly assetClass: EmailAssetClass; readonly url: string; readonly width: number; readonly height: number; readonly alt: string }[];
};

export type EmailTemplate = {
  readonly id: EmailId;
  readonly version: string;
  readonly render: (payload: EmailPayload, assets: EmailAssetSet) => { readonly subject: string; readonly preheader: string; readonly html: string; readonly text: string };
};

export type EmailDeliveryRequest = {
  readonly definition: EmailDefinition;
  readonly recipient: EmailRecipient;
  readonly payload: EmailPayload;
  readonly idempotencyKey: string;
  readonly headers?: Readonly<Record<string, string>>;
};

export type EmailDeliveryResult = {
  readonly status: 'SENT' | 'QUEUED' | 'SUPPRESSED' | 'DUPLICATE' | 'FAILED' | 'NOT_SENT_DRY_RUN' | 'REFUSED_FIXTURE';
  readonly providerMessageId?: string;
  readonly reason?: string;
  readonly at: string;
};

export type EmailPreference = { readonly userId: string; readonly category: PreferenceCategory; readonly on: boolean; readonly version: string; readonly updatedAt: string; readonly source: string };

export type EmailEvent = {
  readonly type: 'REQUESTED' | 'SUPPRESSED' | 'DELIVERED' | 'BOUNCED' | 'OPENED' | 'CTA_CLICKED' | 'DEEP_LINK_OPENED' | 'UNSUBSCRIBED' | 'PREFERENCE_CHANGED' | 'CONVERSION_EVENT';
  readonly emailId: EmailId;
  readonly userId: string;
  readonly idempotencyKey: string;
  readonly at: string;
  readonly detail?: string;
};

/** What a real provider adapter must implement. */
export interface EmailProvider {
  readonly id: string;
  send(request: EmailDeliveryRequest, rendered: { subject: string; preheader: string; html: string; text: string }): Promise<EmailDeliveryResult>;
}

/** Records requests, never sends. Refuses fixture payloads exactly as a real adapter must. */
export function createDryRunEmailProvider(): EmailProvider & { readonly log: readonly EmailDeliveryRequest[] } {
  const log: EmailDeliveryRequest[] = [];
  return {
    id: 'dry-run',
    log,
    async send(request) {
      const at = new Date().toISOString();
      if (request.payload.fixture) return { status: 'REFUSED_FIXTURE', reason: 'Fixture data is never delivered.', at };
      log.push(request);
      return { status: 'NOT_SENT_DRY_RUN', at };
    },
  };
}

/** Delivery guards every adapter applies before calling its provider. */
export function deliveryGuard(request: EmailDeliveryRequest, preference: (c: PreferenceCategory) => boolean): EmailDeliveryResult | null {
  const at = new Date().toISOString();
  if (request.payload.fixture) return { status: 'REFUSED_FIXTURE', reason: 'Fixture data is never delivered.', at };
  const { consentClass, preferenceCategory, id } = request.definition;
  if (!request.recipient.emailVerified && id !== 'A02') return { status: 'SUPPRESSED', reason: 'Address not verified.', at };
  if (consentClass !== 'TRANSACTIONAL' && !preference(preferenceCategory)) return { status: 'SUPPRESSED', reason: `${preferenceCategory} is off.`, at };
  return null;
}
