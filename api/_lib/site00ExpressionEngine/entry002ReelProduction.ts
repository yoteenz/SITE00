/**
 * Sprint B4 — Entry 002 REEL staged production orchestrator.
 */

import type {
  DownstreamFormatHold,
  Entry002B4BootstrapResult,
  FounderReviewGate,
  ReelProductionTelemetry,
} from '../../../shared/site00-expression-engine/entry002ReelTypes.js';
import { buildEntry002FounderReviewGatesWithStoryboard } from './entry002ReelProductionGates.js';
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
import { compileEntry002ReelKeyframes } from './entry002ReelKeyframes.js';
import { buildEntry002ReelMotionPlan } from './entry002ReelMotionPlan.js';
import { compileEntry002ReelProviderRouting } from './entry002ReelProviderRouting.js';
import { runEntry002ReelQA } from './entry002ReelQA.js';
import { buildReelAnnotationUsageContract } from './entry002ReelAnnotationUsage.js';
import {
  buildEntry002ReelEditSuiteBehavior,
  buildEntry002ReelFashionDirection,
  buildEntry002ReelPhoneRole,
} from './entry002ReelDirection.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';

export {
  buildEntry002ReelPhoneRole,
  buildEntry002ReelFashionDirection,
  buildEntry002ReelEditSuiteBehavior,
} from './entry002ReelDirection.js';

export function buildEntry002FounderReviewGates(): FounderReviewGate[] {
  return buildEntry002FounderReviewGatesWithStoryboard('UNREVIEWED');
}

export { buildEntry002FounderReviewGatesWithStoryboard } from './entry002ReelProductionGates.js';

export function downstreamFormatsOnHold(): DownstreamFormatHold[] {
  const formats = ['CAROUSEL', 'STORY', 'CTA_STORY', 'HIGHLIGHT', 'TIKTOK', 'X'] as const;
  return formats.map((format) => ({
    format,
    status: 'UNLOCKED_PENDING_PRODUCTION' as const,
    produced: false as const,
  }));
}

export function founderGateBlocksProgression(gates: FounderReviewGate[]): boolean {
  const cinematic = gates.find((g) => g.gateId === 'GATE_REF_CINEMATIC_SEQUENCE');
  const keyframe = gates.find((g) => g.gateId === 'GATE_1_KEYFRAME');
  if (cinematic?.founderJudgment !== 'LOVE_IT') return true;
  return keyframe?.founderJudgment !== 'LOVE_IT';
}

export async function produceEntry002ReelB4(options?: {
  dispatchKeyframes?: boolean;
}): Promise<Entry002B4BootstrapResult> {
  process.env.EXPRESSION_ENGINE_MEMORY_STORE = process.env.EXPRESSION_ENGINE_MEMORY_STORE ?? '1';
  seedChapter01Canon();
  await bootstrapB31FounderCreativeOverride();

  const audioPlan = buildEntry002ReelAudioPlan();
  const keyframes = compileEntry002ReelKeyframes({ dispatch: options?.dispatchKeyframes ?? false });
  const motionPlan = buildEntry002ReelMotionPlan();
  const providerRouting = compileEntry002ReelProviderRouting();
  const founderGates = buildEntry002FounderReviewGates();

  const annotationUsage = buildReelAnnotationUsageContract();

  const qa = runEntry002ReelQA({
    keyframes,
    audioPlan,
    videoDispatched: false,
  });

  if (!qa.passed) {
    throw new Error(`Entry 002 REEL QA failed: ${qa.blockers.join('; ')}`);
  }

  const telemetry: ReelProductionTelemetry = {
    generationAttempts: 0,
    compiledPlans: keyframes.length,
    planningReceipts: keyframes.length,
    repairAttempts: 0,
    manualInterventions: 0,
    founderRevisions: 0,
    costUsd: null,
    productionTimeMs: null,
    lineageCompleteness: keyframes.every((k) => k.receipt.trackingState === 'TRACKED')
      ? 'COMPLETE'
      : 'INCOMPLETE',
  };

  const baseEntry = compileEntry002LockedEntry();
  saveEntry({
    ...baseEntry,
    status: 'IN_PRODUCTION',
    audioPlan,
    metadata: {
      sprint: 'B4_ENTRY_002_REEL_PRODUCTION',
      reelId: ENTRY_002_REEL_ID,
      chapterId: CHAPTER_01_ID,
      territoryId: ENTRY_002_TERRITORY_ID,
      worldId: ENTRY_002_WORLD_ID,
      keyframes,
      motionPlan,
      founderGates,
      videoDispatched: false,
      primaryMotionAuthority: 'REEL',
      annotationUsage,
    } as never,
    generationReceipts: [...baseEntry.generationReceipts, ...keyframes.map((k) => k.receipt)],
    assetIds: [...baseEntry.assetIds, ...keyframes.map((k) => k.assetId)],
  });

  return {
    sprint: 'B4_ENTRY_002_REEL_PRODUCTION',
    reelId: ENTRY_002_REEL_ID,
    runtimeTargetSec: { ...ENTRY_002_REEL_RUNTIME_TARGET },
    argumentArc: buildEntry002ReelArgumentArc(),
    shotPlan: buildEntry002ReelShotPlan(),
    keyframes,
    motionPlan,
    audioPlan,
    phoneRole: buildEntry002ReelPhoneRole(),
    fashionDirection: buildEntry002ReelFashionDirection(),
    editSuiteBehavior: buildEntry002ReelEditSuiteBehavior(),
    providerRouting,
    founderGates,
    qa,
    annotationUsage,
    downstreamHold: downstreamFormatsOnHold(),
    telemetry,
    videoDispatched: false,
    assetsGenerated: keyframes.length,
  };
}

export async function bootstrapB4Entry002ReelProduction(
  options?: Parameters<typeof produceEntry002ReelB4>[0],
): Promise<Entry002B4BootstrapResult> {
  return produceEntry002ReelB4(options);
}

export { bootstrapB4Entry002ReelProduction as bootstrapB4 };
