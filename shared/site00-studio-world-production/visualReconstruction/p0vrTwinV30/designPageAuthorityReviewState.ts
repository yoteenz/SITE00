import {
  DESIGN_PAGE_V3_AUTHORITY_LOCK_ID,
  DESIGN_PAGE_V3_PILOT_PROJECT_ID,
  P0_VR_TWIN_V30_BUILD,
} from './constants.js';
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
  return {
    buildRef: P0_VR_TWIN_V30_BUILD,
    authoritySessionId: `dpa-${projectId}-${Date.now()}`,
    projectId,
    pageLabel: input?.pageLabel ?? 'NDXBOOK Design Workstation',
    candidateGeneration: 0,
    lastResult: null,
    founderReview: {
      mobileApproved: false,
      desktopApproved: false,
      lockId: null,
      refineNotes: [],
      lastAction: null,
      updatedAt: now,
    },
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
      ...session.founderReview,
      mobileApproved: false,
      desktopApproved: false,
      lockId: null,
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

export function approveDesignPageAuthorityViewport(
  session: DesignPageAuthorityReviewSession,
  viewport: 'mobile' | 'desktop',
): DesignPageAuthorityReviewSession {
  const now = new Date().toISOString();
  const founderReview: DesignPageAuthorityFounderReviewState = {
    ...session.founderReview,
    mobileApproved: viewport === 'mobile' ? true : session.founderReview.mobileApproved,
    desktopApproved: viewport === 'desktop' ? true : session.founderReview.desktopApproved,
    lastAction: 'APPROVE',
    updatedAt: now,
  };
  if (founderReview.mobileApproved && founderReview.desktopApproved) {
    founderReview.lockId = DESIGN_PAGE_V3_AUTHORITY_LOCK_ID;
  }
  return { ...session, founderReview, updatedAt: now };
}

export function approveDesignPageAuthorityPair(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityReviewSession {
  const now = new Date().toISOString();
  return {
    ...session,
    founderReview: {
      ...session.founderReview,
      mobileApproved: true,
      desktopApproved: true,
      lockId: DESIGN_PAGE_V3_AUTHORITY_LOCK_ID,
      lastAction: 'APPROVE',
      updatedAt: now,
    },
    updatedAt: now,
  };
}

export function isDesignPageAuthorityLocked(session: DesignPageAuthorityReviewSession): boolean {
  return session.founderReview.lockId === DESIGN_PAGE_V3_AUTHORITY_LOCK_ID;
}
