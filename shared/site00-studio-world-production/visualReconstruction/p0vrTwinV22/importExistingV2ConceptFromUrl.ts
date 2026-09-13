import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import { mergeVisualConceptApiResult } from '../p0vrTwinV21/orchestrateTwinV2VisualConcept.js';
import { ensureConceptGallery } from './conceptGalleryState.js';

/** Register an already-generated visual (FAL URL, photo, or storage URL) without paid image generation. */
export function importExistingV2ConceptFromUrl(
  session: ConceptDirectedTwinSession,
  input: { imageUrl: string; imageStorageRef?: string | null; label?: string },
): ConceptDirectedTwinSession {
  const url = input.imageUrl.trim();
  if (!url) throw new Error('TWIN_V2_IMPORT: imageUrl required');
  let next = mergeVisualConceptApiResult(session, {
    action: 'generate',
    imageUrl: url,
    imageStorageRef: input.imageStorageRef ?? null,
  });
  next = ensureConceptGallery(next);
  if (next.conceptGallery) {
    const last = next.conceptGallery.candidates.at(-1);
    if (last) {
      const candidates = next.conceptGallery.candidates.map((c) =>
        c.conceptId === last.conceptId
          ? { ...c, generationType: 'LEGACY_V2_CONCEPT' as const, founderInstruction: input.label ?? 'imported_url' }
          : c,
      );
      next = {
        ...next,
        conceptGallery: { ...next.conceptGallery, candidates },
      };
    }
  }
  return next;
}

export function importExistingV2ConceptsFromUrls(
  session: ConceptDirectedTwinSession,
  urls: string[],
): ConceptDirectedTwinSession {
  let next = session;
  for (const raw of urls) {
    const url = raw.trim();
    if (!url) continue;
    next = importExistingV2ConceptFromUrl(next, { imageUrl: url });
  }
  return next;
}
