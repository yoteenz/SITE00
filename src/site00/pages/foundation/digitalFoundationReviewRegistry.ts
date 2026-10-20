/**
 * Canonical Digital Foundation review registry (IDNTY micro-product).
 * Source-grounded inventory for `/foundation/review` — not a substitute for live routes.
 */
import {
  OVERLAY_META,
  REFERRAL_OVERLAY_IDS,
  WORKSPACE_OVERLAY_IDS,
  type RegisteredOverlayId,
} from '../../admin/founder-workspace/overlay/overlayRegistry';
import { FOUNDER_WORKSPACE_SIDEBAR_NAV } from '../../admin/founder-workspace/config/navigation';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from '../../admin/founder-workspace/config/routes';
import { SITE00_ROUTES } from '../../config/routes';
import type { DfView } from '../../foundation-client/model';
import { reviewAnchorForView } from './reviewLinks';

export const DIGITAL_FOUNDATION_REVIEW_REGISTRY_VERSION = '2026-10-20-phase2-board-authority1';

export const DF_REVIEW_PRODUCT = {
  IDNTY_DIGITAL_FOUNDATION: 'IDNTY_DIGITAL_FOUNDATION',
  IDNTY_FOUNDER_WORKSPACE: 'IDNTY_FOUNDER_WORKSPACE',
  SITE00_PUBLIC_BUILDER: 'SITE00_PUBLIC_BUILDER',
  SITE00_DIGITAL_LOCATION: 'SITE00_DIGITAL_LOCATION',
} as const;

export const FORBIDDEN_FOUNDATION_BUILDER_REVIEW_IMPORTS = [
  '../../builder-studio/BuilderStudio',
  '../bldr/BldrSpatialStudioPage',
  'builder-studio/BuilderStudio',
] as const;

export const FORBIDDEN_FOUNDATION_BUILDER_REVIEW_SRC = '/bldr/studio/';

export type DfReviewGroupId =
  | 'INTAKE'
  | 'FOUNDATION_BUILDER'
  | 'POST_INTAKE'
  | 'PROPOSAL_CHECKOUT'
  | 'CLIENT_PORTAL'
  | 'CLIENT_COMPLETION'
  | 'CLIENT_ACCESS'
  | 'FOUNDER_WORKSPACE'
  | 'FOUNDER_REVIEW_QUEUE'
  | 'FOUNDER_OPERATIONS'
  | 'FOUNDER_OVERLAYS'
  | 'DEPRECATED';

export type DfReviewRenderMode =
  | 'inline_df_screen'
  | 'inline_founder_shell'
  | 'external_route'
  | 'legacy_redirect'
  | 'registry_gap';

export type DfReviewImplementationStatus =
  | 'reviewable'
  | 'auth_gated'
  | 'backend_blocked'
  | 'legacy_redirect'
  | 'not_implemented';

export type DfReviewEntry = {
  reviewId: string;
  anchorId: string;
  legacyAnchors?: readonly string[];
  group: DfReviewGroupId;
  productOwner: (typeof DF_REVIEW_PRODUCT)[keyof typeof DF_REVIEW_PRODUCT];
  pageName: string;
  pageFamily: string;
  componentSource: string;
  runtimeRoute?: string;
  renderMode: DfReviewRenderMode;
  implementationStatus: DfReviewImplementationStatus;
  authRequirement: 'none' | 'founder_session' | 'client_token';
  reviewAdapter:
    | 'inline_fixture'
    | 'inline_fixture_founder'
    | 'live_route'
    | 'blocked_legacy'
    | 'coverage_inventory';
  fixtureContract?: string;
  notes?: string;
};

