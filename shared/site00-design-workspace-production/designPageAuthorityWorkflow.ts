/**
 * P0.VR.DESIGN-AUTHORITY-WORKFLOW2 — page-scoped authority references, preferences,
 * promotions, CGPT collaboration, and Composer handoff packages.
 */

import { loadPageViewportAuthorities } from './designProjectBinding/pageViewportAuthority.js';

export type ViewportAuthorityReferenceStatus = 'DRAFT' | 'ACTIVE' | 'SUPERSEDED';

export type AuthorityCollaborationMessage = {
  id: string;
  role: 'founder' | 'cgpt';
  text: string;
  attachmentDataUrl?: string;
  at: string;
};

export type ViewportAuthorityReferenceVersion = {
  versionId: string;
  label: string;
  imageUrl: string | null;
  notes: string;
  createdAt: string;
  status: ViewportAuthorityReferenceStatus;
};

export type ViewportAuthorityReference = {
  authorityId: string;
  projectId: string;
  pageId: string;
  viewport: 'MOBILE' | 'DESKTOP';
  activeVersionId: string;
  versions: readonly ViewportAuthorityReferenceVersion[];
  chatThreadId: string;
  messages: readonly AuthorityCollaborationMessage[];
  updatedAt: string;
};

export type PreferredViewportConcept = {
  mobileConceptId: string | null;
  desktopConceptId: string | null;
};

export type PromotedViewportDesign = {
  mobileConceptId: string | null;
  mobilePromotedAt: string | null;
  desktopConceptId: string | null;
  desktopPromotedAt: string | null;
};

export type TwinImplementationStatus = 'NONE' | 'IMPLEMENTING' | 'READY_FOR_REVIEW';

export type TwinImplementationPackage = {
  packageId: string;
  projectId: string;
  pageId: string;
  mobilePromotedDesignId: string;
  desktopPromotedDesignId: string;
  mobileAuthorityReferenceId: string;
  desktopAuthorityReferenceId: string;
  tabletPolicy: 'DERIVED' | 'OVERRIDE';
  interactionContractVersion: string;
  assetManifestVersion: string;
  pageContextVersion: string;
  references: readonly string[];
  handoffTimestamp: string;
  founderApproval: true;
};

export type PageAuthorityWorkflowState = {
  mobileAuthority: ViewportAuthorityReference;
  desktopAuthority: ViewportAuthorityReference;
  preferred: PreferredViewportConcept;
  promoted: PromotedViewportDesign;
  pairReviewOpenedAt: string | null;
  twinReviewedAt: string | null;
  pairLockedAt: string | null;
  twinImplementationStatus: TwinImplementationStatus;
  composerHandoffPackage: TwinImplementationPackage | null;
  /** Founder declined Grok asset work for this page. */
  grokOptOut: boolean;
  twinRouteVerifiedAt: string | null;
  history: readonly { type: string; at: string; summary: string }[];
};

const STORAGE_PREFIX = 'site00:design-page-authority-workflow:v1:';

function storageKey(projectId: string, pageId: string): string {
  return `${STORAGE_PREFIX}${projectId.toLowerCase()}::${pageId}`;
}

function seedImage(projectId: string, pageId: string, viewport: 'MOBILE' | 'DESKTOP'): string | null {
  const auth = loadPageViewportAuthorities(projectId, pageId);
  if (!auth) return null;
  return viewport === 'MOBILE' ? auth.mobileAuthorityUrl : auth.desktopAuthorityUrl;
}

function createAuthorityRef(
  projectId: string,
  pageId: string,
  viewport: 'MOBILE' | 'DESKTOP',
): ViewportAuthorityReference {
  const now = new Date().toISOString();
  const versionId = `${viewport.toLowerCase()}-auth-v1`;
  const imageUrl = seedImage(projectId, pageId, viewport);
  return {
    authorityId: `${pageId}:${viewport.toLowerCase()}-authority`,
    projectId,
    pageId,
    viewport,
    activeVersionId: versionId,
    chatThreadId: `cgpt-${pageId}-${viewport}`,
    updatedAt: now,
    messages: [],
    versions: [
      {
        versionId,
        label: 'v1',
        imageUrl,
        notes: 'Initial authority reference (founder + CGPT collaboration).',
        createdAt: now,
        status: 'ACTIVE',
      },
    ],
  };
}

export function createInitialPageAuthorityWorkflow(projectId: string, pageId: string): PageAuthorityWorkflowState {
  return {
    mobileAuthority: createAuthorityRef(projectId, pageId, 'MOBILE'),
    desktopAuthority: createAuthorityRef(projectId, pageId, 'DESKTOP'),
    preferred: { mobileConceptId: null, desktopConceptId: null },
    promoted: {
      mobileConceptId: null,
      mobilePromotedAt: null,
      desktopConceptId: null,
      desktopPromotedAt: null,
    },
    pairReviewOpenedAt: null,
    twinReviewedAt: null,
    pairLockedAt: null,
    twinImplementationStatus: 'NONE',
    composerHandoffPackage: null,
    grokOptOut: false,
    twinRouteVerifiedAt: null,
    history: [],
  };
}

