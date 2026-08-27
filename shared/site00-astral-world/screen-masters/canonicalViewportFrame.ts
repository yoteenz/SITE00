/**
 * P0.E.FT5.2E — Canonical stage rendered dimensions at content viewport width.
 */

import { AW_M_01_CANONICAL_STAGE } from './canonicalScreenStage.js';

const { referenceWidth, referenceHeight } = AW_M_01_CANONICAL_STAGE;

/** Uniform scale: viewportWidth / referenceWidth */
export function canonicalStageRenderScale(viewportWidth: number): number {
  return viewportWidth / referenceWidth;
}

/** Expected rendered stage height in CSS px at a given content viewport width */
export function canonicalStageRenderedHeight(viewportWidth: number): number {
  return referenceHeight * canonicalStageRenderScale(viewportWidth);
}

/** Reference heights at QA breakpoints */
export const AW_M_01_EXPECTED_STAGE_HEIGHT_390 = canonicalStageRenderedHeight(390);
export const AW_M_01_EXPECTED_STAGE_HEIGHT_430 = canonicalStageRenderedHeight(430);
