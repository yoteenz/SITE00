/**
 * P0.VR.DESIGNBENCH.OPUS-VIEWMODE1 — shared workspace model for the NDXBOOK
 * DESIGN workspace.
 *
 * The workspace object below is the single source of truth for both
 * presentation modes. CANONICAL (the Opus spatial/editorial authority) and
 * LIST (the Spark digest renderer, wired in a later sprint) read the same
 * state and call the same actions; only presentation differs. A renderer must
 * never hold its own copy of candidate selection, authority, readiness or
 * record state.
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
  TWIN_OPUS_DIRECT_READINESS,
  TWIN_OPUS_DIRECT_SELECT_ACTIONS,
  TWIN_OPUS_DIRECT_STAGE,
  TWIN_OPUS_DIRECT_STATUS_ROWS,
  TWIN_OPUS_DIRECT_TARGET,
  TWIN_OPUS_DIRECT_VIEWPORTS,
  type TwinOpusDirectViewportId,
} from './twinOpusDirectContent';

export const TWIN_OPUS_DIRECT_VIEW_MODES = ['canonical', 'list'] as const;

export type TwinOpusDirectViewMode = (typeof TWIN_OPUS_DIRECT_VIEW_MODES)[number];

export const TWIN_OPUS_DIRECT_DEFAULT_VIEW_MODE: TwinOpusDirectViewMode = 'canonical';

export const TWIN_OPUS_DIRECT_VIEW_MODE_LABELS: Record<TwinOpusDirectViewMode, string> = {
  canonical: 'CANONICAL',
  list: 'LIST',
};

/** Presentation-only preference, so it survives a reload without touching workspace data. */
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

/**
 * Everything a presentation renderer is allowed to read. Spark receives this
 * object unchanged; the shape is the handoff contract for the LIST renderer.
 */
export interface TwinOpusDirectWorkspaceData {
  header: typeof TWIN_OPUS_DIRECT_HEADER;
  context: typeof TWIN_OPUS_DIRECT_CONTEXT;
  primaryNav: typeof TWIN_OPUS_DIRECT_PRIMARY_NAV;
  target: typeof TWIN_OPUS_DIRECT_TARGET;
  stage: typeof TWIN_OPUS_DIRECT_STAGE;
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
  readiness: typeof TWIN_OPUS_DIRECT_READINESS;
  checks: typeof TWIN_OPUS_DIRECT_CHECKS;
  statusRows: typeof TWIN_OPUS_DIRECT_STATUS_ROWS;
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
}

export interface TwinOpusDirectWorkspace {
  data: TwinOpusDirectWorkspaceData;
  state: TwinOpusDirectWorkspaceState;
  actions: TwinOpusDirectWorkspaceActions;
  /** Derived: the candidate `state.candidateId` points at. */
  selectedCandidate: (typeof TWIN_OPUS_DIRECT_CANDIDATES)[number];
  /** Derived: readiness ring geometry, shared so both renderers agree on the value. */
  readinessDash: { circumference: number; offset: number };
  viewMode: TwinOpusDirectViewMode;
  setViewMode: (mode: TwinOpusDirectViewMode) => void;
}

const WORKSPACE_DATA: TwinOpusDirectWorkspaceData = {
  header: TWIN_OPUS_DIRECT_HEADER,
  context: TWIN_OPUS_DIRECT_CONTEXT,
  primaryNav: TWIN_OPUS_DIRECT_PRIMARY_NAV,
  target: TWIN_OPUS_DIRECT_TARGET,
  stage: TWIN_OPUS_DIRECT_STAGE,
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
  readiness: TWIN_OPUS_DIRECT_READINESS,
  checks: TWIN_OPUS_DIRECT_CHECKS,
  statusRows: TWIN_OPUS_DIRECT_STATUS_ROWS,
  nextAction: TWIN_OPUS_DIRECT_NEXT_ACTION,
  conceptTabs: TWIN_OPUS_DIRECT_CONCEPT_TABS,
  conceptFields: TWIN_OPUS_DIRECT_CONCEPT_FIELDS,
  amendment: TWIN_OPUS_DIRECT_AMENDMENT,
  bottomNav: TWIN_OPUS_DIRECT_BOTTOM_NAV,
};

export function useTwinOpusDirectWorkspace(): TwinOpusDirectWorkspace {
  const [viewport, setViewport] = useState<TwinOpusDirectViewportId>('MOBILE');
  const [navIndex, setNavIndex] = useState(0);
  const [candidateId, setCandidateId] = useState(TWIN_OPUS_DIRECT_CANDIDATES[0].id);
  const [authorityPairOpen, setAuthorityPairOpen] = useState(true);
  const [recordTabIndex, setRecordTabIndex] = useState(0);
  const [dockIndex, setDockIndex] = useState(0);
  const [viewMode, setViewModeState] = useState<TwinOpusDirectViewMode>(TWIN_OPUS_DIRECT_DEFAULT_VIEW_MODE);

  // Read after mount so the first paint matches the server/default render.
  useEffect(() => {
    const stored = readStoredViewMode();
    if (stored !== TWIN_OPUS_DIRECT_DEFAULT_VIEW_MODE) setViewModeState(stored);
  }, []);

  const setViewMode = useCallback((mode: TwinOpusDirectViewMode) => {
    setViewModeState(mode);
    try {
      window.sessionStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      /* presentation preference only — a storage failure must not break the switch */
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
    }),
    [],
  );

  const selectedCandidate = useMemo(
    () =>
      TWIN_OPUS_DIRECT_CANDIDATES.find((candidate) => candidate.id === candidateId) ??
      TWIN_OPUS_DIRECT_CANDIDATES[0],
    [candidateId],
  );

  const readinessDash = useMemo(() => {
    const circumference = 2 * Math.PI * 30;
    return {
      circumference,
      offset: circumference * (1 - TWIN_OPUS_DIRECT_READINESS.percent / 100),
    };
  }, []);

  const state = useMemo<TwinOpusDirectWorkspaceState>(
    () => ({ viewport, navIndex, candidateId, authorityPairOpen, recordTabIndex, dockIndex }),
    [viewport, navIndex, candidateId, authorityPairOpen, recordTabIndex, dockIndex],
  );

  return {
    data: WORKSPACE_DATA,
    state,
    actions,
    selectedCandidate,
    readinessDash,
    viewMode,
    setViewMode,
  };
}
