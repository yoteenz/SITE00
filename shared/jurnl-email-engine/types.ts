/**
 * JURNL EDITORIAL CORRESPONDENCE — canonical email ontology types
 * (P0.JURNL.EMAIL-ENGINE.CANONICAL-ARCHITECTURE-AND-CREATIVE-INFRASTRUCTURE1).
 *
 * Every JURNL email belongs to:
 *   EMAIL FAMILY → MESSAGE TYPE → TRIGGER / CAMPAIGN → STATE / VARIANT → RESPONSIVE AUTHORITY → ASSET PACKAGE → IMPLEMENTED TEMPLATE
 *
 * This module is provider-neutral and holds no copy that is final until the founder approves it.
 */

/** The seven parent families. */
export type EmailFamilyId = 'E01' | 'E02' | 'E03' | 'E04' | 'E05' | 'E06' | 'E07';

/** The first eight authority emails (the creative batch test). */
export type EmailId = 'A01' | 'A02' | 'A03' | 'A04' | 'A05' | 'A06' | 'A07' | 'A08';

/** Visual layer model. L3–L5 are live HTML and are never flattened into generated imagery. */
export type EmailLayerId = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

/** Who owns a piece of the email: generated / static imagery, or live HTML. */
export type Ownership = 'IMAGE' | 'HTML';

/** Transactional / marketing firewall. */
export type ConsentClass = 'TRANSACTIONAL' | 'LIFECYCLE_SERVICE' | 'MARKETING';

/** Conceptual preference categories (exposed only where product truth supports them). */
export type PreferenceCategory = 'ACCOUNT_SECURITY' | 'PRODUCT_SERVICE_UPDATES' | 'FINANCIAL_BRIEFS' | 'REMINDERS_NUDGES' | 'EDITORIAL_MARKETING';

/** Personalization depth. Never fabricate financial facts or observations. */
export type PersonalizationLevel = 'P0' | 'P1' | 'P2' | 'P3';

/** Correspondence artifacts: the physical object each email behaves as. */
export type ArtifactGrammar =
  | 'INVITATION'
  | 'WELCOME_LETTER'
  | 'ENTRY_CARD'
  | 'FIELD_GUIDE'
  | 'ANNOTATED_NOTE'
  | 'EDITORIAL_EXPLAINER'
  | 'BRIEFING_SHEET'
  | 'LEDGER_INSERT'
  | 'CLIPBOARD_BRIEF'
  | 'PRINTED_REVIEW'
  | 'CEREMONIAL_NOTE'
  | 'MILESTONE_CARD'
  | 'EMBOSSED_LETTER'
  | 'PINNED_NOTE'
  | 'SMALL_MEMO'
  | 'DESK_SLIP'
  | 'ACCESS_CREDENTIAL'
  | 'FORMAL_NOTICE'
  | 'PRIVATE_CORRESPONDENCE'
  | 'MAGAZINE_SPREAD'
  | 'BROADSIDE'
  | 'CAMPAIGN_LETTER'
  | 'CULTURAL_EDITORIAL';

/** Reusable component vocabulary. */
export type EmailComponentId =
  | 'EC01'
  | 'EC02'
  | 'EC03'
  | 'EC04'
  | 'EC05'
  | 'EC06'
  | 'EC07'
  | 'EC08'
  | 'EC09'
  | 'EC10'
  | 'EC11'
  | 'EC12'
  | 'EC13'
  | 'EC14'
  | 'EC15'
  | 'EC16'
  | 'EC17';

/** Email asset classes. EMAIL_LIVE_CONTENT is HTML and is never an image. */
export type EmailAssetClass = 'EMAIL_ENVIRONMENT' | 'EMAIL_ARTIFACT_SHELL' | 'EMAIL_DECORATIVE_INSERT' | 'EMAIL_THUMBNAIL' | 'EMAIL_LIVE_CONTENT';

/** How a template obtains an asset. */
export type LineageAction = 'REUSE' | 'DERIVE' | 'REGENERATE' | 'CREATE_NEW';

/** Production lifecycle. Founder approval is never inferred. */
export type EmailProductionState =
  | 'PLANNED'
  | 'CONTRACT_READY'
  | 'CREATIVE_READY'
  | 'AUTHORITY_IN_REVIEW'
  | 'AUTHORITY_APPROVED'
  | 'ASSETS_READY'
  | 'IMPLEMENTATION_READY'
  | 'IMPLEMENTED'
  | 'RESPONSIVE_QA'
  | 'DELIVERY_QA'
  | 'APPROVED'
  | 'LIVE'
  | 'SUPERSEDED'
  | 'ARCHIVED';

/** Delivery state of a message contract (separate from creative production). */
export type DeliveryState = 'NOT_WIRED' | 'RENDER_ONLY' | 'DRY_RUN' | 'PROVIDER_OWNED' | 'LIVE' | 'PAUSED';

export type Priority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

/** Where a trigger event comes from, judged against repository truth. */
export type TriggerSourceStatus =
  /** The event already exists in a running system (e.g. Supabase Auth sends the email itself). */
  | 'EXISTS_PROVIDER_OWNED'
  /** A state exists in product truth (a derivation or a store), but no event is emitted yet. */
  | 'STATE_EXISTS_EVENT_NOT_EMITTED'
  /** Neither the state nor the event exists yet; specified here, implemented later. */
  | 'PROPOSED';

/** Typographic case rules. */
export type CaseRule = 'UPPERCASE' | 'SENTENCE_CASE' | 'UPPERCASE_OR_DESIGNED_TITLE_CASE';

export type AgentRole = 'GROK_OPENART' | 'OPUS' | 'COMPOSER' | 'FOUNDER';

export type FounderApproval = { readonly status: 'NOT_REVIEWED' | 'IN_REVIEW' | 'APPROVED' | 'REVISION_REQUESTED'; readonly by?: 'FOUNDER'; readonly date?: string };
