import { TWIN_V2_HOST_BOUNDARY_VIOLATION } from './constants.js';
import type { ConceptBlueprint } from '../p0vrTwinV22/types.js';
import { detectGeneratedHostArtifacts } from './detectGeneratedHostArtifacts.js';

export function assertNoGeneratedHostArtifactsInClientBuild(blueprint: ConceptBlueprint): void {
  const artifacts = detectGeneratedHostArtifacts({ conceptId: blueprint.conceptId, blueprint });
  const executableHits = artifacts.filter((a) =>
    blueprint.objects.some((o) => o.objectId === a.objectId && !o.isGeneratedHostArtifact),
  );
  if (executableHits.length > 0) {
    throw new Error(
      `${TWIN_V2_HOST_BOUNDARY_VIOLATION}: client build contains generated host artifacts: ${executableHits.map((h) => h.objectId).join(', ')}`,
    );
  }

  for (const obj of blueprint.objects) {
    if (obj.isGeneratedHostArtifact) {
      throw new Error(`${TWIN_V2_HOST_BOUNDARY_VIOLATION}: object ${obj.objectId} marked host artifact in client blueprint`);
    }
    if (obj.type === 'nav' && obj.bounds.y >= 0.82) {
      throw new Error(`${TWIN_V2_HOST_BOUNDARY_VIOLATION}: invented global bottom nav in client build (${obj.objectId})`);
    }
  }
}