function appendHistory(
  state: PageAuthorityWorkflowState,
  type: string,
  summary: string,
): PageAuthorityWorkflowState {
  return {
    ...state,
    history: [...state.history, { type, at: new Date().toISOString(), summary }].slice(-100),
  };
}

export function loadPageAuthorityWorkflow(projectId: string, pageId: string): PageAuthorityWorkflowState {
  if (typeof localStorage === 'undefined') {
    return createInitialPageAuthorityWorkflow(projectId, pageId);
  }
  try {
    const raw = localStorage.getItem(storageKey(projectId, pageId));
    if (!raw) return createInitialPageAuthorityWorkflow(projectId, pageId);
    return JSON.parse(raw) as PageAuthorityWorkflowState;
  } catch {
    return createInitialPageAuthorityWorkflow(projectId, pageId);
  }
}

export function savePageAuthorityWorkflow(
  projectId: string,
  pageId: string,
  state: PageAuthorityWorkflowState,
): PageAuthorityWorkflowState {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(storageKey(projectId, pageId), JSON.stringify(state));
  }
  return state;
}

export function setPreferredViewportConcept(
  state: PageAuthorityWorkflowState,
  viewport: 'MOBILE' | 'DESKTOP',
  conceptId: string,
): PageAuthorityWorkflowState {
  const preferred =
    viewport === 'MOBILE' ?
      { ...state.preferred, mobileConceptId: conceptId }
    : { ...state.preferred, desktopConceptId: conceptId };
  const event = viewport === 'MOBILE' ? 'mobile_concept_selected' : 'desktop_concept_selected';
  return appendHistory({ ...state, preferred }, event, `${viewport} preferred concept ${conceptId}`);
}

export function promoteViewportDesign(
  state: PageAuthorityWorkflowState,
  viewport: 'MOBILE' | 'DESKTOP',
): PageAuthorityWorkflowState {
  const now = new Date().toISOString();
  if (viewport === 'MOBILE') {
    if (!state.preferred.mobileConceptId) throw new Error('NO_MOBILE_PREFERRED');
    const promoted = {
      ...state.promoted,
      mobileConceptId: state.preferred.mobileConceptId,
      mobilePromotedAt: now,
    };
    return appendHistory({ ...state, promoted }, 'mobile_design_promoted', `Mobile promoted ${promoted.mobileConceptId}`);
  }
  if (!state.preferred.desktopConceptId) throw new Error('NO_DESKTOP_PREFERRED');
  const promoted = {
    ...state.promoted,
    desktopConceptId: state.preferred.desktopConceptId,
    desktopPromotedAt: now,
  };
  return appendHistory({ ...state, promoted }, 'desktop_design_promoted', `Desktop promoted ${promoted.desktopConceptId}`);
}

export function markPairReviewOpened(state: PageAuthorityWorkflowState): PageAuthorityWorkflowState {
  const now = new Date().toISOString();
  return appendHistory(
    { ...state, pairReviewOpenedAt: state.pairReviewOpenedAt ?? now },
    'pair_review_opened',
    'Promoted design pair review opened',
  );
}

export function markTwinReviewed(state: PageAuthorityWorkflowState): PageAuthorityWorkflowState {
  return appendHistory(
    { ...state, twinReviewedAt: new Date().toISOString() },
    'twin_ready_for_review',
    'Founder reviewed twin / working page',
  );
}

export function appendAuthorityChatMessage(
  state: PageAuthorityWorkflowState,
  viewport: 'MOBILE' | 'DESKTOP',
  message: Omit<AuthorityCollaborationMessage, 'id' | 'at'>,
): PageAuthorityWorkflowState {
  const row: AuthorityCollaborationMessage = {
    ...message,
    id: `msg-${Date.now()}`,
    at: new Date().toISOString(),
  };
  const key = viewport === 'MOBILE' ? 'mobileAuthority' : 'desktopAuthority';
  const ref = state[key];
  return {
    ...state,
    [key]: {
      ...ref,
      messages: [...ref.messages, row],
      updatedAt: row.at,
    },
  };
}

