import type { DesignPageAuthorityReviewSession } from '../types.js';
import {
  attachMobileTwinPipelineFromBrowserStore,
  ensureMobileTwinPipelineDefaults,
  writeMobileTwinPipelineToBrowser,
} from './mobileTwinPipelinePersistence.js';
import {
  hasFlowABaselineForBenchmark,
  isCapabilityTestFounderReviewReady,
  reconcileMobileTwinPipelineState,
} from './reconcileMobileTwinPipelineState.js';
import type { MobileTwinPipelineState } from './types.js';
import { normalizeFounderNbpPromotionOnLoad } from './applyFounderNbpMobileTwinPromotion.js';
import { hydrateMobileTwinReviewState } from './hydrateMobileTwinReviewState.js';
import { tryRecoverOrphanTwinArtifacts } from './tryRecoverOrphanTwinArtifacts.js';

export type MobileTwinPipelineDiagnostics = {
  renderCount: number;
  falRenderCount: number;
  blueprintCount: number;
  falJobsDispatched: number;
  capabilityStatus: string;
  strategy: string;
  step2Ready: boolean;
  benchmarkReady: boolean;
};

export function getMobileTwinPipelineDiagnostics(pipeline: MobileTwinPipelineState): MobileTwinPipelineDiagnostics {
  const reconciled = reconcileMobileTwinPipelineState(pipeline);
  return {
    renderCount: reconciled.renders.length,
    falRenderCount: reconciled.renders.filter(
      (r) => r.provider === 'FAL' || /fal\.media|vitest-fal:/i.test(r.renderImageUri ?? ''),
    ).length,
    blueprintCount: reconciled.blueprintTwins.filter((b) => b.twinImageUri).length,
    falJobsDispatched: reconciled.falJobsDispatched ?? 0,
    capabilityStatus: reconciled.twinCapabilityTest?.status ?? 'NOT RUN',
    strategy: reconciled.mobileTwinVisualGenerationStrategy ?? 'UNRESOLVED',
    step2Ready: isCapabilityTestFounderReviewReady(reconciled),
    benchmarkReady:
      (reconciled.mobileTwinVisualGenerationStrategy === 'ATOMIC_SIBLING_FROM_COMPOSITION' ||
        Boolean(reconciled.founderManualTwinPathUnlock)) &&
      hasFlowABaselineForBenchmark(reconciled),
  };
}

/** Merge dedicated mobile-twin LS + reconcile metadata (founder SYNC / sessionView). */
export function syncFounderMobileTwinSession(
  session: DesignPageAuthorityReviewSession,
  projectId: string,
): DesignPageAuthorityReviewSession {
  const merged = attachMobileTwinPipelineFromBrowserStore(projectId, session.mobileTwinPipeline ?? undefined);
  if (!merged) return session;
  const pipeline = ensureMobileTwinPipelineDefaults(reconcileMobileTwinPipelineState(merged));
  const beforeLock = pipeline.mobileTwinProviderLock?.locked;
  const promoted = normalizeFounderNbpPromotionOnLoad({
    ...session,
    mobileTwinPipeline: hydrateMobileTwinReviewState(pipeline),
    updatedAt: new Date().toISOString(),
  });
  const recovered = tryRecoverOrphanTwinArtifacts(promoted);
  if (recovered.mobileTwinPipeline?.mobileTwinProviderLock?.locked && !beforeLock) {
    writeMobileTwinPipelineToBrowser(projectId, recovered.mobileTwinPipeline);
  }
  return recovered;
}
