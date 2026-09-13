import {
  DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP,
  DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE,
  DESIGN_PAGE_V3_HOST_PRODUCT_NAME,
  DESIGN_PAGE_V3_PILOT_PROJECT_ID,
  P0_VR_TWIN_V30_BUILD,
} from './constants.js';
import type { DesignPageV3FounderTerritoryVerdict } from './hostProjectExpressionModel.js';
import { buildTerritoryPrototypeBundles } from './buildTerritoryPrototypeBundles.js';
import { emptyAuthorityPipelineState, registerGeneratedCandidates } from './designWorkspaceAuthorityPipeline.js';
import {
  appendTerritoryBundlesToGallery,
  emptyTerritoryGallery,
  latestTerritoryCandidate,
  normalizeDesignPageAuthoritySession,
  resolveSelectedTerritoryCandidate,
  resolveTerritoryCandidate,
  territoryGalleryHasCandidates,
} from './designPageAuthorityTerritoryGallery.js';
import type {
  DesignPageAuthorityFounderReviewState,
  DesignPageAuthorityGenerationResult,
  DesignPageAuthorityReviewSession,
  DesignPageAuthorityTerritoryScope,
} from './types.js';
import type { DesignPageV3TerritoryId } from './hostProjectExpressionModel.js';

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
    territoryGallery: emptyTerritoryGallery(),
    selectedCandidateByTerritory: {},
    founderReview: emptyFounderReview(now),
    authorityPipeline: emptyAuthorityPipelineState(),
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

export function mergeDesignPageAuthorityApiResponse(
  priorSession: DesignPageAuthorityReviewSession,
  api: {
    result: DesignPageAuthorityGenerationResult;
    session?: DesignPageAuthorityReviewSession;
  },
  action: 'GENERATE' | 'REFINE' | 'REGENERATE' | 'REGENERATE_TERRITORY',
): DesignPageAuthorityReviewSession {
  const territories = api.result?.territories ?? [];
  if (!territories.length) {
    throw new Error(
      'AUTHORITY_GENERATION_EMPTY: API returned no territory mobile/desktop frames — FAL may have run but results were not wired to the gallery',
    );
  }
  let merged = applyDesignPageAuthorityGeneration(priorSession, api.result, action);
  if (api.session && !territoryGalleryHasCandidates(merged.territoryGallery)) {
    const serverNorm = normalizeDesignPageAuthoritySession(api.session);
    if (territoryGalleryHasCandidates(serverNorm.territoryGallery)) {
      merged = normalizeDesignPageAuthoritySession({
        ...serverNorm,
        founderReview: {
          ...serverNorm.founderReview,
          refineNotes: priorSession.founderReview.refineNotes,
          selectedTerritoryId:
            priorSession.founderReview.selectedTerritoryId ?? serverNorm.founderReview.selectedTerritoryId,
          territoryVerdicts: {
            ...priorSession.founderReview.territoryVerdicts,
            ...serverNorm.founderReview.territoryVerdicts,
          },
        },
      });
    }
  }
  return merged;
}

/** Instant A/B/C gallery from bundled SVG prototypes (no API / FAL). */
export function seedDesignPageAuthorityPrototypeGallery(
  session: DesignPageAuthorityReviewSession,
  input?: { territoryIds?: DesignPageV3TerritoryId[] },
): DesignPageAuthorityReviewSession {
  const base = normalizeDesignPageAuthoritySession(session);
  if (territoryGalleryHasCandidates(base.territoryGallery)) return base;
  const now = new Date().toISOString();
  const batchGeneration = base.candidateGeneration + 1;
  const bundles = buildTerritoryPrototypeBundles({
    authoritySessionId: base.authoritySessionId,
    territoryIds: input?.territoryIds,
  });
  const territoryGallery = appendTerritoryBundlesToGallery({
    gallery: base.territoryGallery,
    bundles,
    batchGeneration,
    createdAt: now,
  });
  const selectedCandidateByTerritory = { ...base.selectedCandidateByTerritory };
  for (const bundle of bundles) {
    const latest = latestTerritoryCandidate(territoryGallery, bundle.territoryId);
    if (latest) selectedCandidateByTerritory[bundle.territoryId] = latest.candidateId;
  }
  return registerGeneratedCandidates(
    normalizeDesignPageAuthoritySession({
      ...base,
      candidateGeneration: batchGeneration,
      territoryGallery,
      selectedCandidateByTerritory,
      authorityPipeline: base.authorityPipeline ?? emptyAuthorityPipelineState(),
      updatedAt: now,
    }),
  );
}

