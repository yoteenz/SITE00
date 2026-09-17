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
  TWIN_OPUS_DIRECT_CHECKS,
  TWIN_OPUS_DIRECT_CONCEPT_FIELDS,
  TWIN_OPUS_DIRECT_CONCEPT_TABS,
  TWIN_OPUS_DIRECT_CONTEXT,
  TWIN_OPUS_DIRECT_GALLERY,
  TWIN_OPUS_DIRECT_HEADER,
  TWIN_OPUS_DIRECT_HERO,
  TWIN_OPUS_DIRECT_OUTPUT_COLUMNS,
  TWIN_OPUS_DIRECT_OUTPUT_TITLE,
  TWIN_OPUS_DIRECT_PIPELINE_TITLE,
  TWIN_OPUS_DIRECT_PRIMARY_NAV,
  TWIN_OPUS_DIRECT_RAIL_ACTIONS,
  TWIN_OPUS_DIRECT_READINESS_SHELL,
  TWIN_OPUS_DIRECT_SELECT_ACTIONS,
  TWIN_OPUS_DIRECT_STAGE,
  TWIN_OPUS_DIRECT_TARGET,
  TWIN_OPUS_DIRECT_VIEWPORTS,
  type TwinOpusDirectViewportId,
} from './twinOpusDirectContent';
import {
  designPageTargetLines,
  readDesignPageTarget,
} from '../production/designProductionPageTarget';
import { readDesignWorkspaceSurface, writeDesignWorkspaceSurface } from '../production/designProductionWorkspaceMode';
import {
  buildDesignModuleHierarchy,
  buildDesignProjectIntelligence,
  designHeaderCrumbLabels,
} from '../../../../../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { site00ProjectsDesignModulePath } from '../../../config/routes';
import {
  computeContextualNextAction,
  railActionDisabledReason,
} from '../../../../../shared/site00-design-workspace-production/designInteractionEligibility.js';
import { useDesignProductionNavigation } from '../production/useDesignProductionNavigation';
import {
  twinOpusDirectCandidateArtifactView,
  twinOpusDirectCandidateById,
} from './twinOpusDirectCandidateArtifacts';
import {
  useTwinOpusDirectProduction,
  type TwinOpusDirectProduction,
} from './useTwinOpusDirectProduction';

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
  candidates: typeof TWIN_OPUS_DIRECT_CANDIDATES;
  candidateActions: typeof TWIN_OPUS_DIRECT_CANDIDATE_ACTIONS;
  outputTitle: typeof TWIN_OPUS_DIRECT_OUTPUT_TITLE;
  outputColumns: typeof TWIN_OPUS_DIRECT_OUTPUT_COLUMNS;
  pipelineTitle: typeof TWIN_OPUS_DIRECT_PIPELINE_TITLE;
  readiness: {
    label: string;
    percent: number;
    state: string;
    compiler: string;
    compilerState: string;
    checksLabel: string;
    statusLabel: string;
    viewDetails: string;
  };
  checks: readonly { id: string; label: string; state: 'pass' | 'fail' | 'pending' | 'warn' }[];
  statusRows: readonly { id: string; label: string; value: string }[];
  nextAction: {
    label: string;
    lines: readonly string[];
    primary: string;
    secondary: readonly string[];
  };
  conceptTabs: typeof TWIN_OPUS_DIRECT_CONCEPT_TABS;
  conceptFields: typeof TWIN_OPUS_DIRECT_CONCEPT_FIELDS;
  amendment: typeof TWIN_OPUS_DIRECT_AMENDMENT;
  bottomNav: typeof TWIN_OPUS_DIRECT_BOTTOM_NAV;
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
  selectForMobile: () => void;
  selectForDesktop: () => void;
  openCompareConcepts: () => void;
  openStructuredArtifact: (columnId: string) => void;
  openAmendmentDetail: () => void;
  runContextualNextAction: () => void;
  railDisabledReason: (actionId: string) => string | null;
  goWorkspace: () => void;
  goDesignHistory: () => void;
  goChangeHistory: () => void;
  goMasterAmendment: () => void;
}

export interface TwinOpusDirectWorkspace {
  data: TwinOpusDirectWorkspaceData;
  state: TwinOpusDirectWorkspaceState;
  actions: TwinOpusDirectWorkspaceActions;
  selectedCandidate: (typeof TWIN_OPUS_DIRECT_CANDIDATES)[number];
  readinessDash: { circumference: number; offset: number };
  viewMode: TwinOpusDirectViewMode;
  setViewMode: (mode: TwinOpusDirectViewMode) => void;
  production: TwinOpusDirectProduction;
  projectSlug: string;
  workspaceSurface: ReturnType<typeof readDesignWorkspaceSurface>;
}

