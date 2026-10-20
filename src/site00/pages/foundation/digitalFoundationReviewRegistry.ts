/**
 * Canonical Digital Foundation review registry (IDNTY micro-product).
 * Source-grounded inventory for `/foundation/review` — not a substitute for live routes.
 */
import { SITE00_ROUTES } from '../../config/routes';
import type { DfView } from '../../foundation-client/model';
import { reviewAnchorForView } from './reviewLinks';

export const DIGITAL_FOUNDATION_REVIEW_REGISTRY_VERSION = '2026-10-20-lock1';

export const DF_REVIEW_PRODUCT = {
  IDNTY_DIGITAL_FOUNDATION: 'IDNTY_DIGITAL_FOUNDATION',
  IDNTY_FOUNDER_WORKSPACE: 'IDNTY_FOUNDER_WORKSPACE',
  SITE00_PUBLIC_BUILDER: 'SITE00_PUBLIC_BUILDER',
} as const;

/** Imports that must never satisfy IDNTY foundation builder review entries. */
export const FORBIDDEN_FOUNDATION_BUILDER_REVIEW_IMPORTS = [
  '../../builder-studio/BuilderStudio',
  '../bldr/BldrSpatialStudioPage',
  'builder-studio/BuilderStudio',
] as const;

/** Iframe / route patterns that must not mount as the foundation builder in review. */
export const FORBIDDEN_FOUNDATION_BUILDER_REVIEW_SRC = '/bldr/studio/';

export type DfReviewGroupId =
  | 'INTAKE'
  | 'FOUNDATION_BUILDER'
  | 'POST_INTAKE'
  | 'PROPOSAL_CHECKOUT'
  | 'CLIENT_PORTAL'
  | 'CLIENT_ACCESS'
  | 'FOUNDER_WORKSPACE'
  | 'DEPRECATED';

export type DfReviewRenderMode = 'inline_df_screen' | 'external_route' | 'legacy_redirect';

export type DfReviewEntry = {
  reviewId: string;
  anchorId: string;
  legacyAnchors?: readonly string[];
  group: DfReviewGroupId;
  productOwner: (typeof DF_REVIEW_PRODUCT)[keyof typeof DF_REVIEW_PRODUCT];
  pageName: string;
  componentSource: string;
  runtimeRoute?: string;
  renderMode: DfReviewRenderMode;
  implementationStatus: 'reviewable' | 'auth_gated' | 'backend_blocked' | 'legacy_redirect';
  notes?: string;
};

export const DIGITAL_FOUNDATION_REVIEW_GROUP_LABELS: Record<DfReviewGroupId, string> = {
  INTAKE: 'Foundation intake',
  FOUNDATION_BUILDER: 'Digital Foundation builder (P03 configurator)',
  POST_INTAKE: 'Post-intake waiting',
  PROPOSAL_CHECKOUT: 'Proposal & checkout',
  CLIENT_PORTAL: 'Client foundation portal',
  CLIENT_ACCESS: 'Client access',
  FOUNDER_WORKSPACE: 'Founder workspace (live auth)',
  DEPRECATED: 'Deprecated review links',
};

function intakeEntry(view: DfView, pageName: string, source: string): DfReviewEntry {
  return {
    reviewId: `INTAKE_${view}`,
    anchorId: reviewAnchorForView(view),
    group: view === 'P03' ? 'FOUNDATION_BUILDER' : 'INTAKE',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName,
    componentSource: source,
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
  };
}

