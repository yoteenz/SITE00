/**
 * P0.VR.DESIGN-WORKSPACE-PIPELINE-REACTIVITY-AND-STALE-STATE-ELIMINATION1
 * Single canonical Design Workspace pipeline state compiled from durable generation + workflow stores.
 */

import type { DesignProductionState } from './types.js';
import type { PageAuthorityWorkflowState } from './designPageAuthorityWorkflow.js';
import { compileDesignPageContext } from './designProjectBinding/pageContext.js';
import { isOpusFrameworkHandoffPackage } from './designOpusFrameworkHandoff.js';
import type {
  PageConceptGeneratedArtifact,
  PageConceptGenerationState,
  PageConceptPipelineSet,
} from './pageConceptPipeline/types.js';
import {
  resolveExperienceExpressionStatus,
  resolveMobileAuthorityStatus,
} from './pageConceptPipeline/pageConceptViewportFamilyState.js';
import {
  resolveViewportBaseAuthorityStatus,
  resolveViewportExpressionAuthority,
  resolveViewportExpressionStatus,
} from './pageConceptPipeline/pageConceptViewportExpressionAuthority.js';
import { discoverProjectPageFamilyLayout } from './pageConceptPipeline/projectPageFamilyHierarchyDiscovery.js';
import type { PageFunctionalExpansionIntelligence } from './pageConceptPipeline/pageFunctionalExpansionIntelligence.js';

export type DesignWorkspaceCanonicalStatus =
  | 'NOT_STARTED'
  | 'SELECTED'
  | 'CONFIRMED'
  | 'GENERATING'
  | 'PARTIAL'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'READY'
  | 'STALE'
  | 'BLOCKED'
  | 'LIVE'
  | 'FAILED';

export type DesignWorkspacePipelineState = {
  projectId: string;
  pageId: string;
  route: string | null;
  pipelineLineage: PageConceptPipelineSet['pipelineLineage'] | null;
  selectedMobileConceptId: string | null;
  confirmedMobileAuthorityId: string | null;
  mobileAuthorityStatus: DesignWorkspaceCanonicalStatus;
  mobileExperiencePackageId: string | null;
  mobileExperienceStatus: DesignWorkspaceCanonicalStatus;
  desktopViewportAuthorityId: string | null;
  desktopViewportStatus: DesignWorkspaceCanonicalStatus;
  desktopExpressionPackageId: string | null;
  desktopExpressionStatus: DesignWorkspaceCanonicalStatus;
  tabletViewportAuthorityId: string | null;
  tabletViewportStatus: DesignWorkspaceCanonicalStatus;
  tabletExpressionPackageId: string | null;
  tabletExpressionStatus: DesignWorkspaceCanonicalStatus;
  viewportFamilyId: string | null;
  viewportFamilyStatus: DesignWorkspaceCanonicalStatus;
  pageFamilyBlueprintId: string | null;
  pageFamilyStatus: DesignWorkspaceCanonicalStatus;
  interactionMapId: string | null;
  interactionMapStatus: DesignWorkspaceCanonicalStatus;
  functionalExpansionDecisionVersion: string | null;
  functionalExpansionStatus: DesignWorkspaceCanonicalStatus;
  frameworkId: string | null;
  frameworkStatus: DesignWorkspaceCanonicalStatus;
  twinStatus: DesignWorkspaceCanonicalStatus;
  assetGenerationStatus: DesignWorkspaceCanonicalStatus;
  interactionCount: number;
  pageFamilyParentCount: number;
  pageFamilyChildCount: number;
  pageFamilyGrandchildCount: number;
  pageFamilyTotalPages: number;
  experienceOutputCount: number;
  loadState: 'LOADING' | 'READY' | 'FAILED';
  updatedAt: string;
  /** Bound artifact versions for review surfaces (stale detection). */
  bindings: {
    mobileAuthorityArtifactId: string | null;
    experienceSourceMobileArtifactId: string | null;
    desktopExpressionSourceAuthorityId: string | null;
    tabletExpressionSourceAuthorityId: string | null;
  };
};

export type CompileDesignWorkspacePipelineInput = {
  projectId: string;
  pageId: string;
  generationState: PageConceptGenerationState | null;
  production?: DesignProductionState | null;
  pageWorkflow?: PageAuthorityWorkflowState | null;
  generationJobs?: readonly PageConceptGeneratedArtifact[];
  twinRouteReachable?: boolean | null;
};

