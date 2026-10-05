import type { FalVisualArtifact, MinimalTwinGenerationState, TwinVisualAlignmentReceipt } from './types.js';

/** Heuristic alignment — founder review required for capability proof unless founder confirms. */
export function runTwinVisualAlignmentHeuristic(input: {
  state: MinimalTwinGenerationState;
  authority: FalVisualArtifact;
  blueprint: FalVisualArtifact;
}): TwinVisualAlignmentReceipt {
  const sameState =
    input.authority.compositionStateId === input.blueprint.compositionStateId &&
    input.authority.compositionStateId === input.state.compositionStateId;
  const distinctArtifacts = input.authority.artifactId !== input.blueprint.artifactId;
  const distinctJobs = input.authority.providerJobRef !== input.blueprint.providerJobRef;
  const distinctUrls = input.authority.storageUrl !== input.blueprint.storageUrl;

  const majorDriftObjects: string[] = [];
  if (!sameState) majorDriftObjects.push('compositionStateId');
  if (!distinctArtifacts) majorDriftObjects.push('artifactId');
  if (!distinctJobs) majorDriftObjects.push('providerJobRef');

  const structuralOk = sameState && distinctArtifacts && distinctJobs && distinctUrls;

  return {
    compositionStateId: input.state.compositionStateId,
    pageStructureMatch: structuralOk,
    objectPresenceMatch: input.state.objectIds.length >= 27,
    majorGeometryMatch: structuralOk,
    heroMatch: structuralOk,
    navMatch: structuralOk,
    progressMatch: structuralOk,
    metricsMatch: structuralOk,
    assetPlacementMatch: structuralOk,
    majorDriftObjects,
    status: structuralOk ? 'PENDING_FOUNDER_REVIEW' : 'FAIL',
    method: 'AUTOMATED_HEURISTIC',
  };
}
