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
  TWIN_OPUS_DIRECT_NEXT_ACTION,
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
  header: Omit<typeof TWIN_OPUS_DIRECT_HEADER, 'project'> & { project: string };
  context: typeof TWIN_OPUS_DIRECT_CONTEXT;
  primaryNav: typeof TWIN_OPUS_DIRECT_PRIMARY_NAV;
  target: typeof TWIN_OPUS_DIRECT_TARGET;
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
  nextAction: typeof TWIN_OPUS_DIRECT_NEXT_ACTION;
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
}

export function useTwinOpusDirectWorkspace(projectSlug: string): TwinOpusDirectWorkspace {
  const production = useTwinOpusDirectProduction(projectSlug);
  const { state: prodState, projection, actions: prodActions, actor } = production;

  const [viewport, setViewport] = useState<TwinOpusDirectViewportId>('MOBILE');
  const [navIndex, setNavIndex] = useState(0);
  const [candidateId, setCandidateId] = useState(prodState.selectedCandidateId);
  const [authorityPairOpen, setAuthorityPairOpen] = useState(true);
  const [recordTabIndex, setRecordTabIndex] = useState(0);
  const [dockIndex, setDockIndex] = useState(0);
  const [viewMode, setViewModeState] = useState<TwinOpusDirectViewMode>(TWIN_OPUS_DIRECT_DEFAULT_VIEW_MODE);
  const [pageTarget, setPageTarget] = useState(() => readDesignPageTarget(projectSlug));

  useEffect(() => {
    const onTarget = (event: Event) => {
      const detail = (event as CustomEvent<{ projectSlug?: string }>).detail;
      if (!detail?.projectSlug || detail.projectSlug.toLowerCase() !== projectSlug.toLowerCase()) return;
      setPageTarget(readDesignPageTarget(projectSlug));
    };
    window.addEventListener('site00:design-page-target', onTarget);
    return () => window.removeEventListener('site00:design-page-target', onTarget);
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

  const actions = useMemo<TwinOpusDirectWorkspaceActions>(
    () => ({
      selectViewport: setViewport,
      selectNavSection: setNavIndex,
      selectCandidate: setCandidateId,
      toggleAuthorityPair: () => setAuthorityPairOpen((open) => !open),
      selectRecordTab: setRecordTabIndex,
      selectDockDestination: setDockIndex,
      onRailAction: (actionId: string) => {
        switch (actionId) {
          case 'pair-review':
            prodActions.runPairReview();
            break;
          case 'review-authority':
            if (actor.isFounder) prodActions.runReviewAuthority('APPROVE');
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
      },
      openProvenance: prodActions.openProvenance,
      openReadinessReceipt: prodActions.openReadinessReceipt,
    }),
    [actor, candidateId, prodActions, production, projectSlug],
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
    const slugLabel = (projectSlug || 'ndxbook').trim().toUpperCase();
    return {
      header: {
        ...TWIN_OPUS_DIRECT_HEADER,
        project: `PROJECT: ${slugLabel}`,
      },
      context: TWIN_OPUS_DIRECT_CONTEXT,
      primaryNav: TWIN_OPUS_DIRECT_PRIMARY_NAV,
      target: {
        ...TWIN_OPUS_DIRECT_TARGET,
        lines: designPageTargetLines(pageTarget) as unknown as typeof TWIN_OPUS_DIRECT_TARGET.lines,
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
      nextAction: TWIN_OPUS_DIRECT_NEXT_ACTION,
      conceptTabs: TWIN_OPUS_DIRECT_CONCEPT_TABS,
      conceptFields: TWIN_OPUS_DIRECT_CONCEPT_FIELDS,
      amendment: TWIN_OPUS_DIRECT_AMENDMENT,
      bottomNav: TWIN_OPUS_DIRECT_BOTTOM_NAV,
    };
  }, [pageTarget, prodState.workflowStage, projection, projectSlug]);

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
  };
}
