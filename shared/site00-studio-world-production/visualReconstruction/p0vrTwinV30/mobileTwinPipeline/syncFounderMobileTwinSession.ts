import type { DesignPageAuthorityReviewSession } from '../types.js';
import {
  attachMobileTwinPipelineFromBrowserStore,
  ensureMobileTwinPipelineDefaults,
  restoreMobileTwinPipelineFromBrowserStore,
} from './mobileTwinPipelinePersistence.js';
import { evaluateMobileTwinPipelineRecovery } from './evaluateMobileTwinPipelineRecovery.js';
import {
  hasFlowABaselineForBenchmark,
  isCapabilityTestFounderReviewReady,
  reconcileMobileTwinPipelineState,
} from './reconcileMobileTwinPipelineState.js';
import type { MobileTwinPipelineState } from './types.js';
import { normalizeFounderNbpPromotionOnLoad } from './applyFounderNbpMobileTwinPromotion.js';
import { hydrateMobileTwinReviewState } from './hydrateMobileTwinReviewState.js';
import { tryRecoverOrphanTwinArtifacts } from './tryRecoverOrphanTwinArtifacts.js';
import { applyMobileTwinPackageApprovalConfirmation } from '../../p0vrTwinV30R8M/confirmMobileTwinPackageApproval.js';
import { ensureMobileDesignReferenceAuthority } from './mobileDesignReferenceAuthority.js';
import { emptyMobileTwinPipelineState } from './types.js';

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
export function restoreFounderMobileTwinPipelineFromBrowser(
  session: DesignPageAuthorityReviewSession,
  projectId: string,
): DesignPageAuthorityReviewSession {
  const restored = restoreMobileTwinPipelineFromBrowserStore(projectId, session.mobileTwinPipeline ?? undefined);
  if (!restored) return session;
  const pipeline = ensureMobileTwinPipelineDefaults(reconcileMobileTwinPipelineState(restored));
  const promoted = normalizeFounderNbpPromotionOnLoad({
    ...session,
    mobileTwinPipeline: hydrateMobileTwinReviewState(pipeline),
    updatedAt: new Date().toISOString(),
  });
  return applyMobileTwinPackageApprovalConfirmation(tryRecoverOrphanTwinArtifacts(promoted));
}

export function syncFounderMobileTwinSession(
  session: DesignPageAuthorityReviewSession,
  projectId: string,
): DesignPageAuthorityReviewSession {
  let base = session;
  if (!base.mobileTwinPipeline && base.authorityPipeline?.mobileMaster) {
    try {
      base = ensureMobileDesignReferenceAuthority({
        ...base,
        mobileTwinPipeline: emptyMobileTwinPipelineState(),
      });
    } catch {
      /* mobile master incomplete */
    }
  }
  let merged = attachMobileTwinPipelineFromBrowserStore(projectId, base.mobileTwinPipeline ?? undefined);
  if (!merged) return session;
  const recovery = evaluateMobileTwinPipelineRecovery({ ...session, mobileTwinPipeline: merged }, projectId);
  if (recovery.showRecoveryStrip) {
    merged = restoreMobileTwinPipelineFromBrowserStore(projectId, merged) ?? merged;
  }
  const pipeline = ensureMobileTwinPipelineDefaults(reconcileMobileTwinPipelineState(merged));
  const promoted = normalizeFounderNbpPromotionOnLoad({
    ...session,
    mobileTwinPipeline: hydrateMobileTwinReviewState(pipeline),
    updatedAt: new Date().toISOString(),
  });
  return applyMobileTwinPackageApprovalConfirmation(tryRecoverOrphanTwinArtifacts(promoted));
}
