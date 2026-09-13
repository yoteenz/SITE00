import type { ConceptCandidate } from '../p0vrTwinV22/types.js';
import type { ConceptGalleryState } from '../p0vrTwinV22/types.js';

export const TWIN_V2_STALE_UNSANITIZED_BLUEPRINT = 'TWIN_V2_STALE_UNSANITIZED_BLUEPRINT' as const;

export function assertActiveConceptUsesExecutionBlueprint(input: {
  candidate: ConceptCandidate;
  gallery: ConceptGalleryState;
}): void {
  const executionId = input.candidate.executionBlueprintId;
  if (!executionId) {
    throw new Error(`${TWIN_V2_STALE_UNSANITIZED_BLUEPRINT}: missing executionBlueprintId on active concept`);
  }
  const execution = input.gallery.sanitizedBlueprints?.[executionId];
  if (!execution) {
    throw new Error(`${TWIN_V2_STALE_UNSANITIZED_BLUEPRINT}: execution blueprint not hydrated (${executionId})`);
  }
  if (execution.objects.some((o) => o.isGeneratedHostArtifact)) {
    throw new Error(`${TWIN_V2_STALE_UNSANITIZED_BLUEPRINT}: execution blueprint still contains host artifacts`);
  }
}
