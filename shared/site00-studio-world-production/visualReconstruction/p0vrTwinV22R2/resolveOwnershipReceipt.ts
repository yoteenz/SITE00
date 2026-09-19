import type { ConceptBlueprint } from '../p0vrTwinV22/types.js';
import type { GeneratedHostArtifact, OwnershipResolutionReceipt } from './types.js';
import type { VisualOwnership } from './types.js';

export function resolveOwnershipReceipt(input: {
  conceptId: string;
  blueprint: ConceptBlueprint;
  generatedHostArtifacts: GeneratedHostArtifact[];
}): OwnershipResolutionReceipt {
  const counts: Record<VisualOwnership, number> = {
    HOST_OWNED_LOCKED: 0,
    CLIENT_OWNED_CREATIVE: 0,
    SHARED_BOUNDARY: 0,
    DEVICE_CHROME_EXCLUDED: 0,
  };

  const unresolved: string[] = [];
  for (const obj of input.blueprint.objects) {
    const ownership = obj.ownership ?? 'CLIENT_OWNED_CREATIVE';
    counts[ownership] += 1;
    if (ownership === 'SHARED_BOUNDARY' && !obj.ownershipNote) {
      unresolved.push(obj.objectId);
    }
  }

  return {
    conceptId: input.conceptId,
    hostOwnedCount: counts.HOST_OWNED_LOCKED,
    clientOwnedCount: counts.CLIENT_OWNED_CREATIVE,
    sharedCount: counts.SHARED_BOUNDARY,
    excludedGeneratedArtifacts: input.generatedHostArtifacts.map((a) => a.objectId),
    unresolved,
    status: unresolved.length === 0 ? 'RESOLVED' : 'PARTIAL',
  };
}
