/**
 * P0.VR.6R8 — Detection learning events from founder corrections (calibration assist, not canon).
 */

import type { NormalizedBbox } from '../types.js';

export type BrandFamilyThumbnailCropPattern = {
  containerType: string;
  mediaInsetPattern: { xRatio: number; yRatio: number; wRatio: number; hRatio: number };
  labelLocation: 'BOTTOM' | 'NONE';
  borderExclusion: number;
  typicalAspect: number;
  confidence: number;
  learnedFromCorrections: number;
};

export type DetectionLearningEvent = {
  eventId: string;
  targetSlot: string;
  assetType: string;
  detectedCrop: NormalizedBbox;
  finalCrop: NormalizedBbox;
  delta: NormalizedBbox;
  reason: string | null;
  contaminationRemoved: string[];
  createdAt: string;
};

const events: DetectionLearningEvent[] = [];
const patterns: BrandFamilyThumbnailCropPattern[] = [];

export function recordDetectionCorrection(input: {
  targetSlot: string;
  assetType: string;
  detectedCrop: NormalizedBbox;
  finalCrop: NormalizedBbox;
  reason?: string | null;
  contaminationRemoved?: string[];
}): DetectionLearningEvent {
  const delta: NormalizedBbox = {
    x: input.finalCrop.x - input.detectedCrop.x,
    y: input.finalCrop.y - input.detectedCrop.y,
    width: input.finalCrop.width - input.detectedCrop.width,
    height: input.finalCrop.height - input.detectedCrop.height,
  };
  const event: DetectionLearningEvent = {
    eventId: `dle-${Date.now()}`,
    targetSlot: input.targetSlot,
    assetType: input.assetType,
    detectedCrop: input.detectedCrop,
    finalCrop: input.finalCrop,
    delta,
    reason: input.reason ?? null,
    contaminationRemoved: input.contaminationRemoved ?? [],
    createdAt: new Date().toISOString(),
  };
  events.push(event);
  if (input.targetSlot.startsWith('BRAND_FAMILY_')) {
    upsertFamilyPattern(input.targetSlot, input.detectedCrop, input.finalCrop);
  }
  return event;
}

function upsertFamilyPattern(slot: string, detected: NormalizedBbox, final: NormalizedBbox): void {
  const existing = patterns.find((p) => p.containerType === slot);
  const mediaInsetPattern = {
    xRatio: (final.x - detected.x) / Math.max(detected.width, 0.001),
    yRatio: (final.y - detected.y) / Math.max(detected.height, 0.001),
    wRatio: final.width / Math.max(detected.width, 0.001),
    hRatio: final.height / Math.max(detected.height, 0.001),
  };
  if (existing) {
    existing.learnedFromCorrections += 1;
    existing.confidence = Math.min(98, existing.confidence + 2);
    existing.mediaInsetPattern = mediaInsetPattern;
  } else {
    patterns.push({
      containerType: slot,
      mediaInsetPattern,
      labelLocation: 'BOTTOM',
      borderExclusion: 0.08,
      typicalAspect: final.width / Math.max(final.height, 0.001),
      confidence: 72,
      learnedFromCorrections: 1,
    });
  }
}

export function listDetectionLearningEvents(): DetectionLearningEvent[] {
  return [...events];
}

export function listBrandFamilyThumbnailPatterns(): BrandFamilyThumbnailCropPattern[] {
  return [...patterns];
}

export function resetDetectionLearningForTest(): void {
  events.length = 0;
  patterns.length = 0;
}
