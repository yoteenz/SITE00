import type { WorkspaceConceptSlotId, WorkspaceSelfWorkflowState } from './types.js';
import type { WorkspaceSelfGeneratedArtifact } from './generationTypes.js';

export function readyConceptJob(
  state: WorkspaceSelfWorkflowState,
  conceptId: WorkspaceConceptSlotId,
  viewport: 'MOBILE' | 'DESKTOP',
): WorkspaceSelfGeneratedArtifact | null {
  const job = state.generationJobs.find(
    (j) => j.conceptId === conceptId && j.viewport === viewport && j.status === 'READY',
  );
  if (!job) return null;
  if (state.conceptSet && job.captureSetId !== state.conceptSet.captureSetId) return null;
  return job;
}

export function resolveConceptArtifactRef(
  state: WorkspaceSelfWorkflowState,
  conceptId: WorkspaceConceptSlotId,
  viewport: 'MOBILE' | 'DESKTOP',
): string | null {
  const job = readyConceptJob(state, conceptId, viewport);
  if (job?.artifactPath) return job.artifactPath;
  if (job?.imageUri) return job.imageUri;
  if (state.conceptSet) return null;
  const concept = state.concepts.find((c) => c.conceptId === conceptId);
  return viewport === 'MOBILE' ? concept?.mobileArtifactPath ?? null : concept?.desktopArtifactPath ?? null;
}

export function resolveConceptArtifactId(
  state: WorkspaceSelfWorkflowState,
  conceptId: WorkspaceConceptSlotId,
  viewport: 'MOBILE' | 'DESKTOP',
): string | null {
  return readyConceptJob(state, conceptId, viewport)?.artifactId ?? null;
}
