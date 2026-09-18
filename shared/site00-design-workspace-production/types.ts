import type { ComposerContractFreezeMetadata } from './composerContractFreeze.js';

export const DESIGN_PRODUCTION_STORE_VERSION = 2 as const;

export const DESIGN_PRODUCTION_PAGE_ID = 'design-twin-opus-direct' as const;

export type FounderActor = { email: string | null; isFounder: boolean };

export type DesignWorkflowStage = 'DESIGN' | 'BUILD';

export type DesignPackageStatus =
  | 'DESIGN_IN_PROGRESS'
  | 'DESIGN_APPROVED'
  | 'READY_FOR_PRODUCTIONIZATION'
  | 'BUILD_REVIEW_READY'
  | 'APPROVED_FOR_BUILD';

export type ViewportAuthorityState =
  | 'MISSING'
  | 'SELECTED'
  | 'PROMOTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'LOCKED'
  | 'SUPERSEDED';

export type AuthorityReviewDecision = 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT' | null;

export type TabletAuthorityMode = 'DERIVED' | 'OVERRIDE';

export type DesignProductionEventType =
  | 'VIEWPORT_SELECTED'
  | 'VIEWPORT_UNSELECTED'
  | 'VIEWPORT_MASTER_PROMOTED'
  | 'VIEWPORT_MASTER_SUPERSEDED'
  | 'PAIR_LOCKED'
  | 'PAIR_SUPERSEDED'
  | 'DERIVATION_MARKED_STALE'
  | 'FOUNDER_AUTHORITY_INJECTION'
  | 'MOVED_TO_BUILD'
  | 'CANDIDATE_REFINED'
  | 'CANDIDATE_REGENERATED'
  | 'AUTHORITY_REVIEWED'
  | 'PAIR_REVIEW_OPENED'
  | 'TABLET_OVERRIDE_CREATED'
  | 'COMPOSER_HANDOFF_CREATED'
  | 'TWIN_IMPLEMENTATION_STARTED';

export type DesignProductionHistoryEntry = {
  id: string;
  type: DesignProductionEventType;
  at: string;
  actorEmail: string | null;
  summary: string;
  payload?: Record<string, unknown>;
};

export type SpendConfirmationRecord = {
  id: string;
  action: 'REFINE' | 'REGENERATE';
  estimatedUsd: number;
  confirmedAt: string;
  runId: string | null;
  actualUsd: number | null;
  provider: string | null;
  model: string | null;
};

export type BuildPackageReference = {
  id: string;
  projectId: string;
  pageId: string;
  designAuthorityVersion: string;
  interactionContractVersion: string;
  assetManifestVersion: string;
  provenanceVersion: string;
  readinessReceiptId: string;
  createdAt: string;
  createdBy: string | null;
};

export type DesignProductionState = {
  storeVersion: typeof DESIGN_PRODUCTION_STORE_VERSION;
  projectId: string;
  pageId: typeof DESIGN_PRODUCTION_PAGE_ID;
  sessionVersion: number;
  contractFreeze: ComposerContractFreezeMetadata;
  workflowStage: DesignWorkflowStage;
  packageStatus: DesignPackageStatus;
  selectedCandidateId: string;
  /** Gallery highlight only — not the same as viewport preference. */
  preferredMobileConceptId: string | null;
  preferredDesktopConceptId: string | null;
  promotedMobileConceptId: string | null;
  promotedDesktopConceptId: string | null;
  mobileAuthority: ViewportAuthorityState;
  desktopAuthority: ViewportAuthorityState;
  mobileVersion: string;
  desktopVersion: string;
  twinImplementationStatus: 'NONE' | 'IMPLEMENTING' | 'READY_FOR_REVIEW';
  /** Set when founder completes twin page review gate (Grok gating). */
  twinPageReviewedAt: string | null;
  pairReviewOpenedAt: string | null;
  authorityReviewDecision: AuthorityReviewDecision;
  authorityReviewedAt: string | null;
  pairLockedAt: string | null;
  authorityLockedBy: string | null;
  designAuthorityVersion: string;
  tabletMode: TabletAuthorityMode;
  tabletDerivedOk: boolean;
  tabletOverrideReason: string | null;
  tabletOverrideApprovedAt: string | null;
  translationApproved: boolean;
  buildPackage: BuildPackageReference | null;
  history: DesignProductionHistoryEntry[];
  spendConfirmations: SpendConfirmationRecord[];
  updatedAt: string;
};

export type ReadinessGateScope = 'DESIGN_AUTHORITY' | 'RESPONSIVE' | 'ASSETS' | 'INTERACTIONS' | 'PROVENANCE' | 'ACCESSIBILITY' | 'TECHNICAL' | 'FOUNDER' | 'BUILD';

export type ReadinessGateResult = 'PASS' | 'FAIL' | 'BLOCKED' | 'NOT_APPLICABLE';

export type ReadinessGateCheck = {
  id: string;
  label: string;
  scope: ReadinessGateScope;
  result: ReadinessGateResult;
  reason: string;
  blocking: boolean;
};

export type DesignReadinessReceipt = {
  id: string;
  computedAt: string;
  applicableGates: number;
  passedGates: number;
  readinessPercent: number;
  blockers: ReadinessGateCheck[];
  warnings: ReadinessGateCheck[];
  checks: ReadinessGateCheck[];
  buildEligible: boolean;
  readyLabel: 'READY' | 'BLOCKED' | 'UNKNOWN';
};

export type DesignWorkspaceArtifactView = {
  src: string;
  title: string;
  subtitle?: string;
  role?: string;
  viewport?: string;
  candidateId?: string;
  version?: string;
};

export type DesignProductionUiOverlay =
  | null
  | 'OV-OVERFLOW-MENU'
  | 'OV-CREATIVE-CONTEXT'
  | 'OV-PROVENANCE'
  | 'OV-READINESS-RECEIPT'
  | 'OV-CONTRACT-VERSIONS'
  | 'OV-HOST-MODULE-NAV'
  | 'OV-PAIR-REVIEW'
  | 'OV-REVIEW-AUTHORITY'
  | 'OV-SPEND-CONFIRM'
  | 'OV-FULLSCREEN-ARTIFACT'
  | 'OV-INSPECT-CANDIDATE'
  | 'OV-COMPARE-CONCEPTS'
  | 'OV-STRUCTURED-ARTIFACT'
  | 'OV-PAGE-BATCH-EDIT'
  | 'OV-PAGE-ASSET-INSPECT'
  | 'OV-PAGE-INTERACTIONS'
  | 'OV-PAGE-PIPELINE'
  | 'OV-PIPELINE-TECHNICAL'
  | 'OV-PIPELINE-STAGE'
  | 'OV-AMENDMENT-DETAIL'
  | 'OV-VIEWPORT-AUTHORITY-EDITOR'
  | 'OV-COMPOSER-HANDOFF'
  | 'OV-REVIEW-TWIN-PAGE';

export type DesignProductionUiPayload = {
  artifact?: DesignWorkspaceArtifactView;
  inspectCandidateId?: string;
  compareCandidateIds?: [string, string];
  structuredColumnId?: string;
  pageBatchEdit?: { sourcePageId: string; pageIds: string[]; scope: string };
  pageAssetId?: string;
  pipelineStageId?: string;
  authorityEditorViewport?: 'MOBILE' | 'DESKTOP';
  reviewTwinRoute?: string;
};
