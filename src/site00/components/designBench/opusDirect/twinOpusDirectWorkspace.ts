/**
 * P0.VR.DESIGNBENCH.OPUS-VIEWMODE1 — shared workspace model for the NDXBOOK
 * DESIGN workspace.
 *
 * P0.VR.DESIGN-PRODUCTION1 — tier-A production state (authority, readiness,
 * workflow) is merged from useTwinOpusDirectProduction so Canonical and List
 * share one domain projection.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  TWIN_OPUS_DIRECT_AMENDMENT,
  TWIN_OPUS_DIRECT_AUTHORITY_PAIR,
  TWIN_OPUS_DIRECT_BOTTOM_NAV,
  TWIN_OPUS_DIRECT_CANDIDATES,
  TWIN_OPUS_DIRECT_CANDIDATE_ACTIONS,
  TWIN_OPUS_DIRECT_CONCEPT_FIELDS,
  TWIN_OPUS_DIRECT_CONCEPT_TABS,
  TWIN_OPUS_DIRECT_CONTEXT,
  TWIN_OPUS_DIRECT_GALLERY,
  TWIN_OPUS_DIRECT_HEADER,
  TWIN_OPUS_DIRECT_HERO,
  TWIN_OPUS_DIRECT_OUTPUT_TITLE,
  TWIN_OPUS_DIRECT_PIPELINE_TITLE,
  TWIN_OPUS_DIRECT_PRIMARY_NAV,
  TWIN_OPUS_DIRECT_RAIL_ACTIONS,
  TWIN_OPUS_DIRECT_SELECT_ACTIONS,
  TWIN_OPUS_DIRECT_STAGE,
  TWIN_OPUS_DIRECT_TARGET,
  TWIN_OPUS_DIRECT_VIEWPORTS,
  type TwinOpusDirectCandidate,
  type TwinOpusDirectViewportId,
} from './twinOpusDirectContent';
import {
  buildPageConceptGallerySections,
  type PageConceptGalleryCard,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryPresentation.js';
import {
  listPageConceptCandidatesHydrated,
  refreshPageConceptGalleryFromPersistedState,
  resolvePageConceptGalleryEmptyPresentation,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryHydration.js';

const listPageConceptCandidates = listPageConceptCandidatesHydrated;
import {
  PAGE_CONCEPT_GALLERY_INSPECT_EVENT,
  type PageConceptGalleryInspectDetail,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryEvents.js';
import {
  buildPagePipelineControllerModel,
  type PagePipelineControllerModel,
  type PipelineResolutionHandler,
} from '../../../../../shared/site00-design-workspace-production/designPagePipelineController.js';
import {
  computeHeroAssemblyActions,
  type HeroAssemblyActionsModel,
} from '../../../../../shared/site00-design-workspace-production/designHeroAssemblyActions.js';
import { listStagedGrokAssets } from '../../../../../shared/site00-design-workspace-production/designGrokAssetModel.js';
import { compileDesignPageContext } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/pageContext.js';
import {
  buildPageSystemReviewModel,
  type PageSystemReviewModel,
} from '../../../../../shared/site00-design-workspace-production/designPageSystemReview.js';
import { DESIGN_PAGE_CAPTURE_UPDATED_EVENT } from '../../../../../shared/site00-design-workspace-production/designPageCapture.js';
import { designPageCaptureEventMatches } from '../../../../../shared/site00-design-workspace-production/designPageIdentity.js';
import { getDesignBoundPage } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/designPageRegistry.js';
import { designProductionPageTargetFromRecord } from '../production/designPageTargetFromRecord';
import {
  designPageTargetLines,
  resolveDesignPageTargetForShell,
  writeDesignPageTarget,
} from '../production/designProductionPageTarget';
import {
  buildDesignModuleHierarchy,
  buildDesignProjectIntelligence,
  designHeaderCrumbLabels,
  mergePageViewportIntoReadiness,
  resolveAuthorityRailRows,
  resolveHeroPreviewForViewport,
  resolvePageViewportBundle,
  type HeroPreviewResolution,
  type ViewportControlPresentation,
} from '../../../../../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { pageCaptureDisplaySrc } from '../../../../../shared/site00-design-workspace-production/designPageCapture.js';
import { projectDesignProductionProjection } from '../../../../../shared/site00-design-workspace-production/designProductionProjection.js';
import { site00ProjectsDesignModulePath } from '../../../config/routes';
import {
  computeContextualNextAction,
  railActionDisabledReason,
} from '../../../../../shared/site00-design-workspace-production/designInteractionEligibility.js';
import { useDesignProductionNavigation } from '../production/useDesignProductionNavigation';
import { readDesignAgentViewport, writeDesignAgentViewport } from '../designAgent/designAgentSessionPrefs';
import {
  twinOpusDirectCandidateArtifactView,
  twinOpusDirectCandidateById,
} from './twinOpusDirectCandidateArtifacts';
import {
  DESIGN_PIPELINE_HANDLER_EVENT,
  useTwinOpusDirectProduction,
  type TwinOpusDirectProduction,
} from './useTwinOpusDirectProduction';
import { useDesignPageCapture } from './useDesignPageCapture';
import { usePageAuthorityWorkflow } from './usePageAuthorityWorkflow';
import { useHydrateDesignPageCaptures } from './useHydrateDesignPageCaptures';
import { usePageConceptGeneration } from './usePageConceptGeneration';
import {
  assertPageConceptGenerationGateDivergence,
  pageConceptGenerationGateFromEligibility,
  type PageConceptGenerationEligibility,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationEligibility.js';
import {
  resolveActiveAuthorityImage,
} from '../../../../../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';

export const TWIN_OPUS_DIRECT_VIEW_MODES = ['canonical', 'list'] as const;

export type TwinOpusDirectViewMode = (typeof TWIN_OPUS_DIRECT_VIEW_MODES)[number];

export const TWIN_OPUS_DIRECT_DEFAULT_VIEW_MODE: TwinOpusDirectViewMode = 'canonical';

export const TWIN_OPUS_DIRECT_VIEW_MODE_LABELS: Record<TwinOpusDirectViewMode, string> = {
  canonical: 'CANONICAL',
  list: 'LIST',
};

const VIEW_MODE_STORAGE_KEY = 'site00:twin-opus-direct:view-mode:v1';

function isViewMode(value: unknown): value is TwinOpusDirectViewMode {
  return TWIN_OPUS_DIRECT_VIEW_MODES.includes(value as TwinOpusDirectViewMode);
}

function galleryCardToTwinCandidate(card: PageConceptGalleryCard): TwinOpusDirectCandidate {
  return {
    id: card.id,
    version: card.version,
    surface: card.surface,
    versionTag: card.versionTag,
    viewportScope: card.viewportScope,
    artifactId: card.artifactId,
    runId: card.runId,
    previewSrc: card.previewSrc,
    slotLabel: card.slotLabel,
    pipelineLabel: card.pipelineLabel,
    territoryLabel: card.territoryLabel,
    runLabel: card.runLabel,
    createdAtLabel: card.createdAtLabel,
    artifactStatus: card.artifactStatus,
    runGroup: card.runGroup,
    selectedMobileAuthority: card.selectedMobileAuthority,
    artifactRole: card.artifactRole,
  };
}

function readStoredViewMode(): TwinOpusDirectViewMode {
  if (typeof window === 'undefined') return TWIN_OPUS_DIRECT_DEFAULT_VIEW_MODE;
  try {
    const stored = window.sessionStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return isViewMode(stored) ? stored : TWIN_OPUS_DIRECT_DEFAULT_VIEW_MODE;
  } catch {
    return TWIN_OPUS_DIRECT_DEFAULT_VIEW_MODE;
  }
}

export interface TwinOpusDirectWorkspaceData {
  header: { brand: string; project: string; page: string; compiler: string };
  context: { chip: string; stream: string; right: string };
  primaryNav: typeof TWIN_OPUS_DIRECT_PRIMARY_NAV;
  target: { label: string; lines: readonly string[] };
  stage: Omit<typeof TWIN_OPUS_DIRECT_STAGE, 'authorityValue' | 'stageValue'> & {
    authorityValue: string;
    stageValue: string;
  };
  viewports: typeof TWIN_OPUS_DIRECT_VIEWPORTS;
  hero: typeof TWIN_OPUS_DIRECT_HERO;
  selectActions: typeof TWIN_OPUS_DIRECT_SELECT_ACTIONS;
  authorityPair: typeof TWIN_OPUS_DIRECT_AUTHORITY_PAIR;
  railActions: typeof TWIN_OPUS_DIRECT_RAIL_ACTIONS;
  gallery: typeof TWIN_OPUS_DIRECT_GALLERY;
  candidates: readonly TwinOpusDirectCandidate[];
  candidateSections: {
    currentRunId: string | null;
    current: readonly TwinOpusDirectCandidate[];
    history: readonly TwinOpusDirectCandidate[];
  };
  selectedMobileConceptId: string | null;
  candidateActions: typeof TWIN_OPUS_DIRECT_CANDIDATE_ACTIONS;
  outputTitle: typeof TWIN_OPUS_DIRECT_OUTPUT_TITLE;
  pageSystemReview: PageSystemReviewModel;
  pipelineTitle: typeof TWIN_OPUS_DIRECT_PIPELINE_TITLE;
  pagePipeline: PagePipelineControllerModel;
  conceptTabs: typeof TWIN_OPUS_DIRECT_CONCEPT_TABS;
  conceptFields: typeof TWIN_OPUS_DIRECT_CONCEPT_FIELDS;
  amendment: typeof TWIN_OPUS_DIRECT_AMENDMENT;
  bottomNav: typeof TWIN_OPUS_DIRECT_BOTTOM_NAV;
  heroPreview: HeroPreviewResolution;
  viewportControls: readonly ViewportControlPresentation[];
  galleryEmptyMessage: string | null;
  galleryEmptyTestId: 'gallery-page-concept-empty' | 'gallery-page-concept-load-failed' | null;
  galleryGenerateLabel: string;
  /** Single source — gallery CTA disabled + blocker copy derive from this only. */
  pageConceptGenerationEligibility: PageConceptGenerationEligibility;
  pageConceptGenerationGate: ReturnType<typeof pageConceptGenerationGateFromEligibility>;
  pageConceptTargetPageId: string;
  authorityPairPresentation: {
    title: string;
    mobile: { label: string; version: string; state: string; previewSrc: string | null; missing: boolean };
    desktop: { label: string; version: string; state: string; previewSrc: string | null; missing: boolean };
    tabletLabel: string;
    promotedMobile: { conceptId: string | null; previewSrc: string | null; version: string };
    promotedDesktop: { conceptId: string | null; previewSrc: string | null; version: string };
  };
  viewportPreferenceBadges: (candidateId: string) => readonly string[];
  outputViewportNote: string | null;
  heroCompare: {
    currentSrc: string | null;
    currentMeta: string;
    currentEmptyLabel: string;
    conceptSrc: string | null;
    conceptMeta: string;
    conceptEmptyLabel: string;
    captureBusy: boolean;
    captureError: string | null;
  };
  heroAssembly: HeroAssemblyActionsModel;
}

