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
  let territoryGallery = session.territoryGallery ?? emptyTerritoryGallery();
  if (!territoryGalleryHasCandidates(territoryGallery) && session.lastResult?.territories?.length) {
    territoryGallery = appendTerritoryBundlesToGallery({
      gallery: territoryGallery,
      bundles: session.lastResult.territories,
      batchGeneration: session.candidateGeneration || 1,
      createdAt: session.lastResult.founderReview?.updatedAt ?? session.updatedAt,
    });
  }
  const selectedCandidateByTerritory = { ...(session.selectedCandidateByTerritory ?? {}) };
  for (const id of TERRITORY_IDS) {
    if (!selectedCandidateByTerritory[id] && territoryGallery[id].length) {
      selectedCandidateByTerritory[id] = latestTerritoryCandidate(territoryGallery, id)!.candidateId;
    }
  }
  return {
    ...session,
    territoryGallery,
    selectedCandidateByTerritory,
  };
}

export function territoryDisplayName(id: DesignPageV3TerritoryId): string {
  return DESIGN_PAGE_V3_TERRITORY_DEFINITIONS[id].name;
}
