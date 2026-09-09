/**
 * P0.VR.6R7 — Founder Crop Intelligence types.
 */

import type { NormalizedBbox } from '../types.js';

export const CROP_REVIEW_STATUSES = [
  'DETECTED',
  'NEEDS_IDENTITY_CONFIRMATION',
  'EDIT_REQUIRED',
  'READY_FOR_APPROVAL',
  'APPROVED',
  'REJECTED',
  'REPLACED_BY_MANUAL_CROP',
  'INVALID',
] as const;

export type CropReviewStatus = (typeof CROP_REVIEW_STATUSES)[number];

export const ASSET_IDENTITY_DECISIONS = ['CONFIRMED', 'WRONG_ASSET', 'UNSURE'] as const;
export type AssetIdentityDecision = (typeof ASSET_IDENTITY_DECISIONS)[number] | null;

export const OBJECT_COVERAGE_STATES = ['FULL', 'PARTIAL', 'UNKNOWN'] as const;
export type ObjectCoverageState = (typeof OBJECT_COVERAGE_STATES)[number];

export const EDGE_CONTACT_STATES = ['CLEAR', 'TOUCHING', 'CLIPPED'] as const;
export type EdgeContactState = (typeof EDGE_CONTACT_STATES)[number];

export const UNWANTED_CONTEXT_TYPES = [
  'NONE',
  'DEVICE_CHROME',
  'BROWSER_CHROME',
  'TEXT',
  'ADJACENT_CARD',
  'BACKGROUND',
  'OTHER_UI',
  'MULTIPLE_OBJECTS',
  'UNKNOWN',
] as const;

export type UnwantedContextType = (typeof UNWANTED_CONTEXT_TYPES)[number];

export const PREFLIGHT_SEVERITIES = ['INFO', 'WARN', 'BLOCK'] as const;
export type PreflightSeverity = (typeof PREFLIGHT_SEVERITIES)[number];

export type CropPreflightIssue = {
  code: string;
  label: string;
  severity: PreflightSeverity;
};

export type AssetTargetSlotContract = {
  slotId: string;
  assetType: string;
  expectedAspectRatio: number | null;
  expectedBackgroundPolicy: string;
  expectedObjectCount: number;
  allowText: boolean;
  allowDeviceChrome: boolean;
  allowUIChrome: boolean;
  minimumResolution: { width: number; height: number };
  preferredPaddingPercent: number;
  transparencyPolicy: string;
  treatmentPlan: string;
  expectedContentSummary: string;
};

export type CropDetectionExplanation = {
  summary: string;
  detectionBasis: string;
  confidencePercent: number;
  detectedType: string;
  expectedContent: string;
};

export type CropQualityPreflightResult = {
  objectCoverage: ObjectCoverageState;
  edgeContact: EdgeContactState;
  unwantedContext: UnwantedContextType[];
  sourceResolution: { width: number; height: number };
  minimumSizePass: boolean;
  targetAspectCompatibility: 'COMPATIBLE' | 'WARN' | 'INCOMPATIBLE';
  blankRegion: boolean;
  issues: CropPreflightIssue[];
  blocksApproval: boolean;
  blocksBatchApproval: boolean;
  recommendedAction: string;
};

export type CropEditHistoryEntry = {
  id: string;
  action:
    | 'DETECTOR_INITIAL'
    | 'FOUNDER_DRAG'
    | 'FOUNDER_RESIZE'
    | 'FIT_OBJECT'
    | 'PADDING_ADJUST'
    | 'RESET'
    | 'MANUAL_CROP'
    | 'SPLIT'
    | 'MERGE'
    | 'RE_DETECT'
    | 'APPROVED';
  bounds: NormalizedBbox;
  timestamp: string;
  note: string | null;
};

export type CropReviewState = {
  candidateId: string;
  assetNumber: string;
  assetName: string;
  assetType: string;
  targetSlot: string;
  reviewStatus: CropReviewStatus;
  assetIdentity: AssetIdentityDecision;
  detectorCrop: NormalizedBbox;
  founderCrop: NormalizedBbox | null;
  finalApprovedCrop: NormalizedBbox | null;
  detectionExplanation: CropDetectionExplanation;
  preflight: CropQualityPreflightResult;
  targetSlotContract: AssetTargetSlotContract;
  editHistory: CropEditHistoryEntry[];
  cropChecksum: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  humanSummary: string;
  providerDispatchCount: number;
};

export type BatchCropSummary = {
  total: number;
  detected: number;
  identityConfirmed: number;
  ready: number;
  editRequired: number;
  approved: number;
  generationBlocked: boolean;
};

export type PixelBounds = { x: number; y: number; width: number; height: number };
