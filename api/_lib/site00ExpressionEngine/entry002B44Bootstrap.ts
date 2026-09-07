/**
 * Sprint B4.4 — Entry 002 REEL storyboard authority bootstrap.
 */

import type { Entry002B44BootstrapResult } from '../../../shared/site00-expression-engine/entry002ReelStoryboardTypes.js';
import { REEL_PRODUCTION_ORDER } from '../../../shared/site00-expression-engine/entry002ReelStoryboardTypes.js';
import { seedChapter01Canon } from './chapterStore.js';
import { bootstrapB31FounderCreativeOverride } from './entry002B31Bootstrap.js';
import { compileEntry002LockedEntry } from './entry002Blueprint.js';
import { saveEntry } from './entryStore.js';
import {
  buildEntry002ReelStoryboardRecord,
} from './entry002ReelStoryboardBuilder.js';
import { runReelStoryboardQA } from './entry002ReelStoryboardQA.js';
import {
  dispatchAllEntry002ReelStoryboardVisuals,
  isValidStoryboardPanelRaster,
} from './entry002ReelStoryboardDispatch.js';
import { buildEntry002PreStoryboardKeyframeStatuses } from './entry002PreStoryboardKeyframes.js';
import {
  buildEntry002FounderReviewGatesWithStoryboard,
  buildEntry002StoryboardGate,
} from './entry002ReelProductionGates.js';
import { buildReelStoryboardTelemetry } from './entry002ReelStoryboardTelemetry.js';
import { listGenerationReceiptsForEntry } from './lineageRegistration.js';

export async function bootstrapB44Entry002ReelStoryboardAuthority(options?: {
  dispatchFal?: boolean;
  forceDispatch?: boolean;
  panelsOnly?: boolean;
}): Promise<Entry002B44BootstrapResult> {
  process.env.EXPRESSION_ENGINE_MEMORY_STORE = process.env.EXPRESSION_ENGINE_MEMORY_STORE ?? '1';
  seedChapter01Canon();
  await bootstrapB31FounderCreativeOverride();
  saveEntry(compileEntry002LockedEntry());

  const dispatchFal = options?.dispatchFal ?? Boolean(process.env.FAL_KEY?.trim());
  const visuals = await dispatchAllEntry002ReelStoryboardVisuals({
    dispatchFal,
    forceDispatch: options?.forceDispatch,
    panelsOnly: options?.panelsOnly,
  });

  const panelsWithUrls = visuals.panels
    .filter(isValidStoryboardPanelRaster)
    .map((p) => ({
      panelNumber: p.panelNumber,
      storagePath: p.storagePath,
      previewUrl: p.previewUrl!,
    }));

  const strip =
    visuals.strip && visuals.strip.actualFileExists && visuals.strip.previewUrl
      ? { storagePath: visuals.strip.storagePath, previewUrl: visuals.strip.previewUrl }
      : null;

  const storyboard = buildEntry002ReelStoryboardRecord(panelsWithUrls, strip);
  const qa = runReelStoryboardQA(storyboard);

  if (!qa.passed) {
    throw new Error(`B4.4 storyboard QA failed: ${qa.blockers.join('; ')}`);
  }

  const receipts = listGenerationReceiptsForEntry('entry-002');
  const telemetry = buildReelStoryboardTelemetry(receipts, storyboard.panels.length);
  const preStoryboardKeyframes = buildEntry002PreStoryboardKeyframeStatuses();
  const founderGates = buildEntry002FounderReviewGatesWithStoryboard(storyboard.founderJudgment);
  const storyboardGate = buildEntry002StoryboardGate(storyboard.founderJudgment);

  return {
    sprint: 'B4.4_ENTRY_002_REEL_STORYBOARD_AUTHORITY',
    productionOrder: REEL_PRODUCTION_ORDER,
    storyboard,
    qa,
    telemetry,
    preStoryboardKeyframes,
    keyframeGenerationBlocked: true,
    videoGenerationBlocked: true,
    klingBlocked: true,
    roughCutBlocked: true,
    downstreamBlocked: true,
    founderGates,
    storyboardGate,
    panelVisuals: visuals.panels,
    stripVisual: visuals.strip,
    nextAction: 'FOUNDER STORYBOARD REVIEW',
  };
}

export { bootstrapB44Entry002ReelStoryboardAuthority as bootstrapB44 };
