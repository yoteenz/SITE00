/**
 * Sprint B4.1 — Entry 002 REEL keyframe first-pass rasterization orchestrator.
 */

import type {
  Entry002B41BootstrapResult,
  ReelKeyframeRasterFrame,
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
import { dispatchAllEntry002ReelKeyframeRasters } from './entry002ReelKeyframeDispatch.js';
import { runEntry002ReelKeyframeRasterQA } from './entry002ReelKeyframeRasterQA.js';
import { buildEntry002ReelMotionPlan } from './entry002ReelMotionPlan.js';
import { compileEntry002ReelProviderRouting } from './entry002ReelProviderRouting.js';
import {
  buildEntry002ReelEditSuiteBehavior,
  buildEntry002ReelFashionDirection,
  buildEntry002ReelPhoneRole,
} from './entry002ReelDirection.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import { listGenerationReceiptsForEntry } from './lineageRegistration.js';

export async function produceEntry002ReelKeyframeRastersB41(options?: {
  dispatchFal?: boolean;
}): Promise<Entry002B41BootstrapResult> {
  process.env.EXPRESSION_ENGINE_MEMORY_STORE = process.env.EXPRESSION_ENGINE_MEMORY_STORE ?? '1';
  seedChapter01Canon();
  await bootstrapB31FounderCreativeOverride();

  const rasters = await dispatchAllEntry002ReelKeyframeRasters({
    dispatchFal: options?.dispatchFal,
  });

  if (rasters.length !== 3) {
    throw new Error(`B4.1 requires exactly 3 keyframe rasters — got ${rasters.length}`);
  }

  const qa = runEntry002ReelKeyframeRasterQA(rasters);
  const founderGates = buildEntry002FounderReviewGates();
  const audioPlan = buildEntry002ReelAudioPlan();

  const frames: ReelKeyframeRasterFrame[] = rasters.map((r) => ({
    role: r.role,
    assetId: r.assetId,
    storagePath: r.storagePath,
    previewUrl: r.previewUrl,
    provider: r.provider,
    model: r.model,
    dimensions: r.dimensions,
    aspectRatio: r.aspectRatio,
    planningReceiptId: r.planningReceiptId,
    generationReceipt: r.generationReceipt,
    founderJudgment: r.founderJudgment,
    canonState: r.canonState,
    status: r.status,
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
      sprint: 'B4.1_ENTRY_002_REEL_KEYFRAME_RASTERIZATION',
      reelId: ENTRY_002_REEL_ID,
      chapterId: CHAPTER_01_ID,
      territoryId: ENTRY_002_TERRITORY_ID,
      worldId: ENTRY_002_WORLD_ID,
      keyframeRasters: frames,
      founderGates,
      videoDispatched: false,
      motionBlocked: true,
    } as never,
    generationReceipts: [
      ...baseEntry.generationReceipts,
      ...rasters.map((r) => r.generationReceipt),
    ],
    assetIds: [...baseEntry.assetIds, ...rasters.map((r) => r.assetId)],
  });

  return {
    sprint: 'B4.1_ENTRY_002_REEL_KEYFRAME_RASTERIZATION',
    reelId: ENTRY_002_REEL_ID,
    runtimeTargetSec: { ...ENTRY_002_REEL_RUNTIME_TARGET },
    argumentArc: buildEntry002ReelArgumentArc(),
    shotPlan: buildEntry002ReelShotPlan(),
    keyframeRasters: frames,
    motionPlan: buildEntry002ReelMotionPlan(),
    audioPlan,
    phoneRole: buildEntry002ReelPhoneRole(),
    fashionDirection: buildEntry002ReelFashionDirection(),
    editSuiteBehavior: buildEntry002ReelEditSuiteBehavior(),
    providerRouting: compileEntry002ReelProviderRouting(),
    founderGates,
    qa,
    downstreamHold: downstreamFormatsOnHold(),
    telemetry: {
      generationAttempts: 3,
      repairAttempts: 0,
      manualInterventions: 0,
      founderRevisions: 0,
      costUsd: null,
      productionTimeMs: null,
      lineageCompleteness: orphanCount === 0 && legacyUntracked === 0 ? 'COMPLETE' : 'INCOMPLETE',
    },
    lineage: {
      tracked: reelReceipts.filter((r) => r.trackingState === 'TRACKED').length,
      orphanAssets: orphanCount,
      legacyUntracked,
    },
    videoDispatched: false,
    klingBlocked: true,
    roughCutBlocked: true,
    assetsGenerated: 3,
  };
}

export async function bootstrapB41Entry002ReelKeyframeRasterization(
  options?: Parameters<typeof produceEntry002ReelKeyframeRastersB41>[0],
): Promise<Entry002B41BootstrapResult> {
  return produceEntry002ReelKeyframeRastersB41(options);
}

export { bootstrapB41Entry002ReelKeyframeRasterization as bootstrapB41 };
