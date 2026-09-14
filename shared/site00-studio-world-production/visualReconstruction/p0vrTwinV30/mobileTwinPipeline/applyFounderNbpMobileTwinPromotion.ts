import type { DesignPageAuthorityReviewSession } from '../types.js';
import { P0_VR_TWIN_V30R7MF3P3_LINEAGE, P0_VR_TWIN_V30R7MF3P4_LINEAGE } from '../constants.js';
import { resolveFocusedHybridNbpModel } from '../../../../site00-visual-generation/twinFocusedHybridBenchmarkCatalog.js';
import {
  FOUNDER_MANUAL_PROMOTION_SOURCE,
  HISTORICAL_PROVIDER_BENCHMARK,
  LOCKED_MOBILE_STRATEGY_STATUS,
  type FounderTwinProviderPromotionReceipt,
} from './mobileTwinProviderPromotionTypes.js';
import type { MobileTwinRenderStrategy } from './twinFocusedHybridBenchmarkTypes.js';
import type { MobileTwinProviderBenchmarkState } from './twinProviderBenchmarkTypes.js';
import type { MobileTwinFocusedHybridBenchmarkState } from './twinFocusedHybridBenchmarkTypes.js';

export function applyFounderNbpMobileTwinPromotion(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityReviewSession {
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline) throw new Error('MOBILE_TWIN_PIPELINE_MISSING');
  if (pipeline.mobileTwinVisualGenerationStrategy !== 'ATOMIC_SIBLING_FROM_COMPOSITION') {
    throw new Error('MOBILE_TWIN_PROMOTION_REQUIRES_METHOD_A');
  }

  const nbpModel = resolveFocusedHybridNbpModel();
  const now = new Date().toISOString();
  const promotionId = pipeline.founderTwinProviderPromotionReceiptId ?? `ftpr-nbp-${session.projectId}-${Date.now()}`;

  const sourceBenchmarkId =
    pipeline.focusedHybridBenchmark?.benchmarkId ?? pipeline.providerBenchmark?.benchmarkId ?? null;

  const receipt: FounderTwinProviderPromotionReceipt = {
    id: promotionId,
    projectId: session.projectId,
    workspaceType: 'DESIGN_PAGE_V3',
    viewport: 'MOBILE',
    sourceSprint: P0_VR_TWIN_V30R7MF3P3_LINEAGE,
    sourceBenchmarkId,
    selectedStrategy: 'NBP_FULL_PAIR',
    actualProvider: 'FAL',
    actualModel: nbpModel,
    blueprintProvider: 'FAL',
    blueprintModel: nbpModel,
    selectionMethod: 'FOUNDER_MANUAL_PROMOTION',
    reason: 'FOUNDER_VISUAL_JUDGMENT',
    benchmarkSupersededForRouting: true,
    createdAt: now,
    status: 'ACTIVE',
  };

  const renderStrategy: MobileTwinRenderStrategy = {
    strategy: 'NBP_FULL_PAIR',
    actualProvider: 'FAL',
    actualModel: nbpModel,
    blueprintProvider: 'FAL',
    blueprintModel: nbpModel,
    benchmarkRunId: sourceBenchmarkId ?? promotionId,
    benchmarkSnapshotId:
      pipeline.focusedHybridBenchmark?.snapshot.id ??
      pipeline.providerBenchmark?.snapshot.id ??
      `promoted-${promotionId}`,
    compositionStateId:
      pipeline.twinCapabilityTest?.snapshot.compositionStateId ??
      pipeline.focusedHybridBenchmark?.snapshot.compositionStateId ??
      pipeline.compositionStates[0]?.id ??
      'unknown',
    compositionHash:
      pipeline.twinCapabilityTest?.snapshot.compositionHash ??
      pipeline.focusedHybridBenchmark?.snapshot.compositionHash ??
      pipeline.compositionStates[0]?.compositionHash ??
      'unknown',
    actualRenderId:
      pipeline.focusedHybridBenchmark?.strategies.NBP_FULL_PAIR_CORRECTED.actualRenderId ??
      pipeline.mobileTwinRenderStrategy?.actualRenderId ??
      null,
    blueprintRenderId:
      pipeline.focusedHybridBenchmark?.strategies.NBP_FULL_PAIR_CORRECTED.blueprintRenderId ??
      pipeline.mobileTwinRenderStrategy?.blueprintRenderId ??
      null,
    founderNotes: 'Founder manual NBP full-pair promotion (R7MF3P4)',
    selectedAt: now,
    status: LOCKED_MOBILE_STRATEGY_STATUS,
  };

  const markBenchmarkHistorical = <T extends { benchmarkRoutingRole?: string }>(state: T | null): T | null =>
    state ? { ...state, benchmarkRoutingRole: HISTORICAL_PROVIDER_BENCHMARK } : null;

  const providerBenchmark = markBenchmarkHistorical(
    pipeline.providerBenchmark as MobileTwinProviderBenchmarkState & { benchmarkRoutingRole?: string },
  );
  const focusedHybridBenchmark = markBenchmarkHistorical(
    pipeline.focusedHybridBenchmark as MobileTwinFocusedHybridBenchmarkState & { benchmarkRoutingRole?: string },
  );

  return {
    ...session,
    mobileTwinPipeline: {
      ...pipeline,
      founderTwinProviderPromotionReceiptId: promotionId,
      mobileTwinProviderLock: {
        viewport: 'MOBILE',
        actualProvider: 'FAL',
        actualModel: nbpModel,
        blueprintProvider: 'FAL',
        blueprintModel: nbpModel,
        locked: true,
        source: FOUNDER_MANUAL_PROMOTION_SOURCE,
        promotionReceiptId: promotionId,
        lockedAt: now,
      },
      mobileTwinRenderStrategy: renderStrategy,
      providerBenchmark,
      focusedHybridBenchmark,
      mobileTwinProviderStrategy: null,
      artifactsById: {
        ...pipeline.artifactsById,
        [promotionId]: receipt,
        [`lineage-${P0_VR_TWIN_V30R7MF3P4_LINEAGE}`]: { sprint: P0_VR_TWIN_V30R7MF3P4_LINEAGE, at: now },
      },
      desktopJobsDispatched: 0,
    },
    updatedAt: now,
  };
}

export function unlockMobileTwinProviderStrategy(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityReviewSession {
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline) return session;
  return {
    ...session,
    mobileTwinPipeline: {
      ...pipeline,
      mobileTwinProviderLock: null,
      mobileTwinRenderStrategy: pipeline.mobileTwinRenderStrategy ?
        { ...pipeline.mobileTwinRenderStrategy, status: 'PROVISIONAL_WINNER' }
      : null,
    },
    updatedAt: new Date().toISOString(),
  };
}

/** Pilot NDXBOOK: normalize provisional benchmark state to locked NBP once Method A is set. */
export function normalizeFounderNbpPromotionOnLoad(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityReviewSession {
  if (session.projectId.toLowerCase() !== 'ndxbook') return session;
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline) return session;
  if (pipeline.mobileTwinProviderLock?.locked) return session;
  if (pipeline.mobileTwinVisualGenerationStrategy !== 'ATOMIC_SIBLING_FROM_COMPOSITION') return session;
  try {
    return applyFounderNbpMobileTwinPromotion(session);
  } catch {
    return session;
  }
}
