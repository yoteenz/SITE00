/**
 * P0.VR.4R2 — Reference crop authority types.
 */

export const P0_VR_4R2_LINEAGE = 'P0.VR.4R2' as const;

export const CROP_FAILURE_CLASSES = [
  'CROP_COORDINATE_SPACE_MISMATCH',
  'CROP_TOO_SMALL',
  'CROP_TOO_LARGE',
  'CROP_WRONG_REGION',
  'CROP_OBJECT_CLIPPED',
  'CROP_FEATURE_POINT_USED_AS_OBJECT',
  'CROP_SOURCE_DIMENSION_MISMATCH',
  'CROP_PREVIEW_PROVIDER_INPUT_MISMATCH',
  'CROP_NOT_APPROVED',
  'GENERATION_BLOCKED_BY_CROP_QA',
] as const;

export type CropFailureClass = (typeof CROP_FAILURE_CLASSES)[number];

export const CROP_QA_STATUSES = [
  'CROP_DRAFT',
  'CROP_QA_FAILED',
  'CROP_READY',
  'CROP_APPROVED',
] as const;

export type CropQaStatus = (typeof CROP_QA_STATUSES)[number];

export type SourcePixelBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type NormalizedBounds = {
  normalizedX: number;
  normalizedY: number;
  normalizedWidth: number;
  normalizedHeight: number;
};

export type CropCoordinateRecord = {
  sourceWidth: number;
  sourceHeight: number;
  displayWidth: number;
  displayHeight: number;
  scaleX: number;
  scaleY: number;
  devicePixelRatio: number;
  scrollX: number;
  scrollY: number;
  selectionDisplayX: number;
  selectionDisplayY: number;
  selectionDisplayWidth: number;
  selectionDisplayHeight: number;
  detectedBounds: SourcePixelBounds;
  founderAdjustedBounds: SourcePixelBounds | null;
  finalBounds: SourcePixelBounds;
  normalizedBounds: NormalizedBounds;
  paddingPercent: number;
  qaStatus: CropQaStatus;
  qaFailures: CropFailureClass[];
  cropChecksum: string | null;
  approvedAt: string | null;
  locked: boolean;
  cropId: string;
  cropVersion: number;
  sourceScreenshotId: string;
  generationIdsUsingCrop: string[];
};

export type ReferenceCropQaResult = {
  status: CropQaStatus;
  pass: boolean;
  failures: CropFailureClass[];
  geometryPass: boolean;
  coveragePass: boolean;
  previewValid: boolean;
};

export type DesignGenerationPreflightResult = {
  pass: boolean;
  blocked: boolean;
  blocker: string | null;
  failureClass: CropFailureClass | null;
  checks: {
    referenceExists: boolean;
    cropQaPass: boolean;
    cropDimensionsValid: boolean;
    objectCoveragePass: boolean;
    referencePreviewValid: boolean;
    referenceChecksumPresent: boolean;
    providerAvailable: boolean;
    spendAuthorized: boolean;
    cropApproved: boolean;
  };
};

export const REGENERATION_REASON_CLASSES = [
  'CROP_CHANGED',
  'PROMPT_CHANGED',
  'MODEL_CHANGED',
  'GENERATION_FIDELITY_FAILED',
  'FOUNDER_REQUESTED',
] as const;

export type RegenerationReasonClass = (typeof REGENERATION_REASON_CLASSES)[number];
