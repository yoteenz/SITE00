import {
  DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP,
  DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE,
  DESIGN_PAGE_V3_HOST_PRODUCT_NAME,
  DESIGN_PAGE_V3_PILOT_PROJECT_ID,
  P0_VR_TWIN_V30_BUILD,
} from './constants.js';
import type { DesignPageV3FounderTerritoryVerdict, DesignPageV3TerritoryId } from './hostProjectExpressionModel.js';
import type {
  DesignPageAuthorityFounderReviewState,
  DesignPageAuthorityGenerationResult,
  DesignPageAuthorityReviewSession,
} from './types.js';

export function createDesignPageAuthorityReviewSession(input?: {
  projectId?: string;
  pageLabel?: string;
}): DesignPageAuthorityReviewSession {
  const now = new Date().toISOString();
  const projectId = input?.projectId ?? DESIGN_PAGE_V3_PILOT_PROJECT_ID;
  const client = projectId.toUpperCase();
  return {
    buildRef: P0_VR_TWIN_V30_BUILD,
    authoritySessionId: `dpa-${projectId}-${Date.now()}`,
    projectId,
    pageLabel: input?.pageLabel ?? `${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} · DESIGN · Project: ${client} open`,
    candidateGeneration: 0,
    lastResult: null,
    founderReview: emptyFounderReview(now),
    updatedAt: now,
  };
}

function emptyFounderReview(now: string): DesignPageAuthorityFounderReviewState {
  return {
    mobileApproved: false,
    desktopApproved: false,
    mobileLockId: null,
    desktopLockId: null,
    selectedTerritoryId: null,
    territoryVerdicts: {},
    refineNotes: [],
    lastAction: null,
    updatedAt: now,
  };
}

export function applyDesignPageAuthorityGeneration(
  session: DesignPageAuthorityReviewSession,
  result: DesignPageAuthorityGenerationResult,
  action: 'GENERATE' | 'REFINE' | 'REGENERATE',
): DesignPageAuthorityReviewSession {
  const now = new Date().toISOString();
  return {
    ...session,
    candidateGeneration: session.candidateGeneration + 1,
    lastResult: result,
    founderReview: {
      ...emptyFounderReview(now),
      refineNotes: session.founderReview.refineNotes,
      selectedTerritoryId: session.founderReview.selectedTerritoryId,
      territoryVerdicts: { ...session.founderReview.territoryVerdicts },
      lastAction: action,
      updatedAt: now,
    },
    updatedAt: now,
  };
}

export function appendDesignPageAuthorityRefineNote(
  session: DesignPageAuthorityReviewSession,
  note: string,
): DesignPageAuthorityReviewSession {
  const trimmed = note.trim();
  if (!trimmed) return session;
  const now = new Date().toISOString();
  return {
    ...session,
    founderReview: {
      ...session.founderReview,
      refineNotes: [...session.founderReview.refineNotes, trimmed],
      lastAction: 'REFINE',
      updatedAt: now,
    },
    updatedAt: now,
  };
}

export function selectDesignPageAuthorityTerritory(
  session: DesignPageAuthorityReviewSession,
  territoryId: DesignPageV3TerritoryId,
): DesignPageAuthorityReviewSession {
  const now = new Date().toISOString();
  let next: DesignPageAuthorityReviewSession = {
    ...session,
    founderReview: {
      ...session.founderReview,
      selectedTerritoryId: territoryId,
      lastAction: 'SELECT_TERRITORY',
      updatedAt: now,
    },
    updatedAt: now,
  };
  const bundle = session.lastResult?.territories.find((t) => t.territoryId === territoryId);
  if (bundle && session.lastResult) {
    next = {
      ...next,
      lastResult: {
        ...session.lastResult,
        mobile: bundle.mobile,
        desktop: bundle.desktop,
        selectedTerritoryId: territoryId,
      },
    };
  }
  return next;
}

export function setDesignPageAuthorityTerritoryVerdict(
  session: DesignPageAuthorityReviewSession,
  territoryId: DesignPageV3TerritoryId,
  verdict: DesignPageV3FounderTerritoryVerdict,
): DesignPageAuthorityReviewSession {
  const now = new Date().toISOString();
  return {
    ...session,
    founderReview: {
      ...session.founderReview,
      territoryVerdicts: { ...session.founderReview.territoryVerdicts, [territoryId]: verdict },
      lastAction: 'TERRITORY_VERDICT',
      updatedAt: now,
    },
    updatedAt: now,
  };
}

export function approveDesignPageAuthorityViewport(
  session: DesignPageAuthorityReviewSession,
  viewport: 'mobile' | 'desktop',
): DesignPageAuthorityReviewSession {
  if (!session.founderReview.selectedTerritoryId) {
    throw new Error('TERRITORY_REQUIRED: select territory A/B/C before viewport lock');
  }
  const now = new Date().toISOString();
  const founderReview: DesignPageAuthorityFounderReviewState = {
    ...session.founderReview,
    mobileApproved: viewport === 'mobile' ? true : session.founderReview.mobileApproved,
    desktopApproved: viewport === 'desktop' ? true : session.founderReview.desktopApproved,
    mobileLockId:
      viewport === 'mobile' ? DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE : session.founderReview.mobileLockId,
    desktopLockId:
      viewport === 'desktop' ? DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP : session.founderReview.desktopLockId,
    lastAction: 'APPROVE',
    updatedAt: now,
  };
  return { ...session, founderReview, updatedAt: now };
}

export function approveDesignPageAuthorityPair(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityReviewSession {
  let next = session;
  next = approveDesignPageAuthorityViewport(next, 'mobile');
  next = approveDesignPageAuthorityViewport(next, 'desktop');
  return next;
}

export function isDesignPageAuthorityViewportLocked(
  session: DesignPageAuthorityReviewSession,
  viewport: 'mobile' | 'desktop',
): boolean {
  if (viewport === 'mobile') {
    return session.founderReview.mobileLockId === DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE;
  }
  return session.founderReview.desktopLockId === DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP;
}

export function isDesignPageAuthorityFullyLocked(session: DesignPageAuthorityReviewSession): boolean {
  return (
    isDesignPageAuthorityViewportLocked(session, 'mobile') &&
    isDesignPageAuthorityViewportLocked(session, 'desktop')
  );
}

/** @deprecated use isDesignPageAuthorityFullyLocked */
export function isDesignPageAuthorityLocked(session: DesignPageAuthorityReviewSession): boolean {
  return isDesignPageAuthorityFullyLocked(session);
}
