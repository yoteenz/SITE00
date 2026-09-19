/**
 * P0.VR.6R1 — Expected calibration deltas from reference authority (heuristic targets).
 */

import type { CalibrationScreenId, ReferenceDelta, ScreenCalibrationScore } from './types.js';
import { buildReferenceDelta, buildScreenCalibrationScore } from './overlayQA.js';

/** Reference geometry targets for calibration QA (390px mobile canvas). */
export const REFERENCE_COMPONENT_TARGETS: Record<
  string,
  Partial<{ x: number; y: number; width: number; height: number }>
> = {
  SHELL_BREADCRUMB: { x: 16, y: 8, width: 200, height: 12 },
  SHELL_TITLE: { x: 16, y: 48, width: 220, height: 28 },
  SHELL_ORB: { x: 280, y: 40, width: 88, height: 88 },
  PRIMARY_TABS: { x: 0, y: 120, width: 390, height: 32 },
  VIEWPORT_RAIL: { x: 16, y: 160, width: 358, height: 28 },
  ASSET_STEPPER: { x: 8, y: 196, width: 374, height: 44 },
  PAGES_FILTER_RAIL: { x: 0, y: 196, width: 390, height: 28 },
  PAGES_FEATURED: { x: 16, y: 268, width: 358, height: 180 },
  HISTORY_TIMELINE: { x: 16, y: 280, width: 358, height: 320 },
  MORE_PROVIDER_GRID: { x: 16, y: 240, width: 358, height: 72 },
};

export function expectedDeltasForScreen(
  screenId: CalibrationScreenId,
  liveMeasurements: Record<string, Partial<{ x: number; y: number; width: number; height: number }>>,
): ReferenceDelta[] {
  const targetsByScreen: Record<CalibrationScreenId, string[]> = {
    '01_ASSETS_UPLOAD': ['SHELL_TITLE', 'SHELL_ORB', 'ASSET_STEPPER'],
    '02_ASSETS_INSTRUCT': ['SHELL_TITLE', 'ASSET_STEPPER'],
    '03_ASSETS_DETECT': ['ASSET_STEPPER'],
    '04_ASSETS_CROP': ['ASSET_STEPPER'],
    '05_ASSETS_RECONSTRUCT': ['ASSET_STEPPER'],
    '06_ASSETS_APPROVE': ['ASSET_STEPPER'],
    '07_ASSETS_LIVE': ['ASSET_STEPPER'],
    '08_REFERENCES': ['SHELL_TITLE', 'PRIMARY_TABS'],
    '09_PAGES': ['PAGES_FILTER_RAIL', 'PAGES_FEATURED'],
    '10_HISTORY': ['HISTORY_TIMELINE'],
    '11_MORE': ['MORE_PROVIDER_GRID'],
  };

  return targetsByScreen[screenId]
    .map((componentId) => {
      const reference = REFERENCE_COMPONENT_TARGETS[componentId];
      const live = liveMeasurements[componentId];
      if (!reference || !live) return null;
      return buildReferenceDelta({
        screenId,
        componentId,
        reference,
        live,
        correction: `CALIBRATE ${componentId}`,
      });
    })
    .filter(Boolean) as ReferenceDelta[];
}

export function buildCalibrationReport(
  screenId: CalibrationScreenId,
  liveMeasurements: Record<string, Partial<{ x: number; y: number; width: number; height: number }>>,
): ScreenCalibrationScore {
  const deltas = expectedDeltasForScreen(screenId, liveMeasurements);
  return buildScreenCalibrationScore({ screenId, deltas });
}
