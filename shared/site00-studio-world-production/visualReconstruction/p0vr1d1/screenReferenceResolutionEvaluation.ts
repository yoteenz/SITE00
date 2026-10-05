/**
 * P0.VR.1D.1 — ScreenReferenceResolutionEvaluation
 */

import type { ScreenReferenceResolutionStatus } from './types.js';
import { MOOD_BOARD_RESOLUTION_THRESHOLDS } from './constants.js';

export type ScreenReferenceResolutionEvaluation = {
  status: ScreenReferenceResolutionStatus;
  confidence: number;
  canProceedWithoutFullScreen: boolean;
  founderMessage: string | null;
  layoutGeometry: boolean;
  typography: boolean;
  spacing: boolean;
  assetPlacement: boolean;
  componentBoundaries: boolean;
  visualHierarchy: boolean;
};

export function evaluateScreenReferenceResolution(input: {
  cropWidth: number;
  cropHeight: number;
  viewportClass: string;
}): ScreenReferenceResolutionEvaluation {
  const minDim = Math.min(input.cropWidth, input.cropHeight);
  let status: ScreenReferenceResolutionStatus = 'INSUFFICIENT';
  let confidence = 0.45;

  if (minDim >= MOOD_BOARD_RESOLUTION_THRESHOLDS.SUFFICIENT_MIN_PX) {
    status = 'SUFFICIENT';
    confidence = 0.92;
  } else if (minDim >= MOOD_BOARD_RESOLUTION_THRESHOLDS.PARTIAL_MIN_PX) {
    status = 'PARTIALLY_SUFFICIENT';
    confidence = 0.74;
  }

  const canProceed = status !== 'INSUFFICIENT';
  const founderMessage =
    status === 'INSUFFICIENT'
      ? 'THIS SCREEN CAN BE BUILT FROM THE MOOD BOARD, BUT A HIGHER-RESOLUTION SCREEN REFERENCE WOULD IMPROVE PIXEL PRECISION.'
      : status === 'PARTIALLY_SUFFICIENT'
        ? 'REFERENCE QUALITY: PARTIALLY SUFFICIENT — ADD HIGH-RES REFERENCE optional for tighter pixel match.'
        : null;

  return {
    status,
    confidence,
    canProceedWithoutFullScreen: canProceed,
    founderMessage,
    layoutGeometry: minDim >= 120,
    typography: minDim >= 200,
    spacing: minDim >= 160,
    assetPlacement: minDim >= 180,
    componentBoundaries: minDim >= 140,
    visualHierarchy: minDim >= 100,
  };
}

export function referenceResolutionInsufficient(status: ScreenReferenceResolutionStatus): boolean {
  return status === 'INSUFFICIENT';
}
