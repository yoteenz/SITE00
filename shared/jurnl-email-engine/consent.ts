/**
 * Transactional / lifecycle / marketing firewall and the conceptual preference model.
 *
 * Source truth (2026-10-08): JURNL has no email consent, no email preferences and no unsubscribe concept.
 * - Consent keys today (src/projects/jurnl/data/foundation/consent.ts, CONSENT_VERSION 2026-10-05): DATA_REMEMBER,
 *   LINKED_ACCOUNTS, NO_DATA_SALE, AI_PERSONALIZED, AI_CATEGORIZATION, AI_BUDGET, AI_NATURAL_LANGUAGE, AI_MARKET_TRENDS,
 *   ASK_JURNL_CONTEXT. None of them is an email permission.
 * - settings.notificationsEnabled exists (default false) and is unused.
 * - The account page row "NOTIFICATIONS · REMINDERS & UPDATES" is not implemented (shows NOT IN THIS PREVIEW YET.).
 * This module therefore defines the model; it does not add consent keys or change live consent.
 */

import type { ConsentClass, PreferenceCategory } from './types.js';

export type ConsentClassContract = {
  readonly id: ConsentClass;
  readonly definition: string;
  readonly examples: readonly string[];
  /** Must the recipient have opted in to this category before sending? */
  readonly requiresOptIn: boolean;
  /** Is a category unsubscribe link (EC17 + List-Unsubscribe) required? */
  readonly requiresUnsubscribe: boolean;
  readonly marketingContentAllowed: boolean;
  readonly sendsWhenMarketingDeclined: boolean;
  readonly rules: readonly string[];
};

export const CONSENT_CLASSES: readonly ConsentClassContract[] = [
  {
    id: 'TRANSACTIONAL',
    definition: 'Required to deliver a service the person asked for, or to keep their account secure. Sent because of a specific action or a security event.',
    examples: ['verify email', 'reset access', 'security alert', 'account change confirmation', 'data export ready'],
    requiresOptIn: false,
    requiresUnsubscribe: false,
    marketingContentAllowed: false,
    sendsWhenMarketingDeclined: true,
    rules: [
      'Never contains promotional, editorial or cross-sell content (no EC01 environment art, EC05, EC08, EC10, EC17).',
      'Never requires a marketing subscription to be delivered.',
      'Security links are never wrapped by click tracking.',
      'States what happened, when, and what to do if it was not the recipient.',
    ],
  },
  {
    id: 'LIFECYCLE_SERVICE',
    definition: 'Helps the person use the service they signed up for: arrival, setup guidance, briefs, reminders, real milestones.',
    examples: ['welcome', 'finish setup', 'Safe to Spend ready', 'weekly brief', 'purchase second look', 'milestone reached'],
    requiresOptIn: false,
    requiresUnsubscribe: true,
    marketingContentAllowed: false,
    sendsWhenMarketingDeclined: true,
    rules: [
      'Classify carefully: a lifecycle email is about the person’s own account and data, never about selling.',
      'Recurring or optional lifecycle mail (briefs, reminders, milestones) is sent only while its preference category is on, and carries a category unsubscribe (EC17).',
      'One-time arrival mail (welcome) carries a preferences link in the footer.',
      'No promotions, offers or campaign content; a product mention is allowed only when it is the next step for this person.',
    ],
  },
  {
    id: 'MARKETING',
    definition: 'Optional storytelling and promotion: campaigns, launches, editorial.',
    examples: ['feature launch', 'seasonal planning story', 'JURNL editorial'],
    requiresOptIn: true,
    requiresUnsubscribe: true,
    marketingContentAllowed: true,
    sendsWhenMarketingDeclined: false,
    rules: [
      'Sent only with explicit marketing consent recorded with version, timestamp and source.',
      'One-click unsubscribe (RFC 8058 List-Unsubscribe-Post) and a visible footer link.',
      'Never carries personal financial figures or account/security content.',
    ],
  },
];

export const FIREWALL_RULES = [
  'Every message contract declares exactly one consent class.',
  'Family and consent class must agree: E06 is TRANSACTIONAL only; E07 is MARKETING only; E01, E03, E04 and E05 are LIFECYCLE_SERVICE.',
  'A component may appear only in the consent classes it lists (components.ts).',
  'Marketing content never enters TRANSACTIONAL mail, and a TRANSACTIONAL email never becomes a carrier for lifecycle or marketing modules.',
  'When classification is uncertain, choose the stricter class and record why.',
] as const;

export type PreferenceCategoryContract = {
  readonly id: PreferenceCategory;
  readonly label: string;
  readonly consentClass: ConsentClass;
  readonly description: string;
  readonly defaultOn: boolean;
  readonly userCanDisable: boolean;
  /** Is this category exposed by product/backend truth today? */
  readonly supportedToday: boolean;
  /** The consent record that would back it when implemented (proposed name, not yet in ConsentType). */
  readonly proposedConsentKey: string | null;
};

export const PREFERENCE_CATEGORIES: readonly PreferenceCategoryContract[] = [
  { id: 'ACCOUNT_SECURITY', label: 'ACCOUNT & SECURITY', consentClass: 'TRANSACTIONAL', description: 'Verification, access resets, security notices and account changes.', defaultOn: true, userCanDisable: false, supportedToday: false, proposedConsentKey: null },
  { id: 'PRODUCT_SERVICE_UPDATES', label: 'PRODUCT / SERVICE UPDATES', consentClass: 'LIFECYCLE_SERVICE', description: 'Welcome, setup guidance and changes to how JURNL works for you.', defaultOn: true, userCanDisable: true, supportedToday: false, proposedConsentKey: 'EMAIL_SERVICE_UPDATES' },
  { id: 'FINANCIAL_BRIEFS', label: 'FINANCIAL BRIEFS', consentClass: 'LIFECYCLE_SERVICE', description: 'Your weekly and monthly brief.', defaultOn: false, userCanDisable: true, supportedToday: false, proposedConsentKey: 'EMAIL_FINANCIAL_BRIEFS' },
  { id: 'REMINDERS_NUDGES', label: 'REMINDERS & NUDGES', consentClass: 'LIFECYCLE_SERVICE', description: 'Short notes when something may need a look.', defaultOn: false, userCanDisable: true, supportedToday: false, proposedConsentKey: 'EMAIL_REMINDERS' },
  { id: 'EDITORIAL_MARKETING', label: 'JURNL EDITORIAL', consentClass: 'MARKETING', description: 'Stories, launches and seasonal editions.', defaultOn: false, userCanDisable: true, supportedToday: false, proposedConsentKey: 'EMAIL_EDITORIAL_MARKETING' },
];

export const PREFERENCE_RULES = [
  'Do not expose a category in the product until backend truth supports storing and honouring it.',
  'ACCOUNT & SECURITY is always on and is not shown as a toggle; it is explained in the preference centre.',
  'Opt-ins for FINANCIAL BRIEFS, REMINDERS & NUDGES and JURNL EDITORIAL default to off until the founder decides otherwise and the consent copy is approved.',
  'When implemented, email consent uses the existing consent record shape (consent_type, status, version, granted_at, revoked_at, source) through repository.patchConsent — no parallel consent system.',
  'settings.notificationsEnabled may become the master switch for non-transactional mail; it must not gate TRANSACTIONAL mail.',
  'Unsubscribe applies immediately and is idempotent; it never signs the person out or touches other consents.',
] as const;
