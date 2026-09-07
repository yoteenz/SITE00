/**
 * Sprint B4.2 — Entry 002 REEL keyframe execution dispatch orchestrator.
 */

import type {
  Entry002B42BootstrapResult,
  ReelKeyframeExecutionFrame,
} from '../../../shared/site00-expression-engine/entry002ReelTypes.js';
import { seedChapter01Canon } from './chapterStore.js';
import { bootstrapB31FounderCreativeOverride } from './entry002B31Bootstrap.js';
import { compileEntry002LockedEntry, ENTRY_002_TERRITORY_ID, ENTRY_002_WORLD_ID } from './entry002Blueprint.js';
import { saveEntry } from './entryStore.js';
import { buildEntry002ReelAudioPlan } from './entry002ReelAudioPlan.js';
import {
  buildEntry002ReelArgumentArc,
  buildEntry002ReelShotPlan,
  ENTRY_002_REEL_ID,
  ENTRY_002_REEL_RUNTIME_TARGET,
} from './entry002ReelShotPlan.js';
import { buildEntry002FounderReviewGates, downstreamFormatsOnHold } from './entry002ReelProduction.js';
import {
  dispatchAllEntry002ReelKeyframeRasters,
  isValidGeneratedRaster,
} from './entry002ReelKeyframeDispatch.js';
import { runEntry002ReelKeyframeRasterQA } from './entry002ReelKeyframeRasterQA.js';
import { buildReelKeyframeTelemetrySemantics } from './entry002ReelKeyframeTelemetry.js';
import { buildEntry002ReelMotionPlan } from './entry002ReelMotionPlan.js';
import { compileEntry002ReelProviderRouting } from './entry002ReelProviderRouting.js';
import {
  buildEntry002ReelEditSuiteBehavior,
  buildEntry002ReelFashionDirection,
  buildEntry002ReelPhoneRole,
} from './entry002ReelDirection.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import { listGenerationReceiptsForEntry } from './lineageRegistration.js';

export async function executeEntry002ReelKeyframeDispatchB42(options?: {
  dispatchFal?: boolean;
  forceDispatch?: boolean;
}): Promise<Entry002B42BootstrapResult> {
  process.env.EXPRESSION_ENGINE_MEMORY_STORE = process.env.EXPRESSION_ENGINE_MEMORY_STORE ?? '1';
  seedChapter01Canon();
  await bootstrapB31FounderCreativeOverride();

  const dispatchFal = options?.dispatchFal ?? Boolean(process.env.FAL_KEY?.trim());
  const rasters = await dispatchAllEntry002ReelKeyframeRasters({
    dispatchFal,
    forceDispatch: options?.forceDispatch,
  });

  const successful = rasters.filter(isValidGeneratedRaster);
  if (dispatchFal && successful.length !== 3) {
    const failures = rasters.filter((r) => !isValidGeneratedRaster(r)).map((r) => `${r.role}: ${r.failure ?? 'no raster'}`);
    throw new Error(`B4.2 requires 3 successful raster results — got ${successful.length}. Failures: ${failures.join('; ')}`);
  }

  const qa = runEntry002ReelKeyframeRasterQA(rasters);
  const founderGates = buildEntry002FounderReviewGates();
  const audioPlan = buildEntry002ReelAudioPlan();
  const telemetrySemantics = buildReelKeyframeTelemetrySemantics(rasters, 3);

  const frames: ReelKeyframeExecutionFrame[] = rasters.map((r) => ({
    role: r.role,
    assetId: r.assetId,
    storagePath: r.storagePath,
    previewUrl: r.previewUrl,
    provider: r.provider,
    model: r.model,
    providerRequestId: r.providerRequestId,
    dimensions: r.dimensions,
    aspectRatio: r.aspectRatio,
    planningReceiptId: r.planningReceiptId,
    generationReceipt: r.generationReceipt,
    creativeAssetRecord: r.creativeAssetRecord,
    dispatchAttempted: r.dispatchAttempted,
    actualFileExists: r.actualFileExists,
    fallbackAttempted: r.fallbackAttempted,
    status: r.status,
    failure: r.failure,
    founderJudgment: r.founderJudgment,
    canonState: r.canonState,
    qaAdvisory: qa.checks.filter((c) => c.check.startsWith(r.role)),
  }));

  const allReceipts = listGenerationReceiptsForEntry('entry-002');
  const reelReceipts = allReceipts.filter((r) => r.format === 'REEL');
  const orphanCount = reelReceipts.filter((r) => !r.assetId || !r.entryId).length;
  const legacyUntracked = reelReceipts.filter((r) => r.trackingState === 'LEGACY_UNTRACKED').length;

  const baseEntry = compileEntry002LockedEntry();
  saveEntry({
    ...baseEntry,
    status: 'IN_PRODUCTION',
    audioPlan,
    metadata: {
      sprint: 'B4.2_ENTRY_002_REEL_KEYFRAME_EXECUTION',
      reelId: ENTRY_002_REEL_ID,
      chapterId: CHAPTER_01_ID,
      territoryId: ENTRY_002_TERRITORY_ID,
      worldId: ENTRY_002_WORLD_ID,
      keyframeExecutions: frames,
      founderGates,
      videoDispatched: false,
      motionBlocked: true,
    } as never,
    generationReceipts: [
      ...baseEntry.generationReceipts,
      ...rasters.filter((r) => r.generationReceipt).map((r) => r.generationReceipt!),
    ],
    assetIds: [...baseEntry.assetIds, ...successful.map((r) => r.assetId)],
  });

  return {
    sprint: 'B4.2_ENTRY_002_REEL_KEYFRAME_EXECUTION',
    reelId: ENTRY_002_REEL_ID,
    runtimeTargetSec: { ...ENTRY_002_REEL_RUNTIME_TARGET },
    argumentArc: buildEntry002ReelArgumentArc(),
    shotPlan: buildEntry002ReelShotPlan(),
    keyframeExecutions: frames,
    motionPlan: buildEntry002ReelMotionPlan(),
    audioPlan,
    phoneRole: buildEntry002ReelPhoneRole(),
    fashionDirection: buildEntry002ReelFashionDirection(),
    editSuiteBehavior: buildEntry002ReelEditSuiteBehavior(),
    providerRouting: compileEntry002ReelProviderRouting(),
    founderGates,
    qa,
    downstreamHold: downstreamFormatsOnHold(),
    telemetrySemantics,
    lineage: {
      tracked: reelReceipts.filter((r) => r.trackingState === 'TRACKED').length,
      orphanAssets: orphanCount,
      legacyUntracked,
    },
    videoDispatched: false,
    klingBlocked: true,
    roughCutBlocked: true,
    actualProviderDispatches: telemetrySemantics.dispatchedGenerations,
    actualRasterResults: telemetrySemantics.successfulRasterResults,
  };
}

export async function bootstrapB42Entry002ReelKeyframeExecution(
  options?: Parameters<typeof executeEntry002ReelKeyframeDispatchB42>[0],
): Promise<Entry002B42BootstrapResult> {
  return executeEntry002ReelKeyframeDispatchB42(options);
}

export { bootstrapB42Entry002ReelKeyframeExecution as bootstrapB42 };