export function applyDesignPageAuthorityGeneration(
  session: DesignPageAuthorityReviewSession,
  result: DesignPageAuthorityGenerationResult,
  action: 'GENERATE' | 'REFINE' | 'REGENERATE' | 'REGENERATE_TERRITORY',
): DesignPageAuthorityReviewSession {
  const now = new Date().toISOString();
  const batchGeneration = session.candidateGeneration + 1;
  const base = normalizeDesignPageAuthoritySession(session);
  const territoryGallery = appendTerritoryBundlesToGallery({
    gallery: base.territoryGallery,
    bundles: result.territories,
    batchGeneration,
    createdAt: now,
  });
  const selectedCandidateByTerritory = { ...base.selectedCandidateByTerritory };
  for (const bundle of result.territories) {
    const latest = latestTerritoryCandidate(territoryGallery, bundle.territoryId);
    if (latest) selectedCandidateByTerritory[bundle.territoryId] = latest.candidateId;
  }
  const withGallery = normalizeDesignPageAuthoritySession({
    ...base,
    candidateGeneration: batchGeneration,
    lastResult: result,
    territoryGallery,
    selectedCandidateByTerritory,
    founderReview: {
      ...emptyFounderReview(now),
      refineNotes: base.founderReview.refineNotes,
      selectedTerritoryId: base.founderReview.selectedTerritoryId,
      territoryVerdicts: { ...base.founderReview.territoryVerdicts },
      lastAction: action,
      updatedAt: now,
    },
    authorityPipeline: base.authorityPipeline ?? emptyAuthorityPipelineState(),
    updatedAt: now,
  });
  return registerGeneratedCandidates(withGallery);
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
  const normalized = normalizeDesignPageAuthoritySession(next);
  const candidate = resolveTerritoryCandidate(
    normalized.territoryGallery,
    territoryId,
    normalized.selectedCandidateByTerritory[territoryId],
  );
  if (candidate && normalized.lastResult) {
    next = {
      ...normalized,
      lastResult: {
        ...normalized.lastResult,
        mobile: candidate.mobile,
        desktop: candidate.desktop,
        selectedTerritoryId: territoryId,
      },
    };
  } else {
    next = normalized;
  }
  return next;
}

export function selectDesignPageAuthorityTerritoryCandidate(
  session: DesignPageAuthorityReviewSession,
  territoryId: DesignPageV3TerritoryId,
  candidateId: string,
): DesignPageAuthorityReviewSession {
  const now = new Date().toISOString();
  const normalized = normalizeDesignPageAuthoritySession(session);
  const candidate = resolveTerritoryCandidate(normalized.territoryGallery, territoryId, candidateId);
  if (!candidate) return normalized;
  let next: DesignPageAuthorityReviewSession = {
    ...normalized,
    selectedCandidateByTerritory: {
      ...normalized.selectedCandidateByTerritory,
      [territoryId]: candidateId,
    },
    founderReview: {
      ...normalized.founderReview,
      lastAction: 'SELECT_TERRITORY_CANDIDATE',
      updatedAt: now,
    },
    updatedAt: now,
  };
  if (normalized.founderReview.selectedTerritoryId === territoryId && next.lastResult) {
    next = {
      ...next,
      lastResult: {
        ...next.lastResult,
        mobile: candidate.mobile,
        desktop: candidate.desktop,
        selectedTerritoryId: territoryId,
      },
    };
  }
  return next;
}

export function territoryScopeToIds(scope: DesignPageAuthorityTerritoryScope): DesignPageV3TerritoryId[] {
  return scope === 'ALL' ? ['A', 'B', 'C'] : [scope];
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
  const candidate = resolveSelectedTerritoryCandidate(session);
  if (!candidate) {
    throw new Error('TERRITORY_CANDIDATE_REQUIRED: generate at least one pair in selected territory');
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
