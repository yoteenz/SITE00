import { P0_VR_TWIN_V30_BUILD } from './constants.js';
import { buildTerritoryPrototypeBundles } from './buildTerritoryPrototypeBundles.js';
import { emptyAuthorityPipelineState, registerGeneratedCandidates } from './designWorkspaceAuthorityPipeline.js';
import { setAuthorityBatchLedgerSnapshot } from './designPageAuthorityBatchLedger.js';
import {
  galleryHasUnviewableAuthorityImages,
  isUnviewableAuthorityImageStorageUrl,
} from './repairAuthorityPrototypeUrls.js';
import {
  latestTerritoryCandidate,
  normalizeDesignPageAuthoritySession,
  replaceTerritoryBundlesInGallery,
} from './designPageAuthorityTerritoryGallery.js';
import type { DesignPageAuthorityReviewSession } from './types.js';
import type { DesignPageV3TerritoryId } from './hostProjectExpressionModel.js';

const TERRITORY_IDS: DesignPageV3TerritoryId[] = ['A', 'B', 'C'];

export { galleryHasUnviewableAuthorityImages, isUnviewableAuthorityImageStorageUrl };

export function shouldForcePrototypeGalleryRecovery(session: DesignPageAuthorityReviewSession): boolean {
  if (session.buildRef !== P0_VR_TWIN_V30_BUILD) return true;
  return galleryHasUnviewableAuthorityImages(session.territoryGallery);
}

/** Replace entire gallery with bundled public-path R3 prototypes (one batch). */
export function forceReplaceDesignPageAuthorityWithPrototypeGallery(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityReviewSession {
  const now = new Date().toISOString();
  const bundles = buildTerritoryPrototypeBundles({
    authoritySessionId: session.authoritySessionId,
  });
  const territoryGallery = replaceTerritoryBundlesInGallery({
    gallery: { A: [], B: [], C: [] },
    bundles,
    batchGeneration: 1,
    createdAt: now,
  });
  const selectedCandidateByTerritory: Partial<Record<DesignPageV3TerritoryId, string>> = {};
  for (const id of TERRITORY_IDS) {
    const latest = latestTerritoryCandidate(territoryGallery, id);
    if (latest) selectedCandidateByTerritory[id] = latest.candidateId;
  }
  let next: DesignPageAuthorityReviewSession = {
    ...session,
    buildRef: P0_VR_TWIN_V30_BUILD,
    candidateGeneration: 1,
    lastResult: null,
    territoryGallery,
    selectedCandidateByTerritory,
    authorityPipeline: emptyAuthorityPipelineState(),
    founderReview: {
      ...session.founderReview,
      mobileApproved: false,
      desktopApproved: false,
      mobileLockId: null,
      desktopLockId: null,
      lastAction: 'REGENERATE',
      updatedAt: now,
    },
    updatedAt: now,
  };
  next = registerGeneratedCandidates(normalizeDesignPageAuthoritySession(next));
  setAuthorityBatchLedgerSnapshot(session.projectId, next.territoryGallery, 1);
  return next;
}

export function recoverDesignPageAuthorityGalleryIfBroken(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityReviewSession {
  const normalized = normalizeDesignPageAuthoritySession(session);
  if (!shouldForcePrototypeGalleryRecovery(normalized)) return normalized;
  return forceReplaceDesignPageAuthorityWithPrototypeGallery(normalized);
}
