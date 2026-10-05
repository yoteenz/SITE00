/**
 * P0.CB.1A — Reference board replacement + versioning types (Studio World generic).
 */

import type {
  CreativeReferenceAsset,
  CreativeReferenceBoard,
  SlideProductionAsset,
  SlideReference,
  SlideReconstructionSpec,
} from '../types.js';

export const REFERENCE_VERSION_STATUSES = [
  'ACTIVE',
  'SUPERSEDED',
  'HISTORICAL',
  'DRAFT',
  'REJECTED',
] as const;

export type ReferenceVersionStatus = (typeof REFERENCE_VERSION_STATUSES)[number];

export const PARENT_REFERENCE_STATUSES = [
  'CURRENT',
  'REFERENCE_REPLACED',
  'REDECOMPOSITION_READY',
  'RECONSTRUCTION_STALE',
  'REVIEW_REQUIRED',
  'CURRENT_AGAIN',
] as const;

export type ParentReferenceStatus = (typeof PARENT_REFERENCE_STATUSES)[number];

export const PHOTO_OVERRIDE_COMPATIBILITY_STATES = [
  'COMPATIBLE',
  'CROP_CHANGED',
  'PHOTO_CHANGED',
  'NO_LONGER_USED',
  'AMBIGUOUS',
] as const;

export type PhotoOverrideCompatibilityState = (typeof PHOTO_OVERRIDE_COMPATIBILITY_STATES)[number];

export const STALE_PRODUCTION_STATES = ['APPROVED_ASSET_STALE_AGAINST_REFERENCE'] as const;

export type StaleProductionState = (typeof STALE_PRODUCTION_STATES)[number];

export type CreativeReferenceVersion = {
  referenceVersionId: string;
  parentSequenceId: string;
  referenceAssetId: string;
  boardId: string | null;
  versionNumber: number;
  createdAt: string;
  createdBy: string;
  source: 'FOUNDER_UPLOAD' | 'FOUNDER_REPLACE' | 'SLIDE_REPLACE' | 'BULK_REPLACE' | 'INITIAL';
  status: ReferenceVersionStatus;
  supersedesReferenceVersionId: string | null;
  reason: string | null;
  notes: string | null;
};

export type ActiveCreativeReferenceAuthority = {
  parentSequenceId: string;
  activeReferenceVersionId: string;
  draftReferenceVersionId: string | null;
  updatedAt: string;
};

export type ReferenceVersionArchive = {
  referenceVersionId: string;
  parentSequenceId: string;
  referenceAsset: CreativeReferenceAsset;
  board: CreativeReferenceBoard | null;
  slideReferences: SlideReference[];
  reconstructionSpecs: SlideReconstructionSpec[];
  productionAssets: SlideProductionAsset[];
  archivedAt: string;
  immutable: true;
};

export type CreativeReferenceDiffChange = {
  slideNumber: number;
  oldSlideReferenceId: string | null;
  newSlideReferenceId: string | null;
  copyChanged: boolean;
  photoChanged: boolean;
  compositionChanged: boolean;
  materialChanged: boolean;
  edgeBindingChanged: boolean;
  limeChanged: boolean;
  typographyChanged: boolean;
  reordered: boolean;
  added: boolean;
  removed: boolean;
};

export type CreativeReferenceDiff = {
  diffId: string;
  parentSequenceId: string;
  oldReferenceVersionId: string | null;
  newReferenceVersionId: string;
  oldSlideCount: number;
  newSlideCount: number;
  slideCountChanged: boolean;
  addedSlides: number[];
  removedSlides: number[];
  reorderedSlides: number[];
  changes: CreativeReferenceDiffChange[];
  computedAt: string;
};

export type PhotographyOverrideCompatibilityEvaluation = {
  slideId: string;
  slideNumber: number;
  state: PhotoOverrideCompatibilityState;
  priorSourceMode: string | null;
  priorSelectedAssetId: string | null;
  carryForward: boolean;
  requiresFounderDecision: boolean;
  message: string;
};

export type SlideSpecDiffSummary = {
  slideNumber: number;
  compositionChanged: boolean;
  copyChanged: boolean;
  materialChanged: boolean;
  photoChanged: boolean;
  edgeBehaviorChanged: boolean;
  bindingChanged: boolean;
  constructionHistoryChanged: boolean;
  limeChanged: boolean;
  typographyChanged: boolean;
  annotationsChanged: boolean;
  legacyCaseMismatch: boolean;
};

export type SelectiveInvalidationResult = {
  slideId: string;
  invalidatedReference: boolean;
  invalidatedSpec: boolean;
  invalidatedPhotoPrompt: boolean;
  invalidatedCandidate: boolean;
  invalidatedApproval: boolean;
  staleProductionState: StaleProductionState | null;
  preservedHqAsset: boolean;
  siblingPreserved: boolean;
};