export const DIGITAL_FOUNDATION_REVIEW_ENTRIES: readonly DfReviewEntry[] = [
  intakeEntry('P01', 'Get started', 'foundation-client/parents/EntryIntake.tsx#P01Entry'),
  intakeEntry('P02', 'Business information', 'foundation-client/parents/EntryIntake.tsx#P02Intake'),
  {
    reviewId: 'FOUNDATION_BUILDER_P03',
    anchorId: reviewAnchorForView('P03'),
    group: 'FOUNDATION_BUILDER',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Build your foundation (configurator)',
    componentSource: 'foundation-client/parents/EntryIntake.tsx#P03Configure',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    notes: 'Approved IDNTY foundation builder — not /bldr/studio public customer builder.',
  },
  intakeEntry('P04', 'Recommendation', 'foundation-client/parents/Recommendation.tsx#P04Recommendation'),
  intakeEntry('P05', 'Review + checkout', 'foundation-client/parents/CheckoutActivation.tsx#P05Review'),
  intakeEntry('P06', 'Activation', 'foundation-client/parents/CheckoutActivation.tsx#P06Activation'),
  {
    reviewId: 'CLIENT_FOUNDATION_OVERVIEW',
    anchorId: reviewAnchorForView('OVERVIEW'),
    legacyAnchors: ['df-r-OVERVIEW'],
    group: 'CLIENT_PORTAL',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Project overview',
    componentSource: 'foundation-client/parents/ProjectPortal.tsx#P07ProjectOverview',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
  },
  {
    reviewId: 'CLIENT_FOUNDATION_ROADMAP',
    anchorId: reviewAnchorForView('ROADMAP'),
    group: 'CLIENT_PORTAL',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Project roadmap',
    componentSource: 'foundation-client/parents/ProjectPortal.tsx#P08Roadmap',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
  },
  {
    reviewId: 'CLIENT_FOUNDATION_NEEDS_YOU',
    anchorId: reviewAnchorForView('NEEDS_YOU'),
    group: 'CLIENT_PORTAL',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Needs you',
    componentSource: 'foundation-client/parents/ProjectPortal.tsx#P10NeedsYou',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
  },
  {
    reviewId: 'CLIENT_FOUNDATION_STAGE',
    anchorId: reviewAnchorForView('STAGE'),
    group: 'CLIENT_PORTAL',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Stage detail',
    componentSource: 'foundation-client/parents/ProjectPortal.tsx#P09StageDetail',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
  },
  {
    reviewId: 'CLIENT_FOUNDATION_RECORDS',
    anchorId: reviewAnchorForView('RECORDS'),
    group: 'CLIENT_PORTAL',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'My records',
    componentSource: 'foundation-client/parents/ProjectPortal.tsx#RecordsLibrary',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
  },
  {
    reviewId: 'CLIENT_FOUNDATION_COMM_PREFS',
    anchorId: reviewAnchorForView('COMM_PREFS'),
    group: 'CLIENT_PORTAL',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Communication preferences',
    componentSource: 'foundation-client/parents/ProjectPortal.tsx#CommunicationPreferences',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
  },
  {
    reviewId: 'POST_INTAKE_SUBMITTED',
    anchorId: 'df-r-post-intake-submitted',
    group: 'POST_INTAKE',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Intake received / taking shape',
    componentSource: 'foundation-client/parents/IntakeSubmittedStatus.tsx#P03IntakeSubmitted',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    notes: 'Fixture preview — simulated post-intake surface (no live quote).',
  },
  {
    reviewId: 'CLIENT_ACCESS_RETURN',
    anchorId: 'df-r-client-return',
    group: 'CLIENT_ACCESS',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Email reentry / session return',
    componentSource: 'pages/foundation/DigitalFoundationReturnPage.tsx',
    runtimeRoute: SITE00_ROUTES.digitalFoundationReturn,
    renderMode: 'external_route',
    implementationStatus: 'reviewable',
    notes: 'Open live route in new tab — uses session or reentry form.',
  },
  {
    reviewId: 'CLIENT_FOUNDATION_COMPLETE',
    anchorId: 'df-r-complete',
    group: 'CLIENT_PORTAL',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_DIGITAL_FOUNDATION,
    pageName: 'Foundation complete',
    componentSource: 'pages/foundation/DigitalFoundationCompleteSurface.tsx',
    renderMode: 'inline_df_screen',
    implementationStatus: 'reviewable',
    notes: 'Fixture M_COMPLETE_CREDIT — simulated completion.',
  },
  {
    reviewId: 'FOUNDER_WORKSPACE_OVERVIEW',
    anchorId: 'df-r-founder-overview',
    group: 'FOUNDER_WORKSPACE',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_FOUNDER_WORKSPACE,
    pageName: 'Founder workspace overview',
    componentSource: 'admin/founder-workspace/FounderWorkspaceApp.tsx',
    runtimeRoute: SITE00_ROUTES.digitalFoundationFounderWorkspaceOverview,
    renderMode: 'external_route',
    implementationStatus: 'auth_gated',
  },
  {
    reviewId: 'FOUNDER_WORKSPACE_FOUNDATIONS',
    anchorId: 'df-r-founder-foundations',
    group: 'FOUNDER_WORKSPACE',
    productOwner: DF_REVIEW_PRODUCT.IDNTY_FOUNDER_WORKSPACE,
    pageName: 'Foundations registry',
    componentSource: 'admin/founder-workspace/pages/FoundationsPage.tsx',
    runtimeRoute: `${SITE00_ROUTES.digitalFoundationFounderWorkspace}/foundations`,
    renderMode: 'external_route',
    implementationStatus: 'auth_gated',
  },
  ...(['PLACE', 'FEEL', 'WORK', 'PACE', 'BLUEPRINT'] as const).map(
    (room): DfReviewEntry => ({
      reviewId: `DEPRECATED_PUBLIC_BUILDER_${room}`,
      anchorId: `df-r-bldr-${room}`,
      group: 'DEPRECATED',
      productOwner: DF_REVIEW_PRODUCT.SITE00_PUBLIC_BUILDER,
      pageName: `Legacy BLDR · ${room} (public builder — wrong product)`,
      componentSource: 'pages/bldr/BldrSpatialStudioPage.tsx → BuilderStudio (FORBIDDEN for DF review)',
      runtimeRoute: `${SITE00_ROUTES.bldrSpatialStudio}/${room.toLowerCase()}`,
      renderMode: 'legacy_redirect',
      implementationStatus: 'legacy_redirect',
      notes: 'Previously iframe-mounted public SITE 00 builder. Use FOUNDATION_BUILDER_P03 (#df-r-P03).',
    }),
  ),
];

const anchorIndex = new Map<string, DfReviewEntry>();
for (const entry of DIGITAL_FOUNDATION_REVIEW_ENTRIES) {
  anchorIndex.set(entry.anchorId, entry);
  for (const legacy of entry.legacyAnchors ?? []) anchorIndex.set(legacy, entry);
}

export function resolveReviewEntry(anchorId: string): DfReviewEntry | undefined {
  return anchorIndex.get(anchorId);
}

/** Nav-visible entries (inline review on this page). */
export function reviewEntriesForIndex(): DfReviewEntry[] {
  return DIGITAL_FOUNDATION_REVIEW_ENTRIES.filter(
    (e) => e.renderMode === 'inline_df_screen' || e.renderMode === 'legacy_redirect',
  );
}

export function reviewEntriesByGroup(): Map<DfReviewGroupId, DfReviewEntry[]> {
  const map = new Map<DfReviewGroupId, DfReviewEntry[]>();
  for (const entry of reviewEntriesForIndex()) {
    const list = map.get(entry.group) ?? [];
    list.push(entry);
    map.set(entry.group, list);
  }
  return map;
}

export const APPROVED_FOUNDATION_BUILDER_SOURCE =
  'foundation-client/parents/EntryIntake.tsx#P03Configure';
