import { buildComposerContractFreezeMetadata } from './composerContractFreeze.js';
import type { DesignProductionHistoryEntry, DesignProductionState } from './types.js';
import { DESIGN_PRODUCTION_PAGE_ID, DESIGN_PRODUCTION_STORE_VERSION } from './types.js';

const STORAGE_PREFIX = 'site00:design-workspace-production:v1:';

export function designProductionStorageKey(projectId: string): string {
  return `${STORAGE_PREFIX}${projectId.toLowerCase()}`;
}

export function createInitialDesignProductionState(projectId: string): DesignProductionState {
  const now = new Date().toISOString();
  return {
    storeVersion: DESIGN_PRODUCTION_STORE_VERSION,
    projectId: projectId.toLowerCase(),
    pageId: DESIGN_PRODUCTION_PAGE_ID,
    sessionVersion: 1,
    contractFreeze: buildComposerContractFreezeMetadata({ designAuthorityVersion: 'design-authority-v1' }),
    workflowStage: 'DESIGN',
    packageStatus: 'DESIGN_IN_PROGRESS',
    selectedCandidateId: 'v13',
    mobileAuthority: 'SELECTED',
    desktopAuthority: 'PROMOTED',
    mobileVersion: 'V1.3',
    desktopVersion: 'V1.1',
    pairReviewOpenedAt: null,
    authorityReviewDecision: null,
    authorityReviewedAt: null,
    pairLockedAt: null,
    designAuthorityVersion: 'design-authority-v1',
    tabletMode: 'DERIVED',
    tabletDerivedOk: true,
    tabletOverrideReason: null,
    tabletOverrideApprovedAt: null,
    translationApproved: false,
    buildPackage: null,
    history: [],
    spendConfirmations: [],
    updatedAt: now,
  };
}

function appendHistory(
  state: DesignProductionState,
  entry: Omit<DesignProductionHistoryEntry, 'id'>,
): DesignProductionHistoryEntry[] {
  const row: DesignProductionHistoryEntry = {
    id: `dph-${Date.now()}-${state.history.length}`,
    ...entry,
  };
  return [...state.history, row].slice(-200);
}

export function loadDesignProductionState(projectId: string): DesignProductionState {
  if (typeof localStorage === 'undefined') {
    return createInitialDesignProductionState(projectId);
  }
  try {
    const raw = localStorage.getItem(designProductionStorageKey(projectId));
    if (!raw) return createInitialDesignProductionState(projectId);
    const parsed = JSON.parse(raw) as DesignProductionState;
    if (parsed.storeVersion !== DESIGN_PRODUCTION_STORE_VERSION) {
      return createInitialDesignProductionState(projectId);
    }
    return parsed;
  } catch {
    return createInitialDesignProductionState(projectId);
  }
}

export function saveDesignProductionState(state: DesignProductionState): DesignProductionState {
  const next = { ...state, updatedAt: new Date().toISOString(), sessionVersion: state.sessionVersion + 1 };
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(designProductionStorageKey(state.projectId), JSON.stringify(next));
  }
  return next;
}

export function withHistory(
  state: DesignProductionState,
  entry: Omit<DesignProductionHistoryEntry, 'id'>,
): DesignProductionState {
  return { ...state, history: appendHistory(state, entry) };
}