function mapExperienceStatus(
  raw: ReturnType<typeof resolveExperienceExpressionStatus>,
): DesignWorkspaceCanonicalStatus {
  switch (raw) {
    case 'NOT_STARTED':
    case 'SUPERSEDED':
      return 'NOT_STARTED';
    case 'GENERATING':
      return 'GENERATING';
    case 'PARTIAL_FAILURE':
      return 'PARTIAL';
    case 'READY_FOR_REVIEW':
      return 'READY_FOR_REVIEW';
    case 'APPROVED':
      return 'APPROVED';
    case 'FAILED':
      return 'FAILED';
    default:
      return 'NOT_STARTED';
  }
}

function mapMobileAuthority(raw: ReturnType<typeof resolveMobileAuthorityStatus>): DesignWorkspaceCanonicalStatus {
  if (raw === 'NONE') return 'NOT_STARTED';
  if (raw === 'SELECTED') return 'SELECTED';
  return 'CONFIRMED';
}

function mapViewportBase(
  familyReady: boolean,
  generating: boolean,
  stale: boolean,
): DesignWorkspaceCanonicalStatus {
  if (stale) return 'STALE';
  if (generating) return 'GENERATING';
  return familyReady ? 'READY' : 'NOT_STARTED';
}

function mapExpressionStatus(
  viewport: 'DESKTOP' | 'TABLET',
  pipelineSet: PageConceptPipelineSet | null,
  baseReady: boolean,
): DesignWorkspaceCanonicalStatus {
  if (!baseReady) return 'BLOCKED';
  const raw = resolveViewportExpressionStatus(pipelineSet, viewport);
  switch (raw) {
    case 'NOT_STARTED':
    case 'SUPERSEDED':
      return 'NOT_STARTED';
    case 'GENERATING':
      return 'GENERATING';
    case 'PARTIAL_FAILURE':
      return 'PARTIAL';
    case 'READY_FOR_REVIEW':
      return 'READY_FOR_REVIEW';
    case 'APPROVED':
      return 'APPROVED';
    case 'FAILED':
      return 'FAILED';
    default:
      return 'NOT_STARTED';
  }
}

function jobRunning(
  jobs: readonly PageConceptGeneratedArtifact[],
  provider: 'GPT2_TABLET' | 'GPT2_DESKTOP',
): boolean {
  return jobs.some((j) => j.provider === provider && j.status === 'RUNNING');
}

function expressionStale(
  pipelineSet: PageConceptPipelineSet | null,
  viewport: 'DESKTOP' | 'TABLET',
  familyArtifactId: string | null,
): boolean {
  const authority = resolveViewportExpressionAuthority(pipelineSet, viewport);
  if (!authority) return false;
  if (!familyArtifactId) return true;
  return authority.sourceViewportAuthorityArtifactId !== familyArtifactId;
}

function experienceStale(
  pipelineSet: PageConceptPipelineSet | null,
  mobileArtifactId: string | null,
): boolean {
  const authority = pipelineSet?.experienceExpressionAuthority ?? null;
  if (!authority) return false;
  if (!mobileArtifactId) return true;
  return authority.sourceMobileArtifactId !== mobileArtifactId;
}

function mapViewportFamilyStatus(
  familyStatus: string | null | undefined,
): DesignWorkspaceCanonicalStatus {
  if (!familyStatus) return 'NOT_STARTED';
  if (familyStatus === 'LOCKED') return 'APPROVED';
  if (familyStatus === 'APPROVED') return 'APPROVED';
  if (familyStatus === 'AWAITING_FOUNDER_FAMILY_REVIEW') return 'READY_FOR_REVIEW';
  return 'READY';
}

function mapPageFamilyStatus(blueprintApprovedAt: string | null | undefined): DesignWorkspaceCanonicalStatus {
  if (!blueprintApprovedAt) return 'NOT_STARTED';
  return 'APPROVED';
}

function mapInteractionMapStatus(
  mapApprovedAt: string | null | undefined,
  blueprintId: string | null,
  mapBlueprintId: string | null | undefined,
): DesignWorkspaceCanonicalStatus {
  if (!mapApprovedAt) return blueprintId ? 'READY_FOR_REVIEW' : 'NOT_STARTED';
  if (blueprintId && mapBlueprintId && mapBlueprintId !== blueprintId) return 'STALE';
  return 'APPROVED';
}

