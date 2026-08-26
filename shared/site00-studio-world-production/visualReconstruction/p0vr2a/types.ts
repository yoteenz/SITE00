/**
 * P0.VR.2A — Reference asset slot compiler + geometry-locked asset production types.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';

export const P0_VR_2A_LINEAGE = 'P0.VR.2A' as const;

export const VISUAL_REGION_CLASSIFICATIONS = [
  'DOM_UI',
  'DOM_TEXT',
  'SVG_ICON',
  'IMAGE_ASSET',
  'MATERIAL_TEXTURE',
  'MIXED_REGION',
] as const;

export type VisualRegionClassification = (typeof VISUAL_REGION_CLASSIFICATIONS)[number];

export const REFERENCE_ASSET_TYPES = [
  'EDITORIAL_IMAGE',
  'CHARACTER_IMAGE',
  'ENVIRONMENT_IMAGE',
  'PAPER_ARTIFACT',
  'STICKY_NOTE',
  'TAPE',
  'COLLAGE',
  'CAMPAIGN_ART',
  'VIDEO_POSTER',
  'TEXTURE',
  'DECORATIVE_OBJECT',
  'BACKGROUND_ART',
  'IMAGE_COMPOSITE',
] as const;

export type ReferenceAssetType = (typeof REFERENCE_ASSET_TYPES)[number];

export const REFERENCE_ASSET_ROLES = [
  'EDITORIAL_IMAGE',
  'CHARACTER_PORTRAIT',
  'CAMPAIGN_ARTWORK',
  'STICKY_NOTE',
  'PAPER_TEXTURE',
  'COLLAGE_ELEMENT',
  'ENVIRONMENT_BACKDROP',
  'DECORATIVE',
  'VIDEO_POSTER',
  'BACKGROUND_ART',
] as const;

export type ReferenceAssetRole = (typeof REFERENCE_ASSET_ROLES)[number];

export const ASSET_GENERATION_STATUSES = [
  'MISSING',
  'EXISTING_ASSET_FOUND',
  'READY_TO_GENERATE',
  'QUEUED',
  'GENERATING',
  'READY',
  'FAILED',
  'NEEDS_REVIEW',
  'BLOCKED',
] as const;

export type AssetGenerationStatus = (typeof ASSET_GENERATION_STATUSES)[number];

export const ASSET_BIND_MODES = ['PREVIEW_BIND', 'CANON_BIND'] as const;
export type AssetBindMode = (typeof ASSET_BIND_MODES)[number];

export const BACKGROUND_BEHAVIORS = [
  'TRANSPARENT',
  'WHITE',
  'CREAM',
  'REFERENCE_MATCHED',
  'ENVIRONMENT',
  'NONE',
] as const;

export type BackgroundBehavior = (typeof BACKGROUND_BEHAVIORS)[number];

export const OBJECT_FIT_MODES = ['cover', 'contain', 'fill', 'none'] as const;
export type ObjectFitMode = (typeof OBJECT_FIT_MODES)[number];

export const CROP_MODES = ['cover', 'contain', 'center-crop'] as const;
export type CropMode = (typeof CROP_MODES)[number];

export type ReferenceBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: number;
};

export type TargetBounds = ReferenceBounds;

export type AssetSafeAreaContract = {
  safeInsetTop: number;
  safeInsetRight: number;
  safeInsetBottom: number;
  safeInsetLeft: number;
  subjectAnchor: 'center' | 'top' | 'bottom' | 'left' | 'right';
  textFreeZone: boolean;
  cropTolerance: number;
};

export type ReferenceAssetCropContract = {
  aspectRatio: number;
  objectFit: ObjectFitMode;
  objectPosition: string;
  focusX: number;
  focusY: number;
  allowCropTop: boolean;
  allowCropBottom: boolean;
  allowCropLeft: boolean;
  allowCropRight: boolean;
};

export type ReferenceVisualAssetSlot = {
  slotId: string;
  projectId: string;
  screenId: string;
  route: string;
  viewportClass: DesignViewportClass;
  referenceId: string;
  regionId: string;

  assetRole: ReferenceAssetRole;
  assetType: ReferenceAssetType;

  referenceBounds: ReferenceBounds;
  targetBounds: TargetBounds;

  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: number;

  objectFit: ObjectFitMode;
  objectPosition: string;
  cropMode: CropMode;

  zIndex: number;
  borderRadius: number;
  mask: string | null;
  clipPath: string | null;

  backgroundBehavior: BackgroundBehavior;
  transparencyRequired: boolean;

  referenceCropAssetId: string | null;
  referenceCropStoragePath: string | null;

  existingAssetCandidateIds: string[];

  promptId: string | null;
  generationStatus: AssetGenerationStatus;
  assetStatus: AssetGenerationStatus;

  resolvedAssetId: string | null;
  resolvedAssetUrl: string | null;
  bindMode: AssetBindMode | null;

  safeArea: AssetSafeAreaContract;
  cropContract: ReferenceAssetCropContract;

  requiresCharacterAuthority: boolean;
  characterAuthorityReady: boolean;

  productionDensity: 1 | 2 | 4;
  generationWidth: number;
  generationHeight: number;

  createdAt: string;
  updatedAt: string;
};

export type ReferenceAssetBrief = {
  briefId: string;
  slotId: string;
  assetRole: ReferenceAssetRole;
  visualPurpose: string;
  referenceDescription: string;
  mustPreserve: string[];
  mustExclude: string[];
  subject: string;
  material: string;
  composition: string;
  camera: string;
  lighting: string;
  palette: string;
  texture: string;
  background: BackgroundBehavior;
  transparency: boolean;
  identityAuthority: string | null;
  brandAuthority: string;
  referenceImageAuthority: boolean;
  outputGeometry: {
    displayWidth: number;
    displayHeight: number;
    generationWidth: number;
    generationHeight: number;
    aspectRatio: number;
  };
};

export type CompiledReferenceAssetPrompt = {
  promptId: string;
  slotId: string;
  version: number;
  compiledAt: string;
  provider: string;
  model: string;
  promptText: string;
  sections: Record<string, string>;
  inputReferenceImages: string[];
  imageReferencePrimary: boolean;
  textToImagePrimary: boolean;
  editable: boolean;
};

export type VisualAssetGenerationRecord = {
  assetId: string;
  slotId: string;
  referenceId: string;
  promptId: string;
  promptVersion: number;
  prompt: string;
  provider: string;
  model: string;
  inputReferenceImages: string[];
  output: string | null;
  cost: number | null;
  createdAt: string;
  completedAt: string | null;
  status: 'QUEUED' | 'GENERATING' | 'READY' | 'FAILED';
  qa: AssetQaResult | null;
  supersedes: string | null;
  canonStatus: 'PREVIEW' | 'CANON' | 'REJECTED';
};

export type AssetQaResult = {
  referenceFidelity: number;
  composition: number;
  subjectPlacement: number;
  cropCompatibility: number;
  palette: number;
  material: number;
  brandFit: number;
  identityContinuity: number | null;
  safeAreaPass: boolean;
  placementQuality: number;
  overall: number;
  passed: boolean;
};

export type AssetSlotContract = {
  slotId: string;
  role: ReferenceAssetRole;
  bounds: TargetBounds;
  assetStatus: AssetGenerationStatus;
  resolvedAssetUrl: string | null;
  prompt: CompiledReferenceAssetPrompt | null;
  cropContract: ReferenceAssetCropContract;
  safeArea: AssetSafeAreaContract;
  falStatus: AssetGenerationStatus;
};

export type DetectedVisualRegion = {
  regionId: string;
  classification: VisualRegionClassification;
  referenceBounds: ReferenceBounds;
  assetRoleHint: ReferenceAssetRole | null;
  assetTypeHint: ReferenceAssetType | null;
  isInteractiveDom: boolean;
  mixedRasterComponent: boolean;
};

export type ExistingAssetLookupResult = {
  slotId: string;
  found: boolean;
  source: 'EXACT_CANONICAL' | 'APPROVED_PIPELINE' | 'REFERENCE_CROP' | 'NONE';
  assetId: string | null;
  assetUrl: string | null;
};

export type FalProviderRoute = {
  provider: 'fal';
  model: string;
  mode: 'image-reference' | 'text-to-image';
  reason: string;
};

export type AssetGenerationDispatchResult = {
  slotId: string;
  generationRecordId: string;
  status: AssetGenerationStatus;
  blocked: boolean;
  blockReason: string | null;
};

export type MissingAssetsSummary = {
  total: number;
  missing: number;
  existingFound: number;
  readyToGenerate: number;
  generating: number;
  ready: number;
  failed: number;
  blocked: number;
};

export type P0VR2AFailureCode =
  | 'FAIL_REFERENCE_ASSET_SLOT_MISSING'
  | 'FAIL_ASSET_SLOT_GEOMETRY_UNKNOWN'
  | 'FAIL_FAL_PROMPT_MISSING'
  | 'FAIL_FAL_PROMPT_IGNORES_REFERENCE'
  | 'FAIL_FAL_ASSET_WRONG_ASPECT_RATIO'
  | 'FAIL_FAL_ASSET_INCOMPATIBLE_WITH_CROP'
  | 'FAIL_GENERATED_ASSET_NOT_BOUND_TO_SLOT'
  | 'FAIL_ASSET_BIND_CAUSES_LAYOUT_SHIFT'
  | 'FAIL_EXISTING_ASSET_REGENERATED_UNNECESSARILY'
  | 'FAIL_FULL_SCREEN_RECONSTRUCTION_BLOCKED_ON_ASSET_GENERATION'
  | 'FAIL_CHARACTER_ASSET_GENERATED_WITHOUT_IDENTITY_AUTHORITY';
