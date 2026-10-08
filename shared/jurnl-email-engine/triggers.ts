/**
 * Trigger contract schema, trigger events (mapped to repository truth) and personalization levels.
 *
 * Source truth (2026-10-08):
 * - The shipped app mounts JURNL in design-preview mode only (src/site00/projectRuntime/ProjectRuntimeRoute.tsx);
 *   its auth adapter is device-local and sends no email.
 * - The production adapter (src/projects/jurnl/runtime/state/supabaseAuthAdapter.ts, never mounted) uses Supabase Auth:
 *   signUp (sends Supabase's "Confirm signup" email), auth.resend({ type: 'signup' }), resetPasswordForEmail (sends
 *   Supabase's "Reset password" email). Those emails use templates configured in the Supabase dashboard, which are not in
 *   this repository. No emailRedirectTo / redirectTo is passed.
 * - Repository events (src/projects/jurnl/data/repository/types.ts RepositoryEventType) are emitted in memory only and
 *   nothing subscribes. ACCOUNT_CREATED means a money account, not a person signing up. SETUP_COMPLETED fires on every
 *   setup patch, so it cannot mean "setup finished".
 * - Analytics allow-list (src/projects/jurnl/data/analytics/jurnlAnalytics.ts) has jurnl_setup_completed, jurnl_goal_created
 *   and others; only jurnl_route_viewed and jurnl_error_shown are fired.
 * Email trigger events below reuse these names where they exist and say plainly where an event still has to be built.
 */

import type { ConsentClass, DeliveryState, EmailId, PersonalizationLevel, Priority, TriggerSourceStatus } from './types.js';

/** The trigger contract every email carries. */
export type TriggerContract = {
  readonly emailId: EmailId;
  readonly triggerEvent: TriggerEventId;
  readonly eligibility: readonly string[];
  readonly suppression: readonly string[];
  /** Minimum time between two sends of this email to one person (ISO 8601 duration), or ONCE. */
  readonly cooldown: string;
  readonly personalizationInputs: readonly string[];
  readonly personalization: PersonalizationLevel;
  /** App route under the JURNL runtime base path, e.g. "today". */
  readonly ctaDestination: string;
  readonly consentClass: ConsentClass;
  readonly priority: Priority;
  /** Idempotency key template. */
  readonly duplicateGuard: string;
  readonly deliveryState: DeliveryState;
};

export type TriggerEventId =
  | 'AUTH_EMAIL_CONFIRMED'
  | 'AUTH_SIGNUP_CONFIRMATION_REQUESTED'
  | 'SETUP_INCOMPLETE'
  | 'SAFE_TO_SPEND_READY'
  | 'WEEKLY_BRIEF_READY'
  | 'PURCHASE_ATTENTION_DETECTED'
  | 'GOAL_REACHED'
  | 'AUTH_PASSWORD_RESET_REQUESTED';

export type TriggerEventContract = {
  readonly id: TriggerEventId;
  /** Spec name from the sprint brief, for traceability. */
  readonly briefName: string;
  readonly status: TriggerSourceStatus;
  readonly source: string;
  readonly fires: string;
  /** What has to exist before this trigger can fire for real. */
  readonly dependencies: readonly string[];
};

