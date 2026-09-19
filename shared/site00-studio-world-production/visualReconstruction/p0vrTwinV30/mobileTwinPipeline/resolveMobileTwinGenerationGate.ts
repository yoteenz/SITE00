import type { DesignPageAuthorityReviewSession } from '../types.js';
import type { MobileAtomicTwinGenerationRun, MobileTwinPipelineState } from './types.js';

export type MobileTwinGenerationGate =
  | { action: 'RUN_FULL' }
  | { action: 'RETURN_READY'; run: MobileAtomicTwinGenerationRun }
  | { action: 'RETRY_BLUEPRINT_ONLY'; run: MobileAtomicTwinGenerationRun }
  | { action: 'RETRY_ACTUAL_ONLY'; run: MobileAtomicTwinGenerationRun }
  | { action: 'IN_PROGRESS'; run: MobileAtomicTwinGenerationRun };

export function resolveMobileTwinGenerationGate(
  session: DesignPageAuthorityReviewSession,
  input: {
    compositionHash: string;
    referenceAuthorityId: string;
    featureManifestVersion: string;
    projectCreativeContextVersion: string;
    runVersion: number;
  },
): MobileTwinGenerationGate {
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline) return { action: 'RUN_FULL' };

  const recent = [...pipeline.atomicRuns]
    .reverse()
    .find(
      (r) =>
        r.referenceAuthorityId === input.referenceAuthorityId &&
        r.compositionHash === input.compositionHash &&
        r.featureManifestVersion === input.featureManifestVersion,
    );

  if (!recent) return { action: 'RUN_FULL' };

  if (recent.status === 'FOUNDER_REVIEW_READY' && recent.packageId) {
    return { action: 'RETURN_READY', run: recent };
  }

  if (recent.status === 'GENERATING' || recent.status === 'RECONCILING') {
    return { action: 'IN_PROGRESS', run: recent };
  }

  const hasActual = Boolean(
    recent.actualRenderArtifactId &&
      pipeline.renders.some((r) => r.id === recent.actualRenderArtifactId && r.renderImageUri),
  );
  const hasBlueprint = Boolean(
    recent.blueprintRenderArtifactId &&
      pipeline.blueprintTwins.some((b) => b.id === recent.blueprintRenderArtifactId && b.twinImageUri),
  );

  if (hasActual && !hasBlueprint && recent.status === 'PARTIAL') {
    return { action: 'RETRY_BLUEPRINT_ONLY', run: recent };
  }
  if (!hasActual && hasBlueprint && recent.status === 'PARTIAL') {
    return { action: 'RETRY_ACTUAL_ONLY', run: recent };
  }

  return { action: 'RUN_FULL' };
}

export function attachOrphanRecoveryReceipt(
  pipeline: MobileTwinPipelineState,
  receipt: { id: string; recoveredArtifactIds: string[]; status: 'PASS' | 'AMBIGUOUS' },
): MobileTwinPipelineState {
  return {
    ...pipeline,
    artifactsById: {
      ...pipeline.artifactsById,
      [receipt.id]: receipt,
    },
  };
}
