import type { ConceptCandidate, ConceptGalleryState } from '../p0vrTwinV22/types.js';

export type ActiveConceptBlueprintTrace = {
  activeConceptId: string;
  originalConceptBlueprintId: string | null;
  sanitizedConceptBlueprintId: string | null;
  executionBlueprintId: string | null;
  activeBlueprintIdUsedByUi: string | null;
  activeBlueprintIdUsedByBuild: string | null;
  hostBoundaryStatus: boolean;
  hostShellContractId: string | null;
};

export function resolveActiveConceptBlueprintTrace(input: {
  candidate: ConceptCandidate;
  gallery: ConceptGalleryState;
}): ActiveConceptBlueprintTrace {
  const originalId = input.candidate.originalBlueprintId ?? input.candidate.conceptBlueprintId;
  const executionId = input.candidate.executionBlueprintId ?? null;
  return {
    activeConceptId: input.candidate.conceptId,
    originalConceptBlueprintId: originalId,
    sanitizedConceptBlueprintId: executionId,
    executionBlueprintId: executionId,
    activeBlueprintIdUsedByUi: executionId ?? originalId,
    activeBlueprintIdUsedByBuild: executionId,
    hostBoundaryStatus: input.candidate.buildReadiness.hostBoundaryReady === true,
    hostShellContractId: input.gallery.hostShellContracts?.[input.candidate.conceptId]?.version ?? null,
  };
}