export const DIGITAL_FOUNDATION_REVIEW_GROUP_LABELS: Record<DfReviewGroupId, string> = {
  INTAKE: 'A · Foundation intake',
  FOUNDATION_BUILDER: 'B · Website builder (hybrid studio)',
  POST_INTAKE: 'C · Post-intake review / waiting',
  PROPOSAL_CHECKOUT: 'D · Personalized proposals & checkout',
  CLIENT_PORTAL: 'E · Active client portal',
  CLIENT_COMPLETION: 'F · Completion & next threshold',
  CLIENT_ACCESS: 'G · Client secure access',
  FOUNDER_WORKSPACE: 'H · Founder workspace & pipeline',
  FOUNDER_REVIEW_QUEUE: 'I · Review queue / quote approval',
  FOUNDER_OPERATIONS: 'J · Execution & runbook',
  FOUNDER_OVERLAYS: 'K · Client & founder overlays',
  DEPRECATED: 'Deprecated public builder links',
};

export const REVIEW_GROUP_ORDER: DfReviewGroupId[] = [
  'INTAKE',
  'FOUNDATION_BUILDER',
  'POST_INTAKE',
  'PROPOSAL_CHECKOUT',
  'CLIENT_PORTAL',
  'CLIENT_COMPLETION',
  'CLIENT_ACCESS',
  'FOUNDER_WORKSPACE',
  'FOUNDER_REVIEW_QUEUE',
  'FOUNDER_OPERATIONS',
  'FOUNDER_OVERLAYS',
];

function inlineIntake(view: DfView, pageName: string, source: string, group: DfReviewGroupId): DfReviewEntry {
  return {
    reviewId: `INTAKE_${view}`,
    anchorId: reviewAnchorForView(view),
    group,
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName,
    pageFamily: 'foundation-intake',
    componentSource: source,
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'none',
    reviewAdapter: 'inline_fixture',
  };
}

function gapEntry(
  reviewId: string,
  anchorId: string,
  group: DfReviewGroupId,
  pageName: string,
  notes: string,
): DfReviewEntry {
  return {
    reviewId,
    anchorId,
    group,
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName,
    pageFamily: 'coverage-gap',
    componentSource: '—',
    renderMode: 'registry_gap',
    implementationStatus: 'not_implemented',
    authRequirement: 'none',
    reviewAdapter: 'coverage_inventory',
    notes,
  };
}

function founderRoute(
  reviewId: string,
  pageName: string,
  href: string,
  source: string,
  group: DfReviewGroupId,
  notes?: string,
): DfReviewEntry {
  return {
    reviewId,
    anchorId: `df-r-founder-${reviewId.toLowerCase()}`,
    group,
    productOwner: DF_REVIEW_PRODUCT.IDNTY_FOUNDER_WORKSPACE,
    pageName,
    pageFamily: 'founder-workspace',
    componentSource: source,
    runtimeRoute: href,
    renderMode: 'inline_founder_shell',
    implementationStatus: 'reviewable',
    authRequirement: 'founder_session',
    reviewAdapter: 'inline_fixture_founder',
    notes: notes ?? 'Simulated founder workspace in review stage (cloud preview admin fixtures).',
  };
}

/** Founder boards 13–15C on the engine-generated operations snapshot (`generated/reviewFounderSnapshots.json`). */
function founderBoard(
  reviewId: string,
  pageName: string,
  route: string,
  source: string,
  group: DfReviewGroupId,
  notes?: string,
): DfReviewEntry {
  return {
    reviewId,
    anchorId: `df-r-founder-${reviewId.toLowerCase()}`,
    group,
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName,
    pageFamily: 'founder-board',
    componentSource: source,
    runtimeRoute: route,
    renderMode: 'inline_founder_shell',
    implementationStatus: 'reviewable',
    authRequirement: 'founder_session',
    reviewAdapter: 'inline_fixture_founder',
    fixtureContract: 'FOUNDER_OPERATIONS_SNAPSHOT',
    notes: notes ?? 'Engine snapshot · navigable between boards · task actions inert.',
  };
}