export function useTwinOpusDirectWorkspace(projectSlug: string): TwinOpusDirectWorkspace {
  const production = useTwinOpusDirectProduction(projectSlug);
  const { state: prodState, projection, actions: prodActions, actor } = production;
  const nav = useDesignProductionNavigation();

  const [viewport, setViewport] = useState<TwinOpusDirectViewportId>('MOBILE');
  const [navIndex, setNavIndex] = useState(0);
  const [candidateId, setCandidateId] = useState(prodState.selectedCandidateId);
  const [authorityPairOpen, setAuthorityPairOpen] = useState(true);
  const [recordTabIndex, setRecordTabIndex] = useState(0);
  const [dockIndex, setDockIndex] = useState(0);
  const [viewMode, setViewModeState] = useState<TwinOpusDirectViewMode>(TWIN_OPUS_DIRECT_DEFAULT_VIEW_MODE);
  const [pageTarget, setPageTarget] = useState(() => readDesignPageTarget(projectSlug));
  const [workspaceSurface, setWorkspaceSurface] = useState(() => readDesignWorkspaceSurface(projectSlug));

  useEffect(() => {
    const onTarget = (event: Event) => {
      const detail = (event as CustomEvent<{ projectSlug?: string }>).detail;
      if (!detail?.projectSlug || detail.projectSlug.toLowerCase() !== projectSlug.toLowerCase()) return;
      setPageTarget(readDesignPageTarget(projectSlug));
      setWorkspaceSurface(readDesignWorkspaceSurface(projectSlug));
    };
    window.addEventListener('site00:design-page-target', onTarget);
    window.addEventListener('site00:design-workspace-surface', onTarget);
    return () => {
      window.removeEventListener('site00:design-page-target', onTarget);
      window.removeEventListener('site00:design-workspace-surface', onTarget);
    };
  }, [projectSlug]);

  useEffect(() => {
    setCandidateId(prodState.selectedCandidateId);
  }, [prodState.selectedCandidateId, prodState.updatedAt]);

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
      const candidate = twinOpusDirectCandidateById(candidateId);
      prodActions.selectViewportCandidate(viewport, candidate.id, candidate.version);
    },
    [candidateId, prodActions],
  );

  const actions = useMemo<TwinOpusDirectWorkspaceActions>(
    () => ({
      selectViewport: setViewport,
      selectNavSection: setNavIndex,
      selectCandidate: (id: string) => {
        setCandidateId(id);
        prodActions.selectGalleryCandidate(id);
      },
      toggleAuthorityPair: () => setAuthorityPairOpen((open) => !open),
      selectRecordTab: setRecordTabIndex,
      selectDockDestination: setDockIndex,
      selectForMobile: () => selectForViewport('MOBILE'),
      selectForDesktop: () => selectForViewport('DESKTOP'),
      openCompareConcepts: () => {
        const ids = TWIN_OPUS_DIRECT_CANDIDATES.map((c) => c.id);
        const idx = Math.max(0, ids.indexOf(candidateId));
        const other = ids[(idx + 1) % ids.length] ?? candidateId;
        prodActions.openCompareConcepts(candidateId, other);
      },
      openStructuredArtifact: (columnId) => prodActions.openStructuredArtifact(columnId),
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
      goWorkspace: () => {
        writeDesignWorkspaceSurface(projectSlug, 'project-overview');
        setWorkspaceSurface('project-overview');
        nav.goWorkspace();
      },
      goDesignHistory: () => nav.goSection('history'),
      goChangeHistory: () => {
        nav.goSection('history');
        setRecordTabIndex(2);
      },
      goMasterAmendment: () => {
        setRecordTabIndex(4);
        prodActions.openAmendmentDetail();
      },
      onRailAction: (actionId: string) => {
        switch (actionId) {
          case 'promote-mobile':
            prodActions.promoteViewportMaster('MOBILE');
            break;
          case 'promote-desktop':
            prodActions.promoteViewportMaster('DESKTOP');
            break;
          case 'pair-review':
            prodActions.runPairReview();
            break;
          case 'review-authority':
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
          prodActions.openInspectCandidate(candidate);
        }
        if (actionId === 'fullscreen') {
          prodActions.openFullscreenArtifact(twinOpusDirectCandidateArtifactView(candidate, viewport));
        }
      },
      openProvenance: prodActions.openProvenance,
      openReadinessReceipt: prodActions.openReadinessReceipt,
    }),
    [actor, candidateId, nav, prodActions, prodState, production, selectForViewport, viewport],
  );

  const selectedCandidate = useMemo(
    () =>
      TWIN_OPUS_DIRECT_CANDIDATES.find((c) => c.id === candidateId) ?? TWIN_OPUS_DIRECT_CANDIDATES[0],
    [candidateId],
  );

  const readinessDash = useMemo(() => {
    const circumference = 2 * Math.PI * 30;
    const pct = projection.percent;
    return {
      circumference,
      offset: circumference * (1 - pct / 100),
    };
  }, [projection.percent]);

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
    const targetLines =
      workspaceSurface === 'page-workspace' && pageTarget ?
        designPageTargetLines(pageTarget)
      : ['PROJECT OVERVIEW', 'PAGE MAP', (intel?.displayName ?? slug.toUpperCase()).toString()];

    return {
      header: {
        ...TWIN_OPUS_DIRECT_HEADER,
        brand: crumbs.brand,
        project: crumbs.module,
        page: crumbs.activeProject,
      },
      context: {
        chip: (intel?.displayName ?? slug.toUpperCase()).toString(),
        stream: intel?.primaryCreativeStream ?? TWIN_OPUS_DIRECT_CONTEXT.stream,
        right: 'PROJECT CREATIVE CONTEXT',
      },
      primaryNav: TWIN_OPUS_DIRECT_PRIMARY_NAV,
      target: {
        ...TWIN_OPUS_DIRECT_TARGET,
        label: workspaceSurface === 'page-workspace' ? 'TARGET' : 'MODULE',
        lines: targetLines as unknown as typeof TWIN_OPUS_DIRECT_TARGET.lines,
      },
      stage: {
        ...TWIN_OPUS_DIRECT_STAGE,
        stageValue: prodState.workflowStage === 'BUILD' ? 'BUILD' : TWIN_OPUS_DIRECT_STAGE.stageValue,
        authorityValue: projection.stageAuthorityValue,
      },
      viewports: TWIN_OPUS_DIRECT_VIEWPORTS,
      hero: TWIN_OPUS_DIRECT_HERO,
      selectActions: TWIN_OPUS_DIRECT_SELECT_ACTIONS,
      authorityPair: TWIN_OPUS_DIRECT_AUTHORITY_PAIR,
      railActions: TWIN_OPUS_DIRECT_RAIL_ACTIONS,
      gallery: TWIN_OPUS_DIRECT_GALLERY,
      candidates: TWIN_OPUS_DIRECT_CANDIDATES,
      candidateActions: TWIN_OPUS_DIRECT_CANDIDATE_ACTIONS,
      outputTitle: TWIN_OPUS_DIRECT_OUTPUT_TITLE,
      outputColumns: TWIN_OPUS_DIRECT_OUTPUT_COLUMNS,
      pipelineTitle: TWIN_OPUS_DIRECT_PIPELINE_TITLE,
      readiness: {
        ...TWIN_OPUS_DIRECT_READINESS_SHELL,
        percent: projection.percent,
        state: projection.state,
        compilerState: projection.compilerState,
      },
      checks: projection.checks.length > 0 ? projection.checks : TWIN_OPUS_DIRECT_CHECKS,
      statusRows: projection.statusRows,
      nextAction: (() => {
        const next = computeContextualNextAction(prodState, actor);
        return {
          label: next.label,
          lines: next.lines,
          primary: next.lines[0] ?? 'NEXT ACTION',
          secondary: ['VIEW TECHNICAL DETAILS'],
        };
      })(),
      conceptTabs: TWIN_OPUS_DIRECT_CONCEPT_TABS,
      conceptFields: TWIN_OPUS_DIRECT_CONCEPT_FIELDS,
      amendment: TWIN_OPUS_DIRECT_AMENDMENT,
      bottomNav: TWIN_OPUS_DIRECT_BOTTOM_NAV,
    };
  }, [actor, pageTarget, prodState, projection, projectSlug, workspaceSurface]);

  const state = useMemo<TwinOpusDirectWorkspaceState>(
    () => ({ viewport, navIndex, candidateId, authorityPairOpen, recordTabIndex, dockIndex }),
    [viewport, navIndex, candidateId, authorityPairOpen, recordTabIndex, dockIndex],
  );

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
    workspaceSurface,
  };
}