export interface TwinOpusDirectWorkspaceState {
  viewport: TwinOpusDirectViewportId;
  navIndex: number;
  candidateId: string;
  authorityPairOpen: boolean;
  recordTabIndex: number;
  dockIndex: number;
}

export interface TwinOpusDirectWorkspaceActions {
  selectViewport: (viewport: TwinOpusDirectViewportId) => void;
  selectNavSection: (index: number) => void;
  selectCandidate: (candidateId: string) => void;
  toggleAuthorityPair: () => void;
  selectRecordTab: (index: number) => void;
  selectDockDestination: (index: number) => void;
  onRailAction: (actionId: string) => void;
  onCandidateAction: (actionId: string) => void;
  openProvenance: () => void;
  openReadinessReceipt: () => void;
  openViewReadiness: () => void;
  openViewPipeline: () => void;
  openTechnicalDetails: () => void;
  openPipelineStage: (stageId: string) => void;
  runPipelineHandler: (handler: PipelineResolutionHandler) => void;
  openResolveBlocker: () => void;
  selectForMobile: () => void;
  selectForDesktop: () => void;
  openCompareConcepts: () => void;
  openStructuredArtifact: (columnId: string) => void;
  openDesignPage: (pageId: string) => void;
  openPageBatchEdit: (input: { sourcePageId: string; pageIds: string[]; scope: string }) => void;
  openPageAssetInspect: (assetId: string) => void;
  openPageAssetsPanel: (assetId?: string) => void;
  openPageInteractionsInspector: () => void;
  openAmendmentDetail: () => void;
  runContextualNextAction: () => void;
  railDisabledReason: (actionId: string) => string | null;
  goWorkspace: () => void;
  goDesignHistory: () => void;
  goChangeHistory: () => void;
  goMasterAmendment: () => void;
  generatePageConcepts: () => void;
  captureScreen: () => Promise<void>;
  openHeroCompareFullscreen: (side: 'current' | 'concept') => void;
  openCreatePageFramework: () => void;
  openGrokPageAssetProduction: () => void;
  openViewportAuthorityEditor: (viewport: 'MOBILE' | 'DESKTOP') => void;
}