function overlayEntry(id: RegisteredOverlayId): DfReviewEntry {
  const meta = OVERLAY_META[id];
  const blocked = meta.blockedByBackend || meta.blockedByPolicy;
  return {
    reviewId: `OVERLAY_${id}`,
    anchorId: `df-r-overlay-${id}`,
    group: 'FOUNDER_OVERLAYS',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_FOUNDER_WORKSPACE,
    pageName: `${id} · ${meta.title}`,
    pageFamily: meta.family === 'referral' ? 'referral-overlay' : 'workspace-overlay',
    componentSource: `admin/founder-workspace/overlay/overlayRegistry.ts#${id}`,
    runtimeRoute: IDNTY_FOUNDER_WORKSPACE_ROUTES.root,
    renderMode: 'external_route',
    implementationStatus: blocked ? 'backend_blocked' : 'auth_gated',
    authRequirement: 'founder_session',
    reviewAdapter: 'live_route',
    notes: `Trigger: ${meta.trigger}. Open overlay from founder workspace after auth — not a standalone public URL.`,
  };
}

const CLIENT_INLINE: DfReviewEntry[] = [
  inlineIntake('P01', 'Get started', 'foundation-client/parents/EntryIntake.tsx#P01Entry', 'INTAKE'),
  inlineIntake('P02', 'Business information', 'foundation-client/parents/EntryIntake.tsx#P02Intake', 'INTAKE'),
  inlineIntake('P03', 'Build your foundation (configurator)', 'foundation-client/parents/EntryIntake.tsx#P03Configure', 'INTAKE'),
  {
    reviewId: 'INTAKE_P03_DOMAIN',
    anchorId: 'df-r-P03-domain',
    group: 'INTAKE',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Build your foundation · domain path open',
    pageFamily: 'foundation-intake',
    componentSource: 'foundation-client/parents/EntryIntake.tsx#P03Configure',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'none',
    reviewAdapter: 'inline_fixture',
  },
  {
    reviewId: 'INTAKE_P03_EMAIL',
    anchorId: 'df-r-P03-email',
    group: 'INTAKE',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Build your foundation · email row open',
    pageFamily: 'foundation-intake',
    componentSource: 'foundation-client/parents/EntryIntake.tsx#P03Configure',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'none',
    reviewAdapter: 'inline_fixture',
  },
  inlineIntake('P04', 'Recommendation', 'foundation-client/parents/Recommendation.tsx#P04Recommendation', 'PROPOSAL_CHECKOUT'),
  inlineIntake('P05', 'Review + checkout', 'foundation-client/parents/CheckoutActivation.tsx#P05Review', 'PROPOSAL_CHECKOUT'),
  inlineIntake('P06', 'Activation / payment confirmation', 'foundation-client/parents/CheckoutActivation.tsx#P06Activation', 'PROPOSAL_CHECKOUT'),
  {
    reviewId: 'POST_INTAKE_SUBMITTED',
    anchorId: 'df-r-post-intake-submitted',
    group: 'POST_INTAKE',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Your foundation is taking shape',
    pageFamily: 'post-intake',
    componentSource: 'foundation-client/parents/IntakeSubmittedStatus.tsx#P03IntakeSubmitted',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'none',
    reviewAdapter: 'inline_fixture',
    fixtureContract: 'INTAKE_SUBMITTED',
    notes: 'Simulated G-02 withheld quote.',
  },
  {
    reviewId: 'POST_INTAKE_STATUS',
    anchorId: 'df-r-post-intake-status',
    group: 'POST_INTAKE',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Review status (intake received)',
    pageFamily: 'post-intake',
    componentSource: 'foundation-client/parents/IntakeSubmittedStatus.tsx',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'none',
    reviewAdapter: 'inline_fixture',
    fixtureContract: 'INTAKE_SUBMITTED',
  },
  gapEntry(
    'POST_CLARIFICATION',
    'df-r-post-clarification',
    'POST_INTAKE',
    'Clarification requested',
    'Client clarification UI is driven from live artifact state — no isolated fixture yet. See founder Reviews queue.',
  ),
  {
    reviewId: 'PROPOSAL_READY',
    anchorId: 'df-r-proposal-ready',
    group: 'PROPOSAL_CHECKOUT',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Personalized proposal ready',
    pageFamily: 'proposal',
    componentSource: 'foundation-client/parents/Recommendation.tsx#P04Recommendation',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'none',
    reviewAdapter: 'inline_fixture',
    fixtureContract: 'PROPOSAL_READY',
    notes: 'Simulated after founder commercial release (quote visible).',
  },
  {
    reviewId: 'QUOTE_ACCEPTANCE',
    anchorId: 'df-r-quote-acceptance',
    group: 'PROPOSAL_CHECKOUT',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Quote acceptance',
    pageFamily: 'checkout',
    componentSource: 'foundation-client/parents/CheckoutActivation.tsx#P05Review',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'none',
    reviewAdapter: 'inline_fixture',
    fixtureContract: 'A_BASE',
  },
  {
    reviewId: 'AWAITING_PAYMENT',
    anchorId: 'df-r-awaiting-payment',
    group: 'PROPOSAL_CHECKOUT',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Awaiting payment',
    pageFamily: 'checkout',
    componentSource: 'foundation-client/parents/CheckoutActivation.tsx#P05Review',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'none',
    reviewAdapter: 'inline_fixture',
    fixtureContract: 'A_BASE',
    notes: 'Same parent as quote review — simulated checkout session.',
  },
  {
    reviewId: 'PAYMENT_FAILURE',
    anchorId: 'df-r-payment-failure',
    group: 'PROPOSAL_CHECKOUT',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Payment failure / recovery',
    pageFamily: 'checkout',
    componentSource: 'foundation-client/parents/CheckoutActivation.tsx#P06Activation',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'none',
    reviewAdapter: 'inline_fixture',
    fixtureContract: 'K_PAYMENT_FAILURE',
  },
  {
    reviewId: 'CLIENT_PORTAL_NAV',
    anchorId: 'df-r-client-portal',
    group: 'CLIENT_PORTAL',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Client portal (navigable shell)',
    pageFamily: 'client-portal',
    componentSource: 'foundation-client/FoundationClient.tsx + ProjectPortal parents',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'client_token',
    reviewAdapter: 'inline_fixture',
    fixtureContract: 'J_PAYMENT_SUCCESS',
    notes: 'Four-tab portal shell with fixture payload — deep links still available per tab.',
  },
  {
    reviewId: 'CLIENT_FOUNDATION_OVERVIEW',
    anchorId: reviewAnchorForView('OVERVIEW'),
    group: 'CLIENT_PORTAL',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Project overview',
    pageFamily: 'client-portal',
    componentSource: 'foundation-client/parents/ProjectPortal.tsx#P07ProjectOverview',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'client_token',
    reviewAdapter: 'inline_fixture',
    fixtureContract: 'J_PAYMENT_SUCCESS',
  },
  {
    reviewId: 'CLIENT_FOUNDATION_ROADMAP',
    anchorId: reviewAnchorForView('ROADMAP'),
    group: 'CLIENT_PORTAL',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Project roadmap',
    pageFamily: 'client-portal',
    componentSource: 'foundation-client/parents/ProjectPortal.tsx#P08Roadmap',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'client_token',
    reviewAdapter: 'inline_fixture',
    fixtureContract: 'J_PAYMENT_SUCCESS',
  },
  {
    reviewId: 'CLIENT_SCREEN_10_APPROVAL',
    anchorId: 'df-r-needs-you-approval',
    group: 'CLIENT_PORTAL',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Screen 10 · We need your approval',
    pageFamily: 'client-portal',
    componentSource: 'foundation-client/parents/ProjectPortal.tsx#P10NeedsYou',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'client_token',
    reviewAdapter: 'inline_fixture',
    fixtureContract: 'J_SIGNATURE_APPROVAL',
    notes: 'Signature approval action with preview — review fixture only (inert submit).',
  },
  {
    reviewId: 'CLIENT_FOUNDATION_NEEDS_YOU',
    anchorId: reviewAnchorForView('NEEDS_YOU'),
    group: 'CLIENT_PORTAL',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Needs you',
    pageFamily: 'client-portal',
    componentSource: 'foundation-client/parents/ProjectPortal.tsx#P10NeedsYou',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'client_token',
    reviewAdapter: 'inline_fixture',
    fixtureContract: 'J_PAYMENT_SUCCESS',
  },
  {
    reviewId: 'CLIENT_FOUNDATION_STAGE',
    anchorId: reviewAnchorForView('STAGE'),
    group: 'CLIENT_PORTAL',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Stage detail',
    pageFamily: 'client-portal',
    componentSource: 'foundation-client/parents/ProjectPortal.tsx#P09StageDetail',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'client_token',
    reviewAdapter: 'inline_fixture',
    fixtureContract: 'J_PAYMENT_SUCCESS',
  },
  {
    reviewId: 'CLIENT_SCREEN_13A_RECORDS',
    anchorId: reviewAnchorForView('RECORDS'),
    group: 'CLIENT_PORTAL',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Screen 13A · Your records all in one place',
    pageFamily: 'client-portal',
    componentSource: 'foundation-client/parents/ProjectPortal.tsx#RecordsLibrary',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'client_token',
    reviewAdapter: 'inline_fixture',
    fixtureContract: 'J_PAYMENT_SUCCESS',
  },
  {
    reviewId: 'CLIENT_RECORD_DOMAIN_DETAIL',
    anchorId: 'df-r-record-domain',
    group: 'CLIENT_PORTAL',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Screen 13A detail · Domain registration record',
    pageFamily: 'client-portal',
    componentSource: 'foundation-client/parents/ProjectPortal.tsx#RecordDetail',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'client_token',
    reviewAdapter: 'inline_fixture',
    fixtureContract: 'M_COMPLETE_CREDIT',
    notes: 'Overview / documents / settings / history tabs. Documents stay empty until a document contract exists.',
  },
  {
    reviewId: 'CLIENT_FOUNDATION_COMM_PREFS',
    anchorId: reviewAnchorForView('COMM_PREFS'),
    group: 'CLIENT_PORTAL',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Communication preferences',
    pageFamily: 'client-portal',
    componentSource: 'foundation-client/parents/ProjectPortal.tsx#CommunicationPreferences',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'client_token',
    reviewAdapter: 'inline_fixture',
    fixtureContract: 'J_PAYMENT_SUCCESS',
  },
  gapEntry(
    'CLIENT_ACTIVITY',
    'df-r-client-activity',
    'CLIENT_PORTAL',
    'Client activity feed',
    'No dedicated client activity parent — activity lives in portal overview and records.',
  ),
  gapEntry(
    'CLIENT_IN_PROGRESS',
    'df-r-client-in-progress',
    'CLIENT_PORTAL',
    'Project in progress',
    'Use stage detail + roadmap fixtures for in-progress states.',
  ),
  gapEntry(
    'CLIENT_WAITING_CLIENT',
    'df-r-waiting-on-client',
    'CLIENT_PORTAL',
    'Waiting on client',
    'Needs-you parent covers open client actions when present on fixture.',
  ),
  gapEntry(
    'CLIENT_WAITING_PROVIDER',
    'df-r-waiting-on-provider',
    'CLIENT_PORTAL',
    'Waiting on provider',
    'Operational stage copy — no separate static parent.',
  ),
  gapEntry(
    'CLIENT_FINAL_VERIFICATION',
    'df-r-final-verification',
    'CLIENT_PORTAL',
    'Final verification',
    'Rendered via stage roadmap when foundation nears complete.',
  ),
  {
    reviewId: 'CLIENT_SCREEN_11_COMPLETE',
    anchorId: 'df-r-complete',
    group: 'CLIENT_COMPLETION',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Screen 11 · Your foundation is complete',
    pageFamily: 'client-portal',
    componentSource: 'foundation-client/parents/FoundationMilestone.tsx#P11FoundationComplete',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'client_token',
    reviewAdapter: 'inline_fixture',
    fixtureContract: 'M_COMPLETE_CREDIT',
    notes: 'Milestone inside the portal — the four portal areas stay reachable.',
  },
  {
    reviewId: 'CLIENT_SCREEN_12_LOCATION',
    anchorId: 'df-r-location',
    group: 'CLIENT_COMPLETION',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Screen 12 · Your digital location (next threshold)',
    pageFamily: 'client-portal',
    componentSource: 'foundation-client/parents/FoundationMilestone.tsx#P12DigitalLocation',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'client_token',
    reviewAdapter: 'inline_fixture',
    fixtureContract: 'M_COMPLETE_CREDIT',
    notes: 'Credit state from the eligibility contract; build paths from builder PLACE_OPTIONS. Handoff inert in review.',
  },
  {
    reviewId: 'CLIENT_PORTAL_COMPLETE_NAV',
    anchorId: 'df-r-client-portal-complete',
    group: 'CLIENT_COMPLETION',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Completed portal (navigable shell)',
    pageFamily: 'client-portal',
    componentSource: 'foundation-client/FoundationClient.tsx + ProjectPortal + FoundationMilestone parents',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'client_token',
    reviewAdapter: 'inline_fixture',
    fixtureContract: 'M_COMPLETE_CREDIT',
    notes: 'Post-completion portal: overview, roadmap, needs you, records, milestone and next threshold.',
  },
  {
    ...gapEntry(
      'CLIENT_SCREEN_12A_LOCATION_LIVE',
      'df-r-digital-location-live',
      'CLIENT_COMPLETION',
      'Screen 12A · Your digital location is live',
      'Board-only. Owned by the SITE 00 Digital Location product — shown when a location project launches, not on foundation completion.',
    ),
    productOwner: DF_REVIEW_PRODUCT.SITE00_DIGITAL_LOCATION,
  },
  {
    reviewId: 'CLIENT_ACCESS_RETURN',
    anchorId: 'df-r-client-return',
    group: 'CLIENT_ACCESS',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Secure email reentry / session return',
    pageFamily: 'client-access',
    componentSource: 'pages/foundation/DigitalFoundationReturnPage.tsx',
    runtimeRoute: SITE00_ROUTES.digitalFoundationReturn,
    renderMode: 'external_route',
    implementationStatus: 'reviewable',
    authRequirement: 'client_token',
    reviewAdapter: 'live_route',
    notes: 'Live route — session or reentry form (not inline).',
  },
  gapEntry(
    'CLIENT_HOME_RETURN',
    'df-r-client-home',
    'CLIENT_ACCESS',
    'Home screen return (PWA)',
    'PWA install + return uses live foundation link — no separate review panel.',
  ),
];

