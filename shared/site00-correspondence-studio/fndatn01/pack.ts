/**
 * FNDATN-01 — SITE 00 / DIGITAL FOUNDATION / FOUNDATIONAL CORRESPONDENCE / PACK 01.
 *
 * Seven transactional emails implemented from founder visual authority (14 device references).
 * Registering the pack registers templates and trigger contracts only. Nothing here dispatches
 * email; every trigger is `dispatch_enabled: false` and delivery stays dry-run.
 */

export const FNDATN01_PACK_ID = 'FNDATN-01' as const;
export const FNDATN01_PACK_TITLE = 'SITE 00 / DIGITAL FOUNDATION / FOUNDATIONAL CORRESPONDENCE / PACK 01';
export const FNDATN01_BRAND = 'SITE 00';
export const FNDATN01_VERSION_LABEL = 'FNDATN-01 FOUNDER AUTHORITY';
export const FNDATN01_VERSION_CREATED_AT = '2026-10-12T00:00:00.000Z';
export const FNDATN01_STATUS = 'FOUNDER VISUAL AUTHORITY SUPPLIED / HTML IMPLEMENTATION PENDING VALIDATION / FINAL FOUNDER APPROVAL PENDING';
export const FNDATN01_SOURCE_ATTACHMENT = 'SITE00_FNDATN_7_EMAILS_UNDER_4MB_5cf4.zip';

export const FNDATN01_PUBLIC_ROOT = '/site00-correspondence-studio/fndatn-01';
export const FNDATN01_AUTHORITY_MANIFEST = 'docs/site00/correspondence/fndatn-01/FNDATN_01_AUTHORITY_MANIFEST.json';
export const FNDATN01_ASSET_PROVENANCE = 'docs/site00/correspondence/fndatn-01/FNDATN_01_ASSET_PROVENANCE.json';

/** Derived scheduled conditions. Not artifact events; no scheduler evaluates them yet. */
export type Fndatn01DerivedTrigger = 'INTAKE_RESUME_REMINDER_DUE' | 'QUOTE_EXPIRY_REMINDER_DUE';

export type Fndatn01Trigger =
  | { kind: 'artifact_event'; event: 'ARTIFACT_CREATED' | 'INTAKE_COMPLETED' | 'QUOTE_CREATED' | 'PAYMENT_CONFIRMED' | 'FOUNDATION_COMPLETED' }
  | { kind: 'derived_condition'; condition: Fndatn01DerivedTrigger };

export type Fndatn01EmailId = '01' | '02' | '03' | '04' | '05' | '06' | '07';

export type Fndatn01Email = {
  id: Fndatn01EmailId;
  slug: string;
  title: string;
  template_id: string;
  /** True when the template id is new to the lifecycle registry with this pack. */
  new_template: boolean;
  role: 'lifecycle' | 'conditional_recovery';
  purpose: string;
  trigger: Fndatn01Trigger;
  eligibility: string[];
  never_send_when: string[];
  cta_label: string;
  cta_destination: string;
  /** Separate contracts this email must not absorb. */
  preserved_contracts: string[];
  authority: { desktop: string; mobile: string };
  preview_path: string;
  dispatch_enabled: false;
};

function authority(slug: string) {
  return {
    desktop: `${FNDATN01_PUBLIC_ROOT}/authority/${slug}/desktop.jpg`,
    mobile: `${FNDATN01_PUBLIC_ROOT}/authority/${slug}/mobile.jpg`,
  };
}

export function fndatn01PreviewPath(slug: string, variant: 'default' | 'activation_pending' = 'default'): string {
  return `${FNDATN01_PUBLIC_ROOT}/${slug}${variant === 'default' ? '' : `--${variant.replace('_', '-')}`}.html`;
}

function email(def: Omit<Fndatn01Email, 'authority' | 'preview_path' | 'dispatch_enabled'>): Fndatn01Email {
  return {
    ...def,
    authority: authority(def.slug),
    preview_path: fndatn01PreviewPath(def.slug),
    dispatch_enabled: false,
  };
}

