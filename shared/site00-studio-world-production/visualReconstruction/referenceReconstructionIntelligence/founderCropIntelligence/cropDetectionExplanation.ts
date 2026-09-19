/**
 * CropDetectionExplanation — safe human-readable detection reasoning.
 */

import type { CropDetectionExplanation } from './types.js';

export function buildCropDetectionExplanation(input: {
  brandKey: string;
  assetType: string;
  semanticSlot: string;
  confidencePercent: number;
  detectionBasis?: string;
}): CropDetectionExplanation {
  const name = input.brandKey.replace(/_/g, ' ');
  const basis =
    input.detectionBasis ??
    `IMAGE-LIKE REGION INSIDE ${name} FAMILY CARD ON SKINS AUTHORITY SCREEN`;

  let summary = `SELECTED BECAUSE THIS IS THE LARGEST IMAGE-LIKE REGION INSIDE THE ${name} FAMILY CARD.`;
  if (input.brandKey === 'NDXBOOK') {
    summary =
      'SELECTED BECAUSE THIS REGION CONTAINS THE NDXBOOK FAMILY VISUAL INCLUDING SURROUNDING DEVICE / CARD CONTEXT.';
  }

  return {
    summary,
    detectionBasis: basis,
    confidencePercent: input.confidencePercent,
    detectedType: `${input.assetType} / ${input.semanticSlot.split('_').slice(-2).join('_')}`,
    expectedContent: `FULL ${name} FAMILY VISUAL · NO DEVICE CHROME · NO SURROUNDING UI · NO ADJACENT CARD`,
  };
}