const FOUNDER_ENTRIES: DfReviewEntry[] = [
  ...FOUNDER_WORKSPACE_SIDEBAR_NAV.map((item) =>
    founderRoute(
      item.id.toUpperCase(),
      item.label,
      item.href,
      `admin/founder-workspace/pages/${item.id === 'overview' ? 'Overview' : item.id.charAt(0).toUpperCase() + item.id.slice(1)}Page.tsx`,
      item.id === 'reviews' ? 'FOUNDER_REVIEW_QUEUE' : item.id === 'operations' || item.id === 'correspondence' ? 'FOUNDER_OPERATIONS' : 'FOUNDER_WORKSPACE',
    ),
  ),
  founderRoute(
    'CREATE_CLIENT',
    'Create client (OL-01)',
    IDNTY_FOUNDER_WORKSPACE_ROUTES.foundations,
    'admin/founder-workspace/overlays/CreateClientOverlay.tsx',
    'FOUNDER_WORKSPACE',
    'Opens from workspace shell — requires founder auth.',
  ),
  founderRoute(
    'CLIENT_RECORD',
    'Client record (foundations/:id)',
    `${IDNTY_FOUNDER_WORKSPACE_ROUTES.foundations}/:artifactId`,
    'admin/founder-workspace/pages/ClientRecordPage.tsx',
    'FOUNDER_WORKSPACE',
  ),
  founderRoute(
    'REVIEWS_INTAKE_QUEUE',
    'Submitted intake review queue',
    IDNTY_FOUNDER_WORKSPACE_ROUTES.reviews,
    'admin/founder-workspace/pages/ReviewsPage.tsx',
    'FOUNDER_REVIEW_QUEUE',
  ),
  founderRoute(
    'INTAKE_REVIEW_DETAIL',
    'Intake review detail',
    IDNTY_FOUNDER_WORKSPACE_ROUTES.reviews,
    'admin/founder-workspace/pages/ReviewsPage.tsx#Decision',
    'FOUNDER_REVIEW_QUEUE',
  ),
  founderRoute(
    'QUOTE_APPROVAL',
    'Quote approval (OL-08)',
    IDNTY_FOUNDER_WORKSPACE_ROUTES.reviews,
    'admin/founder-workspace/pages/ReviewsPage.tsx + overlay OL-08',
    'FOUNDER_REVIEW_QUEUE',
  ),
  founderRoute(
    'QUOTE_REVISE',
    'Quote draft / revise (OL-09)',
    IDNTY_FOUNDER_WORKSPACE_ROUTES.reviews,
    'admin/founder-workspace/pages/ReviewsPage.tsx + overlay OL-09',
    'FOUNDER_REVIEW_QUEUE',
  ),
  founderRoute(
    'CLARIFICATION_REQUEST',
    'Clarification request (OL-11)',
    IDNTY_FOUNDER_WORKSPACE_ROUTES.reviews,
    'admin/founder-workspace/pages/ReviewsPage.tsx + overlay OL-11',
    'FOUNDER_REVIEW_QUEUE',
  ),
  founderRoute(
    'REFERRALS_CARD_STUDIO',
    'Card studio (referrals)',
    IDNTY_FOUNDER_WORKSPACE_ROUTES.referrals,
    'admin/founder-workspace/pages/ReferralsPage.tsx#CardStudio',
    'FOUNDER_WORKSPACE',
  ),
  founderRoute(
    'SYSTEM_TEST_LAB',
    'Test lab (system)',
    IDNTY_FOUNDER_WORKSPACE_ROUTES.system,
    'admin/founder-workspace/pages/SystemPage.tsx',
    'FOUNDER_WORKSPACE',
  ),
  founderBoard(
    'FOUNDATION_PIPELINE',
    'Screen 13 · Foundation pipeline',
    SITE00_ROUTES.digitalFoundationPipeline,
    'admin/pages/foundation/boards/FounderBoards.tsx#FounderPipelineBoard',
    'FOUNDER_WORKSPACE',
    'Portfolio oversight over getPipelineView + pipelineAttentionQueries.',
  ),
  founderBoard(
    'PROJECT_COMMAND',
    'Screen 14 · Project command',
    SITE00_ROUTES.digitalFoundationProjectCommand,
    'admin/pages/foundation/boards/FounderBoards.tsx#FounderProjectCommandBoard',
    'FOUNDER_WORKSPACE',
    'Single project over getProjectCommandSnapshot + getRunbookView.',
  ),
  founderBoard(
    'EXECUTION_WORKBENCH',
    'Screen 15 · Execution workbench',
    SITE00_ROUTES.digitalFoundationWorkbench,
    'admin/pages/foundation/boards/FounderBoards.tsx#FounderWorkbenchBoard',
    'FOUNDER_OPERATIONS',
  ),
  founderBoard(
    'RUNBOOK_OVERVIEW',
    'Screen 15A · Your runbook at a glance',
    SITE00_ROUTES.digitalFoundationRunbook,
    'admin/pages/foundation/boards/FounderBoards.tsx#FounderRunbookOverviewBoard',
    'FOUNDER_OPERATIONS',
  ),
  founderBoard(
    'RUNBOOK_DETAIL',
    'Screen 15B · Foundation runbook detail',
    SITE00_ROUTES.digitalFoundationRunbookTasks,
    'admin/pages/foundation/boards/FounderBoards.tsx#FounderRunbookDetailBoard',
    'FOUNDER_OPERATIONS',
  ),
  founderBoard(
    'RUNBOOK_TASK_DETAIL',
    'Screen 15C · Task detail',
    SITE00_ROUTES.digitalFoundationRunbookTask,
    'admin/pages/foundation/boards/FounderBoards.tsx#FounderTaskDetailBoard',
    'FOUNDER_OPERATIONS',
    'Opens on the in-progress task of the snapshot (DKIM configured). Start / mark executed are inert in review.',
  ),
];