function expansionDecisionSummary(intelligence: PageFunctionalExpansionIntelligence): {
  pendingFounderReview: number;
  approved: number;
  rejected: number;
} {
  const proposals = intelligence.proposals ?? [];
  return {
    pendingFounderReview: proposals.filter((p) => p.status === 'PROPOSED' || p.status === 'DEFERRED').length,
    approved: proposals.filter((p) => p.status === 'FOUNDER_APPROVED').length,
    rejected: proposals.filter((p) => p.status === 'FOUNDER_REJECTED').length,
  };
}

function mapFunctionalExpansionStatus(
  intelligence: PageConceptPipelineSet['functionalExpansionIntelligence'],
): DesignWorkspaceCanonicalStatus {
  if (!intelligence) return 'NOT_STARTED';
  const summary = expansionDecisionSummary(intelligence);
  if (summary.pendingFounderReview > 0) return 'READY_FOR_REVIEW';
  if (summary.approved > 0) return 'APPROVED';
  if (summary.rejected > 0 && summary.approved === 0) return 'BLOCKED';
  return 'NOT_STARTED';
}

function mapTwinStatus(input: CompileDesignWorkspacePipelineInput): DesignWorkspaceCanonicalStatus {
  const ps = input.generationState?.pipelineSet;
  if (ps?.liveRouteHashAfter) return 'LIVE';
  const twinStatus =
    input.production?.twinImplementationStatus ?? input.pageWorkflow?.twinImplementationStatus ?? 'NONE';
  if (twinStatus === 'READY_FOR_REVIEW' || input.twinRouteReachable) return 'READY';
  if (twinStatus === 'IMPLEMENTING') return 'GENERATING';
  if (ps?.twinImplementationPackage) return 'READY_FOR_REVIEW';
  return 'NOT_STARTED';
}

function mapFrameworkStatus(input: CompileDesignWorkspacePipelineInput): DesignWorkspaceCanonicalStatus {
  const pkg = input.pageWorkflow?.composerHandoffPackage ?? null;
  const framework = isOpusFrameworkHandoffPackage(pkg) ? pkg : null;
  if (!framework) return 'NOT_STARTED';
  if (framework.workflowStage === 'FRAMEWORK_READY') return 'READY';
  if (framework.workflowStage === 'FRAMEWORK_BUILDING') return 'GENERATING';
  return 'READY_FOR_REVIEW';
}

function mapAssetGenerationStatus(input: CompileDesignWorkspacePipelineInput): DesignWorkspaceCanonicalStatus {
  const twin = mapTwinStatus(input);
  const framework = mapFrameworkStatus(input);
  if (framework !== 'READY' && framework !== 'APPROVED') return 'BLOCKED';
  if (twin !== 'LIVE' && twin !== 'READY') return 'BLOCKED';
  return 'READY';
}