export function createAuthorityReferenceVersion(
  state: PageAuthorityWorkflowState,
  viewport: 'MOBILE' | 'DESKTOP',
  input: { imageUrl: string | null; notes: string },
): PageAuthorityWorkflowState {
  const key = viewport === 'MOBILE' ? 'mobileAuthority' : 'desktopAuthority';
  const ref = state[key];
  const nextNum = ref.versions.length + 1;
  const versionId = `${ref.viewport.toLowerCase()}-auth-v${nextNum}`;
  const version: ViewportAuthorityReferenceVersion = {
    versionId,
    label: `v${nextNum}`,
    imageUrl: input.imageUrl ?? ref.versions.find((v) => v.versionId === ref.activeVersionId)?.imageUrl ?? null,
    notes: input.notes,
    createdAt: new Date().toISOString(),
    status: 'ACTIVE',
  };
  const versions = ref.versions.map((v) => ({ ...v, status: 'SUPERSEDED' as const }));
  return appendHistory(
    {
      ...state,
      [key]: {
        ...ref,
        activeVersionId: versionId,
        versions: [...versions, version],
        updatedAt: version.createdAt,
      },
    },
    'authority_reference_updated',
    `${viewport} authority ${version.label}`,
  );
}

export function setActiveAuthorityVersion(
  state: PageAuthorityWorkflowState,
  viewport: 'MOBILE' | 'DESKTOP',
  versionId: string,
): PageAuthorityWorkflowState {
  const key = viewport === 'MOBILE' ? 'mobileAuthority' : 'desktopAuthority';
  const ref = state[key];
  if (!ref.versions.some((v) => v.versionId === versionId)) return state;
  return {
    ...state,
    [key]: { ...ref, activeVersionId: versionId, updatedAt: new Date().toISOString() },
  };
}

export function resolveActiveAuthorityImage(ref: ViewportAuthorityReference): string | null {
  return ref.versions.find((v) => v.versionId === ref.activeVersionId)?.imageUrl ?? null;
}

export function bothDesignsPromoted(state: PageAuthorityWorkflowState): boolean {
  return Boolean(state.promoted.mobileConceptId && state.promoted.desktopConceptId);
}

export function createComposerHandoffPackage(
  state: PageAuthorityWorkflowState,
  input: {
    projectId: string;
    pageId: string;
    interactionContractVersion: string;
    assetManifestVersion: string;
    pageContextVersion: string;
    tabletPolicy: 'DERIVED' | 'OVERRIDE';
  },
): { state: PageAuthorityWorkflowState; pkg: TwinImplementationPackage } {
  if (!state.promoted.mobileConceptId || !state.promoted.desktopConceptId) {
    throw new Error('PROMOTED_PAIR_REQUIRED');
  }
  const now = new Date().toISOString();
  const pkg: TwinImplementationPackage = {
    packageId: `tip-${Date.now()}`,
    projectId: input.projectId,
    pageId: input.pageId,
    mobilePromotedDesignId: state.promoted.mobileConceptId,
    desktopPromotedDesignId: state.promoted.desktopConceptId,
    mobileAuthorityReferenceId: state.mobileAuthority.authorityId,
    desktopAuthorityReferenceId: state.desktopAuthority.authorityId,
    tabletPolicy: input.tabletPolicy,
    interactionContractVersion: input.interactionContractVersion,
    assetManifestVersion: input.assetManifestVersion,
    pageContextVersion: input.pageContextVersion,
    references: [
      state.mobileAuthority.activeVersionId,
      state.desktopAuthority.activeVersionId,
    ],
    handoffTimestamp: now,
    founderApproval: true,
  };
  const next = appendHistory(
    {
      ...state,
      pairLockedAt: now,
      twinImplementationStatus: 'IMPLEMENTING',
      composerHandoffPackage: pkg,
    },
    'composer_handoff_created',
    `Handoff package ${pkg.packageId}`,
  );
  return { state: next, pkg };
}

export const GPT2_AUTHORITY_REFERENCE_INPUT_FIELDS = [
  'MOBILE_AUTHORITY_REFERENCE',
  'DESKTOP_AUTHORITY_REFERENCE',
] as const;

export function setGrokOptOut(state: PageAuthorityWorkflowState, optOut: boolean): PageAuthorityWorkflowState {
  return appendHistory(
    { ...state, grokOptOut: optOut },
    optOut ? 'grok_opt_out' : 'grok_opt_in',
    optOut ? 'Founder: no Grok assets needed' : 'Grok asset production re-enabled',
  );
}

export function markTwinRouteVerified(state: PageAuthorityWorkflowState): PageAuthorityWorkflowState {
  return {
    ...state,
    twinRouteVerifiedAt: new Date().toISOString(),
    twinImplementationStatus:
      state.twinImplementationStatus === 'NONE' ? 'IMPLEMENTING' : state.twinImplementationStatus,
  };
}

export function buildGpt2AuthorityInputs(state: PageAuthorityWorkflowState) {
  return {
    mobileAuthorityReference: resolveActiveAuthorityImage(state.mobileAuthority),
    desktopAuthorityReference: resolveActiveAuthorityImage(state.desktopAuthority),
    mobileAuthorityVersion: state.mobileAuthority.activeVersionId,
    desktopAuthorityVersion: state.desktopAuthority.activeVersionId,
  };
}