const OVERLAY_ENTRIES = [...WORKSPACE_OVERLAY_IDS, ...REFERRAL_OVERLAY_IDS].map(overlayEntry);

const HYBRID_BUILDER_STUDIO = (['PLACE', 'FEEL', 'WORK', 'PACE', 'BLUEPRINT'] as const).map(
  (room): DfReviewEntry => ({
    reviewId: `HYBRID_BUILDER_${room}`,
    anchorId: `df-r-bldr-${room}`,
    group: 'FOUNDATION_BUILDER',
    productOwner: DF_REVIEW_PRODUCT.SITE00_PUBLIC_BUILDER,
    pageName: `Hybrid builder · ${room}`,
    pageFamily: 'hybrid-spatial-builder',
    componentSource: 'pages/bldr/BldrSpatialStudioPage.tsx → BuilderStudio (?reviewRoom= sample embed)',
    runtimeRoute: `${SITE00_ROUTES.bldrSpatialStudio}/${room.toLowerCase()}?reviewRoom=${room}`,
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    authRequirement: 'none',
    reviewAdapter: 'inline_fixture',
    notes: 'Sample-mode iframe on DF review — distinct from P03 foundation configurator.',
  }),
);

export const DIGITAL_FOUNDATION_REVIEW_ENTRIES: readonly DfReviewEntry[] = [
  ...CLIENT_INLINE,
  ...FOUNDER_ENTRIES,
  ...OVERLAY_ENTRIES,
  ...HYBRID_BUILDER_STUDIO,
];

