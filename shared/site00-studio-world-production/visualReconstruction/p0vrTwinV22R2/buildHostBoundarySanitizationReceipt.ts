import type { HostShellContract } from './types.js';
import type { GeneratedHostArtifact } from './types.js';
import type { ConceptBlueprint } from '../p0vrTwinV22/types.js';

export type HostBoundarySanitizationReceipt = {
  conceptId: string;
  originalBlueprintId: string;
  executionBlueprintId: string;
  generatedHostArtifactCount: number;
  excludedArtifactIds: string[];
  hostComponentBindings: string[];
  hostBoundaryReady: boolean;
  status: 'SANITIZED' | 'INCOMPLETE';
};

export function buildHostBoundarySanitizationReceipt(input: {
  conceptId: string;
  originalBlueprint: ConceptBlueprint;
  executionBlueprint: ConceptBlueprint;
  generatedHostArtifacts: GeneratedHostArtifact[];
  hostShellContract: HostShellContract;
  hostBoundaryReady: boolean;
}): HostBoundarySanitizationReceipt {
  return {
    conceptId: input.conceptId,
    originalBlueprintId: input.originalBlueprint.blueprintId,
    executionBlueprintId: input.executionBlueprint.blueprintId,
    generatedHostArtifactCount: input.generatedHostArtifacts.length,
    excludedArtifactIds: input.generatedHostArtifacts.map((a) => a.objectId),
    hostComponentBindings: [
      input.hostShellContract.hostHeaderComponent,
      input.hostShellContract.hostBottomNavComponent,
      input.hostShellContract.pageMountPoint,
    ],
    hostBoundaryReady: input.hostBoundaryReady,
    status: input.hostBoundaryReady ? 'SANITIZED' : 'INCOMPLETE',
  };
}
