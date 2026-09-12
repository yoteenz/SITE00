/**
 * P0.VR.UPGRADE.2 — Twin reconstruction types.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import type { ReconstructionPlan } from '../p0vrCapture1/reconstructionPlan.js';

export const PAGE_IMPLEMENTATION_STATES = ['LIVE', 'TWIN', 'ARCHIVED'] as const;
export type PageImplementationState = (typeof PAGE_IMPLEMENTATION_STATES)[number];

export const TWIN_SESSION_STATUSES = [
  'PLANNED',
  'BUILDING',
  'READY_FOR_REVIEW',
  'REVISION_REQUESTED',
  'REVISING',
  'VERIFYING',
  'APPROVED_FOR_PROMOTION',
  'PROMOTING',
  'PROMOTED',
  'FAILED',
  'SUPERSEDED',
  'ARCHIVED',
] as const;
export type TwinSessionStatus = (typeof TWIN_SESSION_STATUSES)[number];

export const TWIN_MUTATION_POLICIES = ['READ_ONLY', 'SAFE_TEST', 'LIVE_ALLOWED'] as const;
export type TwinMutationPolicy = (typeof TWIN_MUTATION_POLICIES)[number];

export type PageFunctionContract = {
  route: string;
  auth: string[];
  permissions: string[];
  dataQueries: string[];
  mutations: string[];
  forms: string[];
  links: string[];
  navigation: string[];
  state: string[];
  featureFlags: string[];
  actions: string[];
  businessRules: string[];
};

export type TwinBuildStepReceipt = {
  step: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETE' | 'FAILED';
  completedAt: string | null;
  detail: string | null;
};

export type TwinImplementationVersion = {
  versionId: string;
  sessionId: string;
  revisionNumber: number;
  buildRef: string;
  commitSha: string | null;
  createdAt: string;
  status: 'DRAFT' | 'READY' | 'PROMOTED' | 'SUPERSEDED' | 'ARCHIVED';
};

export type TwinRevision = {
  revisionId: string;
  sessionId: string;
  instruction: string;
  source: 'FOUNDER' | 'SYSTEM';
  createdAt: string;
  status: 'PENDING' | 'APPLYING' | 'APPLIED' | 'FAILED';
  resultVersionId: string | null;
  materialDirectionChange: boolean;
};

export type TwinViewportCapture = {
  sessionId: string;
  pageId: string;
  viewport: DesignViewportClass;
  captureId: string;
  imageRef: string | null;
  capturedAt: string;
  status: 'CAPTURE_READY' | 'CAPTURE_FAILED' | 'CAPTURE_PENDING';
};

export type TwinFidelityDimension = 'STRUCTURE' | 'VISUAL' | 'ASSET' | 'FUNCTION' | 'RESPONSIVE';

export type TwinFidelityQaResult = {
  dimension: TwinFidelityDimension;
  status: 'PASS' | 'WARN' | 'FAIL' | 'PENDING';
  summary: string;
};

export type PromotionReadiness = {
  visualReady: boolean;
  functionReady: boolean;
  routeReady: boolean;
  authorityCurrent: boolean;
  captureReady: boolean;
  founderApproved: boolean;
  blockingIssues: string[];
  warnings: string[];
};

export type LiveImplementationSnapshot = {
  snapshotId: string;
  projectId: string;
  pageId: string;
  route: string;
  implementationVersionId: string;
  captureId: string | null;
  createdAt: string;
  reason: 'PRE_PROMOTION' | 'PRE_RESTORE';
  status: 'CREATED' | 'ARCHIVED';
};

export type ArchivedPageVersion = {
  archiveId: string;
  pageId: string;
  route: string;
  implementationVersionId: string;
  captureId: string | null;
  promotedOutAt: string;
  sourceSessionId: string | null;
  status: 'ARCHIVED' | 'RESTORED';
};

export type PromotionReceipt = {
  promotionId: string;
  sessionId: string;
  pageId: string;
  fromVersionId: string;
  toVersionId: string;
  archivedVersionId: string;
  startedAt: string;
  completedAt: string | null;
  status: 'PREPARING' | 'VERIFYING' | 'SWITCHING' | 'COMPLETE' | 'FAILED';
  errors: string[];
};

export type PageRecoveryReceipt = {
  recoveryId: string;
  fromVersionId: string;
  toVersionId: string;
  archiveId: string;
  reason: string;
  restoredAt: string;
  status: 'COMPLETE' | 'FAILED';
};

export type PageImplementationVersion = {
  versionId: string;
  commitSha: string | null;
  patchId: string | null;
  buildRef: string;
  pageId: string;
  route: string;
  sourceSessionId: string | null;
  authorityVersionId: string | null;
  captureId: string | null;
  reconstructionPlanId: string | null;
  status: 'LIVE' | 'TWIN' | 'ARCHIVED';
  createdAt: string;
};

export type ReconstructionTwinSession = {
  sessionId: string;
  projectId: string;
  pageId: string;
  viewport: DesignViewportClass;
  canonicalRoute: string;
  twinRoute: string;
  authorityVersionId: string;
  beforeCaptureId: string;
  reconstructionPlanId: string;
  sourceLiveVersionId: string;
  twinVersionId: string | null;
  mutationPolicy: TwinMutationPolicy;
  functionContract: PageFunctionContract;
  reconstructionPlan: ReconstructionPlan;
  measuredSpecId?: string | null;
  forensicsReportId?: string | null;
  postTwinForensicsReportId?: string | null;
  convergenceBefore?: import('../p0vrDiag1/types.js').VisualConvergenceScore | null;
  convergenceAfter?: import('../p0vrDiag1/types.js').VisualConvergenceScore | null;
  regionConvergence?: import('../p0vrDiag1/types.js').RegionConvergenceResult[] | null;
  status: TwinSessionStatus;
  buildSteps: TwinBuildStepReceipt[];
  twinCapture: TwinViewportCapture | null;
  revisions: TwinRevision[];
  twinVersions: TwinImplementationVersion[];
  fidelityQa: TwinFidelityQaResult[];
  promotionReadiness: PromotionReadiness | null;
  responsiveImpact: string[];
  createdAt: string;
  updatedAt: string;
  approvedForPromotionAt: string | null;
  promotedAt: string | null;
  regionExecutionDecisions?: import('../p0vrConverge1/types.js').RegionExecutionDecision[];
  twinBuildReceipt?: import('../p0vrConverge1/types.js').TwinBuildReceipt | null;
  visualRefinement?: import('../p0vrConverge1/types.js').VisualRefinementSession | null;
  twinCssPatch?: import('../p0vrConverge1/twinCssPatchEngine.js').TwinCssPatch | null;
  activeBuildJobId?: string | null;
  buildJobStatus?: string | null;
  lastBuildExecutionReceipt?: import('../p0vrConverge1/twinBuildJob.js').TwinBuildExecutionReceipt | null;
  /** P0.VR.REBUILD.1 — Authority-first reconstruction */
  reconstructionStrategy?: import('../p0vrRebuild1/types.js').ReconstructionStrategy;
  compositionDivergenceScore?: import('../p0vrRebuild1/types.js').CompositionDivergenceScore | null;
  twinCompositionVersion?: import('../p0vrRebuild1/types.js').TwinCompositionVersion | null;
  authorityRegionOrder?: string[] | null;
  visualAuthorityStatus?: import('../p0vrRebuild1/types.js').VisualAuthorityStatus | null;
  twinRenderMode?: import('../p0vrRebuild1/types.js').TwinRenderMode | null;
  authorityCompositionCoverage?: import('../p0vrRebuild1/types.js').AuthorityCompositionCoverage | null;
  legacyStructureRetentionCheck?: import('../p0vrRebuild1/types.js').LegacyStructureRetentionCheck | null;
  visualAuthorityAcceptanceGate?: import('../p0vrRebuild1/types.js').VisualAuthorityAcceptanceGate | null;
  fidelityScoreProvenance?: import('../p0vrRebuild1/types.js').FidelityScoreProvenance[] | null;
  /** P0.VR.REPLICATION.1 */
  reconstructionMode?: import('../p0vrReplication1/types.js').ReconstructionMode | null;
  replicationIterations?: import('../p0vrReplication1/types.js').ReplicationIteration[] | null;
  replicationBudgetPolicy?: import('../p0vrReplication1/types.js').ReplicationBudgetPolicy | null;
  finalReplicationDiff?: import('../p0vrReplication1/types.js').VisualReplicationDiff | null;
  visualPageBlueprintId?: string | null;
  founderVisualAcceptance?: import('../p0vrReplication1/types.js').FounderVisualAcceptance | null;
  legacyTwinLabel?: 'LEGACY_PATCH_TWIN' | null;
  /** P0.VR.REPLICATION.1R1 */
  replicationExecutionReceipt?: import('../p0vrReplication1R1/replicationExecutionReceipt.js').ReplicationExecutionReceipt | null;
  replicationExecutionMode?: import('../p0vrReplication1R1/replicationExecutionReceipt.js').ReplicationExecutionMode | null;
  replicationNextStrategy?: 'CONTINUE_REFINEMENT' | 'SWITCH_IMPLEMENTATION_APPROACH' | null;
  /** P0.VR.REPLICATION.2 — Shell-first geometric reconstruction */
  authorityShellBlueprintId?: string | null;
  shellMatchResult?: import('../p0vrReplication2/shellMatchResult.js').ShellMatchResult | null;
  shellReconstructionReceipt?: import('../p0vrReplication2/shellReconstructionReceipt.js').ShellReconstructionReceipt | null;
};

export type PageLiveRegistryEntry = {
  projectId: string;
  pageId: string;
  route: string;
  implementationState: PageImplementationState;
  liveVersionId: string;
  lastKnownGoodPageVersionId: string | null;
  activeTwinSessionId: string | null;
};
