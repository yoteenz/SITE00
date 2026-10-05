/**
 * Sprint B4.5 — Entry 002 cinematic visual sequence bootstrap.
 */

import type { Entry002B45BootstrapResult } from '../../../shared/site00-expression-engine/entry002CinematicVisualSequenceTypes.js';
import { CINEMATIC_VIDEO_PRODUCTION_ORDER } from '../../../shared/site00-expression-engine/entry002CinematicVisualSequenceTypes.js';
import { seedChapter01Canon } from './chapterStore.js';
import { bootstrapB31FounderCreativeOverride } from './entry002B31Bootstrap.js';
import { compileEntry002LockedEntry } from './entry002Blueprint.js';
import { saveEntry } from './entryStore.js';
import { buildEntry002BlockingStoryboardRetirement } from './entry002BlockingStoryboardRetirement.js';
import { buildEntry002CinematicVisualSequenceRecord } from './entry002CinematicSequenceBuilder.js';
import { runCinematicVisualSequenceQA } from './entry002CinematicSequenceQA.js';
import {
  dispatchAllEntry002CinematicVisuals,
  dispatchEntry002CinematicContactSheet,
  isValidCinematicFrameRaster,
} from './entry002CinematicSequenceDispatch.js';
import { resolveEntry002CinematicContinuityReferenceBoards } from './entry002CinematicSequenceContinuityPack.js';
import { buildEntry002CinematicVisualSequenceFrames } from './entry002CinematicSequenceFrames.js';
import { buildEntry002PreStoryboardKeyframeStatuses } from './entry002PreStoryboardKeyframes.js';
import {
  buildEntry002CinematicSequenceGate,
  buildEntry002FounderReviewGatesWithStoryboard,
} from './entry002ReelProductionGates.js';
import { listGenerationReceiptsForEntry } from './lineageRegistration.js';
import { isStoryboardGenerationReceipt, isKeyframeGenerationReceipt, isVideoGenerationReceipt } from './entry002ReelStoryboardTelemetry.js';
import { CINEMATIC_SEQUENCE_STAGE_LABEL } from './entry002CinematicSequenceDispatch.js';

export async function bootstrapB45Entry002CinematicVisualSequence(options?: {
  dispatchFal?: boolean;
  forceDispatch?: boolean;
  skipContactSheet?: boolean;
}): Promise<Entry002B45BootstrapResult> {
  process.env.EXPRESSION_ENGINE_MEMORY_STORE = process.env.EXPRESSION_ENGINE_MEMORY_STORE ?? '1';
  seedChapter01Canon();
  await bootstrapB31FounderCreativeOverride();
  saveEntry(compileEntry002LockedEntry());

  const blockingStoryboard = buildEntry002BlockingStoryboardRetirement();
  const dispatchFal = options?.dispatchFal ?? Boolean(process.env.FAL_KEY?.trim());
  const boards = await resolveEntry002CinematicContinuityReferenceBoards();
  const frames = buildEntry002CinematicVisualSequenceFrames();

  const frameResults = await dispatchAllEntry002CinematicVisuals(frames, boards, {
    dispatchFal,
    forceDispatch: options?.forceDispatch,
  });

  const contactSheet = options?.skipContactSheet
    ? null
    : await dispatchEntry002CinematicContactSheet(frames.length, {
        dispatchFal,
        forceDispatch: options?.forceDispatch,
      });

  const framesWithUrls = frameResults
    .filter(isValidCinematicFrameRaster)
    .map((f) => ({
      frameNumber: f.frameNumber,
      storagePath: f.storagePath,
      previewUrl: f.previewUrl!,
    }));

  const contact =
    contactSheet && contactSheet.actualFileExists && contactSheet.previewUrl
      ? { storagePath: contactSheet.storagePath, previewUrl: contactSheet.previewUrl }
      : null;

  const cinematicSequence = await buildEntry002CinematicVisualSequenceRecord(framesWithUrls, contact);
  const qa = runCinematicVisualSequenceQA(cinematicSequence);

  if (!qa.passed) {
    throw new Error(`B4.5 cinematic sequence QA failed: ${qa.blockers.join('; ')}`);
  }

  const receipts = listGenerationReceiptsForEntry('entry-002');
  const telemetry = {
    blockingStoryboardGeneration: receipts.filter(isStoryboardGenerationReceipt).length,
    cinematicSequenceGeneration: receipts.filter(
      (r) => r.promptLineage.includes(CINEMATIC_SEQUENCE_STAGE_LABEL),
    ).length || cinematicSequence.frames.length,
    keyframeGeneration: receipts.filter(isKeyframeGenerationReceipt).length,
    videoGeneration: receipts.filter(isVideoGenerationReceipt).length,
  };

  const preStoryboardKeyframes = buildEntry002PreStoryboardKeyframeStatuses();
  const founderGates = buildEntry002FounderReviewGatesWithStoryboard('REFERENCE_ONLY', 'UNREVIEWED');
  const cinematicSequenceGate = buildEntry002CinematicSequenceGate('UNREVIEWED');

  return {
    sprint: 'B4.5_ENTRY_002_CINEMATIC_VISUAL_SEQUENCE',
    productionOrder: CINEMATIC_VIDEO_PRODUCTION_ORDER,
    blockingStoryboard,
    cinematicSequence,
    qa,
    telemetry,
    preStoryboardKeyframes: preStoryboardKeyframes.map((k) => ({
      assetId: k.assetId,
      status: k.status,
      canonState: k.canonState,
    })),
    keyframeGenerationBlocked: true,
    videoGenerationBlocked: true,
    klingBlocked: true,
    roughCutBlocked: true,
    downstreamBlocked: true,
    founderGates,
    cinematicSequenceGate,
    frameVisuals: frameResults.map((f) => ({
      frameNumber: f.frameNumber,
      frameId: f.frameId,
      storagePath: f.storagePath,
      previewUrl: f.previewUrl,
      status: f.status,
      actualFileExists: f.actualFileExists,
      referenceBoardsUsed: f.referenceBoardsUsed,
    })),
    contactSheetVisual: contactSheet
      ? {
          storagePath: contactSheet.storagePath,
          previewUrl: contactSheet.previewUrl,
          status: contactSheet.status,
          actualFileExists: contactSheet.actualFileExists,
        }
      : null,
    nextAction: 'REFERENCE ONLY — not active gate; see Pre-Storyboard Authority tab',
  };
}

export { bootstrapB45Entry002CinematicVisualSequence as bootstrapB45 };
