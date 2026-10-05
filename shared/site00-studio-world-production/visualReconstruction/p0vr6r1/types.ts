/**
 * P0.VR.6R1 — Pixel-fidelity calibration + overlay diff recovery.
 */

export const P0_VR_6R1_LINEAGE = 'P0.VR.6R1' as const;

export const CALIBRATION_SCREEN_IDS = [
  '01_ASSETS_UPLOAD',
  '02_ASSETS_INSTRUCT',
  '03_ASSETS_DETECT',
  '04_ASSETS_CROP',
  '05_ASSETS_RECONSTRUCT',
  '06_ASSETS_APPROVE',
  '07_ASSETS_LIVE',
  '08_REFERENCES',
  '09_PAGES',
  '10_HISTORY',
  '11_MORE',
] as const;

export type CalibrationScreenId = (typeof CALIBRATION_SCREEN_IDS)[number];

export const P0_VR_6R1_FAILURE_CODES = [
  'REFERENCE_PIXEL_CALIBRATION_REQUIRED',
  'REFERENCE_BOX_MODEL_DRIFT',
  'REFERENCE_COLOR_ROLE_DRIFT',
  'REFERENCE_ICON_SUBSTITUTION',
  'REFERENCE_TEXT_COLLISION',
  'REFERENCE_FILTER_CLIPPING',
  'REFERENCE_FEATURED_PAGE_COMPRESSED',
  'REFERENCE_TIMELINE_TOO_FLAT',
  'REFERENCE_PROVIDER_CARD_COLLISION',
  'REFERENCE_EMPTY_STATE_GEOMETRY_DRIFT',
  'REFERENCE_OVERLAY_NOT_RUN',
] as const;

export type P0VR6R1FailureCode = (typeof P0_VR_6R1_FAILURE_CODES)[number];

export type ReferenceDeltaSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export type ReferenceDelta = {
  screenId: CalibrationScreenId;
  componentId: string;
  referenceX: number | null;
  liveX: number | null;
  deltaX: number | null;
  referenceY: number | null;
  liveY: number | null;
  deltaY: number | null;
  referenceWidth: number | null;
  liveWidth: number | null;
  deltaWidth: number | null;
  referenceHeight: number | null;
  liveHeight: number | null;
  deltaHeight: number | null;
  severity: ReferenceDeltaSeverity;
  correction: string;
};

export type CalibrationComparisonStatus = 'HIGH_MATCH' | 'PARTIAL_MATCH' | 'MAJOR_DRIFT' | 'NOT_EVALUATED';

export type ScreenCalibrationScore = {
  screenId: CalibrationScreenId;
  shellScore: CalibrationComparisonStatus;
  geometryScore: CalibrationComparisonStatus;
  typographyScore: CalibrationComparisonStatus;
  spacingScore: CalibrationComparisonStatus;
  assetScore: CalibrationComparisonStatus;
  overallStatus: CalibrationComparisonStatus;
  numericScore: number | null;
  deltas: ReferenceDelta[];
};

export type OverlayCapturePair = {
  screenId: CalibrationScreenId;
  referencePath: string;
  livePath: string;
  overlayPath: string | null;
  normalizedWidth: number;
  normalizedHeight: number;
};

export type TextCollisionFinding = {
  selector: string;
  issue: 'TEXT_OVERFLOW' | 'HORIZONTAL_OVERFLOW' | 'BOUNDING_COLLISION' | 'CLIPPED_LABEL';
  severity: ReferenceDeltaSeverity;
  description: string;
};