export interface TwinOpusDirectWorkspace {
  data: TwinOpusDirectWorkspaceData;
  state: TwinOpusDirectWorkspaceState;
  actions: TwinOpusDirectWorkspaceActions;
  selectedCandidate: (typeof TWIN_OPUS_DIRECT_CANDIDATES)[number] | null;
  readinessDash: { circumference: number; offset: number };
  viewMode: TwinOpusDirectViewMode;
  setViewMode: (mode: TwinOpusDirectViewMode) => void;
  production: TwinOpusDirectProduction;
  projectSlug: string;
  pageConceptGeneration: ReturnType<typeof usePageConceptGeneration>;
}

export function useTwinOpusDirectWorkspace(projectSlug: string): TwinOpusDirectWorkspace {
  const production = useTwinOpusDirectProduction(projectSlug);
  const { state: prodState, actions: prodActions, actor, syncStatus } = production;
  const nav = useDesignProductionNavigation();

  const [viewport, setViewport] = useState<TwinOpusDirectViewportId>(() => {
    const stored = readDesignAgentViewport();
    return stored === 'TABLET' || stored === 'DESKTOP' ? stored : 'MOBILE';
  });
  const [navIndex, setNavIndex] = useState(0);
  const [candidateId, setCandidateId] = useState(prodState.selectedCandidateId);
  const [authorityPairOpen, setAuthorityPairOpen] = useState(true);
  const [recordTabIndex, setRecordTabIndex] = useState(0);
  const [dockIndex, setDockIndex] = useState(0);
  const [viewMode, setViewModeState] = useState<TwinOpusDirectViewMode>(TWIN_OPUS_DIRECT_DEFAULT_VIEW_MODE);
  const [pageTarget, setPageTarget] = useState(() => resolveDesignPageTargetForShell(projectSlug));
  const [pageConceptRevision, setPageConceptRevision] = useState(0);

  const pageConceptGeneration = usePageConceptGeneration(
    projectSlug,
    pageTarget.pageId,
    pageTarget.screenId,
    pageTarget.route,
  );

  useEffect(() => {
    refreshPageConceptGalleryFromPersistedState(projectSlug, pageTarget.pageId);
    setPageConceptRevision((v) => v + 1);
  }, [
    pageTarget.pageId,
    projectSlug,
    pageConceptGeneration.generationJobs,
    pageConceptGeneration.generationState.pipelineSet,
    pageConceptGeneration.generationStatus,
  ]);

  useHydrateDesignPageCaptures(projectSlug, pageTarget.pageId, pageTarget.screenId);

  const pageCapture = useDesignPageCapture(
    projectSlug,
    pageTarget.pageId,
    pageTarget.screenId,
    viewport,
    pageTarget.route,
  );
  const pageAuthority = usePageAuthorityWorkflow(projectSlug, pageTarget.pageId);

  useEffect(() => {
    writeDesignAgentViewport(viewport);
  }, [viewport]);

  useEffect(() => {
    const bump = (event: Event) => {
      const detail = (event as CustomEvent<{ projectId?: string; pageId?: string }>).detail;
      if (!designPageCaptureEventMatches(projectSlug, pageTarget.pageId, detail)) return;
      setPageConceptRevision((v) => v + 1);
    };
    window.addEventListener('site00:page-concept-generation-updated', bump);
    window.addEventListener(DESIGN_PAGE_CAPTURE_UPDATED_EVENT, bump);
    window.addEventListener('site00:page-concept-captures-hydrated', bump);
    const onFocusGallery = (event: Event) => {
      const detail = (event as CustomEvent<{ projectId?: string; pageId?: string }>).detail;
      if (!designPageCaptureEventMatches(projectSlug, pageTarget.pageId, detail)) return;
      document.querySelector('[data-testid="page-concept-candidate-gallery"]')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    };
    window.addEventListener('site00:page-concept-focus-gallery', onFocusGallery);
    return () => {
      window.removeEventListener('site00:page-concept-generation-updated', bump);
      window.removeEventListener(DESIGN_PAGE_CAPTURE_UPDATED_EVENT, bump);
      window.removeEventListener('site00:page-concept-captures-hydrated', bump);
      window.removeEventListener('site00:page-concept-focus-gallery', onFocusGallery);
    };
  }, [pageTarget.pageId, projectSlug]);

  useEffect(() => {
    const onTarget = (event: Event) => {
      const detail = (event as CustomEvent<{ projectSlug?: string }>).detail;
      if (!detail?.projectSlug || detail.projectSlug.toLowerCase() !== projectSlug.toLowerCase()) return;
      setPageTarget(resolveDesignPageTargetForShell(projectSlug));
    };
    window.addEventListener('site00:design-page-target', onTarget);
    return () => window.removeEventListener('site00:design-page-target', onTarget);
  }, [projectSlug]);

  useEffect(() => {
    setCandidateId(prodState.selectedCandidateId);
  }, [prodState.selectedCandidateId, prodState.updatedAt]);

  const selectedMobileConceptId =
    pageConceptGeneration.pipelineSet?.viewportAuthorityFamily?.selectedMobileConceptId ??
    pageConceptGeneration.pipelineSet?.selectedMobileConceptId ??
    null;

  useEffect(() => {
    if (!selectedMobileConceptId || selectedMobileConceptId === candidateId) return;
    setCandidateId(selectedMobileConceptId);
    prodActions.selectGalleryCandidate(selectedMobileConceptId);
  }, [candidateId, prodActions, selectedMobileConceptId]);

  useEffect(() => {
    const refresh = () => pageAuthority.reload();
    window.addEventListener('site00:design-framework-handoff', refresh);
    return () => window.removeEventListener('site00:design-framework-handoff', refresh);
  }, [pageAuthority]);

  useEffect(() => {
    const stored = readStoredViewMode();
    if (stored !== TWIN_OPUS_DIRECT_DEFAULT_VIEW_MODE) setViewModeState(stored);
  }, []);

  const setViewMode = useCallback((mode: TwinOpusDirectViewMode) => {
    setViewModeState(mode);
    try {
      window.sessionStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      /* presentation preference only */
    }
  }, []);

  const selectForViewport = useCallback(
    (viewport: 'MOBILE' | 'DESKTOP') => {
      const pageConcepts = listPageConceptCandidates(projectSlug, pageTarget.pageId);
      const pageConcept = pageConcepts.find((c) => c.conceptId === candidateId);
      if (pageConcept) {
        pageAuthority.preferConcept(viewport, pageConcept.conceptId);
        prodActions.selectViewportCandidate(viewport, pageConcept.conceptId, pageConcept.conceptTitle.slice(0, 8).toUpperCase());
        return;
      }
      const legacy = twinOpusDirectCandidateById(candidateId);
      if (!TWIN_OPUS_DIRECT_CANDIDATES.some((c) => c.id === candidateId)) return;
      pageAuthority.preferConcept(viewport, legacy.id);
      prodActions.selectViewportCandidate(viewport, legacy.id, legacy.version);
    },
    [candidateId, pageAuthority, pageTarget.pageId, prodActions, projectSlug],
  );

  const actions = useMemo<TwinOpusDirectWorkspaceActions>(
    () => ({
      selectViewport: (next) => {
        setViewport(next);
        writeDesignAgentViewport(next);
      },
      selectNavSection: setNavIndex,
      selectCandidate: (id: string) => {
        setCandidateId(id);
        prodActions.selectGalleryCandidate(id);
        const row = listPageConceptCandidates(projectSlug, pageTarget.pageId).find((c) => c.conceptId === id);
        if (
          row?.artifactRole === 'MOBILE_CANDIDATE' &&
          row.pipelineId === 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE' &&
          row.artifactStatus === 'READY'
        ) {
          void pageConceptGeneration.viewportFamilyHandlers.selectMobile(id);
        }
      },
      toggleAuthorityPair: () => setAuthorityPairOpen((open) => !open),
      selectRecordTab: setRecordTabIndex,
      selectDockDestination: setDockIndex,
      selectForMobile: () => selectForViewport('MOBILE'),
      selectForDesktop: () => selectForViewport('DESKTOP'),
      openCompareConcepts: () => {
        const sections = buildPageConceptGallerySections({
          projectId: projectSlug,
          pageId: pageTarget.pageId,
          viewport,
          selectedMobileConceptId,
        });
        const pageCandidates = [...sections.current, ...sections.history];
        const ids =
          pageCandidates.length > 0 ?
            pageCandidates.map((c) => c.id)
          : TWIN_OPUS_DIRECT_CANDIDATES.map((c) => c.id);
        if (ids.length < 2) return;
        const idx = Math.max(0, ids.indexOf(candidateId));
        const other = ids[(idx + 1) % ids.length] ?? candidateId;
        prodActions.openCompareConcepts(candidateId, other);
      },
      generatePageConcepts: () => {
        void pageConceptGeneration.openGenerationConfirm();
      },
      captureScreen: async () => {
        await pageCapture.captureScreen();
      },
      openCreatePageFramework: () => prodActions.openCreatePageFramework(),
      openGrokPageAssetProduction: () => prodActions.openGrokPageAssetProduction(),
      openHeroCompareFullscreen: (side) => {
        const concepts = listPageConceptCandidates(projectSlug, pageTarget.pageId);
        const selected = concepts.find((c) => c.conceptId === candidateId) ?? null;
        const currentSrc = pageCaptureDisplaySrc(pageCapture.latest?.artifactPath);
        const conceptSrc = selected?.visualReference ?? null;
        const src = side === 'current' ? currentSrc : conceptSrc;
        if (!src) return;
        prodActions.openFullscreenArtifact({
          src,
          title: side === 'current' ? 'CURRENT · PAGE CAPTURE' : 'CONCEPT · PAGE TERRITORY',
          subtitle: pageTarget.pageLabel,
          role: 'hero-compare',
          viewport,
        });
      },
      openStructuredArtifact: (columnId) => prodActions.openStructuredArtifact(columnId),
      openDesignPage: (pageId) => {
        const page = getDesignBoundPage(projectSlug, pageId);
        if (!page) return;
        writeDesignPageTarget(projectSlug, designProductionPageTargetFromRecord(page));
        window.dispatchEvent(new CustomEvent('site00:design-page-target', { detail: { projectSlug } }));
      },
      openPageBatchEdit: (input) => prodActions.openPageBatchEdit(input),
      openPageAssetInspect: (assetId) => prodActions.openPageAssetInspect(assetId),
      openPageAssetsPanel: (assetId) => prodActions.openPageAssetsPanel(assetId),
      openPageInteractionsInspector: () => prodActions.openPageInteractionsInspector(),
      openAmendmentDetail: () => prodActions.openAmendmentDetail(),
      runContextualNextAction: () => {
        const next = computeContextualNextAction(prodState, actor);
        switch (next.handler) {
          case 'runPairReview':
            prodActions.runPairReview();
            break;
          case 'openReviewAuthority':
            prodActions.openReviewAuthority();
            break;
          case 'runLockAuthorityPair':
            prodActions.runLockAuthorityPair();
            break;
          case 'openReadinessReceipt':
            prodActions.openReadinessReceipt();
            break;
          case 'runMoveToBuild':
            prodActions.runMoveToBuild();
            break;
          case 'selectForMobile':
            selectForViewport('MOBILE');
            break;
          case 'selectForDesktop':
            selectForViewport('DESKTOP');
            break;
          case 'promoteMobile':
            prodActions.promoteViewportMaster('MOBILE');
            break;
          case 'promoteDesktop':
            prodActions.promoteViewportMaster('DESKTOP');
            break;
          default:
            break;
        }
      },
      railDisabledReason: (actionId: string) => railActionDisabledReason(actionId, prodState, actor),
      goWorkspace: () => nav.goWorkspace(),
      goDesignHistory: () => nav.goSection('history'),
      goChangeHistory: () => {
        nav.goSection('history');
        setRecordTabIndex(2);
      },
      goMasterAmendment: () => {
        setRecordTabIndex(4);
        prodActions.openAmendmentDetail();
      },
      openViewportAuthorityEditor: (vp) => prodActions.openViewportAuthorityEditor(vp),
      onRailAction: (actionId: string) => {
        switch (actionId) {
          case 'promote-mobile':
            pageAuthority.promoteDesign('MOBILE');
            prodActions.promoteViewportMaster('MOBILE');
            break;
          case 'promote-desktop':
            pageAuthority.promoteDesign('DESKTOP');
            prodActions.promoteViewportMaster('DESKTOP');
            break;
          case 'pair-review':
            pageAuthority.openPairReview();
            prodActions.runPairReview();
            break;
          case 'review-authority':
            pageAuthority.markTwinReviewed();
            prodActions.openReviewAuthority();
            break;
          case 'lock-pair':
            prodActions.runLockAuthorityPair();
            break;
          default:
            break;
        }
      },
      onCandidateAction: (actionId: string) => {
        const candidate = candidateId;
        if (actionId === 'refine') {
          prodActions.requestSpendConfirm({
            action: 'REFINE',
            estimatedUsd: 0.42,
            onConfirmed: (spendConfirmationId) => {
              prodActions.runRefineConcept({
                parentCandidateId: candidate,
                spendConfirmationId,
                estimatedUsd: 0.42,
              });
              production.refresh();
            },
          });
        }
        if (actionId === 'regenerate') {
          prodActions.requestSpendConfirm({
            action: 'REGENERATE',
            estimatedUsd: 0.55,
            onConfirmed: (spendConfirmationId) => {
              prodActions.runRegenerateConcept({
                siblingOfCandidateId: candidate,
                spendConfirmationId,
                estimatedUsd: 0.55,
              });
              production.refresh();
            },
          });
        }
        if (actionId === 'inspect') {
          const row = listPageConceptCandidates(projectSlug, pageTarget.pageId).find((c) => c.conceptId === candidate);
          if (row?.pipelineId === 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE') {
            window.dispatchEvent(
              new CustomEvent<PageConceptGalleryInspectDetail>(PAGE_CONCEPT_GALLERY_INSPECT_EVENT, {
                detail: { projectId: projectSlug, pageId: pageTarget.pageId, conceptId: candidate },
              }),
            );
            pageConceptGeneration.openGenerationReview();
          } else {
            prodActions.openInspectCandidate(candidate);
          }
        }
        if (actionId === 'fullscreen') {
          const row = listPageConceptCandidates(projectSlug, pageTarget.pageId).find((c) => c.conceptId === candidate);
          const src = row?.mobileVisualReference ?? row?.visualReference ?? null;
          if (src) {
            prodActions.openFullscreenArtifact({
              src,
              title: row?.conceptTitle?.toUpperCase() ?? 'CONCEPT CANDIDATE',
              subtitle: pageTarget.pageLabel,
              role: 'concept-candidate',
              viewport,
              candidateId: candidate,
              version: row?.runLabel ?? undefined,
            });
          } else {
            prodActions.openFullscreenArtifact(twinOpusDirectCandidateArtifactView(candidate, viewport));
          }
        }
      },
      openProvenance: prodActions.openProvenance,
      openReadinessReceipt: prodActions.openReadinessReceipt,
      openViewReadiness: prodActions.openViewReadiness,
      openViewPipeline: prodActions.openViewPipeline,
      openTechnicalDetails: prodActions.openTechnicalDetails,
      openPipelineStage: (stageId) => prodActions.openPipelineStage(stageId),
      openResolveBlocker: prodActions.openResolveBlocker,
      runPipelineHandler: (handler) => {
        switch (handler) {
          case 'openReadinessReceipt':
          case 'openViewReadiness':
            prodActions.openViewReadiness();
            break;
          case 'openViewPipeline':
            prodActions.openViewPipeline();
            break;
          case 'openTechnicalDetails':
            prodActions.openTechnicalDetails();
            break;
          case 'openPipelineStage':
            if (pagePipeline.primaryBlocker) {
              prodActions.openPipelineStage(pagePipeline.primaryBlocker.stageId);
            } else {
              prodActions.openViewPipeline();
            }
            break;
          case 'runPairReview':
            prodActions.runPairReview();
            break;
          case 'runLockAuthorityPair':
            prodActions.runLockAuthorityPair();
            break;
          case 'openReviewTwin':
            prodActions.setOverlay('OV-REVIEW-TWIN-PAGE');
            break;
          case 'openComposerHandoff':
            prodActions.openComposerHandoff();
            break;
          case 'selectForMobile':
            selectForViewport('MOBILE');
            break;
          case 'selectForDesktop':
            selectForViewport('DESKTOP');
            break;
          case 'promoteMobile':
            prodActions.promoteViewportMaster('MOBILE');
            break;
          case 'promoteDesktop':
            prodActions.promoteViewportMaster('DESKTOP');
            break;
          case 'openViewportAuthorityEditorMobile':
            prodActions.openViewportAuthorityEditor('MOBILE');
            break;
          case 'openViewportAuthorityEditorDesktop':
            prodActions.openViewportAuthorityEditor('DESKTOP');
            break;
          case 'captureScreen':
            void pageCapture.captureScreen();
            break;
          case 'openCreateFramework':
            prodActions.openCreatePageFramework();
            break;
          case 'openGenerateAssets':
            prodActions.openGrokPageAssetProduction();
            break;
          case 'openGrokDock':
            prodActions.openGrokPageAssetProduction();
            break;
          case 'scrollGallery':
            document.querySelector('.tod-gallery')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            break;
          case 'generatePageConcepts':
            void pageConceptGeneration.openGenerationConfirm();
            break;
          default:
            break;
        }
      },
    }),
    [
      actor,
      candidateId,
      nav,
      pageCapture,
      pageConceptGeneration,
      pageTarget,
      prodActions,
      prodState,
      production,
      projectSlug,
      selectForViewport,
      viewport,
    ],
  );

  const selectedCandidate = useMemo(() => {
    const sections = buildPageConceptGallerySections({
      projectId: projectSlug,
      pageId: pageTarget.pageId,
      viewport,
      selectedMobileConceptId,
    });
    const pageCandidates = [...sections.current, ...sections.history].map(galleryCardToTwinCandidate);
    const fromPage = pageCandidates.find((c) => c.id === candidateId);
    if (fromPage) return fromPage;
    if (pageCandidates.length === 0) return null;
    return pageCandidates[0] ?? null;
  }, [candidateId, pageTarget.pageId, projectSlug, selectedMobileConceptId, viewport]);

  const pageViewportBundle = useMemo(
    () => resolvePageViewportBundle(projectSlug, pageTarget.pageId),
    [pageTarget.pageId, projectSlug],
  );

  const pagePipeline = useMemo(
    () =>
      buildPagePipelineControllerModel({
        projectId: projectSlug,
        pageId: pageTarget.pageId,
        production: prodState,
        twinRouteReachable: pageAuthority.workflow.twinRouteVerifiedAt ? true : null,
        pageConceptGeneration: pageConceptGeneration.generationEligibility,
      }),
    [
      pageAuthority.workflow.twinRouteVerifiedAt,
      pageConceptGeneration.generationEligibility,
      pageTarget.pageId,
      prodState,
      projectSlug,
    ],
  );

  const pageAwareProjection = useMemo(() => {
    const base = projectDesignProductionProjection(prodState);
    if (!pageViewportBundle) return base;
    const receipt = mergePageViewportIntoReadiness(base.receipt, pageViewportBundle.coverage);
    const pending = receipt.checks.filter((c) => c.result === 'BLOCKED' || c.result === 'FAIL').length;
    return {
      ...base,
      receipt,
      percent: receipt.readinessPercent,
      state: receipt.readyLabel,
      compilerState: receipt.buildEligible ? 'BUILD_ELIGIBLE' : receipt.readyLabel,
      statusRows: [
        { id: 'approved', label: 'APPROVED ELEMENTS', value: String(receipt.passedGates) },
        { id: 'pending', label: 'PENDING DECISIONS', value: String(pending) },
        { id: 'blockers', label: 'BLOCKERS', value: String(receipt.blockers.length) },
        { id: 'warnings', label: 'WARNINGS', value: String(receipt.warnings.length) },
      ],
      checks: receipt.checks
        .filter((c) => c.result !== 'NOT_APPLICABLE')
        .slice(0, 5)
        .map((c) => ({
          id: c.id,
          label: c.label.toUpperCase(),
          state: c.result === 'PASS' ? 'pass' as const : c.result === 'FAIL' ? 'fail' as const : 'pending' as const,
        })),
      buildEligible: receipt.buildEligible,
    };
  }, [pageViewportBundle, prodState]);

  const readinessDash = useMemo(() => {
    const circumference = 2 * Math.PI * 30;
    const pct = pagePipeline.readinessPercent;
    return {
      circumference,
      offset: circumference * (1 - pct / 100),
    };
  }, [pagePipeline.readinessPercent]);

  const data = useMemo<TwinOpusDirectWorkspaceData>(() => {
    const slug = (projectSlug || 'ndxbook').trim().toLowerCase();
    const intel = buildDesignProjectIntelligence(slug);
    const hierarchy = buildDesignModuleHierarchy({
      projectsHref: '/projects',
      designHref: site00ProjectsDesignModulePath(),
      activeProjectId: slug,
      activeProjectLabel: intel?.displayName ?? slug.toUpperCase(),
      activePageName: pageTarget?.pageLabel ?? null,
    });
    const crumbs = designHeaderCrumbLabels(hierarchy);
    const shellTarget = pageTarget ?? resolveDesignPageTargetForShell(slug);
    const vpAuth = pageViewportBundle?.auth ?? null;
    const heroPreview =
      vpAuth ?
        resolveHeroPreviewForViewport(vpAuth, viewport)
      : resolveHeroPreviewForViewport(
          {
            projectId: slug,
            pageId: shellTarget.pageId,
            mobileAuthorityUrl: null,
            desktopAuthorityUrl: null,
            tabletOverrideUrl: null,
            tabletDerivedUrl: null,
          },
          viewport,
        );
    const viewportControls = pageViewportBundle?.controls ?? [];
    const gallerySections = buildPageConceptGallerySections({
      projectId: slug,
      pageId: shellTarget.pageId,
      viewport,
      selectedMobileConceptId,
    });
    const scopedCandidates = gallerySections.current.map(galleryCardToTwinCandidate);
    const historyCandidates = gallerySections.history.map(galleryCardToTwinCandidate);
    const galleryEmpty = resolvePageConceptGalleryEmptyPresentation(slug, shellTarget.pageId, viewport);
    const galleryEmptyMessage = galleryEmpty.message;
    const railRows =
      vpAuth ?
        resolveAuthorityRailRows(
          vpAuth,
          prodState.mobileVersion,
          prodState.desktopVersion,
          prodState.mobileAuthority,
          prodState.desktopAuthority,
        )
      : null;

    const pageConcepts = listPageConceptCandidates(slug, shellTarget.pageId);
    const selectedPageConcept = pageConcepts.find((c) => c.conceptId === candidateId) ?? null;
    const captureArtifactPath = pageCapture.latest?.artifactPath ?? null;
    const currentSrc = pageCaptureDisplaySrc(captureArtifactPath);
    const conceptSrc =
      selectedPageConcept ?
        viewport === 'DESKTOP' ?
          selectedPageConcept.desktopVisualReference ??
          selectedPageConcept.visualReference
        : selectedPageConcept.mobileVisualReference ?? selectedPageConcept.visualReference
      : null;
    const capturedLabel =
      pageCapture.latest?.timestamp ?
        (() => {
          const d = new Date(pageCapture.latest!.timestamp);
          const date = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
          const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          return `${date} ${time}`;
        })()
      : 'NO CAPTURE YET';
    const conceptEmptyLabel =
      pageConcepts.length === 0 ? 'NO PAGE CONCEPT SET YET'
      : !selectedPageConcept ? 'NO PAGE CONCEPT SELECTED'
      : viewport === 'DESKTOP' ? 'NO DESKTOP CONCEPT YET'
      : viewport === 'TABLET' ? 'NO TABLET CONCEPT YET'
      : 'NO CONCEPT PREVIEW';

    return {
      header: {
        ...TWIN_OPUS_DIRECT_HEADER,
        brand: crumbs.brand,
        project: crumbs.module,
        page: crumbs.activeProject,
        compiler:
          syncStatus === 'SYNCED' ? TWIN_OPUS_DIRECT_HEADER.compiler
          : syncStatus === 'HYDRATING' ? 'COMPILER: SYNC…'
          : syncStatus === 'STALE' ? 'COMPILER: LOCAL CACHE'
          : 'COMPILER: LOCAL',
      },
      context: {
        chip: (intel?.displayName ?? slug.toUpperCase()).toString(),
        stream: intel?.primaryCreativeStream ?? TWIN_OPUS_DIRECT_CONTEXT.stream,
        right: shellTarget.pageLabel.toUpperCase(),
      },
      primaryNav: TWIN_OPUS_DIRECT_PRIMARY_NAV,
      target: {
        ...TWIN_OPUS_DIRECT_TARGET,
        lines: designPageTargetLines(shellTarget),
      },
      stage: {
        ...TWIN_OPUS_DIRECT_STAGE,
        stageValue: prodState.workflowStage === 'BUILD' ? 'BUILD' : TWIN_OPUS_DIRECT_STAGE.stageValue,
        authorityValue: pageAwareProjection.stageAuthorityValue,
      },
      viewports: TWIN_OPUS_DIRECT_VIEWPORTS,
      hero: {
        ...TWIN_OPUS_DIRECT_HERO,
        eyebrowLeft: designPageTargetLines(shellTarget)[0] ?? TWIN_OPUS_DIRECT_HERO.eyebrowLeft,
        eyebrowCentre: shellTarget.pageLabel,
        eyebrowRight: shellTarget.screenId.replace(/-/g, ' ').slice(0, 12).toUpperCase(),
      } as typeof TWIN_OPUS_DIRECT_HERO,
      heroPreview,
      viewportControls,
      selectActions: TWIN_OPUS_DIRECT_SELECT_ACTIONS,
      authorityPair: TWIN_OPUS_DIRECT_AUTHORITY_PAIR,
      authorityPairPresentation: (() => {
        const wf = pageAuthority.workflow;
        const mobileRef = resolveActiveAuthorityImage(wf.mobileAuthority);
        const desktopRef = resolveActiveAuthorityImage(wf.desktopAuthority);
        const promotedMobileArt =
          prodState.promotedMobileConceptId ?
            twinOpusDirectCandidateArtifactView(prodState.promotedMobileConceptId)
          : null;
        const promotedDesktopArt =
          prodState.promotedDesktopConceptId ?
            twinOpusDirectCandidateArtifactView(prodState.promotedDesktopConceptId)
          : null;
        return {
          title: TWIN_OPUS_DIRECT_AUTHORITY_PAIR.title,
          mobile: {
            label: 'MOBILE AUTHORITY',
            version: wf.mobileAuthority.versions.find((v) => v.versionId === wf.mobileAuthority.activeVersionId)?.label ?? '—',
            state: 'UPSTREAM REF',
            previewSrc: mobileRef,
            missing: !mobileRef,
          },
          desktop: {
            label: 'DESKTOP AUTHORITY',
            version: wf.desktopAuthority.versions.find((v) => v.versionId === wf.desktopAuthority.activeVersionId)?.label ?? '—',
            state: 'UPSTREAM REF',
            previewSrc: desktopRef,
            missing: !desktopRef,
          },
          tabletLabel: railRows?.tabletLabel ?? 'TABLET: DERIVED WHEN PAIR PROMOTED',
          promotedMobile: {
            conceptId: prodState.promotedMobileConceptId,
            previewSrc: promotedMobileArt?.src ?? null,
            version: prodState.mobileVersion,
          },
          promotedDesktop: {
            conceptId: prodState.promotedDesktopConceptId,
            previewSrc: promotedDesktopArt?.src ?? null,
            version: prodState.desktopVersion,
          },
        };
      })(),
      viewportPreferenceBadges: (id: string) => {
        const badges: string[] = [];
        if (selectedMobileConceptId === id) badges.push('SELECTED MOBILE AUTHORITY');
        if (prodState.preferredMobileConceptId === id) badges.push('SELECTED FOR MOBILE');
        if (prodState.preferredDesktopConceptId === id) badges.push('SELECTED FOR DESKTOP');
        if (prodState.promotedMobileConceptId === id) badges.push('PROMOTED MOBILE');
        if (prodState.promotedDesktopConceptId === id) badges.push('PROMOTED DESKTOP');
        return badges;
      },
      railActions: TWIN_OPUS_DIRECT_RAIL_ACTIONS,
      gallery: TWIN_OPUS_DIRECT_GALLERY,
      galleryEmptyMessage,
      galleryEmptyTestId: galleryEmpty.testId,
      galleryGenerateLabel: 'GENERATE PAGE CONCEPTS',
      pageConceptGenerationEligibility: pageConceptGeneration.generationEligibility,
      pageConceptGenerationGate: pageConceptGenerationGateFromEligibility(
        pageConceptGeneration.generationEligibility,
        pageConceptGeneration.generating,
      ),
      pageConceptTargetPageId: pageTarget.pageId,
      candidates: scopedCandidates,
      candidateSections: {
        currentRunId: gallerySections.currentRunId,
        current: scopedCandidates,
        history: historyCandidates,
      },
      selectedMobileConceptId,
      candidateActions: TWIN_OPUS_DIRECT_CANDIDATE_ACTIONS,
      outputTitle: TWIN_OPUS_DIRECT_OUTPUT_TITLE,
      pageSystemReview: buildPageSystemReviewModel(projectSlug, pageTarget.pageId, viewport),
      pipelineTitle: TWIN_OPUS_DIRECT_PIPELINE_TITLE,
      pagePipeline,
      outputViewportNote:
        viewport === 'MOBILE' ? null : (
          `Page system review · ${viewport} viewport${viewport === 'TABLET' && pageViewportBundle?.coverage.tablet === 'DERIVED' ? ' · DERIVED' : ''}`
        ),
      conceptTabs: TWIN_OPUS_DIRECT_CONCEPT_TABS,
      conceptFields: TWIN_OPUS_DIRECT_CONCEPT_FIELDS,
      amendment: TWIN_OPUS_DIRECT_AMENDMENT,
      bottomNav: TWIN_OPUS_DIRECT_BOTTOM_NAV,
      heroCompare: {
        currentSrc,
        currentMeta:
          pageCapture.error ? 'CAPTURE FAILED'
          : currentSrc ? capturedLabel
          : captureArtifactPath ? 'CAPTURE NEEDS RECAPTURE'
          : capturedLabel,
        currentEmptyLabel:
          pageCapture.error ? pageCapture.error
          : captureArtifactPath && !currentSrc ?
            'Previous capture has no image artifact — use CAPTURE SCREEN again.'
          : 'NO CURRENT CAPTURE',
        conceptSrc,
        conceptMeta: selectedPageConcept?.conceptTitle?.toUpperCase() ?? '—',
        conceptEmptyLabel,
        captureBusy: pageCapture.capturing,
        captureError: pageCapture.error,
      },
      heroAssembly: (() => {
        const pageCtx = compileDesignPageContext(projectSlug, pageTarget.pageId);
        const concepts = listPageConceptCandidates(projectSlug, pageTarget.pageId);
        const staged = listStagedGrokAssets(projectSlug, pageTarget.pageId);
        const model = computeHeroAssemblyActions({
          projectId: projectSlug,
          pageId: pageTarget.pageId,
          viewport,
          production: prodState,
          pageWorkflow: pageAuthority.workflow,
          twinRouteReachable: pageAuthority.workflow.twinRouteVerifiedAt ? true : null,
          twinRoute: pageCtx?.route ?? null,
          hasPageConceptCandidates: concepts.length > 0,
          grokGenerationInProgress: staged.some((a) => a.status === 'STAGED'),
        });
        return {
          ...model,
          capture: { ...model.capture, busy: pageCapture.capturing },
        };
      })(),
    };
  }, [
    actor,
    candidateId,
    pagePipeline,
    pageCapture.capturing,
    pageCapture.error,
    pageCapture.latest,
    pageTarget,
    pageViewportBundle,
    prodState,
    pageAuthority.workflow,
    projectSlug,
    syncStatus,
    viewport,
    pageConceptRevision,
    pageConceptGeneration.generating,
    pageConceptGeneration.generationEligibility,
    selectedMobileConceptId,
  ]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const gate = pageConceptGenerationGateFromEligibility(
      pageConceptGeneration.generationEligibility,
      pageConceptGeneration.generating,
    );
    assertPageConceptGenerationGateDivergence({
      eligibility: pageConceptGeneration.generationEligibility,
      generateButtonDisabled: !gate.canPressGenerate,
      renderedBlockerText: gate.blockerMessage,
    });
  }, [pageConceptGeneration.generating, pageConceptGeneration.generationEligibility]);

  const state = useMemo<TwinOpusDirectWorkspaceState>(
    () => ({ viewport, navIndex, candidateId, authorityPairOpen, recordTabIndex, dockIndex }),
    [viewport, navIndex, candidateId, authorityPairOpen, recordTabIndex, dockIndex],
  );

  useEffect(() => {
    const onHandler = (event: Event) => {
      const handler = (event as CustomEvent<{ handler?: PipelineResolutionHandler }>).detail?.handler;
      if (handler) actions.runPipelineHandler(handler);
    };
    window.addEventListener(DESIGN_PIPELINE_HANDLER_EVENT, onHandler);
    return () => window.removeEventListener(DESIGN_PIPELINE_HANDLER_EVENT, onHandler);
  }, [actions]);

  return {
    data,
    state,
    actions,
    selectedCandidate,
    readinessDash,
    viewMode,
    setViewMode,
    production,
    projectSlug,
    pageConceptGeneration,
  };
}