export const TRIGGER_EVENTS: readonly TriggerEventContract[] = [
  {
    id: 'AUTH_EMAIL_CONFIRMED',
    briefName: 'account_created',
    status: 'STATE_EXISTS_EVENT_NOT_EMITTED',
    source: 'Supabase Auth user.email_confirmed_at → JurnlAccount.emailVerified (supabaseAuthAdapter.ts).',
    fires: 'The first time a JURNL account becomes verified (the person has arrived; not at sign-up, which only sends A02).',
    dependencies: ['Production auth mounted (mode="production")', 'Server-side hook on auth.users email_confirmed_at, or a first-verified-session check'],
  },
  {
    id: 'AUTH_SIGNUP_CONFIRMATION_REQUESTED',
    briefName: 'email_verification_required',
    status: 'EXISTS_PROVIDER_OWNED',
    source: 'supabase.auth.signUp and supabase.auth.resend({ type: "signup" }) in supabaseAuthAdapter.ts; Supabase sends its "Confirm signup" template.',
    fires: 'On sign-up and on RESEND EMAIL (F01.02).',
    dependencies: ['Supabase custom email template or Send Email Hook to apply the JURNL authority', 'emailRedirectTo pointing at the JURNL verify route'],
  },
  {
    id: 'SETUP_INCOMPLETE',
    briefName: 'setup_incomplete',
    status: 'PROPOSED',
    source: 'Setup draft (src/projects/jurnl/data/f02/setupDraft.ts): started / resumeAt. There is no "setup finished" flag; repository SETUP_COMPLETED fires on every patch.',
    fires: 'Setup started but not finished 48 hours after AUTH_EMAIL_CONFIRMED, evaluated by a scheduled job.',
    dependencies: ['A real setup-finished flag in the setup draft / snapshot', 'Scheduled job reading jurnl_user_snapshots'],
  },
  {
    id: 'SAFE_TO_SPEND_READY',
    briefName: 'safe_to_spend_ready',
    status: 'STATE_EXISTS_EVENT_NOT_EMITTED',
    source: 'computeSafeToSpend (src/projects/jurnl/data/f09/safeToSpend.ts) completeness COMPLETE; repository emits SAFE_TO_SPEND_RECALCULATED in memory.',
    fires: 'The first time completeness becomes COMPLETE with a positive value.',
    dependencies: ['Server-side recomputation or a persisted first-ready marker in the snapshot'],
  },
  {
    id: 'WEEKLY_BRIEF_READY',
    briefName: 'weekly_brief_ready',
    status: 'PROPOSED',
    source: 'Scheduled weekly job over jurnl_user_snapshots (upcoming projection F07, activity F04, Safe to Spend F09).',
    fires: 'Weekly at the person’s chosen day / time zone (settings.timezone).',
    dependencies: ['FINANCIAL_BRIEFS preference stored and on', 'Scheduler', 'Server-side derivations of upcoming / moved / Safe to Spend'],
  },
  {
    id: 'PURCHASE_ATTENTION_DETECTED',
    briefName: 'purchase_attention_detected',
    status: 'STATE_EXISTS_EVENT_NOT_EMITTED',
    source: 'Saved purchases: purchasesStore.purchaseAffordability NOW / WAIT / NOT_YET; check tone classifyPurchaseCheck FIT / CHECK_IN / OVER (src/projects/jurnl/data/f10).',
    fires: 'A saved purchase the person planned moves from FITS NOW to CLOSE or NOT YET because their plan changed (never for a check they just ran in the app).',
    dependencies: ['Server-side affordability evaluation on snapshot change', 'REMINDERS_NUDGES preference'],
  },
  {
    id: 'GOAL_REACHED',
    briefName: 'milestone_reached',
    status: 'STATE_EXISTS_EVENT_NOT_EMITTED',
    source: 'Goal status COMPLETE with completed_at set by setGoalAside (src/projects/jurnl/data/f14); repository emits GOAL_UPDATED.',
    fires: 'When a goal’s set-aside reaches its target for the first time.',
    dependencies: ['Server-side transition detection (status → COMPLETE)'],
  },
  {
    id: 'AUTH_PASSWORD_RESET_REQUESTED',
    briefName: 'password_reset_requested',
    status: 'EXISTS_PROVIDER_OWNED',
    source: 'supabase.auth.resetPasswordForEmail in supabaseAuthAdapter.ts (F01.05 SEND RESET LINK); Supabase sends its "Reset password" template.',
    fires: 'When a reset is requested.',
    dependencies: ['Supabase custom template or Send Email Hook', 'redirectTo pointing at entry/new-password', 'Handling the PASSWORD_RECOVERY auth event (not handled today)'],
  },
];

export const TRIGGER_RULES = [
  'Use existing event names where source truth has them; never start a competing event system.',
  'Auth emails stay owned by the auth provider (Supabase) until the founder approves moving them; the JURNL authority is applied through the provider’s template or hook.',
  'Every trigger is evaluated server-side from persisted truth (jurnl_user_snapshots, auth.users). Device-local preview state never sends email.',
  'Design-preview accounts (EMMA@EXAMPLE.COM, LOCKED@EXAMPLE.COM) and fixture data are never recipients.',
  'Suppression always includes: unverified address (except A02), hard bounce, complaint, account deleted, category off.',
] as const;

/** Personalization depth. */
export const PERSONALIZATION_LEVELS: readonly { level: PersonalizationLevel; name: string; allows: readonly string[]; rules: readonly string[] }[] = [
  { level: 'P0', name: 'NONE', allows: ['product name', 'fixed copy'], rules: ['Generic account / security communication.'] },
  { level: 'P1', name: 'IDENTITY', allows: ['firstName', 'recipientEmail', 'account context needed for the action'], rules: ['Fall back to no greeting when the name is missing; never “Hi there, user”.'] },
  { level: 'P2', name: 'FINANCIAL CONTEXT', allows: ['Safe to Spend value and date', 'upcoming amounts', 'goal name and amount', 'purchase amount and category'], rules: ['Values come from persisted source truth at send time, with an as-of date.', 'If a value is missing or stale, use the honest incomplete variant; never a placeholder number.'] },
  { level: 'P3', name: 'INTELLIGENT NARRATIVE', allows: ['a contextual explanation derived from real data'], rules: ['Only where source truth permits and the inputs are logged with the send.', 'Never fabricate financial facts or personalized observations.', 'Respect AI consent (AI_PERSONALIZED / AI_NATURAL_LANGUAGE) for any generated narrative.'] },
];