export const FNDATN01_EMAILS: readonly Fndatn01Email[] = [
  email({
    id: '01',
    slug: '01_invitation',
    title: 'FOUNDATION INVITATION',
    template_id: 'personal-foundation-invitation',
    new_template: false,
    role: 'lifecycle',
    purpose: 'Invite the client into their persistent Digital Foundation intake.',
    trigger: { kind: 'artifact_event', event: 'ARTIFACT_CREATED' },
    eligibility: ['Artifact exists with a public token', 'Founder authorizes the send', 'Artifact is not archived'],
    never_send_when: ['Artifact is archived', 'No public token', 'Founder has not authorized the send'],
    cta_label: 'BEGIN YOUR FOUNDATION',
    cta_destination: 'Persistent intake URL: /foundation/{public_token}?step=intake',
    preserved_contracts: [],
  }),
  email({
    id: '02',
    slug: '02_intake_received',
    title: 'INTAKE RECEIVED',
    template_id: 'intake-completed',
    new_template: false,
    role: 'lifecycle',
    purpose: 'Confirm a submitted, persisted intake and set expectations for review.',
    trigger: { kind: 'artifact_event', event: 'INTAKE_COMPLETED' },
    eligibility: ['intake_state is COMPLETE', 'A persisted INTAKE_COMPLETED event supplies the received timestamp'],
    never_send_when: ['Intake only opened or started', 'No persisted INTAKE_COMPLETED event'],
    cta_label: 'VIEW YOUR INTAKE STATUS',
    cta_destination: 'Foundation status URL: /foundation/{public_token}',
    preserved_contracts: ['intake-started (start confirmation) stays separate'],
  }),
  email({
    id: '03',
    slug: '03_recommendation_quote',
    title: 'RECOMMENDATION & QUOTE',
    template_id: 'quote-ready',
    new_template: false,
    role: 'lifecycle',
    purpose: 'Present the founder-approved recommendation and the actual quote for review.',
    trigger: { kind: 'artifact_event', event: 'QUOTE_CREATED' },
    eligibility: ['Quote exists and is founder commercial ready', 'Quote status READY or CLIENT_REVIEW', 'Quote has not expired'],
    never_send_when: ['Quote is DRAFT, SUPERSEDED, EXPIRED or PAID', 'Founder has not cleared the quote', 'Expiration has passed'],
    cta_label: 'REVIEW YOUR RECOMMENDATION & QUOTE',
    cta_destination: 'Quote review URL: /foundation/{public_token}',
    preserved_contracts: [],
  }),
  email({
    id: '04',
    slug: '04_payment_received',
    title: 'PAYMENT RECEIVED / PROJECT ACTIVATED',
    template_id: 'payment-confirmed',
    new_template: false,
    role: 'lifecycle',
    purpose: 'Receipt for a verified payment. Activation copy appears only when activation is confirmed.',
    trigger: { kind: 'artifact_event', event: 'PAYMENT_CONFIRMED' },
    eligibility: ['payment_state is PAID', 'Persisted PAYMENT_CONFIRMED event', 'Paid quote supplies amount and currency'],
    never_send_when: ['Payment not verified', 'Payment FAILED, REFUNDED or DISPUTED'],
    cta_label: 'OPEN YOUR FOUNDATION',
    cta_destination: 'Foundation URL: /foundation/{public_token}',
    preserved_contracts: ['project-activated (PROJECT_ACTIVATED) stays a separate contract', 'Stripe and payment logic unchanged'],
  }),
  email({
    id: '05',
    slug: '05_foundation_complete',
    title: 'FOUNDATION COMPLETE / DELIVERED',
    template_id: 'foundation-complete',
    new_template: false,
    role: 'lifecycle',
    purpose: 'Deliver the completed foundation with verified items only.',
    trigger: { kind: 'artifact_event', event: 'FOUNDATION_COMPLETED' },
    eligibility: ['completion_state COMPLETE', 'Ownership record present', 'Domain, mailbox, DNS/security, device and records each verified'],
    never_send_when: ['Any of the five items is pending verification', 'No ownership record'],
    cta_label: 'VIEW YOUR COMPLETED FOUNDATION',
    cta_destination: 'Foundation URL: /foundation/{public_token}',
    preserved_contracts: ['records-available stays a separate contract'],
  }),
  email({
    id: '06',
    slug: '06_resume_intake',
    title: 'RESUME YOUR INTAKE',
    template_id: 'intake-resume-reminder',
    new_template: true,
    role: 'conditional_recovery',
    purpose: 'Recover a started, unsubmitted intake with saved progress. Payment is never required to resume.',
    trigger: { kind: 'derived_condition', condition: 'INTAKE_RESUME_REMINDER_DUE' },
    eligibility: ['intake_state IN_PROGRESS', 'Saved intake answers exist', 'No INTAKE_COMPLETED event', 'Inactive for the reminder delay'],
    never_send_when: ['Intake submitted', 'No saved intake', 'Artifact archived', 'Reminder already sent for this activity window'],
    cta_label: 'RESUME YOUR INTAKE',
    cta_destination: 'Persistent intake URL: /foundation/{public_token}?step=intake',
    preserved_contracts: ['intake-started confirms a start; this reminder is a different message'],
  }),
  email({
    id: '07',
    slug: '07_quote_expiry',
    title: 'QUOTE EXPIRY REMINDER',
    template_id: 'quote-expiry-reminder',
    new_template: true,
    role: 'conditional_recovery',
    purpose: 'Remind the client before an unpaid quote reaches its actual expiration.',
    trigger: { kind: 'derived_condition', condition: 'QUOTE_EXPIRY_REMINDER_DUE' },
    eligibility: ['Quote status READY or CLIENT_REVIEW', 'payment_state not PAID', 'Actual expires_at present', 'Reminder window reached', 'Not yet expired'],
    never_send_when: ['Quote accepted, paid, superseded or expired', 'No expiration date', 'Outside the reminder window'],
    cta_label: 'SECURE YOUR QUOTE',
    cta_destination: 'Quote review and acceptance URL: /foundation/{public_token}',
    preserved_contracts: ['quote-ready stays the first presentation of the quote'],
  }),
];

export function fndatn01EmailById(id: Fndatn01EmailId): Fndatn01Email {
  const found = FNDATN01_EMAILS.find((e) => e.id === id);
  if (!found) throw new Error(`UNKNOWN FNDATN-01 EMAIL ${id}`);
  return found;
}

export function fndatn01EmailForTemplate(templateId: string): Fndatn01Email | undefined {
  return FNDATN01_EMAILS.find((e) => e.template_id === templateId);
}

/** Reminder timing defaults. Contract values only; nothing schedules them. */
export const FNDATN01_REMINDER_POLICY = {
  intake_resume_after_hours: 48,
  quote_expiry_window_hours: 72,
} as const;
