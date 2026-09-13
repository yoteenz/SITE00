import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import type { ConceptCandidate } from './types.js';
import { sortCandidatesForGallery } from './conceptGalleryState.js';

export type ConceptGalleryQueryInput = {
  projectId: string;
  pageId: string;
  viewport: 'mobile';
  mode: 'CONCEPT_DIRECTED_V2';
  session: ConceptDirectedTwinSession;
};

export type ConceptGalleryQueryResult = {
  candidates: ConceptCandidate[];
  activeConceptId: string | null;
  canonicalConceptCount: number;
};

export function getConceptCandidates(input: ConceptGalleryQueryInput): ConceptGalleryQueryResult {
  if (input.mode !== 'CONCEPT_DIRECTED_V2') {
    throw new Error('CONCEPT_GALLERY_QUERY: unsupported mode');
  }
  const gallery = input.session.conceptGallery;
  const candidates = sortCandidatesForGallery(gallery?.candidates ?? []);
  const activeConceptId =
    gallery?.activeConceptId ??
    gallery?.lastActiveConceptId ??
    candidates[0]?.conceptId ??
    null;
  return {
    candidates,
    activeConceptId,
    canonicalConceptCount: candidates.length,
  };
}
