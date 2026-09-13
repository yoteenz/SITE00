import { emptyAuthorityPipelineState } from './designWorkspaceAuthorityPipeline.js';
import { repairPrototypeGallerySession } from './repairAuthorityPrototypeUrls.js';
import { emptyDesignWorkspaceFeatureAuthorityState } from './designWorkspaceFeatureAuthority/featureAuthorityState.js';
import { DESIGN_PAGE_V3_TERRITORY_DEFINITIONS, type DesignPageV3TerritoryId } from './hostProjectExpressionModel.js';
import type {
  DesignPageAuthorityReviewSession,
  DesignPageAuthorityTerritoryBundle,
  DesignPageAuthorityTerritoryCandidate,
  DesignPageAuthorityTerritoryGallery,
} from './types.js';

const TERRITORY_IDS: DesignPageV3TerritoryId[] = ['A', 'B', 'C'];

export function emptyTerritoryGallery(): DesignPageAuthorityTerritoryGallery {
  return { A: [], B: [], C: [] };
}

export function territoryGalleryHasCandidates(gallery: DesignPageAuthorityTerritoryGallery): boolean {
  return TERRITORY_IDS.some((id) => gallery[id].length > 0);
}

/** Union batches from multiple persisted snapshots (localStorage vs sessionStorage, API merge). */
export function mergeTerritoryGalleries(
  primary: DesignPageAuthorityTerritoryGallery,
  secondary: DesignPageAuthorityTerritoryGallery,
): DesignPageAuthorityTerritoryGallery {
  const next = emptyTerritoryGallery();
  for (const territoryId of TERRITORY_IDS) {
    const byId = new Map<string, DesignPageAuthorityTerritoryCandidate>();
    for (const c of [...(primary[territoryId] ?? []), ...(secondary[territoryId] ?? [])]) {
      byId.set(c.candidateId, c);
    }
    next[territoryId] = [...byId.values()].sort((a, b) => {
      if (a.batchGeneration !== b.batchGeneration) return a.batchGeneration - b.batchGeneration;
      return a.createdAt.localeCompare(b.createdAt);
    });
  }
  return next;
}

export function maxBatchGenerationInGallery(gallery: DesignPageAuthorityTerritoryGallery): number {
  let max = 0;
  for (const territoryId of TERRITORY_IDS) {
    for (const c of gallery[territoryId]) {
      if (c.batchGeneration > max) max = c.batchGeneration;
    }
  }
  return max;
}

export function appendTerritoryBundlesToGallery(input: {
  gallery: DesignPageAuthorityTerritoryGallery;
  bundles: DesignPageAuthorityTerritoryBundle[];
  batchGeneration: number;
  createdAt?: string;
}): DesignPageAuthorityTerritoryGallery {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const next: DesignPageAuthorityTerritoryGallery = {
    A: [...input.gallery.A],
    B: [...input.gallery.B],
    C: [...input.gallery.C],
  };
  for (const bundle of input.bundles) {
    const candidate: DesignPageAuthorityTerritoryCandidate = {
      candidateId: `dpa-cand-${bundle.territoryId}-${input.batchGeneration}-${Date.now()}`,
      territoryId: bundle.territoryId,
      territoryName: bundle.territoryName,
      batchGeneration: input.batchGeneration,
      createdAt,
      mobile: bundle.mobile,
      desktop: bundle.desktop,
    };
    next[bundle.territoryId] = [...next[bundle.territoryId], candidate];
  }
  return next;
}

export function latestTerritoryCandidate(
  gallery: DesignPageAuthorityTerritoryGallery,
  territoryId: DesignPageV3TerritoryId,
): DesignPageAuthorityTerritoryCandidate | null {
  const list = gallery[territoryId];
  return list.length ? list[list.length - 1]! : null;
}

export function resolveTerritoryCandidate(
  gallery: DesignPageAuthorityTerritoryGallery,
  territoryId: DesignPageV3TerritoryId,
  candidateId: string | undefined,
): DesignPageAuthorityTerritoryCandidate | null {
  const list = gallery[territoryId];
  if (!list.length) return null;
  if (candidateId) {
    return list.find((c) => c.candidateId === candidateId) ?? list[list.length - 1]!;
  }
  return list[list.length - 1]!;
}

function bundleAlreadyInGallery(
  gallery: DesignPageAuthorityTerritoryGallery,
  bundle: DesignPageAuthorityTerritoryBundle,
): boolean {
  return gallery[bundle.territoryId].some(
    (c) =>
      c.mobile.artifactId === bundle.mobile.artifactId &&
      c.desktop.artifactId === bundle.desktop.artifactId,
  );
}

/** Attach lastResult territory frames to gallery when FAL completed but gallery was not updated. */
export function syncGalleryFromLastResult(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityReviewSession {
  const bundles = session.lastResult?.territories ?? [];
  if (!bundles.length) return session;
  let territoryGallery = session.territoryGallery ?? emptyTerritoryGallery();
  const missing = bundles.filter((b) => !bundleAlreadyInGallery(territoryGallery, b));
  if (!missing.length) return session;
  territoryGallery = appendTerritoryBundlesToGallery({
    gallery: territoryGallery,
    bundles: missing,
    batchGeneration: session.candidateGeneration || 1,
    createdAt: session.lastResult?.founderReview?.updatedAt ?? session.updatedAt,
  });
  return { ...session, territoryGallery };
}

export function resolveSelectedTerritoryCandidate(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityTerritoryCandidate | null {
  const territoryId = session.founderReview.selectedTerritoryId;
  if (!territoryId) return null;
  const candidateId = session.selectedCandidateByTerritory[territoryId];
  return resolveTerritoryCandidate(session.territoryGallery, territoryId, candidateId);
}

/** Backfill gallery from legacy sessions that only stored lastResult. */
export function normalizeDesignPageAuthoritySession(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityReviewSession {
  const synced = syncGalleryFromLastResult(session);
  let territoryGallery = synced.territoryGallery ?? emptyTerritoryGallery();
  if (!territoryGalleryHasCandidates(territoryGallery) && synced.lastResult?.territories?.length) {
    territoryGallery = appendTerritoryBundlesToGallery({
      gallery: territoryGallery,
      bundles: synced.lastResult!.territories,
      batchGeneration: synced.candidateGeneration || 1,
      createdAt: synced.lastResult!.founderReview?.updatedAt ?? synced.updatedAt,
    });
  }
  const selectedCandidateByTerritory = { ...(synced.selectedCandidateByTerritory ?? {}) };
  for (const id of TERRITORY_IDS) {
    if (!selectedCandidateByTerritory[id] && territoryGallery[id].length) {
      selectedCandidateByTerritory[id] = latestTerritoryCandidate(territoryGallery, id)!.candidateId;
    }
  }
  return repairPrototypeGallerySession({
    ...synced,
    territoryGallery,
    selectedCandidateByTerritory,
    authorityPipeline: synced.authorityPipeline ?? emptyAuthorityPipelineState(),
    featureAuthority: synced.featureAuthority ?? emptyDesignWorkspaceFeatureAuthorityState(),
  });
}

export function territoryDisplayName(id: DesignPageV3TerritoryId): string {
  return DESIGN_PAGE_V3_TERRITORY_DEFINITIONS[id].name;
}
