import { getMobileTwinVisualProviderStrategy } from './getMobileTwinVisualProviderStrategy.js';
import type { DesignPageAuthorityReviewSession } from '../types.js';
import type { MobileTwinPipelineState } from './types.js';
import { hydrateMobileTwinReviewState } from './hydrateMobileTwinReviewState.js';

export type OrphanTwinArtifactRecoveryReceipt = {
  id: string;
  projectId: string;
  recoveredArtifactIds: string[];
  status: 'PASS' | 'AMBIGUOUS';
  createdAt: string;
};

/** Mount unlinked FAL renders/blueprints that match active composition (one-time safe recovery). */
export function tryRecoverOrphanTwinArtifacts(session: DesignPageAuthorityReviewSession): DesignPageAuthorityReviewSession {
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline?.mobileTwinProviderLock?.locked) return session;
  const route = getMobileTwinVisualProviderStrategy(pipeline);
  if (!route) return session;

  const compId = pipeline.activeCompositionStateId;
  const comp = compId ? pipeline.compositionStates.find((c) => c.id === compId) : pipeline.compositionStates.at(-1);
  if (!comp) return session;

  const hasMountedActual = pipeline.renders.some(
    (r) => r.compositionHash === comp.compositionHash && r.renderImageUri && r.provider === 'FAL',
  );
  const hasMountedBlueprint = pipeline.blueprintTwins.some(
    (b) => b.compositionHash === comp.compositionHash && b.twinImageUri,
  );
  if (hasMountedActual && hasMountedBlueprint) return session;

  const orphanRenders = pipeline.renders.filter(
    (r) =>
      r.compositionHash === comp.compositionHash &&
      r.renderImageUri &&
      (r.provider === 'FAL' || r.renderImageUri.includes('fal.media') || r.renderImageUri.includes('vitest-fal')) &&
      r.providerModel?.includes('nano-banana'),
  );
  const orphanBlueprints = pipeline.blueprintTwins.filter(
    (b) => b.compositionHash === comp.compositionHash && b.twinImageUri,
  );

  if (orphanRenders.length > 1 || orphanBlueprints.length > 1) {
    const receipt: OrphanTwinArtifactRecoveryReceipt = {
      id: `otar-ambiguous-${Date.now()}`,
      projectId: session.projectId,
      recoveredArtifactIds: [],
      status: 'AMBIGUOUS',
      createdAt: new Date().toISOString(),
    };
    return {
      ...session,
      mobileTwinPipeline: hydrateMobileTwinReviewState({
        ...pipeline,
        artifactsById: { ...pipeline.artifactsById, [receipt.id]: receipt },
      }),
    };
  }

  const actual = orphanRenders.at(-1);
  const blueprint = orphanBlueprints.at(-1);
  if (!actual && !blueprint) return session;

  const recovered: string[] = [];
  let next: MobileTwinPipelineState = { ...pipeline };
  if (actual) {
    next.activeRenderId = actual.id;
    recovered.push(actual.id);
  }
  if (blueprint) {
    recovered.push(blueprint.id);
  }

  const receipt: OrphanTwinArtifactRecoveryReceipt = {
    id: `otar-${Date.now()}`,
    projectId: session.projectId,
    recoveredArtifactIds: recovered,
    status: 'PASS',
    createdAt: new Date().toISOString(),
  };

  next = {
    ...next,
    artifactsById: { ...next.artifactsById, [receipt.id]: receipt },
  };

  return {
    ...session,
    mobileTwinPipeline: hydrateMobileTwinReviewState(next),
    updatedAt: new Date().toISOString(),
  };
}