const anchorIndex = new Map<string, DfReviewEntry>();
for (const entry of DIGITAL_FOUNDATION_REVIEW_ENTRIES) {
  anchorIndex.set(entry.anchorId, entry);
  for (const legacy of entry.legacyAnchors ?? []) anchorIndex.set(legacy, entry);
}

export function resolveReviewEntry(anchorId: string): DfReviewEntry | undefined {
  return anchorIndex.get(anchorId);
}

/** Full registry for nav / coverage (every discovered page). */
export function allReviewRegistryEntries(): DfReviewEntry[] {
  return [...DIGITAL_FOUNDATION_REVIEW_ENTRIES];
}

/** Inline panels on the review page (includes legacy blocked anchors). */
export function reviewEntriesForIndex(): DfReviewEntry[] {
  return DIGITAL_FOUNDATION_REVIEW_ENTRIES.filter(
    (e) =>
      e.renderMode === 'inline_df_screen' ||
      e.renderMode === 'inline_founder_shell' ||
      e.renderMode === 'legacy_redirect' ||
      e.renderMode === 'registry_gap',
  );
}

export function reviewEntriesByGroup(): Map<DfReviewGroupId, DfReviewEntry[]> {
  const map = new Map<DfReviewGroupId, DfReviewEntry[]>();
  for (const entry of allReviewRegistryEntries()) {
    const list = map.get(entry.group) ?? [];
    list.push(entry);
    map.set(entry.group, list);
  }
  return map;
}

export const APPROVED_FOUNDATION_BUILDER_SOURCE =
  'foundation-client/parents/EntryIntake.tsx#P03Configure';

export function registryCoverageTotals() {
  const all = allReviewRegistryEntries();
  return {
    discovered: all.length,
    reviewable: all.filter((e) => e.implementationStatus === 'reviewable').length,
    auth_gated: all.filter((e) => e.implementationStatus === 'auth_gated').length,
    backend_blocked: all.filter((e) => e.implementationStatus === 'backend_blocked').length,
    not_implemented: all.filter((e) => e.implementationStatus === 'not_implemented').length,
    legacy: all.filter((e) => e.implementationStatus === 'legacy_redirect').length,
  };
}