export function compileDesignWorkspacePipelineState(
  input: CompileDesignWorkspacePipelineInput,
): DesignWorkspacePipelineState {
  const generationState = input.generationState;
  const pipelineSet = generationState?.pipelineSet ?? null;
  const family = pipelineSet?.viewportAuthorityFamily ?? null;
  const jobs = input.generationJobs ?? generationState?.generationJobs ?? [];
  const route = compileDesignPageContext(input.projectId, input.pageId)?.route ?? null;
  const layout = discoverProjectPageFamilyLayout(input.projectId, input.pageId);
  const pageFamilyParentCount = layout.receipt.parentPageCount;
  const pageFamilyChildCount = layout.receipt.childPageCount;
  const pageFamilyGrandchildCount = layout.receipt.grandchildPageCount;
  const pageFamilyTotalPages = layout.receipt.totalPageCount;

  const mobileArtifactId = family?.mobileArtifactId ?? null;
  const desktopArtifactId = family?.desktopArtifactId ?? null;
  const tabletArtifactId = family?.tabletArtifactId ?? null;

  const desktopBaseReady = resolveViewportBaseAuthorityStatus(family, 'DESKTOP') === 'READY';
  const tabletBaseReady = resolveViewportBaseAuthorityStatus(family, 'TABLET') === 'READY';

  const desktopExpr = resolveViewportExpressionAuthority(pipelineSet, 'DESKTOP');
  const tabletExpr = resolveViewportExpressionAuthority(pipelineSet, 'TABLET');
  const experienceAuthority = pipelineSet?.experienceExpressionAuthority ?? null;

  const interactionMap = pipelineSet?.pageFamilyInteractionMap ?? null;
  const blueprint = pipelineSet?.pageFamilyBlueprint ?? null;

  const experienceOutputCount =
    experienceAuthority?.visualStates?.filter((s) => s.materializationStatus === 'READY' || s.previewImageUri)
      .length ?? 0;

  const interactionCount = interactionMap?.records?.length ?? 0;

  const mobileAuthorityStatus = mapMobileAuthority(resolveMobileAuthorityStatus(family));

  const updatedAt =
    family?.updatedAt ??
    pipelineSet?.createdAt ??
    generationState?.activeGenerationRunStartedAt ??
    new Date().toISOString();

  return {
    projectId: input.projectId,
    pageId: input.pageId,
    route,
    pipelineLineage: pipelineSet?.pipelineLineage ?? null,
    selectedMobileConceptId: family?.selectedMobileConceptId ?? pipelineSet?.selectedMobileConceptId ?? null,
    confirmedMobileAuthorityId:
      family?.confirmedMobileConceptId ?? (mobileAuthorityStatus === 'CONFIRMED' ? family?.selectedMobileConceptId ?? null : null),
    mobileAuthorityStatus,
    mobileExperiencePackageId:
      experienceAuthority?.id ?? pipelineSet?.experienceExpressionContract?.contractId ?? null,
    mobileExperienceStatus: experienceStale(pipelineSet, mobileArtifactId) ?
        'STALE'
      : mapExperienceStatus(resolveExperienceExpressionStatus(pipelineSet)),
    desktopViewportAuthorityId: desktopArtifactId,
    desktopViewportStatus: mapViewportBase(
      desktopBaseReady,
      jobRunning(jobs, 'GPT2_DESKTOP'),
      false,
    ),
    desktopExpressionPackageId: desktopExpr?.id ?? null,
    desktopExpressionStatus: expressionStale(pipelineSet, 'DESKTOP', desktopArtifactId) ?
        'STALE'
      : mapExpressionStatus('DESKTOP', pipelineSet, desktopBaseReady),
    tabletViewportAuthorityId: tabletArtifactId,
    tabletViewportStatus: mapViewportBase(
      tabletBaseReady,
      jobRunning(jobs, 'GPT2_TABLET'),
      false,
    ),
    tabletExpressionPackageId: tabletExpr?.id ?? null,
    tabletExpressionStatus: expressionStale(pipelineSet, 'TABLET', tabletArtifactId) ?
        'STALE'
      : mapExpressionStatus('TABLET', pipelineSet, tabletBaseReady),
    viewportFamilyId: family?.familyId ?? null,
    viewportFamilyStatus: mapViewportFamilyStatus(family?.status),
    pageFamilyBlueprintId: blueprint?.blueprintId ?? null,
    pageFamilyStatus: mapPageFamilyStatus(blueprint?.approvedAt),
    interactionMapId: interactionMap?.mapId ?? null,
    interactionMapStatus: mapInteractionMapStatus(
      interactionMap?.approvedAt,
      blueprint?.blueprintId ?? null,
      interactionMap?.blueprintId,
    ),
    functionalExpansionDecisionVersion:
      pipelineSet?.functionalExpansionIntelligence?.intelligenceId ?? null,
    functionalExpansionStatus: mapFunctionalExpansionStatus(pipelineSet?.functionalExpansionIntelligence ?? null),
    frameworkId:
      isOpusFrameworkHandoffPackage(input.pageWorkflow?.composerHandoffPackage ?? null) ?
        input.pageWorkflow!.composerHandoffPackage!.packageId
      : null,
    frameworkStatus: mapFrameworkStatus(input),
    twinStatus: mapTwinStatus(input),
    assetGenerationStatus: mapAssetGenerationStatus(input),
    interactionCount,
    pageFamilyParentCount,
    pageFamilyChildCount,
    pageFamilyGrandchildCount,
    pageFamilyTotalPages,
    experienceOutputCount,
    loadState: generationState ? 'READY' : 'LOADING',
    updatedAt,
    bindings: {
      mobileAuthorityArtifactId: mobileArtifactId,
      experienceSourceMobileArtifactId: experienceAuthority?.sourceMobileArtifactId ?? null,
      desktopExpressionSourceAuthorityId: desktopExpr?.sourceViewportAuthorityArtifactId ?? null,
      tabletExpressionSourceAuthorityId: tabletExpr?.sourceViewportAuthorityArtifactId ?? null,
    },
  };
}

export function isCanonicalGpt2DesignWorkspacePipeline(state: DesignWorkspacePipelineState): boolean {
  return state.pipelineLineage === 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE';
}
