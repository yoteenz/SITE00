/**
 * Sprint B4.4 — Separate storyboard / keyframe / video production telemetry.
 */

import type { ReelStoryboardTelemetry } from '../../../shared/site00-expression-engine/entry002ReelStoryboardTypes.js';
import type { GenerationReceipt } from '../../../shared/site00-expression-engine/types.js';

export function isStoryboardGenerationReceipt(receipt: GenerationReceipt): boolean {
  return (
    receipt.promptLineage.includes('STORYBOARD_GENERATION') ||
    receipt.promptLineage.includes('sprint-b4.4-reel-storyboard')
  );
}

export function isKeyframeGenerationReceipt(receipt: GenerationReceipt): boolean {
  return (
    (receipt.promptLineage.includes('sprint-b4.2-reel-kf-raster') ||
      receipt.promptLineage.includes('sprint-b4.1-reel-kf-raster') ||
      receipt.promptLineage.includes('sprint-b4-entry-002-reel-keyframe')) &&
    !isStoryboardGenerationReceipt(receipt)
  );
}

export function isVideoGenerationReceipt(receipt: GenerationReceipt): boolean {
  return (
    receipt.promptLineage.includes('VIDEO_GENERATION') ||
    receipt.promptLineage.includes('kling') ||
    receipt.promptLineage.includes('rough-cut')
  );
}

export function buildReelStoryboardTelemetry(
  receipts: GenerationReceipt[],
  storyboardPanelCount: number,
): ReelStoryboardTelemetry {
  const storyboardGeneration = receipts.filter(isStoryboardGenerationReceipt).length;
  const keyframeGeneration = receipts.filter(isKeyframeGenerationReceipt).length;
  const videoGeneration = receipts.filter(isVideoGenerationReceipt).length;

  return {
    storyboardGeneration: storyboardGeneration > 0 ? storyboardGeneration : storyboardPanelCount,
    keyframeGeneration,
    videoGeneration,
  };
}

export const STORYBOARD_STAGE_LABEL = 'STORYBOARD_GENERATION' as const;
export const KEYFRAME_STAGE_LABEL = 'KEYFRAME_GENERATION' as const;
export const VIDEO_STAGE_LABEL = 'VIDEO_GENERATION' as const;
